# CricCall

**Shariah-compliant cricket prediction protocol on WireFluid.**

Predict PSL 2026 match outcomes using free CALL tokens. Winners earn from losers' pool. Brand sponsors deposit real PKR prizes distributed to top predictors. No gambling. No money in. Skill-based, transparent, on-chain.

**Live:** [criccall.vercel.app](https://criccall.vercel.app)
**API:** [criccall-production.up.railway.app](https://criccall-production.up.railway.app/api/health)

---

## How It Works

1. **Connect Wallet** — Sign in with your WireFluid wallet (SIWE)
2. **Claim Daily CALL** — Get 100 free CALL tokens every 24 hours (non-transferable reputation tokens)
3. **Predict** — Pick YES or NO on live PSL match markets
4. **Win** — If your prediction is correct, you earn CALL from the losing pool (proportional redistribution)
5. **Earn PKR** — Brand sponsors fund real PKR prize pools. Winners claim PKR via Merkle proofs on-chain

## Architecture

```
┌─────────────────┐     ┌──────────────────┐     ┌─────────────────────────┐
│   Next.js 16    │────▶│   NestJS API     │────▶│   PostgreSQL (Railway)  │
│   (Vercel)      │     │   (Railway)      │     └─────────────────────────┘
│                 │     │                  │
│  wagmi + viem   │     │  Prisma 7 ORM   │
└────────┬────────┘     │  Socket.io WS   │
         │              │  CricAPI Feed   │
         │              └────────┬─────────┘
         │                       │
         ▼                       ▼
┌──────────────────────────────────────────┐
│        WireFluid Testnet (EVM)           │
│        Chain ID: 92533                   │
│                                          │
│  CALLToken          Non-transferable     │
│  PredictionMarket   Binary YES/NO        │
│  CricketOracle      Commit-reveal        │
│  PKRToken           PKR stablecoin       │
│  SponsorVault       Merkle prize dist.   │
└──────────────────────────────────────────┘
```

## Smart Contracts (Verified on WireScan)

| Contract | Address | Explorer |
|---|---|---|
| CALLToken | `0x04884d81a07F0647bF72cfAc5C3Eb3CF863Bf94f` | [View](https://wirefluidscan.com/address/0x04884d81a07F0647bF72cfAc5C3Eb3CF863Bf94f#code) |
| PredictionMarket | `0xB115b03E1C24a4183815804Ca148C786E9a41410` | [View](https://wirefluidscan.com/address/0xB115b03E1C24a4183815804Ca148C786E9a41410#code) |
| CricketOracle | `0x117f08B6BaE7c8AaE9d342f150d332d563f318B6` | [View](https://wirefluidscan.com/address/0x117f08B6BaE7c8AaE9d342f150d332d563f318B6#code) |
| PKRToken | `0x74350054cbd9dE1816dF6c243d429d7bbad8E3b5` | [View](https://wirefluidscan.com/address/0x74350054cbd9dE1816dF6c243d429d7bbad8E3b5#code) |
| SponsorVault | `0xd5ae5c002e70DFB60E812FD7D70718C20a764bF7` | [View](https://wirefluidscan.com/address/0xd5ae5c002e70DFB60E812FD7D70718C20a764bF7#code) |

## Token Model

- **CALL** — Free, non-transferable reputation token. Claim 100/day. Used to predict. Winners take from losers proportionally. Your CALL balance = your prediction track record.
- **PKR** — Pakistani Rupee stablecoin. Funded by brand sponsors. Distributed to winning predictors via Merkle tree proofs. This is real money.

No user puts money in. CALL is free. PKR comes from sponsors. This is what makes CricCall Shariah-compliant.

## Tech Stack

| Layer | Tech |
|---|---|
| Frontend | Next.js 16, React 19, Tailwind CSS, shadcn/ui, wagmi, viem, Framer Motion |
| Backend | NestJS 11, Prisma 7, PostgreSQL, Socket.io, CricAPI |
| Contracts | Solidity 0.8.28, Hardhat, OpenZeppelin |
| Chain | WireFluid Testnet (EVM-compatible Cosmos, CometBFT) |
| Deploy | Vercel (frontend), Railway (API + DB + S3 storage) |
| Auth | SIWE (Sign-In with Ethereum) — wallet-only, decentralized |

## Local Development

```bash
# Prerequisites: Node 22+, pnpm 10+
git clone https://github.com/hamzatrq/criccall.git
cd criccall
pnpm install

# Start frontend + backend
pnpm dev:web   # http://localhost:3000
pnpm dev:api   # http://localhost:4000/api

# Smart contracts
cd packages/contracts
npx hardhat test
npx hardhat run scripts/deploy.ts --network wirefluid
```

## Key Features

- 18 real PSL 2026 prediction markets with live data from CricAPI
- Daily free token claim with 24h cooldown (on-chain)
- Proportional CALL redistribution to winners
- Brand sponsor system with PKR prize pools
- Commit-reveal oracle for tamper-proof match results
- Tiered rewards: New Fan, Casual, Dedicated, Expert, Superforecaster
- Real-time notifications via WebSocket
- Brand deals unlocked by CALL tier (e.g., 50 CALL = Foodpanda 20% off)
- Admin dashboard for oracle resolution and market management
- Sponsor dashboard for campaign creation and analytics
- Mobile-first responsive design with PSL franchise logos

## Team

Built by **Hamza Tariq** for the Entangled Hackathon (April 2026).

## License

MIT
