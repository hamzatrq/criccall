# Smart Contracts Architecture

## Overview

Five Solidity contracts deployed on WireFluid Testnet (Chain ID: 92533). Built with Hardhat, OpenZeppelin, and Solidity 0.8.28 targeting Cancun EVM. All contracts verified on WireScan.

## Contract Dependency Map

```
CALLToken (ERC-20, non-transferable)
    │
    │  users spend CALL to predict
    │  market returns CALL to winners (proportional from losers)
    ▼
PredictionMarket (core engine)
    ▲                  │
    │                  │
CricketOracle          │
  (commit-reveal)      │
                       │
PKRToken ──→ SponsorVault (real money prizes, separate flow)
```

## Contracts

### 1. CALLToken.sol

Non-transferable, non-purchasable ERC-20 token. Users claim 100 CALL daily and spend them on predictions. Winners receive CALL from the losers' pool. **CALL balance IS reputation** — the leaderboard is sorted by CALL balance.

**Halal constraints enforced by code:**
- No `payable` functions — CALL cannot be purchased
- `transfer()` and `transferFrom()` revert — no secondary market
- `approve()` reverts — no allowance mechanism
- Only PredictionMarket contract can call `spend()` and `reward()`

| Function | Access | Description |
|---|---|---|
| `claimDaily()` | Anyone | Mint 100 CALL to caller. Once per 24 hours. |
| `spend(user, amount)` | PredictionMarket only | Burn CALL when user places prediction |
| `reward(user, amount)` | PredictionMarket only | Mint CALL as winnings to user |
| `setPredictionMarket(address)` | Owner only | Set the authorized market contract |

**State:**
- `lastClaimed[address]` — timestamp of last daily claim per wallet
- `predictionMarket` — authorized market contract address

**Events:** `CreditsClaimed(user, amount)`, `PredictionMarketSet(market)`

**Reputation model:** A user with 5,000 CALL has been consistently right for weeks. You can't buy CALL, can't transfer it — only earn it by predicting correctly. Balance = reputation = leaderboard position.

### 2. CricketOracle.sol

Commit-reveal oracle for cricket match results. Prevents frontrunning by requiring a two-step process: commit a hash, then reveal the result that matches it.

| Function | Access | Description |
|---|---|---|
| `commitResult(matchId, hash)` | Authorized oracle | Commit keccak256(matchId, outcome, secret) |
| `revealResult(matchId, outcome, secret)` | Authorized oracle | Reveal result. Must match commit hash. Triggers PredictionMarket. |
| `addOracle(address)` | Owner | Whitelist an oracle address |
| `removeOracle(address)` | Owner | Remove an oracle address |
| `setConsumer(address)` | Owner | Set PredictionMarket as consumer for auto-resolution |
| `getMatchResult(matchId)` | Anyone | Query resolved match outcome |
| `isResolved(matchId)` | Anyone | Check if match has been resolved |

**Commit-reveal flow:**
```
1. Oracle backend generates random secret
2. Computes hash = keccak256(abi.encode(matchId, outcome, secret))
3. Calls commitResult(matchId, hash) — outcome is hidden
4. Waits ~5 seconds (1 block on WireFluid)
5. Calls revealResult(matchId, outcome, secret) — hash must match
6. CricketOracle calls PredictionMarket.onMatchResolved() automatically
```

**Outcomes enum:** `Unresolved(0)`, `TeamA(1)`, `TeamB(2)`, `Draw(3)`, `NoResult(4)`

**State:**
- `authorizedOracles[address]` — whitelist
- `commits[matchId]` — commit hash, oracle address, timestamp
- `matchResults[matchId]` — outcome, resolved flag, timestamp, resolvedBy

**Events:** `OracleAdded`, `OracleRemoved`, `ResultCommitted(matchId, oracle)`, `ResultRevealed(matchId, outcome)`, `ConsumerSet`

### 3. PredictionMarket.sol

