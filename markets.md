# Markets Module

## Overview

Market creation, lifecycle management, match data ingestion, multi-sponsor campaigns, and real-time state tracking. Every market has two layers: CALL token pool redistribution + PKR prize distribution from one or more sponsors.

## What a Market Is

```
Market = CALL Layer (always) + PKR Layer (always, one or more sponsors)

CALL Layer:
  Users spend CALL → winners take from losers' pool
  Handled by PredictionMarket.sol

PKR Layer:
  Platform deposits default prize
  Brands can attach additional PKR sponsorships
  Each sponsor = separate SponsorVault campaign
  Top predictors win PKR
```

## Market Lifecycle

```
UPCOMING ──→ OPEN ──→ LOCKED ──→ RESOLVED / CANCELED
   │           │         │            │
   │           │         │            ├── Winners claim CALL
   │           │         │            ├── Top N claim PKR (per campaign)
   │           │         │            └── (or CALL refund + PKR clawback if canceled)
   │           │         │
   │           │         └── lockTime passes, no more predictions
   │           │
   │           └── Users predict with CALL, sponsors can still attach
   │
   └── Market created, platform PKR deposited, visible in app
```

## Market Creation

### Auto-Creation (Cron Job)

```
Daily at midnight:
  1. Poll cricket API for matches in next 48 hours
  2. For each match:
     a. Create match record in DB if new
     b. Create default market: "Will {TeamA} win?"
     c. Submit to WireFluid via WireFluidService → market.createMarket()
     d. Platform deposits default PKR prize via SponsorVault
  3. Sync on-chain market ID back to DB
```

### Manual Creation (Admin)

```
POST /admin/markets
Body: {
  "matchId": "PAK-IND-2026-04-20",
  "question": "Will Pakistan score 200+?",
  "lockTime": "2026-04-20T14:00:00Z",
  "yesOutcome": 1,
  "teamA": "Pakistan",
  "teamB": "India",
  "matchType": "T20",
  "tournament": "PSL 2026"
}
```

## Multi-Sponsor Model

Multiple brands can sponsor the same market. Each sponsor creates a separate SponsorVault campaign linked to that market. No contract changes needed.

### How Brands Join

```
1. Platform auto-creates market + deposits Rs. 5,000 PKR (base prize)
   → Market is live, users predicting

2. Foodpanda sees the market trending
   → Deposits Rs. 1,00,000 PKR into SponsorVault
   → Linked to this market
   → Total prize: Rs. 1,05,000

3. PTCL also wants in
   → Deposits Rs. 10,50,000 PKR
   → Total prize: Rs. 11,55,000
   → PTCL becomes title sponsor (highest deposit)
```

### Sponsor Visibility Tiers

Visibility is proportional to PKR deposited. Computed dynamically when sponsors join.

| Tier | Rule | Visibility |
|---|---|---|
| **Title Sponsor** | Highest depositor | "Presented by" header, banner image, logo on share cards, featured deal slot |
| **Gold Sponsor** | Rs. 50,000+ deposit | Logo on market card, name in sponsor list, mentioned in results |
| **Sponsor** | Any deposit | Name in sponsor list |

Recomputed when a new sponsor joins. If a new deposit exceeds the current title sponsor, title transfers.

### Sponsor Onboarding Flow

```
Sponsor logs in (wallet + sponsor role)
  → Browses upcoming/live markets
  → Clicks "Sponsor This Match"
  → Sets: prize amount, winner count
  → Uploads: logo, banner image (optional), click-through URL
  → Approves PKR, deposits into SponsorVault
  → Market card updates immediately
```

### Sponsor Branding Assets

Each sponsor provides:
- **Logo** (required) — displayed in sponsor list and market card
- **Banner image** (optional, title sponsors) — displayed at top of market card
- **Click-through URL** (optional) — link when user taps sponsor logo
- **Sponsor name** (required) — display name

Stored in MinIO, URLs in DB.

## Market Card Rendering

### With Title Sponsor

