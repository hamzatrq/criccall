// SPDX-License-Identifier: MIT
pragma solidity ^0.8.28;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

/**
 * @title CALLToken
 * @notice Non-transferable, non-purchasable ERC-20 token for CricCall predictions.
 *         Users claim 100 free CALL daily. CALL balance IS reputation —
 *         the leaderboard is sorted by CALL balance.
 *
 *         Winners receive CALL from losers' pool (proportional payout).
 *         Over time, good predictors accumulate CALL. Balance = reputation.
 *
 * Halal constraints enforced by code:
 *   1. No payable functions — CALL cannot be purchased
 *   2. Transfers disabled — no secondary market, no monetary value
 *   3. Only PredictionMarket can move CALL — architectural separation
 */
contract CALLToken is ERC20, Ownable {
    uint256 public constant DAILY_AMOUNT = 100 ether;
    uint256 public constant CLAIM_INTERVAL = 24 hours;

    address public predictionMarket;

    mapping(address => uint256) public lastClaimed;

    event CreditsClaimed(address indexed user, uint256 amount);
    event PredictionMarketSet(address indexed market);

    error AlreadyClaimedToday();
    error TransferDisabled();
    error ApprovalDisabled();
    error OnlyPredictionMarket();
    error ZeroAddress();

    constructor() ERC20("CricCall", "CALL") Ownable(msg.sender) {}

    /**
     * @notice Claim 100 free CALL tokens. Once per 24 hours.
     */
    function claimDaily() external {
        if (block.timestamp < lastClaimed[msg.sender] + CLAIM_INTERVAL) {
            revert AlreadyClaimedToday();
        }

        lastClaimed[msg.sender] = block.timestamp;
        _mint(msg.sender, DAILY_AMOUNT);

        emit CreditsClaimed(msg.sender, DAILY_AMOUNT);
    }

    /**
     * @notice Set the PredictionMarket contract address. Only owner.
     * @param _market Address of the PredictionMarket contract
     */
    function setPredictionMarket(address _market) external onlyOwner {
        if (_market == address(0)) revert ZeroAddress();
        predictionMarket = _market;
        emit PredictionMarketSet(_market);
    }

    /**
     * @notice Burn CALL from a user when placing a prediction. Only callable by PredictionMarket.
     * @param user Address of the user
     * @param amount Amount of CALL to burn
     */
    function spend(address user, uint256 amount) external {
        if (msg.sender != predictionMarket) revert OnlyPredictionMarket();
        _burn(user, amount);
    }

    /**
     * @notice Mint CALL to a user as winnings. Only callable by PredictionMarket.
     * @param user Address of the user
     * @param amount Amount of CALL to mint
     */
    function reward(address user, uint256 amount) external {
        if (msg.sender != predictionMarket) revert OnlyPredictionMarket();
        _mint(user, amount);
    }

    // --- Disable all transfers and approvals ---

    function transfer(address, uint256) public pure override returns (bool) {
        revert TransferDisabled();
    }

    function transferFrom(address, address, uint256) public pure override returns (bool) {
        revert TransferDisabled();
    }

    function approve(address, uint256) public pure override returns (bool) {
        revert ApprovalDisabled();
    }
}
