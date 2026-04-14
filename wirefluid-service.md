# WireFluid Service

## Overview

Shared NestJS injectable service that manages viem wallet clients, contract instances, and on-chain utilities. Every backend module that touches WireFluid goes through this service. Two isolated wallets with least-privilege separation. For the hackathon, this service provides read/write contract methods and on-chain event watching. RPC failover and health monitoring are post-hackathon.

## Architecture

```
┌──────────────────────────────────────────────┐
│              WireFluidService                 │
│                                              │
│  Wallets:                                    │
│  ├── ownerWallet   (markets, roots, manage,  │
│  │                  PKR minting)             │
│  └── oracleWallet  (commit/reveal)           │
│                                              │
│  Contract Instances:                         │
│  ├── callToken                               │
│  ├── predictionMarket                        │
│  ├── cricketOracle                           │
│  ├── sponsorVault                            │
│  └── pkrToken                                │
│                                              │
│  Utilities:                                  │
│  ├── getPublicClient()                       │
│  ├── waitForTransaction()                    │
│  ├── estimateGas()                           │
│  ├── getTransactionReceipt()                 │
│  └── watchContractEvent(contract, event, cb) │
│                                              │
│  Used by:                                    │
│  ├── OracleModule                            │
│  ├── MarketsModule                           │
│  └── RewardsModule                           │
└──────────────────────────────────────────────┘
```

## Two Wallets, Two Purposes

```
OWNER_PRIVATE_KEY ──→ ownerWallet
  Used by: MarketsModule, RewardsModule
  On-chain: createMarket, postWinnerRoot, addSponsor,
            setPredictionMarket, mint PKR

ORACLE_PRIVATE_KEY ──→ oracleWallet
  Used by: OracleModule only
  On-chain: commitResult, revealResult
```

Separation of keys means a compromised oracle wallet can't create markets or mint PKR. Least privilege enforced at wallet level.

## Contract Read Methods (Public Client)

No wallet needed. Anyone can query. Used by frontend and backend.

```
// CALLToken
call.balanceOf(address)
call.lastClaimed(address)

// PredictionMarket
market.markets(marketId)
market.getUserPosition(marketId, address)
market.marketCount()

// CricketOracle
oracle.getMatchResult(matchId)
oracle.isResolved(matchId)

// SponsorVault
vault.campaigns(campaignId)
vault.claimed(campaignId, address)

// PKRToken
pkr.balanceOf(address)
pkr.totalSupply()
```

## Contract Write Methods (Wallet Clients)

### Owner Wallet

```
market.createMarket(matchId, question, lockTime, yesOutcome)
vault.addSponsor(address)
vault.removeSponsor(address)
vault.postWinnerRoot(campaignId, root, totalAllocated)
call.setPredictionMarket(address)
oracle.setConsumer(address)
oracle.addOracle(address)
pkr.mint(to, amount)
```

### Oracle Wallet

```
oracle.commitResult(matchId, commitHash)
oracle.revealResult(matchId, outcome, secret)
```

## Transaction Utilities

### waitForTransaction(hash)

Polls until tx is confirmed on WireFluid (~5s with CometBFT finality). Returns receipt with status, gas used, and decoded logs. Throws on revert with decoded custom error.

### estimateGas(contractCall)

Pre-flight gas estimation before submitting. Used to avoid wasting gas on transactions that will revert. Returns estimated gas units.

### getTransactionReceipt(hash)

Fetch receipt for a submitted transaction. Used for verification and audit logging.

## Event Listening

On-chain event watching via `watchContractEvent()`. The WireFluidService subscribes to contract events at startup and routes them to the appropriate module handlers.

### Events Monitored

| Event | Action |
|---|---|
| `MarketResolved` | Trigger reward computation via Rewards module |
| `MarketCanceled` | Notify users of refund availability via WebSocket |
| `RewardClaimed` | Update redemption stats in DB |
| `PredictionPlaced` | Update market pools in DB, push update via WebSocket |
| `WinningsClaimed` | Update user balance cache in DB |

### watchContractEvent(contract, eventName, callback)

Subscribes to a specific event on a contract instance using viem's `watchContractEvent`. Callback receives decoded event args. Used by Predictions, Markets, and Rewards modules to react to on-chain state changes in real time.

## Post-Hackathon

The following features are planned but not implemented for the hackathon:

- **RPC Failover** — cycling through multiple WireFluid RPC endpoints on failure
- **Health Monitoring** — wallet balance alerts, RPC health checks
- **getWalletBalance()** — WIRE balance checks for gas monitoring

## Module Usage Pattern

```typescript
// OracleModule
constructor(private wirefluid: WireFluidService) {}

async commitResult(matchId: string, hash: string) {
  const tx = await this.wirefluid.oracle.commitResult(matchId, hash);
  return this.wirefluid.waitForTransaction(tx);
}

// RewardsModule
async postWinnerRoot(campaignId: string, root: string, total: bigint) {
  const tx = await this.wirefluid.vault.postWinnerRoot(campaignId, root, total);
  return this.wirefluid.waitForTransaction(tx);
}

// MarketsModule
async createMarket(matchId: string, question: string, lockTime: number, yesOutcome: number) {
  const tx = await this.wirefluid.market.createMarket(matchId, question, lockTime, yesOutcome);
  return this.wirefluid.waitForTransaction(tx);
}
```

Every module gets the same injected service. The right wallet is used automatically based on which contract method is called.

## Environment Variables

```env
# Wallets
OWNER_PRIVATE_KEY=
ORACLE_PRIVATE_KEY=

# Network
WIREFLUID_RPC_URL=https://evm.wirefluid.com
WIREFLUID_CHAIN_ID=92533

# Contract Addresses (set after deployment)
CALL_TOKEN_ADDRESS=
PREDICTION_MARKET_ADDRESS=
CRICKET_ORACLE_ADDRESS=
SPONSOR_VAULT_ADDRESS=
PKR_TOKEN_ADDRESS=
```

## Dependencies

- `viem` — wallet clients, contract instances, public client, event watching
- `@nestjs/common` — injectable service
- Contract ABIs — imported from `packages/contracts/artifacts`
