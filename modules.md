# CricCall — Modules

## Smart Contracts (packages/contracts)
- [x] CALLToken — Non-transferable ERC-20, daily claim, balance = reputation
- [x] PredictionMarket — Binary YES/NO markets, oracle resolution, proportional payouts
- [x] SponsorVault — Whitelisted PKR deposits, Merkle claims, expiry clawback
- [x] CricketOracle — Commit-reveal, authorized oracles, consumer notification
- [ ] PKRToken — Mintable ERC-20 stablecoin, admin mints against fiat
- [ ] Integration Tests — Update for CALL rename + PKRToken

## Backend — NestJS (apps/api)
- [x] Auth — Wallet-only SIWE (auth.md)
- [x] Oracle Service — CricAPI polling, commit-reveal, admin endpoint (oracle-service.md)
- [x] WireFluidService — Shared viem wallet client, 2 wallets: owner + oracle (wirefluid-service.md)
- [x] Users — Profile, CALL balance = reputation, tiers, leaderboard (users.md)
- [ ] Markets — Market creation, state tracking, match data ingestion
- [ ] Predictions — Off-chain tracking, history
- [ ] Rewards — Merkle tree computation, postWinnerRoot, PKR claim tracking
- [ ] Brand Deals — Deal listings, tier-gated access, redemption tracking
- [ ] WebSocket Gateway — Real-time prediction updates during live matches
- [ ] Notifications — Tier unlocks, reward claims

## Frontend — Next.js (apps/web)
- [ ] Auth Pages — Connect wallet, SIWE flow
- [ ] Live Markets — Real-time probability display, prediction placement
- [ ] Leaderboard — Rankings by CALL balance
- [ ] Profile — Prediction history, CALL balance, tier display
- [ ] Deals Tab — Tiered brand deals marketplace
- [ ] Rewards — PKR claim interface
- [ ] Share Cards — Prediction result cards for WhatsApp sharing
