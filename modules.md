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
- [ ] WebSocket Gateway — Real-time pool updates during live matches
- [ ] Notifications — Tier unlocks, reward claims, sponsor announcements

## Frontend — Next.js (apps/web)
- [ ] Auth Pages — Connect wallet, SIWE flow
- [ ] Live Markets — Market cards, sponsor branding, probability bars, prediction UX
- [ ] Leaderboard — Rankings by CALL balance
- [ ] Profile — Prediction history, CALL balance, tier display
- [ ] Deals Tab — Tiered brand deals marketplace
- [ ] Rewards — PKR claim interface per campaign
- [ ] Share Cards — Winner cards with sponsor branding for WhatsApp
- [ ] Sponsor Dashboard — Campaign creation, branding upload, analytics
