# Frontend Architecture

## Overview

Next.js App Router + Tailwind CSS + shadcn/ui + Framer Motion + viem/wagmi + Socket.io. Mobile-first, dark theme, cricket stadium energy. The app IS the landing page — no separate marketing site.

## Design Language

```
Colors:
  Base:         #0A0A0F (night match under floodlights)
  YES/Win:      #00FF6A (neon green)
  NO/Tension:   #FF3B5C (hot red)
  Prize/Gold:   #FFD700 (gold)
  Info:         #3B82F6 (electric blue)
  Text:         #FAFAFA (cricket white)
  Muted:        #6B7280 (dimmed text)
  Surface:      #1A1A2E (card backgrounds)
  Border:       #2A2A3E (subtle borders)

Fonts:
  Headings: Bold, condensed, uppercase — stadium scoreboard feel
  Body: Inter — clean, readable
  Numbers: JetBrains Mono or similar monospace — CALL balances, pools, odds

Theme: Dark only. No light mode. Stadium at night.
```

## Tech Stack

- **Next.js 14+ App Router** — file-based routing, server components
- **Tailwind CSS v4** — utility-first styling
- **shadcn/ui** — component library (dark theme base)
- **Framer Motion** — layout animations, gestures, page transitions
- **viem + wagmi** — wallet connection, contract reads/writes
- **Socket.io client** — real-time pool updates, notifications
- **Framer Motion + CSS** — micro-interactions (pulse, glow, breathe)
- **Canvas API** — big moments only (win explosion, confetti)
- **@vercel/og** — server-side share card image generation
- **Recharts** — charts in sponsor analytics dashboard
- **Howler.js** — sound effects (lazy loaded, optional)

## App Navigation

### Mobile (Bottom Nav)

```
┌──────┬──────┬──────┬──────┬──────┐
│ Home │Markets│Deals │Rewards│Profile│
└──────┴──────┴──────┴──────┴──────┘
```

### Desktop (Top Nav)

```
CricCall    Markets  Deals  Leaderboard  Rewards    [CALL: 1,247]  [Connect Wallet]
```

| Tab | Route | Description |
|---|---|---|
| **Home** | `/` | Landing + dashboard. Hero market, how it works, leaderboard, sponsors |
| **Markets** | `/markets` | All markets — live, upcoming, resolved |
| **Market Detail** | `/markets/:id` | Full market — probability bar, sponsors, predict UX |
| **Deals** | `/deals` | Brand deals marketplace, locked/unlocked |
| **Rewards** | `/rewards` | Unclaimed PKR, claim history |
| **Profile** | `/profile` | Own profile — CALL, tier, history, avatar |
| **Public Profile** | `/u/:address` | Other user's profile |
| **Leaderboard** | `/leaderboard` | Full leaderboard by CALL balance |
| **Sponsor Dashboard** | `/sponsor` | Deal management, campaign creation, analytics |
| **Admin** | `/admin` | Market creation, PKR minting, oracle control |

## Landing Page / Home (`/`)

The first screen a judge sees. Everything visible without connecting wallet.

```
┌─────────────────────────────────────────────────┐
│  CricCall                      [Connect Wallet] │
│  Predict Cricket. Win Rewards.                   │
│                                                  │
│  ┌──────────────────────────────────────────┐   │
│  │           HERO — LIVE MATCH              │   │
│  │  PTCL Presents                   LIVE 🔴 │   │
│  │                                          │   │
│  │   🇵🇰 Pakistan  vs  India 🇮🇳             │   │
│  │        142/3 (16.2)    BATTING           │   │
│  │                                          │   │
│  │   Will Pakistan score 180+?              │   │
│  │                                          │   │
│  │   YES 67%  ██████████░░░░  NO 33%       │   │
│  │                                          │   │
│  │   🏆 Rs. 11,55,000 Prize Pool           │   │
│  │   PTCL · Foodpanda · CricCall           │   │
│  │   2,847 predictions · LIVE NOW           │   │
│  │                                          │   │
│  │   [Predict YES]     [Predict NO]         │   │
│  └──────────────────────────────────────────┘   │
│                                                  │
│  ── HOW IT WORKS ──                             │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐     │
│  │ 1. CLAIM │  │ 2. PREDICT│  │ 3. WIN   │     │
│  │ Get 100  │  │ Bet CALL │  │ Win CALL │     │
│  │ free CALL│  │ on YES/NO│  │ + PKR 💰 │     │
│  └──────────┘  └──────────┘  └──────────┘     │
│                                                  │
│  ── LIVE MARKETS ──                             │
│  [Market Card] [Market Card] [Market Card]      │
│                                                  │
│  ── LEADERBOARD ──                              │
│  🥇 CricketKing99     5,247 CALL               │
│  🥈 BabarFanatic      4,891 CALL               │
│  🥉 LahorePredictor   3,456 CALL               │
│                                                  │
│  ── SPONSORS ──                                 │
│  [PTCL]  [Foodpanda]  [KFC]  [Jazz]           │
│                                                  │
│  ── WHY CRICCALL ──                             │
│  ✓ Free to play · ✓ Win real money             │
│  ✓ Shariah compliant · ✓ On-chain              │
│                                                  │
│  [Connect Wallet & Start Predicting]            │
│                                                  │
│  Built for Entangled Hackathon · April 2026     │
│  Powered by WireFluid                           │
└─────────────────────────────────────────────────┘
```

