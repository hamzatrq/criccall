# CricCall — Modules

## Smart Contracts (packages/contracts) — 120 tests passing
- [x] CALLToken — Non-transferable ERC-20, daily claim, balance = reputation
- [x] PredictionMarket — Binary YES/NO markets, oracle resolution, proportional payouts
- [x] SponsorVault — Whitelisted PKR deposits, Merkle claims, expiry clawback, multi-sponsor per market
- [x] CricketOracle — Commit-reveal, authorized oracles, consumer notification
- [x] PKRToken — Mintable PKR stablecoin, admin mints against fiat

## Backend — NestJS (apps/api)
- [x] Auth — Wallet-only SIWE (auth.md)
- [x] Oracle Service — CricAPI polling, commit-reveal, admin endpoint (oracle-service.md)
- [x] WireFluidService — Shared viem wallet client, 2 wallets: owner + oracle (wirefluid-service.md)
- [x] Users — Profile, CALL balance = reputation, tiers, leaderboard, avatar (users.md)
- [x] Markets — Auto-creation, multi-sponsor, visibility tiers, match data (markets.md)
- [x] Predictions — Event indexing, winner lists, user stats (predictions.md)
- [x] Rewards — Proportional PKR to all winners, Merkle trees, claims (rewards.md)
- [x] Brand Deals — CALL-gated deals, brand profiles, redemption analytics (brand-deals.md)
- [x] WebSocket + Notifications — Socket.io real-time updates, in-app notifications (websocket-notifications.md)

## Frontend — Next.js (apps/web) — (frontend.md)
- [x] Design system — Dark theme, cricket stadium energy, neon accents
- [x] Micro-interactions — Framer Motion animations, haptics, sounds
- [x] Image pipeline — Static SVGs, dynamic match cards, @vercel/og share cards
- [ ] Auth Pages — Connect wallet, SIWE flow
- [ ] Home/Landing — Hero market, how it works, leaderboard, sponsors
- [ ] Markets — Market cards, sponsor branding, probability bars, prediction UX
- [ ] Market Detail — Full prediction UX with swipe gestures
- [ ] Leaderboard — Rankings by CALL balance, live position swaps
- [ ] Profile — CALL balance, tier, prediction history, avatar
- [ ] Deals Tab — Locked/unlocked brand deals
- [ ] Rewards — PKR claim interface per campaign
- [ ] Share Cards — Dynamic winner cards for WhatsApp
- [ ] Sponsor Dashboard — Deal management, campaign creation, analytics
- [ ] Admin Panel — Market creation, PKR minting, oracle control