```
┌──────────────────────────────────────────┐
│  PTCL Presents                           │
│  ┌────────────────────────────────────┐  │
│  │        PTCL BANNER IMAGE           │  │
│  └────────────────────────────────────┘  │
│                                          │
│  PSL 2026 · T20                          │
│  🇵🇰 Pakistan vs India 🇮🇳                │
│                                          │
│  Will Pakistan win?                      │
│                                          │
│  YES 62%  ████████░░░  NO 38%           │
│                                          │
│  🏆 Total Prize: Rs. 11,55,000 PKR      │
│                                          │
│  Sponsors:                               │
│  PTCL ████████████████████░ Rs. 10,50,000│
│  Foodpanda ██░░░░░░░░░░░░░░ Rs. 1,00,000│
│  CricCall ░░░░░░░░░░░░░░░░░ Rs. 5,000   │
│                                          │
│  Top 100 predictors win                  │
│  3,420 predictions · Locks 2h 30m        │
└──────────────────────────────────────────┘
```

### Without Brand Sponsor (Platform Only)

```
┌─────────────────────────────────┐
│  PSL 2026 · T20                 │
│  🇵🇰 Pakistan vs India 🇮🇳       │
│                                  │
│  Will Pakistan win?              │
│                                  │
│  YES 62%  ████████░░  NO 38%    │
│                                  │
│  🏆 Prize: Rs. 5,000 PKR        │
│  by CricCall                     │
│                                  │
│  320 predictions · Locks 2h 30m  │
└─────────────────────────────────┘
```

## Share Cards (Winner)

Title sponsor branding on every share card:

```
┌──────────────────────────────────┐
│  🏆 I won Rs. 2,500 PKR!        │
│                                  │
│  PAK vs IND · PSL 2026           │
│  Predicted: Pakistan wins ✓      │
│  My CALL balance: 1,247          │
│                                  │
│  Powered by PTCL                 │
│  [PTCL Logo]                     │
│                                  │
│  Play free on CricCall           │
└──────────────────────────────────┘
```

## Claim Screen

```
┌──────────────────────────────────┐
│  🎉 You won!                     │
│                                  │
│  Rs. 2,500 PKR from PTCL        │
│  Rs. 500 PKR from Foodpanda     │
│                                  │
│  [PTCL Banner]                   │
│                                  │
│  [Claim All to Wallet]           │
│                                  │
│  Also sponsored by: CricCall     │
└──────────────────────────────────┘
```

User claims each campaign separately on-chain (each has its own Merkle proof), but frontend can batch the UX.

## Prize Distribution (After Resolution)

Each campaign resolves independently:

```
Market resolves:
  1. Backend queries all PredictionPlaced events for this market
  2. Ranks ALL predictors by conviction:
     conviction = amount_on_correct_side / total_amount_bet_by_user
  3. For each campaign linked to this market:
     a. Take top N predictors (N = campaign.winner_count)
     b. Split prize proportionally or equally (campaign config)
     c. Build Merkle tree of (address, pkrAmount)
     d. Post root to SponsorVault via WireFluidService
  4. Users claim PKR from frontend per campaign
```

## Visual Identity

Pre-seeded teams table for flags and logos:

```sql
teams
├── id            UUID (PK)
├── name          VARCHAR (unique)
├── short_name    VARCHAR
├── logo_url      VARCHAR
├── type          VARCHAR              ← 'national' or 'franchise'
├── country       VARCHAR
└── created_at    TIMESTAMP
```

## Database Schema

