// SPDX-License-Identifier: MIT
pragma solidity ^0.8.28;

import "@openzeppelin/contracts/access/Ownable.sol";
import "./CALLToken.sol";
import "./CricketOracle.sol";

/**
 * @title PredictionMarket
 * @notice On-chain binary prediction markets for cricket matches on WireFluid.
 *         Users spend CALL tokens to take YES/NO positions.
 *         Markets resolve via CricketOracle. Winners claim proportional payouts.
 *
 *         Market lifecycle: Open → Locked → Resolved | Canceled
 *
 *         YES outcome is defined at market creation (e.g., TeamA wins).
 *         Any other oracle outcome means NO wins.
 *         NoResult cancels the market and refunds all participants.
 */
contract PredictionMarket is Ownable {
    enum MarketState {
        Open,     // 0 - accepting predictions
        Locked,   // 1 - predictions closed, awaiting resolution
        Resolved, // 2 - outcome determined, winners can claim
        Canceled  // 3 - NoResult, all participants refunded
    }

    enum Position {
        Yes, // 0
        No   // 1
    }

    struct Market {
        string matchId;
        string question;
        uint256 lockTime;
        MarketState state;
        CricketOracle.Outcome yesOutcome; // which oracle outcome maps to YES
        CricketOracle.Outcome resolvedOutcome;
        uint256 yesPool;
        uint256 noPool;
    }

    struct UserPosition {
        uint256 yesAmount;
        uint256 noAmount;
        bool claimed;
    }

    CALLToken public immutable callToken;
    CricketOracle public immutable cricketOracle;

    Market[] public markets;

    // marketId => user => position
    mapping(uint256 => mapping(address => UserPosition)) private positions;

    event MarketCreated(
        uint256 indexed marketId,
        string matchId,
        string question,
        uint256 lockTime
    );
    event PredictionPlaced(
        uint256 indexed marketId,
        address indexed user,
        Position position,
        uint256 amount
    );
    event MarketResolved(
        uint256 indexed marketId,
        CricketOracle.Outcome outcome,
        bool yesWins
    );
    event MarketCanceled(uint256 indexed marketId);
    event WinningsClaimed(
        uint256 indexed marketId,
        address indexed user,
        uint256 amount
    );
    event RefundClaimed(
        uint256 indexed marketId,
        address indexed user,
        uint256 amount
    );

    error MarketNotFound();
    error MarketNotOpen();
    error MarketNotResolved();
    error MarketNotCanceled();
    error LockTimeInPast();
    error ZeroAmount();
    error InsufficientCredits();
    error NothingToClaim();
    error AlreadyClaimed();
    error InvalidOutcome();

    constructor(address _callToken, address _oracle) Ownable(msg.sender) {
        callToken = CALLToken(_callToken);
        cricketOracle = CricketOracle(_oracle);
    }

    // --- Market Management ---

    /**
     * @notice Create a new prediction market.
     * @param matchId Cricket match identifier (matches CricketOracle matchId)
     * @param question Human-readable question (e.g., "Will Pakistan win?")
     * @param lockTime Timestamp after which no more predictions are accepted
     * @param yesOutcome Which oracle outcome maps to YES
     */
    function createMarket(
        string calldata matchId,
        string calldata question,
        uint256 lockTime,
        CricketOracle.Outcome yesOutcome
    ) external onlyOwner {
        if (lockTime <= block.timestamp) revert LockTimeInPast();
        if (yesOutcome == CricketOracle.Outcome.Unresolved) revert InvalidOutcome();

        markets.push(
            Market({
                matchId: matchId,
                question: question,
                lockTime: lockTime,
                state: MarketState.Open,
                yesOutcome: yesOutcome,
                resolvedOutcome: CricketOracle.Outcome.Unresolved,
                yesPool: 0,
                noPool: 0
            })
        );

        emit MarketCreated(markets.length - 1, matchId, question, lockTime);
    }

    // --- Predictions ---

    /**
     * @notice Place a prediction on a market.
     * @param marketId The market to predict on
     * @param position YES or NO
     * @param amount Amount of CALL to spend
     */
    function predict(
        uint256 marketId,
        Position position,
        uint256 amount
    ) external {
        if (marketId >= markets.length) revert MarketNotFound();
        Market storage m = markets[marketId];
        if (m.state != MarketState.Open || block.timestamp >= m.lockTime)
            revert MarketNotOpen();
        if (amount == 0) revert ZeroAmount();

        // Check balance before spending
        if (callToken.balanceOf(msg.sender) < amount)
            revert InsufficientCredits();

        // Burn CALL from user
        callToken.spend(msg.sender, amount);

        // Update pools and positions
        UserPosition storage pos = positions[marketId][msg.sender];
        if (position == Position.Yes) {
            m.yesPool += amount;
            pos.yesAmount += amount;
        } else {
            m.noPool += amount;
            pos.noAmount += amount;
        }

        emit PredictionPlaced(marketId, msg.sender, position, amount);
    }

    // --- Resolution ---

    /**
     * @notice Called by CricketOracle when a match result is revealed.
     *         Resolves all markets associated with the matchId.
     * @param matchId The match identifier
     * @param outcome The oracle outcome (uint8 cast of CricketOracle.Outcome)
     */
    function onMatchResolved(string calldata matchId, uint8 outcome) external {
        require(msg.sender == address(cricketOracle), "Only oracle");

        CricketOracle.Outcome oracleOutcome = CricketOracle.Outcome(outcome);

        // Find and resolve all markets for this matchId
        for (uint256 i = 0; i < markets.length; i++) {
            Market storage m = markets[i];
            if (
                keccak256(bytes(m.matchId)) == keccak256(bytes(matchId)) &&
                (m.state == MarketState.Open || m.state == MarketState.Locked)
            ) {
                m.resolvedOutcome = oracleOutcome;

                if (oracleOutcome == CricketOracle.Outcome.NoResult) {
                    m.state = MarketState.Canceled;
                    emit MarketCanceled(i);
                } else {
                    m.state = MarketState.Resolved;
                    bool yesWins = (oracleOutcome == m.yesOutcome);
                    emit MarketResolved(i, oracleOutcome, yesWins);
                }
            }
        }
    }

    // --- Claims ---

    /**
     * @notice Claim winnings from a resolved market.
     * @param marketId The market to claim from
     */
    function claimWinnings(uint256 marketId) external {
        if (marketId >= markets.length) revert MarketNotFound();
        Market storage m = markets[marketId];
        if (m.state != MarketState.Resolved) revert MarketNotResolved();

        UserPosition storage pos = positions[marketId][msg.sender];
        if (pos.claimed) revert AlreadyClaimed();

        bool yesWins = (m.resolvedOutcome == m.yesOutcome);
        uint256 winnerPool = yesWins ? m.yesPool : m.noPool;
        uint256 userStake = yesWins ? pos.yesAmount : pos.noAmount;

        if (userStake == 0) revert NothingToClaim();

        uint256 totalPool = m.yesPool + m.noPool;
        uint256 winnings = (userStake * totalPool) / winnerPool;

        pos.claimed = true;

        callToken.reward(msg.sender, winnings);

        emit WinningsClaimed(marketId, msg.sender, winnings);
    }

    /**
     * @notice Claim refund from a canceled market (NoResult).
     * @param marketId The market to claim refund from
     */
    function claimRefund(uint256 marketId) external {
        if (marketId >= markets.length) revert MarketNotFound();
        Market storage m = markets[marketId];
        if (m.state != MarketState.Canceled) revert MarketNotCanceled();

        UserPosition storage pos = positions[marketId][msg.sender];
        if (pos.claimed) revert AlreadyClaimed();

        uint256 refund = pos.yesAmount + pos.noAmount;
        if (refund == 0) revert NothingToClaim();

        pos.claimed = true;

        callToken.reward(msg.sender, refund);

        emit RefundClaimed(marketId, msg.sender, refund);
    }

    // --- View Functions ---

    function marketCount() external view returns (uint256) {
        return markets.length;
    }

    function getUserPosition(
        uint256 marketId,
        address user
    ) external view returns (UserPosition memory) {
        return positions[marketId][user];
    }
}
