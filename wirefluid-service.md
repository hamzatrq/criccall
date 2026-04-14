# WireFluid Service

## Overview

Shared NestJS injectable service that manages viem wallet clients, contract instances, and on-chain utilities. Every backend module that touches WireFluid goes through this service. Two isolated wallets with least-privilege separation.

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
│  ├── getWalletBalance()                      │
│  └── watchContractEvent()                    │
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

### getWalletBalance(wallet)

Returns WIRE balance for a given wallet. Used for health monitoring — alerts if oracle wallet runs low on gas.

### getTransactionReceipt(hash)

Fetch receipt for a submitted transaction. Used for verification and audit logging.

## Event Listening

```
watchContractEvent(contract, eventName, callback)
```

Subscribes to on-chain events via WebSocket RPC. Used by other modules to react to on-chain state changes.

| Event | Source Contract | Triggers |
|---|---|---|
| `MarketResolved` | PredictionMarket | Reward computation in RewardsModule |
| `MarketCanceled` | PredictionMarket | Refund notification to users |
| `RewardClaimed` | SponsorVault | Redemption stats update |
| `CallClaimed` | CALLToken | User balance cache update |
| `WinningsClaimed` | PredictionMarket | User balance cache update |

## RPC Failover

WireFluid provides 5 RPC endpoints. Service cycles through them on failure.

```
Primary:  https://evm.wirefluid.com
Fallback: https://evm2.wirefluid.com
          https://evm3.wirefluid.com
          https://evm4.wirefluid.com
          https://evm5.wirefluid.com
```

On RPC timeout or connection error:
1. Rotate to next endpoint
2. Retry the failed request
3. Log the failover event
4. If all 5 fail, throw and alert

## Health Monitoring

```
checkHealth()
  → Verify RPC connection alive (eth_blockNumber call)
  → Check both wallet balances
  → Return: {
      rpc: "connected",
      blockNumber: 12345,
      wallets: {
        owner: "0.5 WIRE",
        oracle: "0.3 WIRE"
      }
    }
```

Alert thresholds:
- Wallet < 0.1 WIRE → log warning
- Wallet < 0.01 WIRE → log critical, block write operations for that wallet

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