```sql
matches
├── id              UUID (PK)
├── match_id        VARCHAR (unique, not null)
├── team_a_id       UUID (FK → teams)
├── team_b_id       UUID (FK → teams)
├── match_type      VARCHAR
├── tournament      VARCHAR
├── venue           VARCHAR (nullable)
├── start_time      TIMESTAMP
├── status          VARCHAR DEFAULT 'upcoming'
├── api_data        JSONB (nullable)
├── created_at      TIMESTAMP
└── updated_at      TIMESTAMP

markets
├── id              UUID (PK)
├── on_chain_id     INTEGER (unique, not null)
├── match_id        VARCHAR (FK → matches.match_id)
├── question        VARCHAR (not null)
├── lock_time       TIMESTAMP (not null)
├── yes_outcome     SMALLINT
├── state           VARCHAR DEFAULT 'open'
├── resolved_outcome SMALLINT (nullable)
├── yes_pool        VARCHAR DEFAULT '0'
├── no_pool         VARCHAR DEFAULT '0'
├── total_predictors INTEGER DEFAULT 0
├── yes_won         BOOLEAN (nullable)
├── total_prize     VARCHAR DEFAULT '0'       ← sum of all campaigns
├── created_tx_hash VARCHAR
├── resolved_tx_hash VARCHAR (nullable)
├── created_at      TIMESTAMP
└── updated_at      TIMESTAMP

market_campaigns
├── id              UUID (PK)
├── market_id       UUID (FK → markets)
├── campaign_id     VARCHAR (unique)          ← SponsorVault campaign ID
├── sponsor_id      UUID (FK → users)
├── sponsor_name    VARCHAR
├── sponsor_logo    VARCHAR
├── sponsor_banner  VARCHAR (nullable)        ← banner image (title sponsors)
├── sponsor_url     VARCHAR (nullable)        ← click-through link
├── prize_amount    VARCHAR
├── winner_count    INTEGER
├── distribution    VARCHAR DEFAULT 'proportional'  ← 'proportional' or 'equal'
├── tier            VARCHAR                   ← 'title' / 'gold' / 'sponsor'
├── merkle_root     VARCHAR (nullable)
├── status          VARCHAR DEFAULT 'active'  ← active/resolved/clawed_back
├── created_at      TIMESTAMP
└── updated_at      TIMESTAMP
```

## Blockchain Sync

### Events → DB

| Event | Action |
|---|---|
| `MarketCreated` | Verify DB record, store tx hash |
| `PredictionPlaced` | Update pools, increment predictors, push via WebSocket |
| `MarketResolved` | Update state, trigger prize distribution per campaign |
| `MarketCanceled` | Update state, allow CALL refunds + PKR clawbacks |
| `CampaignCreated` | Link to market, compute sponsor tier |
| `RewardClaimed` | Update campaign redemption stats |

### State Transition Cron

```
Every 60 seconds:
  - Markets past lock_time still 'open' → update to 'locked'
  - Matches past start_time → update status to 'live'
```

## API Endpoints

```
# Public
GET    /markets                          ← List markets (paginated, filterable)
GET    /markets/:id                      ← Market detail + sponsors
GET    /markets/:id/positions            ← Current user's position
GET    /markets/:id/sponsors             ← All sponsors with branding
GET    /markets/live                     ← Open/locked markets
GET    /markets/resolved                 ← Past resolved markets
GET    /markets/match/:matchId           ← All markets for a match

# Sponsor
POST   /markets/:id/sponsor             ← Deposit PKR + attach branding
PATCH  /markets/:id/sponsor/:campaignId  ← Update banner/logo/url
GET    /sponsor/campaigns                ← My campaigns
GET    /sponsor/campaigns/:id/stats      ← Redemptions, impressions

# Admin
POST   /admin/markets                    ← Create market manually
GET    /admin/matches/upcoming           ← Upcoming matches from API
POST   /admin/matches/sync              ← Force sync match schedule
```

## Query Filters

```
GET /markets?status=open&tournament=PSL&matchType=T20&page=1&limit=20
GET /markets?status=resolved&sort=resolved_at:desc
GET /markets/live?team=Pakistan
```

## Redis Caching

```
market:{onChainId}           → full market + sponsors (TTL: 30s open, 5min resolved)
market:{onChainId}:pools     → { yesPool, noPool } (TTL: 10s)
markets:live                 → list of live market IDs (TTL: 30s)
match:{matchId}:status       → match status from API (TTL: 60s)
```

## Sponsor Analytics

```
GET /sponsor/campaigns/:id/stats
Response: {
  market: "PAK vs IND",
  deposited: "1050000",
  tier: "title",
  predictions_during_campaign: 3420,
  unique_users_exposed: 2800,
  winners: 100,
  pkr_claimed: "840000",
  pkr_unclaimed: "210000",
  banner_impressions: 15000,
  share_card_appearances: 1200
}
```

PKR flow verifiable on WireScan. Impression counts from backend analytics.

## Environment Variables

```env
CRICKET_API_KEY=<cricapi-key>
CRICKET_API_URL=https://api.cricapi.com/v1
DEFAULT_PRIZE_AMOUNT=5000          ← platform default PKR prize per market
```
