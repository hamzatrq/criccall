// SPDX-License-Identifier: MIT
pragma solidity ^0.8.28;

import "@openzeppelin/contracts/access/Ownable.sol";

/**
 * @title CricketOracle
 * @notice Commit-reveal oracle for cricket match results on WireFluid.
 *         Authorized oracle addresses commit a hash, then reveal the result.
 *         Prevents frontrunning by requiring the reveal to match the commit.
 *         Triggers PredictionMarket resolution on successful reveal.
 */
contract CricketOracle is Ownable {
    enum Outcome {
        Unresolved, // 0 - default
        TeamA,      // 1
        TeamB,      // 2
        Draw,       // 3
        NoResult    // 4
    }

    struct MatchResult {
        Outcome outcome;
        bool resolved;
        uint256 timestamp;
        address resolvedBy;
    }

    struct Commit {
        bytes32 hash;
        address oracle;
        uint256 timestamp;
        bool revealed;
    }

    // Authorized oracle addresses
    mapping(address => bool) public authorizedOracles;

    // matchId => Commit
    mapping(string => Commit) public commits;

    // matchId => MatchResult
    mapping(string => MatchResult) private matchResults;

    // Consumer contract (PredictionMarket) that gets notified on resolution
    address public consumer;

    event OracleAdded(address indexed oracle);
    event OracleRemoved(address indexed oracle);
    event ResultCommitted(string indexed matchId, address indexed oracle);
    event ResultRevealed(string indexed matchId, Outcome outcome);
    event ConsumerSet(address indexed consumer);

    error NotAuthorizedOracle();
    error AlreadyCommitted();
    error NotCommitted();
    error AlreadyResolved();
    error InvalidReveal();
    error InvalidOutcome();
    error ZeroAddress();

    constructor() Ownable(msg.sender) {}

    // --- Oracle Management ---

    function addOracle(address _oracle) external onlyOwner {
        if (_oracle == address(0)) revert ZeroAddress();
        authorizedOracles[_oracle] = true;
        emit OracleAdded(_oracle);
    }

    function removeOracle(address _oracle) external onlyOwner {
        authorizedOracles[_oracle] = false;
        emit OracleRemoved(_oracle);
    }

    function setConsumer(address _consumer) external onlyOwner {
        consumer = _consumer;
        emit ConsumerSet(_consumer);
    }

    // --- Commit-Reveal ---

    /**
     * @notice Commit a hashed match result. Hash = keccak256(abi.encode(matchId, outcome, secret))
     * @param matchId Unique match identifier
     * @param commitHash The keccak256 hash of (matchId, outcome, secret)
     */
    function commitResult(string calldata matchId, bytes32 commitHash) external {
        if (!authorizedOracles[msg.sender]) revert NotAuthorizedOracle();
        if (commits[matchId].hash != bytes32(0)) revert AlreadyCommitted();

        commits[matchId] = Commit({
            hash: commitHash,
            oracle: msg.sender,
            timestamp: block.timestamp,
            revealed: false
        });

        emit ResultCommitted(matchId, msg.sender);
    }

    /**
     * @notice Reveal a previously committed result. Must match the commit hash.
     * @param matchId Unique match identifier
     * @param outcome The match outcome
     * @param secret The secret used in the commit
     */
    function revealResult(
        string calldata matchId,
        Outcome outcome,
        bytes32 secret
    ) external {
        if (!authorizedOracles[msg.sender]) revert NotAuthorizedOracle();

        Commit storage c = commits[matchId];
        if (c.hash == bytes32(0)) revert NotCommitted();
        if (matchResults[matchId].resolved) revert AlreadyResolved();
        if (outcome == Outcome.Unresolved) revert InvalidOutcome();

        // Verify the reveal matches the commit
        bytes32 expectedHash = keccak256(
            abi.encode(matchId, outcome, secret)
        );
        if (expectedHash != c.hash) revert InvalidReveal();

        c.revealed = true;

        matchResults[matchId] = MatchResult({
            outcome: outcome,
            resolved: true,
            timestamp: block.timestamp,
            resolvedBy: msg.sender
        });

        emit ResultRevealed(matchId, outcome);

        // Notify consumer (PredictionMarket) if set
        if (consumer != address(0)) {
            // The consumer contract should implement IOracleConsumer
            // We use a low-level call to avoid reverting if consumer fails
            (bool success, ) = consumer.call(
                abi.encodeWithSignature(
                    "onMatchResolved(string,uint8)",
                    matchId,
                    uint8(outcome)
                )
            );
            // We don't revert if the consumer call fails — the oracle result is still stored
            success; // silence unused variable warning
        }
    }

    // --- Query Functions ---

    function getMatchResult(string calldata matchId) external view returns (MatchResult memory) {
        return matchResults[matchId];
    }

    function isResolved(string calldata matchId) external view returns (bool) {
        return matchResults[matchId].resolved;
    }
}