## Micro-Interactions & Animations

### Daily CALL Claim

```
Unclaimed state:
  → Cricket ball bounces gently (spring animation)
  → "Claim 100 CALL" button pulses with green glow

On tap:
  → Ball hits bat animation with CRACK haptic
  → Ball flies off screen with particle trail
  → 100 CALL floats up as individual numbers raining down
  → Balance counter rolls up: 547 → 647 (odometer effect)
  → Green confetti burst (2 seconds)
  → "Shabash!" text pops and fades
```

### Placing a Prediction

```
UX: Drag slider for amount, tap YES or NO zone

On confirm (swipe gesture):
  → Stadium floodlight flash (screen brightness pulse)
  → Prediction orb flies into the pool
  → Pool bar shifts smoothly (spring animation)
  → Ripple wave on probability percentage
  → "You're in!" stamp with brief glow
  → Subtle crowd murmur haptic
```

### Probability Bars (Always Alive)

```
Default state:
  → Green (YES) and red (NO) with subtle glow
  → Breathing animation (scale 1.0 ↔ 1.002, 3s cycle)

On new prediction:
  → Bar shifts with spring physics
  → Numbers morph (each digit rolls)
  → Ripple wave at moving edge
  → Small particle burst

Surge past 75%:
  → Stronger glow on dominant side
  → Subtle screen shake (0.5px, 200ms)
```

### Market Resolution

```
WON:
  → Screen blacks out (0.5s)
  → Green + gold particle explosion (canvas)
  → Stadium floodlight sweep
  → "WINNER!" huge text with shake
  → Cricket stumps flying animation
  → CALL balance counter rapidly counts up (odometer)
  → Gold confetti (3 seconds)
  → Crowd cheer audio (2s, if sounds enabled)
  → Strong haptic celebration pattern
  → If PKR: "Rs. 500 PKR 💰" floats up in gold

LOST:
  → Screen dims briefly
  → Stumps-broken animation (bowled out)
  → "Not this time" subdued text
  → Immediately: "Next match in 2h — claim your CALL!"
  → Keep energy positive
  → Single soft haptic

CANCELED:
  → Rain drops animation on screen
  → "Match washed out — CALL refunded"
  → CALL flies back into balance
```

### Tier Upgrade

```
Full screen takeover (2 seconds):
  → Dark overlay
  → New tier badge springs in from below
  → Tier name huge text: "DEDICATED FAN"
  → Sparkle particles around badge
  → "New deals unlocked!" fades in
  → Achievement chime
  → Badge settles, transitions to Deals tab
  → Newly unlocked deals shimmer gold "NEW"
```

### PKR Reward Claim

```
Claim button: pulses with gold glow

On claim:
  → PKR coins cascade down screen
  → Gold number counter ticks up
  → ₨ symbol floats briefly
  → "Claimed!" green stamp
  → Gold confetti
  → Sponsor logo spotlight effect
```

### CALL Balance Display (Header)

```
Always visible, never static:
  CALL: 1,247 ⬆

  On any change:
    → Each digit rolls like odometer
    → Green glow on gain, red on loss
    → Small particle trail on changing digits
    → Up/down arrow animates in
```

### Market Cards

```
Default:
  → Subtle animated gradient background (team colors)
  → "LIVE" red dot pulses
  → Prediction count ticks up in real-time

Hover/Focus:
  → Scale up 1.02
  → Border glow
  → Gradient shifts

Enter:
  → Staggered fade-in (each card 50ms delay)
```

### Leaderboard

```
Scoreboard feel — TV broadcast style

When positions change:
  → Smooth swap animation (Framer Motion layout)
  → Green flash on rising user
  → Red flash on falling user
  → Position numbers animate
  → CALL balance bars animate to new widths
```

### Page Transitions

```
Navigation: smooth slide (Framer Motion AnimatePresence)
List loading: staggered fade-in
Tab switch: content slides in direction of tab
Pull to refresh: cricket ball bounce as spinner
Empty state: animated bat + ball idle
Error state: animated rain (match washed out)
```

## Sound Design (Optional — Off by Default)

| Event | Sound | Duration |
|---|---|---|
| Daily claim | Bat hitting ball — CRACK | <1s |
| Prediction placed | Quick crowd murmur | <1s |
| Market resolving | Brief drum roll | 1s |
| Won prediction | Crowd cheer | 2s |
| Lost prediction | Subtle crowd "oh" | 1s |
| Tier upgrade | Achievement chime | 1s |
| PKR claimed | Cash register cha-ching | <1s |

Toggle in settings. All sounds lazy-loaded, compressed.

