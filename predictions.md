# Predictions Module

## Overview

Indexes on-chain prediction events into PostgreSQL for fast queries. Serves prediction history, user stats, and positions to the frontend. Feeds winner data to the Rewards module after market resolution.

## What Lives Where

| Responsibility | Where |
|---|---|
| Spending CALL on YES/NO | Smart contract (PredictionMarket.sol) |
| Pool tracking | Smart contract |
| CALL redistribution to winners | Smart contract |
| Refunds on canceled markets | Smart contract |
| Indexing predictions into DB | This module |
| Serving prediction history | This module |
| Computing winner lists for PKR | This module → Rewards module |

## Prediction Flow

```
User taps "50 CALL on YES"
    │
    ▼
Frontend signs tx → PredictionMarket.predict() on WireFluid
    │
    ▼
PredictionPlaced event emitted
    │
    ▼
Backend indexes event:
  - Insert into predictions table
  - Update user's cached_call_balance
  - Update market's yes_pool/no_pool in DB
  - Push pool update via WebSocket
    │
    ▼
Market resolves (oracle)
    │
    ▼
Backend processes results:
  - Mark each prediction as won/lost/refunded
  - Compute CALL winnings per user (from on-chain WinningsClaimed events)
  - Compile winner list with CALL amounts → pass to Rewards module
```

## Database Schema

```sql
predictions
├── id              UUID (PK)
├── user_id         UUID (FK → users)
├── market_id       INTEGER (not null)      ← on-chain market ID
├── position        VARCHAR ('yes'/'no')
├── amount          VARCHAR                 ← CALL amount bet
├── tx_hash         VARCHAR
├── result          VARCHAR (nullable)      ← 'won'/'lost'/'refunded'/'pending'
├── winnings        VARCHAR (nullable)      ← CALL amount won (if won)
├── created_at      TIMESTAMP
└── updated_at      TIMESTAMP
```

## Event Processing

### PredictionPlaced

```
On PredictionPlaced(marketId, user, position, amount):
  1. Find or create user by wallet address
  2. Insert prediction record
  3. Update cached_call_balance (subtract amount)
  4. Update market pools in DB (yes_pool or no_pool += amount)
  5. Increment market.total_predictors
  6. Push to WebSocket: { marketId, yesPool, noPool }
```

### MarketResolved

```
On MarketResolved(marketId, outcome, yesWins):
  1. Query all predictions for this market
  2. For each prediction:
     - If on winning side → result = 'won'
     - If on losing side → result = 'lost'
  3. Pass winner list to Rewards module for PKR distribution
```

### WinningsClaimed

```
On WinningsClaimed(marketId, user, amount):
  1. Find prediction record for this user + market
  2. Update winnings = amount
  3. Update user's cached_call_balance (add amount)
```

### MarketCanceled

```
On MarketCanceled(marketId):
  1. Update all predictions for this market: result = 'refunded'
```

## User Stats (Computed from Predictions Table)

```sql
-- Win rate
SELECT
  COUNT(*) as total,
  COUNT(*) FILTER (WHERE result = 'won') as wins,
  ROUND(COUNT(*) FILTER (WHERE result = 'won')::numeric / COUNT(*)::numeric * 100, 1) as win_rate
FROM predictions
WHERE user_id = :userId AND result IN ('won', 'lost');
```

## API Endpoints

```
GET  /users/me/predictions                 ← My prediction history (paginated)
GET  /users/me/predictions?marketId=5      ← My position in specific market
GET  /users/me/stats                       ← Win rate, total, CALL won/lost
GET  /markets/:id/predictions              ← All predictions for a market (admin)
GET  /markets/:id/predictions/summary      ← Aggregate: total predictors, pool sizes
```

### Stats Response

```json
{
  "callBalance": "1247",
  "tier": "dedicated",
  "totalPredictions": 84,
  "correctPredictions": 52,
  "winRate": "61.9%",
  "totalCallWon": "3200",
  "totalCallLost": "1850"
}
```

## What This Module Passes to Rewards

After market resolution, Predictions compiles and sends to Rewards:

```json
{
  "marketId": 5,
  "winningPosition": "yes",
  "totalWinningPool": "70000000000000000000000",
  "winners": [
    { "address": "0xabc...", "amount": "50000000000000000000000" },
    { "address": "0xdef...", "amount": "20000000000000000000000" }
  ]
}
```

Rewards module uses this to compute proportional PKR shares per campaign.
