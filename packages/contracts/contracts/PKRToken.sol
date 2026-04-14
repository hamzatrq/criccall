// SPDX-License-Identifier: MIT
pragma solidity ^0.8.28;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

/**
 * @title PKRToken
 * @notice Mintable ERC-20 representing the Pakistani Rupee on WireFluid.
 *         Admin mints PKR to brands against fiat purchases.
 *         Used as the deposit token in SponsorVault for prize distribution.
 *
 *         For hackathon: we create our own PKR since no stablecoin exists on WireFluid.
 *         In production: replaced by an official PKR stablecoin.
 *
 *         Unlike CALL, PKR is fully transferable and has real monetary value.
 */
contract PKRToken is ERC20, Ownable {
    event Minted(address indexed to, uint256 amount);
    event Burned(address indexed from, uint256 amount);

    constructor() ERC20("Pakistani Rupee", "PKR") Ownable(msg.sender) {}

    /**
     * @notice Mint PKR to an address. Only owner.
     *         Called when brands purchase PKR with fiat.
     * @param to Recipient address (brand wallet or platform treasury)
     * @param amount Amount of PKR to mint
     */
    function mint(address to, uint256 amount) external onlyOwner {
        _mint(to, amount);
        emit Minted(to, amount);
    }

    /**
     * @notice Burn own PKR. Used for off-ramp (converting back to fiat).
     * @param amount Amount of PKR to burn
     */
    function burn(uint256 amount) external {
        _burn(msg.sender, amount);
        emit Burned(msg.sender, amount);
    }
}
