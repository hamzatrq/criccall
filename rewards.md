# Rewards Module

## Overview

Takes winner data from the Predictions module and distributes PKR prizes via SponsorVault. Every correct predictor on the winning side receives PKR proportional to their CALL bet. No top-N cutoff — everyone who was right gets rewarded.

## Distribution Formula

```
user_pkr = (user_call_on_winning_side / total_winning_pool) * campaign_prize_amount

Example:
  Campaign: Rs. 1,00,000 PKR
  Winning pool (YES): 70,000 CALL total across all users

  User A bet 500 CALL on YES  → 500/70,000 * 1,00,000 = Rs. 714.29 PKR
  User B bet 50 CALL on YES   → 50/70,000 * 1,00,000  = Rs. 71.43 PKR
  User C bet 20 CALL on YES   → 20/70,000 * 1,00,000  = Rs. 28.57 PKR

  Everyone on the winning side gets something.
  Bigger CALL bet = more conviction = bigger PKR share.
```

Same proportional formula as CALL redistribution, applied to PKR.

## Distribution Pipeline

Triggered automatically by MarketResolved event:

```
MarketResolved event
    │
    ▼
Wait 60 seconds (let WinningsClaimed txs settle)
    │
    ▼
Predictions module provides winner list:
  { winners: [{ address, callAmount }], totalWinningPool }
    │
    ▼
For each market_campaign linked to this market:
    │
    ├── 1. Compute PKR share per winner
    │      pkr = (callAmount / totalWinningPool) * campaign.prize_amount
    │
    ├── 2. Build Merkle tree
    │      leaves = [(address, pkrAmount), ...]
    │      tree = StandardMerkleTree.of(leaves, ["address", "uint256"])
    │
    ├── 3. Post root to SponsorVault
    │      vault.postWinnerRoot(campaignId, root, totalAllocated)
    │
    ├── 4. Store distribution + tree in DB
    │
    └── 5. Notify winners via Notifications module
```

## Claim Flow

```
User opens Rewards tab
    │
    ▼
Frontend: GET /rewards/me/unclaimed
    │
    ▼
Backend returns:
  [
    { campaign: "PAK-IND-PTCL", amount: "2500", sponsor: "PTCL", logo: "..." },
    { campaign: "PAK-IND-FOODPANDA", amount: "500", sponsor: "Foodpanda", logo: "..." }
  ]
    │
    ▼
User taps "Claim"
    │
    ▼
Frontend: GET /rewards/:campaignId/proof
  → Backend generates Merkle proof from stored tree
  → Returns: { amount, proof[] }
    │
    ▼
Frontend signs tx: vault.claim(campaignId, amount, proof)
    │
    ▼
PKR transferred to user's wallet
    │
    ▼
RewardClaimed event → backend updates claim status
```

## Database Schema

```sql
reward_distributions
├── id              UUID (PK)
├── market_id       UUID (FK → markets)
├── campaign_id     VARCHAR (FK → market_campaigns.campaign_id)
├── merkle_root     VARCHAR
├── total_allocated VARCHAR
├── winner_count    INTEGER
├── tree_data       JSONB                ← full Merkle tree for proof generation
├── post_tx_hash    VARCHAR
├── created_at      TIMESTAMP
└── updated_at      TIMESTAMP

reward_winners
├── id              UUID (PK)
├── distribution_id UUID (FK → reward_distributions)
├── user_id         UUID (FK → users)
├── wallet_address  VARCHAR
├── pkr_amount      VARCHAR
├── call_amount     VARCHAR              ← CALL bet on winning side
├── claimed         BOOLEAN DEFAULT false
├── claim_tx_hash   VARCHAR (nullable)
├── created_at      TIMESTAMP
└── updated_at      TIMESTAMP

reward_claims (from users.md)
├── id              UUID (PK)
├── user_id         UUID (FK → users)
├── campaign_id     VARCHAR
├── amount          VARCHAR
├── tx_hash         VARCHAR
├── claimed_at      TIMESTAMP
└── created_at      TIMESTAMP
```

## API Endpoints

```
# User
GET  /rewards/me                          ← All my rewards (claimed + unclaimed)
GET  /rewards/me/unclaimed                ← Only unclaimed
GET  /rewards/:campaignId/proof           ← Merkle proof for claiming on-chain

# Admin
POST /admin/rewards/:marketId/distribute  ← Manually trigger distribution
GET  /admin/rewards/:marketId/status      ← Distribution status per campaign

# Sponsor
GET  /sponsor/campaigns/:id/winners       ← Winner list with PKR amounts
GET  /sponsor/campaigns/:id/stats         ← Redemption stats
```

### Sponsor Stats Response

```json
{
  "campaignId": "PAK-IND-PTCL",
  "market": "PAK vs IND",
  "deposited": "1050000",
  "tier": "title",
  "totalWinners": 1200,
  "totalAllocated": "1050000",
  "totalClaimed": "840000",
  "totalUnclaimed": "210000",
  "smallestPrize": "12",
  "largestPrize": "25000",
  "bannerImpressions": 15000,
  "shareCardAppearances": 1200
}
```

## Error Handling

| Scenario | Handling |
|---|---|
| postWinnerRoot tx fails | Retry 3x with exponential backoff. Flag for admin if still fails. |
| No correct predictors | No distribution. Campaign eligible for clawback after expiry. |
| Market canceled (NoResult) | No distribution. All campaigns eligible for clawback. |
| User doesn't claim before expiry | Unclaimed PKR returns to sponsor via clawback. |
| Merkle proof generation fails | Return error, user retries. Tree data is in DB. |

## Retry Logic

```
On postWinnerRoot failure:
  Attempt 1: immediate retry
  Attempt 2: wait 5 seconds
  Attempt 3: wait 15 seconds
  After 3 failures:
    - Store distribution as 'failed' in DB
    - Alert admin via Notifications
    - Admin can manually trigger: POST /admin/rewards/:marketId/distribute
```

## Redis Caching

```
rewards:user:{address}:unclaimed    → list of unclaimed rewards (TTL: 60s)
rewards:campaign:{id}:stats         → campaign stats (TTL: 5min)
```
