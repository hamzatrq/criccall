# Frontend Architecture

## Overview

Next.js App Router + Tailwind CSS + shadcn/ui + Framer Motion + viem/wagmi + Socket.io. Mobile-first, light theme, clean and trustworthy. ESPN Cricinfo meets Duolingo — fun and engaging but never looks like gambling. The app IS the landing page — no separate marketing site.

## Design Language

```
Colors:
  Background:     #FFFFFF (clean white)
  Surface:        #F8FAFC (light gray cards)
  Surface Dark:   #F1F5F9 (slightly darker sections)
  Border:         #E2E8F0 (subtle borders)
  Text:           #0F172A (dark navy — primary text)
  Muted:          #64748B (gray — secondary text)
  
  Primary/Green:  #16A34A (cricket green — natural, trustworthy)
  YES:            #16A34A (green — positive, organic)
  NO:             #DC2626 (red — clear, not aggressive)
  Prize/Amber:    #D97706 (warm amber — not flashy gold)
  Info/Blue:      #2563EB (blue — links, info)
  
  Green Tint:     #F0FDF4 (light green background for highlights)
  Red Tint:       #FEF2F2 (light red background)
  Amber Tint:     #FFFBEB (light amber for prize sections)
  Blue Tint:      #EFF6FF (light blue for info sections)

Fonts:
  Headings: Inter — bold, clean, professional
  Body: Inter — readable, modern
  Numbers: JetBrains Mono — CALL balances, pools, odds, monospace

Theme: Light only. Clean, trustworthy, not gambling.
Vibe: ESPN Cricinfo meets Duolingo. Fun but legitimate.
```

## Design Principles

1. **Trust first** — Light backgrounds, clean borders, no neon. Users should feel safe.
2. **Cricket, not casino** — Green is cricket pitch green, not neon gambling green.
3. **Clean cards** — White cards with subtle shadows and borders. No dark gradients.
4. **Warm accents** — Amber for prizes instead of flashy gold. Feels earned, not gambled.
5. **Readable** — Dark text on light background. High contrast. Accessible.
6. **Professional** — A judge should think "this is a real product" not "this is a betting app."

## Tech Stack

- **Next.js 14+ App Router** — file-based routing, server components
- **Tailwind CSS v4** — utility-first styling
- **shadcn/ui** — component library (light theme)
- **Framer Motion** — layout animations, gestures, page transitions
- **viem + wagmi** — wallet connection, contract reads/writes
- **Socket.io client** — real-time pool updates, notifications
- **@vercel/og** — server-side share card image generation
- **Recharts** — charts in sponsor analytics dashboard

## App Navigation

### Mobile (Bottom Nav)

```
┌──────┬──────┬──────┬──────┬──────┐
│ Home │Markets│Deals │Rewards│Profile│
└──────┴──────┴──────┴──────┴──────┘
```

Role-aware: Sponsor sees Sponsor tab, Admin sees Admin tab.

### Desktop (Top Nav)

```
CricCall    Markets  Deals  Leaderboard  Rewards  [Sponsor] [Admin]    [647 CALL]  [Role ▾]  [Avatar]
```

### Pages

| Tab | Route | Description |
|---|---|---|
| **Home** | `/` | Landing + dashboard. Hero market, how it works, leaderboard, sponsors |
| **Markets** | `/markets` | All markets — live, upcoming, resolved. Filter tabs. |
| **Market Detail** | `/markets/:id` | Full market — probability bar, sponsors, predict UX |
| **Deals** | `/deals` | Brand deals marketplace, locked/unlocked by CALL |
| **Rewards** | `/rewards` | Unclaimed PKR, claim history |
| **Profile** | `/profile` | Edit profile, CALL balance, tier progress, prediction history |
| **Leaderboard** | `/leaderboard` | Full leaderboard by CALL balance |
| **Sponsor Dashboard** | `/sponsor` | Campaign analytics, deal management, create forms |
| **Admin** | `/admin` | Market creation, PKR minting, oracle control |

## Landing Page / Home (`/`)

```
┌─────────────────────────────────────────────────┐
│  [Logo] CricCall    Nav Links    [647 CALL] [YO]│  ← White header
│─────────────────────────────────────────────────│
│                                                  │
│  Predict Cricket. Win Rewards.                   │  ← Clean headline
│  Free to play. Shariah compliant.               │
│                                                  │
│  ┌──────────────────────────────────────────┐   │
│  │  PTCL Presents              🔴 LIVE      │   │  ← White card, subtle shadow
│  │  🇵🇰 Pakistan 168/4  vs  India 🇮🇳       │   │
│  │                                          │   │
│  │  Will Pakistan score 180+?               │   │
│  │  YES 67% ████████░░░ NO 33%             │   │  ← Green/red bar on white
│  │  🏆 Rs. 11.6 Lac Prize                  │   │
│  │                                          │   │
│  │  [Predict YES]    [Predict NO]           │   │  ← Green/red buttons
│  └──────────────────────────────────────────┘   │
│                                                  │
│  How It Works                                    │
│  [1. Claim] [2. Predict] [3. Win]              │  ← Light cards with icons
│                                                  │
│  Live Markets                                    │
│  [Card] [Card] [Card]                           │
│                                                  │
│  Leaderboard                                     │
│  1. CricketKing99  5,247 CALL                   │
│  2. BabarFanatic   4,891 CALL                   │
│                                                  │
│  Trusted by: PTCL  Foodpanda  KFC  Jazz         │
│                                                  │
│  [Connect Wallet & Start Predicting]            │
│                                                  │
│  Footer                                          │
└─────────────────────────────────────────────────┘
```

## Micro-Interactions & Animations

All animations remain the same but adapted for light theme:
- No glow effects (they look wrong on white)
- Subtle shadows instead of glows
- Background color flashes instead of screen blackouts
- Confetti and particles still work — just on white background
- Spring animations on cards, bars, and buttons unchanged

### Key Adaptations for Light Theme

```
Win celebration:
  → Green confetti on white background (not black)
  → "WINNER!" in green text with subtle shadow
  → Balance counter rolls up in green
  → No screen blackout — use green tint overlay instead

Probability bars:
  → Solid green and red on light gray track
  → No glow — just clean color fills
  → Subtle shadow on the bar itself

Market cards:
  → White background, subtle border, light shadow on hover
  → Team colors as thin accent strips or badges, not gradients
  → "LIVE" badge in red with white text — clean pill shape

Tier badges:
  → Solid colored pills with white text
  → No glow or shimmer — clean and readable
```

## Sound Design (Optional — Off by Default)

Same as before — cricket sounds, short and punchy. Toggle in settings.

## Image Assets

Same asset pipeline — SVGs for icons/badges, dynamic generation for match cards, @vercel/og for share cards.

### Image Size Constraints

Same constraints as before — all unchanged.

### Upload Validation (Server-Side)

Same validation rules — all unchanged.

## Performance Rules

- **Framer Motion** for layout animations and gestures
- **CSS animations** for micro-interactions — GPU accelerated
- **`prefers-reduced-motion`** respected
- **Lazy load** below-fold content
- **Images** served as WebP
- **Bundle split** per route

## Deployment

- **Vercel** — Next.js hosting
- **Edge functions** — share card generation
- **CDN** — static assets

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
