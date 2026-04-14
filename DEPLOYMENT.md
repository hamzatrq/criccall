# CricCall Smart Contract Deployment — WireFluid Testnet

**Deployed:** April 15, 2026
**Network:** WireFluid Testnet (Chain ID: 92533)
**Explorer:** https://wirefluidscan.com
**RPC:** https://evm.wirefluid.com

## Deployer

| | |
|---|---|
| **Deployer Address** | `0x678D575b98d0c082746A9D277aF881B2Ca996657` |
| **Oracle Address** | `0xC85Dd1885E7e2350d9210c58a60937B1822a5470` |

## Contracts

| Contract | Address | Deploy Tx |
|---|---|---|
| **CALLToken** | `0x04884d81a07F0647bF72cfAc5C3Eb3CF863Bf94f` | [0x91852f...](https://wirefluidscan.com/tx/0x91852fbfcabc483e67837b1cedf5bf442235128bdc8f84b18a46e0687510c523) |
| **CricketOracle** | `0x117f08B6BaE7c8AaE9d342f150d332d563f318B6` | [0x8b295f...](https://wirefluidscan.com/tx/0x8b295f68598983c16bdaa2459a0ce2e01f5ead7048ff3f04a8bbbbc46a4b7175) |
| **PredictionMarket** | `0xB115b03E1C24a4183815804Ca148C786E9a41410` | [0xd26785...](https://wirefluidscan.com/tx/0xd267856b72f7468519becd20833317b017337043c38e57f98cfd555eff626638) |
| **PKRToken** | `0x74350054cbd9dE1816dF6c243d429d7bbad8E3b5` | [0xf16e69...](https://wirefluidscan.com/tx/0xf16e697783e73aa1d666b4e3fe497127a02c40a01aaef6efbd0d0da4f9c99e2e) |
| **SponsorVault** | `0xd5ae5c002e70DFB60E812FD7D70718C20a764bF7` | [0xcac9e6...](https://wirefluidscan.com/tx/0xcac9e6ba5c079be8a3939bc43871008eb6df4767f61e1aba751fa1cd376202fd) |

## Wiring Transactions

| Action | Tx Hash |
|---|---|
| `callToken.setPredictionMarket(PredictionMarket)` | [0x48e4ed...](https://wirefluidscan.com/tx/0x48e4edb7dea1c20412e2a0d3c09a75b324a39e951a375dcddb284204ccf7985e) |
| `oracle.setConsumer(PredictionMarket)` | [0x8c8ad6...](https://wirefluidscan.com/tx/0x8c8ad6d9a96bb43fc110345e952120eecb8d4d2a1e93bd245f2a967ebc38dcde) |
| `oracle.addOracle(0xC85D...5470)` | [0x0e12f8...](https://wirefluidscan.com/tx/0x0e12f8692ccaa425e10da52e3b0470d0284a261345b35383e24cdd2cffd3dc95) |
| `vault.addSponsor(deployer)` | [0x8a9a38...](https://wirefluidscan.com/tx/0x8a9a38cc2c08060bc2e2d570ef3243f57d126dd5e1121591592174ec12ab5421) |
| `pkr.mint(deployer, 10,000,000 PKR)` | [0x820704...](https://wirefluidscan.com/tx/0x82070435aa46d6bc352910e1b3c4e3827fb1212ff03f14752182c68b7ca9aeb0) |

## Contract Descriptions

| Contract | Purpose |
|---|---|
| **CALLToken** | Non-transferable ERC-20. Free 100 daily claim. Balance = reputation. Winners receive CALL from losers' pool. |
| **CricketOracle** | Commit-reveal oracle for match results. Prevents frontrunning. Triggers PredictionMarket resolution. |
| **PredictionMarket** | Binary YES/NO prediction markets. Users spend CALL to predict. Proportional payout to winners. |
| **PKRToken** | Mintable ERC-20 (Pakistani Rupee stablecoin). Admin mints against fiat. Used for prize distribution. |
| **SponsorVault** | Halal prize engine. Whitelisted sponsors deposit PKR. Merkle-based distribution to winners. |

## Compiler Settings

- **Solidity:** 0.8.28
- **EVM Version:** Cancun
- **Optimizer:** Enabled, 200 runs
- **Via IR:** Enabled
- **Framework:** Hardhat 2.28.6
- **OpenZeppelin:** 5.6.1

## Test Coverage

120 tests passing across 6 test files (CALLToken, CricketOracle, PredictionMarket, SponsorVault, PKRToken, Integration).

## Verification

All contracts can be verified on WireScan using the flattened single-file approach:
```bash
npx hardhat flatten contracts/CALLToken.sol > flattened/CALLToken.sol
```
Then submit the flattened file on WireScan with matching compiler settings.

## Architecture

```
CALLToken (ERC-20, non-transferable, balance = reputation)
    │
    │  users spend CALL to predict
    │  market returns CALL to winners
    ▼
PredictionMarket (core engine)
    ▲
    │
CricketOracle (commit-reveal)

PKRToken ──→ SponsorVault (real money prizes, separate flow)
```

## Entangled Hackathon Submission — April 2026

**CricCall** — Predict Cricket. Win Rewards. Zero Gambling.
Built on WireFluid. Shariah-compliant by smart contract architecture.