Core prediction engine. Binary YES/NO markets where users spend CALL tokens. Markets resolve via CricketOracle. Winners claim proportional payouts from the total pool (their stake + losers' stakes).

**Market lifecycle:** `Open → Locked → Resolved | Canceled`

| Function | Access | Description |
|---|---|---|
| `createMarket(matchId, question, lockTime, yesOutcome)` | Owner | Create a new binary market. yesOutcome defines which oracle result maps to YES. |
| `predict(marketId, position, amount)` | Anyone | Spend CALL on YES or NO. Only while Open and before lockTime. |
| `onMatchResolved(matchId, outcome)` | CricketOracle only | Auto-called on reveal. Resolves or cancels all markets for that matchId. |
| `claimWinnings(marketId)` | Anyone | Winners claim proportional share of total pool. |
| `claimRefund(marketId)` | Anyone | Claim full refund on canceled (NoResult) market. |
| `marketCount()` | Anyone | Total number of markets created |
| `getUserPosition(marketId, user)` | Anyone | User's YES and NO amounts for a market |

**Payout formula:**
```
winnings = (userStake / winnerPool) * totalPool

Example: Total pool = 100 CALL. YES pool = 70, NO pool = 30.
TeamA wins (YES wins):
  user1 staked 50 YES → 50/70 * 100 = 71.43 CALL
  user3 staked 20 YES → 20/70 * 100 = 28.57 CALL

Losers' 30 CALL is redistributed to winners proportionally.
Winners' CALL balance grows → reputation grows → leaderboard position improves.
```

**Resolution logic:**
- Oracle outcome matches market's `yesOutcome` → YES wins
- Oracle outcome is anything else (except NoResult) → NO wins
- Oracle outcome is `NoResult` → Market canceled, all refunded

**State:**
- `markets[]` — array of Market structs (matchId, question, lockTime, state, pools)
- `positions[marketId][user]` — UserPosition (yesAmount, noAmount, claimed)

**Events:** `MarketCreated`, `PredictionPlaced(marketId, user, position, amount)`, `MarketResolved(marketId, outcome, yesWins)`, `MarketCanceled`, `WinningsClaimed`, `RefundClaimed`

### 4. SponsorVault.sol

Real money prize engine. Whitelisted sponsors deposit PKR into campaigns. Top predictors (ranked by CALL balance contribution for that match) claim PKR via Merkle proof. Unclaimed funds return to sponsor after expiry.

**Halal constraint:** `require(whitelistedSponsors[msg.sender])` — user funds can never enter the prize pool. Prize money comes from sponsors/platform, not from users.

| Function | Access | Description |
|---|---|---|
| `addSponsor(address)` | Owner | Whitelist a sponsor address |
| `removeSponsor(address)` | Owner | Remove a sponsor |
| `createCampaign(id, token, amount, expiry)` | Whitelisted sponsor | Deposit PKR (or native WIRE) into escrow |
| `postWinnerRoot(id, root, totalAllocated)` | Owner | Post Merkle root of winners after resolution |
| `claim(id, amount, proof)` | Anyone | Claim PKR reward with valid Merkle proof |
| `clawback(id)` | Campaign sponsor | Reclaim unclaimed PKR after expiry |

**Campaign lifecycle:**
```
1. DEPOSIT  — Sponsor deposits PKR. Visible on WireScan.
2. RESOLVE  — Backend ranks predictors, builds Merkle tree, posts root on-chain.
3. CLAIM    — Winners claim PKR via Merkle proof.
4. CLAWBACK — After expiry, sponsor reclaims whatever wasn't claimed.
```

**Merkle leaf format:** `keccak256(bytes.concat(keccak256(abi.encode(address, uint256))))`
Uses OpenZeppelin's StandardMerkleTree (double-hash for second preimage resistance).

**Public audit state per campaign:**
- `totalCommitted` — PKR deposited by sponsor
- `totalAllocated` — PKR assigned to winners via Merkle root
- `totalRedeemed` — PKR actually claimed by winners

**State:**
- `whitelistedSponsors[address]` — sponsor whitelist
- `campaigns[campaignId]` — Campaign struct
- `claimed[campaignId][address]` — whether user has claimed

**Events:** `SponsorAdded`, `SponsorRemoved`, `CampaignCreated(id, sponsor, token, amount, expiry)`, `WinnerRootPosted(id, root)`, `RewardClaimed(id, winner, amount)`, `Clawback(id, sponsor, amount)`

### 5. PKRToken.sol

Mintable ERC-20 representing the Pakistani Rupee on WireFluid. Admin mints PKR to brands against fiat purchases. Used as the deposit token in SponsorVault for prize distribution.

**Why we need this:** No PKR stablecoin exists on WireFluid. For the hackathon, we create our own. In production, this would be replaced by an official PKR stablecoin.

| Function | Access | Description |
|---|---|---|
| `mint(to, amount)` | Owner only | Mint PKR to an address (brands or platform treasury) |
| `burn(amount)` | Anyone | Burn own PKR (for off-ramp) |
| Standard ERC-20 | Anyone | `transfer`, `approve`, `transferFrom` — all enabled (PKR has real value) |

**Flow:**
```
Brand pays CricCall Rs. 100,000 (fiat, bank transfer)
  → Admin mints 100,000 PKR to brand's wallet
  → Brand deposits PKR into SponsorVault campaign
  → Winners claim PKR after match resolution
  → Winners redeem PKR via WireFluid's fiat off-ramp to JazzCash
```

**State:**
- Standard ERC-20 state (balances, allowances)

**Events:** Standard ERC-20 events (`Transfer`, `Approval`) + `Mint(to, amount)`, `Burn(from, amount)`

## Two-Token System

```
CALL Token                              PKR Token
──────────                              ─────────
Source: Free daily claim (100/day)      Source: Admin mints against fiat
Value: Zero monetary value              Value: Real money (1 PKR = Rs. 1)
Transfer: Disabled                      Transfer: Fully enabled
Purchase: Impossible                    Purchase: Brands buy from platform
Use: Prediction fuel + reputation       Use: Prize distribution
Balance = reputation = leaderboard      Balance = actual money won

         ┃ NO CONNECTION ┃
         ┃ No conversion ┃
         ┃ No bridging   ┃
         ┃ No mixing     ┃
```

CALL and PKR never mix. You can't convert CALL to PKR. You can't buy CALL with PKR. The economic loops are completely separate — enforced by smart contract architecture.

## Deployment

**Tooling:** Hardhat 2.28.6, Solidity 0.8.28, Cancun EVM, OpenZeppelin 5.6.1

**Network:** WireFluid Testnet
- RPC: `https://evm.wirefluid.com`
- Chain ID: `92533`
- Explorer: `https://wirefluidscan.com`

**Deployment order:**
```
1. CALLToken.deploy()
2. CricketOracle.deploy()
3. PredictionMarket.deploy(callTokenAddress, oracleAddress)
4. PKRToken.deploy()
5. SponsorVault.deploy()

Wiring:
6. callToken.setPredictionMarket(marketAddress)
7. oracle.setConsumer(marketAddress)
8. oracle.addOracle(oracleWalletAddress)
9. vault.addSponsor(sponsorAddress)
10. pkr.mint(platformTreasury, initialAmount)
```

**Verification:** Flatten with `npx hardhat flatten`, deploy flattened version, verify on WireScan with matching compiler settings.

## Test Coverage

Tests need updating to reflect CALL rename and PKRToken addition. Target: all existing tests pass with renames, plus new PKRToken tests and updated integration tests.
