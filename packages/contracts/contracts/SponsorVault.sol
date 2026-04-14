// SPDX-License-Identifier: MIT
pragma solidity ^0.8.28;

import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";
import "@openzeppelin/contracts/utils/cryptography/MerkleProof.sol";

/**
 * @title SponsorVault
 * @notice Halal reward engine for CricCall on WireFluid.
 *         Whitelisted sponsors deposit funds (ERC-20 or native WIRE) into campaigns.
 *         After market resolution, a Merkle root of winners is posted.
 *         Winners claim rewards via Merkle proof.
 *         Unclaimed funds return to sponsor after expiry.
 *
 * Halal constraint: Only whitelisted sponsor addresses can deposit.
 * A require() rejects any deposit from a non-sponsor. User funds never enter.
 *
 * Public audit state: totalCommitted, totalAllocated, totalRedeemed per campaign.
 */
contract SponsorVault is Ownable {
    using SafeERC20 for IERC20;

    struct Campaign {
        address sponsor;
        address token;         // address(0) for native WIRE
        uint256 totalCommitted;
        uint256 totalAllocated;
        uint256 totalRedeemed;
        uint256 expiry;
        bytes32 winnerRoot;
        bool clawedBack;
    }

    mapping(address => bool) public whitelistedSponsors;
    mapping(string => Campaign) public campaigns;
    mapping(string => mapping(address => bool)) public claimed;

    event SponsorAdded(address indexed sponsor);
    event SponsorRemoved(address indexed sponsor);
    event CampaignCreated(
        string indexed campaignId,
        address indexed sponsor,
        address token,
        uint256 amount,
        uint256 expiry
    );
    event WinnerRootPosted(string indexed campaignId, bytes32 root);
    event RewardClaimed(
        string indexed campaignId,
        address indexed winner,
        uint256 amount
    );
    event Clawback(
        string indexed campaignId,
        address indexed sponsor,
        uint256 amount
    );

    error NotWhitelistedSponsor();
    error CampaignExists();
    error CampaignNotFound();
    error ZeroAmount();
    error ExpiryInPast();
    error ValueMismatch();
    error AllocationExceedsDeposit();
    error InvalidProof();
    error AlreadyClaimed();
    error NotExpired();
    error NotCampaignSponsor();
    error AlreadyClawedBack();
    error NothingToClawback();
    error TransferFailed();

    constructor() Ownable(msg.sender) {}

    // --- Sponsor Management ---

    function addSponsor(address _sponsor) external onlyOwner {
        whitelistedSponsors[_sponsor] = true;
        emit SponsorAdded(_sponsor);
    }

    function removeSponsor(address _sponsor) external onlyOwner {
        whitelistedSponsors[_sponsor] = false;
        emit SponsorRemoved(_sponsor);
    }

    // --- Campaign Management ---

    /**
     * @notice Create a campaign and deposit funds.
     *         For native WIRE: set token to address(0) and send value with tx.
     *         For ERC-20: approve this contract first, then call with token address.
     * @param campaignId Unique campaign identifier
     * @param token ERC-20 token address, or address(0) for native WIRE
     * @param amount Amount to deposit
     * @param expiry Timestamp after which sponsor can clawback unclaimed funds
     */
    function createCampaign(
        string calldata campaignId,
        address token,
        uint256 amount,
        uint256 expiry
    ) external payable {
        if (!whitelistedSponsors[msg.sender]) revert NotWhitelistedSponsor();
        if (campaigns[campaignId].sponsor != address(0)) revert CampaignExists();
        if (amount == 0) revert ZeroAmount();
        if (expiry <= block.timestamp) revert ExpiryInPast();

        if (token == address(0)) {
            // Native WIRE deposit
            if (msg.value != amount) revert ValueMismatch();
        } else {
            // ERC-20 deposit
            IERC20(token).safeTransferFrom(msg.sender, address(this), amount);
        }

        campaigns[campaignId] = Campaign({
            sponsor: msg.sender,
            token: token,
            totalCommitted: amount,
            totalAllocated: 0,
            totalRedeemed: 0,
            expiry: expiry,
            winnerRoot: bytes32(0),
            clawedBack: false
        });

        emit CampaignCreated(campaignId, msg.sender, token, amount, expiry);
    }

    // --- Winner Root ---

    /**
     * @notice Post the Merkle root of winners for a campaign. Only owner.
     * @param campaignId Campaign identifier
     * @param root Merkle root of (address, uint256) leaves
     * @param totalAllocated Total amount allocated to winners
     */
    function postWinnerRoot(
        string calldata campaignId,
        bytes32 root,
        uint256 totalAllocated
    ) external onlyOwner {
        Campaign storage c = campaigns[campaignId];
        if (c.sponsor == address(0)) revert CampaignNotFound();
        if (totalAllocated > c.totalCommitted) revert AllocationExceedsDeposit();

        c.winnerRoot = root;
        c.totalAllocated = totalAllocated;

        emit WinnerRootPosted(campaignId, root);
    }

    // --- Claims ---

    /**
     * @notice Claim reward from a campaign using Merkle proof.
     * @param campaignId Campaign identifier
     * @param amount Amount to claim
     * @param proof Merkle proof for (msg.sender, amount) leaf
     */
    function claim(
        string calldata campaignId,
        uint256 amount,
        bytes32[] calldata proof
    ) external {
        Campaign storage c = campaigns[campaignId];
        if (c.sponsor == address(0)) revert CampaignNotFound();
        if (claimed[campaignId][msg.sender]) revert AlreadyClaimed();

        // Verify Merkle proof
        bytes32 leaf = keccak256(
            bytes.concat(keccak256(abi.encode(msg.sender, amount)))
        );
        if (!MerkleProof.verify(proof, c.winnerRoot, leaf)) revert InvalidProof();

        claimed[campaignId][msg.sender] = true;
        c.totalRedeemed += amount;

        // Transfer reward
        if (c.token == address(0)) {
            (bool success, ) = payable(msg.sender).call{value: amount}("");
            if (!success) revert TransferFailed();
        } else {
            IERC20(c.token).safeTransfer(msg.sender, amount);
        }

        emit RewardClaimed(campaignId, msg.sender, amount);
    }

    // --- Clawback ---

    /**
     * @notice Sponsor reclaims unclaimed funds after campaign expiry.
     * @param campaignId Campaign identifier
     */
    function clawback(string calldata campaignId) external {
        Campaign storage c = campaigns[campaignId];
        if (c.sponsor == address(0)) revert CampaignNotFound();
        if (msg.sender != c.sponsor) revert NotCampaignSponsor();
        if (block.timestamp <= c.expiry) revert NotExpired();
        if (c.clawedBack) revert AlreadyClawedBack();

        uint256 remaining = c.totalCommitted - c.totalRedeemed;
        if (remaining == 0) revert NothingToClawback();

        c.clawedBack = true;

        if (c.token == address(0)) {
            (bool success, ) = payable(msg.sender).call{value: remaining}("");
            if (!success) revert TransferFailed();
        } else {
            IERC20(c.token).safeTransfer(msg.sender, remaining);
        }

        emit Clawback(campaignId, msg.sender, remaining);
    }
}