## Image Assets

### Static Assets (Designed Once)

```
/public/images/
├── badges/
│   ├── casual.svg              ← cricket ball icon, green border
│   ├── dedicated.svg           ← bat + ball, blue glow
│   ├── expert.svg              ← helmet icon, purple shimmer
│   └── superforecaster.svg     ← trophy + stadium, gold particles
├── teams/
│   ├── flags/                  ← country flag SVGs (~20 cricket nations)
│   └── franchises/             ← PSL/IPL logo SVGs (~12)
├── hero/
│   ├── stadium-bg.webp         ← AI-generated hero background
│   └── stadium-bg-mobile.webp  ← mobile-optimized version
├── how-it-works/
│   ├── claim.svg               ← step 1 icon
│   ├── predict.svg             ← step 2 icon
│   └── win.svg                 ← step 3 icon
├── empty-states/
│   ├── no-markets.svg          ← animated bat + ball idle
│   ├── no-predictions.svg
│   └── no-rewards.svg
└── branding/
    ├── logo.svg                ← CricCall logo
    ├── logo-white.svg
    └── wirefluid-badge.svg     ← "Built on WireFluid"
```

### Image Size Constraints

| Asset Type | Format | Max Size | Dimensions |
|---|---|---|---|
| Hero background | WebP | 200KB | 1920x1080 (desktop), 750x1334 (mobile) |
| Team flags | SVG | 10KB each | Scalable |
| Franchise logos | SVG | 15KB each | Scalable |
| Tier badges | SVG | 5KB each | Scalable |
| Icons (how-it-works, empty states) | SVG | 5KB each | Scalable |
| Sponsor logos (uploaded) | WebP/PNG | 100KB | 400x400 max, resized on upload |
| Sponsor banners (uploaded) | WebP/PNG | 300KB | 1200x400 max, resized on upload |
| User avatars (uploaded) | WebP | 50KB | 256x256, resized server-side |
| Share card (generated) | PNG | 150KB | 1200x630 (WhatsApp/OG optimal) |
| Deal images (uploaded) | WebP/PNG | 200KB | 600x400 max, resized on upload |

### Dynamic Generation (Runtime)

**Match Cards:** CSS gradients + team colors + flag compositing. No pre-made images per match.

**Share Cards:** `@vercel/og` (ImageResponse) — renders React components to images server-side.

```
GET /api/og/share-card?marketId=5&userId=0xabc...

Renders:
  → Match result + user's prediction
  → CALL balance + tier
  → Title sponsor branding
  → CricCall branding
  → Returns 1200x630 PNG
```

### Upload Validation (Server-Side)

```
Sponsor logo:
  → Formats: PNG, WebP, SVG
  → Max: 100KB
  → Resize to 400x400 if larger
  → Store as WebP in MinIO

Sponsor banner:
  → Formats: PNG, WebP, JPG
  → Max: 300KB
  → Resize to 1200x400 if larger
  → Store as WebP in MinIO

User avatar:
  → Formats: PNG, JPG, WebP
  → Max: 2MB (before resize)
  → Resize to 256x256
  → Convert to WebP (~50KB after)
  → Store in MinIO

Deal image:
  → Formats: PNG, WebP, JPG
  → Max: 200KB
  → Resize to 600x400 if larger
  → Store as WebP in MinIO
```

All uploads go through NestJS → validated → resized via `sharp` → stored in MinIO.

## Performance Rules

- **Framer Motion** for layout animations and gestures
- **CSS animations** for always-on micro-interactions (pulse, glow, breathe) — GPU accelerated
- **Canvas API** only for big moments (win explosion, confetti) — not always-on
- **`prefers-reduced-motion`** respected — disable all animations for accessibility
- **Lazy load** heavy effects — only when visible in viewport
- **Sound files** lazy-loaded, compressed, <50KB each
- **Images** served as WebP, lazy loaded below fold, priority loaded above fold
- **SVGs** inlined for icons, external for larger illustrations
- **Bundle split** — Socket.io client, Framer Motion, Recharts code-split per route

## Deployment

- **Vercel** — Next.js hosting
- **Edge functions** — share card generation via @vercel/og
- **CDN** — static assets served from Vercel's edge network
- **Environment variables** — WireFluid RPC, contract addresses, API URL, Socket.io URL

```env
NEXT_PUBLIC_API_URL=https://api.criccall.xyz
NEXT_PUBLIC_WS_URL=wss://api.criccall.xyz
NEXT_PUBLIC_WIREFLUID_RPC=https://evm.wirefluid.com
NEXT_PUBLIC_CHAIN_ID=92533
NEXT_PUBLIC_CALL_TOKEN_ADDRESS=
NEXT_PUBLIC_PREDICTION_MARKET_ADDRESS=
NEXT_PUBLIC_CRICKET_ORACLE_ADDRESS=
NEXT_PUBLIC_SPONSOR_VAULT_ADDRESS=
NEXT_PUBLIC_PKR_TOKEN_ADDRESS=
```
