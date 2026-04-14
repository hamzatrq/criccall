# Brand Deals Module

## Overview

Deals marketplace where brands offer exclusive perks to users based on CALL balance. Separate from markets and predictions. CALL balance is a read-only gate — no tokens deducted on redemption. Brands get analytics on who redeemed, when, and at what tier.

## How It Works

```
Brand creates deal:
  "20% off Foodpanda orders"
  Minimum CALL required: 500
  Valid: Apr 15 - May 15

User with 650 CALL:
  → Sees deal in Deals tab
  → Taps "Redeem"
  → Gets coupon code / link / QR
  → No CALL deducted — balance is just the gate

User with 300 CALL:
  → Sees deal but it's locked
  → Shows "Need 500 CALL to unlock"
  → Motivation to predict more and grow balance
```

## Brand Profiles

Brands are users with `sponsor` role. They get a profile page visible to users.

```sql
brand_profiles
├── id              UUID (PK)
├── user_id         UUID (FK → users, unique)
├── brand_name      VARCHAR (not null)
├── brand_logo      VARCHAR
├── brand_banner    VARCHAR (nullable)
├── brand_url       VARCHAR (nullable)
├── description     VARCHAR (nullable)
├── category        VARCHAR                  ← 'food', 'telecom', 'ecommerce', 'entertainment'
├── verified        BOOLEAN DEFAULT false    ← admin verified
├── created_at      TIMESTAMP
└── updated_at      TIMESTAMP
```

## Deal Structure

```sql
deals
├── id              UUID (PK)
├── brand_id        UUID (FK → brand_profiles)
├── title           VARCHAR (not null)
├── description     TEXT
├── image_url       VARCHAR (nullable)       ← deal image (MinIO)
├── min_call        INTEGER (not null)       ← minimum CALL balance required
├── deal_type       VARCHAR                  ← 'coupon_code', 'link', 'qr_code'
├── coupon_code     VARCHAR (nullable)       ← static code, or null if dynamic
├── deal_url        VARCHAR (nullable)       ← redirect URL for link type
├── max_redemptions INTEGER (nullable)       ← null = unlimited
├── total_redeemed  INTEGER DEFAULT 0
├── starts_at       TIMESTAMP
├── expires_at      TIMESTAMP
├── active          BOOLEAN DEFAULT true
├── created_at      TIMESTAMP
└── updated_at      TIMESTAMP

deal_redemptions
├── id              UUID (PK)
├── deal_id         UUID (FK → deals)
├── user_id         UUID (FK → users)
├── redeemed_at     TIMESTAMP
├── call_balance    INTEGER                  ← user's CALL balance at redemption time
├── created_at      TIMESTAMP
└── updated_at      TIMESTAMP
```

One redemption per user per deal. `call_balance` stored at redemption time for brand analytics.

## Deal Types

| Type | How It Works |
|---|---|
| **Coupon Code** | Brand sets a static code (e.g., "CRICCALL20"). Revealed on redeem. |
| **Link** | Redirect URL with tracking params. Opened on redeem. |
| **QR Code** | Generated from coupon code or URL. Shown on redeem. |

## Frontend — Deals Tab

### Browse View

```
┌─────────────────────────────────────┐
│  Deals                  My CALL: 650│
│                                     │
│  ┌─────────────────────────────┐    │
│  │  [Foodpanda Logo]           │    │
│  │  20% off any order          │    │
│  │  Min: 500 CALL ✓ Unlocked  │    │
│  │  142 redeemed · Expires 12d │    │
│  │  [Redeem]                   │    │
│  └─────────────────────────────┘    │
│                                     │
│  ┌─────────────────────────────┐    │
│  │  [KFC Logo]                 │    │
│  │  Free Zinger with any meal  │    │
│  │  Min: 2000 CALL 🔒 Locked  │    │
│  │  Need 1,350 more CALL       │    │
│  │  [Keep Predicting →]        │    │
│  └─────────────────────────────┘    │
│                                     │
│  Filter: [All] [Food] [Telecom]     │
└─────────────────────────────────────┘
```

### After Redemption

```
┌─────────────────────────────────┐
│  ✓ Deal Redeemed!               │
│                                  │
│  [Foodpanda Logo]                │
│  20% off any order               │
│                                  │
│  Your code: CRICCALL20           │
│  [Copy Code]                     │
│                                  │
│  Or scan:                        │
│  [QR CODE]                       │
│                                  │
│  Valid until May 15, 2026        │
│  [Open Foodpanda →]             │
└─────────────────────────────────┘
```

## Redemption Logic

```
POST /deals/:id/redeem

1. Check user's CALL balance (cached or on-chain)
2. Check min_call threshold met
3. Check max_redemptions not exceeded
4. Check deal is active and within date range
5. Check user hasn't already redeemed this deal
6. Insert redemption record (with current call_balance)
7. Increment deal.total_redeemed
8. Return coupon code / URL / QR data
```

No CALL deducted. Balance is read-only gate.

## Brand Dashboard — Analytics

```
GET /sponsor/deals/:id/analytics
Response: {
  "dealId": "...",
  "title": "20% off any order",
  "minCall": 500,
  "status": "active",
  "totalRedemptions": 142,
  "uniqueUsers": 142,
  "maxRedemptions": 5000,
  "redemptionRate": "2.8%",
  "avgCallBalance": 1247,
  "redemptionsByDay": [
    { "date": "2026-04-15", "count": 23 },
    { "date": "2026-04-16", "count": 45 },
    { "date": "2026-04-17", "count": 74 }
  ],
  "redemptionsByTier": {
    "casual": 12,
    "dedicated": 67,
    "expert": 48,
    "superforecaster": 15
  },
  "peakHour": "19:00",
  "eligibleUsers": 8500
}
```

Key metrics:
- **Redemption count** — how many used the deal
- **Redemptions by day** — trend over time
- **Redemptions by tier** — quality of fan redeemed
- **Average CALL balance** — quality of audience reached
- **Eligible users** — how many users currently qualify
- **Peak hour** — when users redeem most (likely during matches)

## API Endpoints

### User

```
GET  /deals                            ← Browse all active deals
GET  /deals?category=food&unlocked=true ← Filter by category + unlock status
GET  /deals/:id                        ← Deal detail
POST /deals/:id/redeem                 ← Redeem deal (checks CALL balance)
GET  /users/me/deals                   ← My redeemed deals
```

### Sponsor

```
GET    /sponsor/deals                  ← List my deals
POST   /sponsor/deals                  ← Create deal
PATCH  /sponsor/deals/:id              ← Update deal
DELETE /sponsor/deals/:id              ← Deactivate deal
GET    /sponsor/deals/:id/analytics    ← Full analytics
GET    /sponsor/deals/:id/redemptions  ← Redemption list (paginated)
```

### Admin

```
GET    /admin/deals                    ← All deals across brands
PATCH  /admin/deals/:id/verify         ← Verify/approve a deal
DELETE /admin/deals/:id                ← Remove a deal
```

## Redis Caching

```
deals:active                        → list of active deal IDs (TTL: 5min)
deals:category:{cat}                → deals filtered by category (TTL: 5min)
deal:{id}                           → deal detail (TTL: 5min)
deal:{id}:redeemed:{userId}         → boolean, has user redeemed (TTL: 1hr)
user:{address}:eligible_deals       → deal IDs user qualifies for (TTL: 60s)
```
