# Users Module

## Overview

User profiles, prediction history, and avatar storage. CALL token balance is reputation — leaderboard and tiers derived directly from on-chain balance. Railway Storage Buckets (S3-compatible) for avatar storage.

## The Core Insight

**CALL balance = reputation.** No separate score, no off-chain computation. A user with 5,000 CALL has been consistently right over weeks. You can't buy it, you can't transfer it — you can only earn it by making correct predictions. The on-chain balance IS the leaderboard.

## User Data Sources

| Data | Source of Truth | Stored in DB? | Why |
|---|---|---|---|
| Wallet address | Blockchain | Yes | Primary identifier |
| Role | DB (RolesGuard) | Yes | Off-chain concept |
| Display name | DB | Yes | User-set, off-chain only |
| Avatar | Railway Storage Bucket | URL in DB | S3-compatible storage |
| Favorite team | DB | Yes | Personalization |
| CALL balance | Blockchain | Cached | This IS reputation. Cached for fast leaderboard. |
| Last claimed time | Blockchain | Cached | Needed for "Claim" button state |
| Prediction history | Blockchain events | Indexed in DB | Querying events on every load is too slow |
| PKR reward claims | Blockchain events | Indexed in DB | Track via RewardClaimed events |
| Tier | Derived from CALL balance | Cached | Computed from cached balance |

## What Users Provide

```
Required (auto from wallet):
  - wallet_address        ← from SIWE on auth

Optional (user sets):
  - display_name          ← "CricketKing99"
  - avatar                ← upload image or pick preset
  - favorite_team         ← Pakistan, India, Australia, etc.
```

No email, no phone, no KYC. Wallet is identity.

## Reputation = CALL Balance

```
How CALL accumulates:
  1. User claims 100 CALL daily (free)
  2. User bets 50 CALL on YES
  3a. YES wins → user gets 50 back + share of losers' pool (net gain)
  3b. YES loses → 50 CALL gone to winners (net loss)

Over time:
  Good predictor: CALL balance grows → higher on leaderboard → better deals
  Bad predictor: CALL balance stays at ~100 (daily claim, lose it, repeat)
  Inactive user: CALL balance stagnates (no daily claim = no growth)
```

## Tiers (Based on CALL Balance)

```
0-99 CALL        → New Fan
100-499 CALL     → Casual Fan        (daily claim level)
500-1999 CALL    → Dedicated Fan     (consistently winning)
2000-4999 CALL   → Expert            (very good predictor)
5000+ CALL       → Superforecaster   (elite, weeks of consistent wins)
```

Tiers computed from cached CALL balance. Updated on every balance change event.

## Leaderboard

```
SELECT wallet_address, display_name, avatar_url, cached_call_balance
FROM users
ORDER BY cached_call_balance DESC
LIMIT 100
```

Simple. The richest in CALL = the best predictor = rank 1. No complex scoring.

## Database Schema

```sql
users
├── id                  UUID (PK)
├── wallet_address      VARCHAR (unique, not null, indexed)
├── role                VARCHAR DEFAULT 'user'
├── display_name        VARCHAR (nullable)
├── avatar_url          VARCHAR (nullable)
├── favorite_team       VARCHAR (nullable)
├── cached_call_balance VARCHAR DEFAULT '0'      ← cached from chain
├── tier                VARCHAR DEFAULT 'new_fan' ← derived from balance
├── last_claimed_at     TIMESTAMP (nullable)
├── created_at          TIMESTAMP
└── updated_at          TIMESTAMP

predictions
├── id                  UUID (PK)
├── user_id             UUID (FK → users)
├── market_id           INTEGER (not null)
├── position            VARCHAR ('yes'/'no')
├── amount              VARCHAR
├── tx_hash             VARCHAR
├── result              VARCHAR (nullable)        ← 'won'/'lost'/'refunded'/'pending'
├── winnings            VARCHAR (nullable)         ← amount won (if won)
├── created_at          TIMESTAMP
└── updated_at          TIMESTAMP

reward_claims
├── id                  UUID (PK)
├── user_id             UUID (FK → users)
├── campaign_id         VARCHAR
├── amount              VARCHAR                    ← PKR amount
├── tx_hash             VARCHAR
├── claimed_at          TIMESTAMP
└── created_at          TIMESTAMP
```

No badges table. No score table. No streak tracking. CALL balance does all of this.

## Blockchain → DB Sync

### Event-Driven (Real-time via WireFluidService)

| Event | Sync Action |
|---|---|
| `CallClaimed` | Update cached_call_balance, last_claimed_at |
| `PredictionPlaced` | Insert prediction record, update cached_call_balance |
| `MarketResolved` | Update prediction results (won/lost), update balances |
| `MarketCanceled` | Update predictions as refunded |
| `WinningsClaimed` | Update prediction winnings, update cached_call_balance, recompute tier |
| `RefundClaimed` | Update cached_call_balance |
| `RewardClaimed` | Insert reward_claims record |

### Periodic Reconciliation (Every 5 minutes)

```
- Reconcile cached_call_balance with on-chain call.balanceOf() for active users
- Recompute tiers from updated balances
- Flag mismatches for investigation
```

### Leaderboard Query

Leaderboard is a direct PostgreSQL query — no Redis cache needed for hackathon:

```sql
SELECT wallet_address, display_name, avatar_url, cached_call_balance
FROM users
ORDER BY CAST(cached_call_balance AS NUMERIC) DESC
LIMIT 100;
```

User balance and tier are also queried directly from PostgreSQL.

## Avatar Storage

Railway Storage Buckets (S3-compatible). Bucket egress is free. Service egress is not — use presigned URLs for serving.

```
Bucket: criccall-avatars (public read)
Path:   {wallet_address}.{ext}

Constraints:
  - Max 2MB
  - PNG, JPG, WebP only
  - Uploaded as-is (image resizing is post-hackathon)
  - Overwrite on update (one avatar per user)
```

Upload flow:
```
POST /users/me/avatar (multipart form)
  → Validate type + size
  → Upload to S3 bucket as {wallet_address}.{ext}
  → Store presigned URL in users.avatar_url
  → Return URL
```

## API Endpoints

```
GET    /users/me                  ← Full profile (from JWT)
PATCH  /users/me                  ← Update display_name, favorite_team
POST   /users/me/avatar           ← Upload avatar image
GET    /users/me/predictions      ← Prediction history (paginated)
GET    /users/me/rewards          ← PKR reward claim history
GET    /users/me/stats            ← CALL balance, tier, total predictions, win rate

GET    /users/:address            ← Public profile (display_name, avatar, tier, CALL balance)
GET    /users/leaderboard         ← Top users by CALL balance (paginated)
GET    /users/leaderboard/weekly  ← Top gainers this week
```

## Environment Variables

```env
S3_BUCKET=criccall-avatars
S3_ACCESS_KEY_ID=
S3_SECRET_ACCESS_KEY=
S3_ENDPOINT=<railway-storage-url>
S3_REGION=us-east-1
```

## Dependencies

- `prisma` + `@prisma/client` — PostgreSQL on Railway
- `@aws-sdk/client-s3` — Railway Storage Buckets (S3-compatible)
- `@aws-sdk/s3-presigned-post` — presigned upload URLs
- `@aws-sdk/s3-request-presigner` — presigned download URLs
