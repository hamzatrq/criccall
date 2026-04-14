# CRICCALL

### *Predict Cricket. Earn Rewards. Zero Gambling.*

The world's first Shariah-compliant, on-chain cricket prediction protocol — built on **WireFluid** — targeting 140 million fans in a country that legalized blockchain 5 weeks ago.

| **140M** | **27M** | **$0** | **Zero on WireFluid** |
|---|---|---|---|
| Cricket Fans in Pakistan | Crypto Users | User Risk | Shariah-compliant prediction protocols on any EVM chain |

**ENTANGLED HACKATHON SUBMISSION · APRIL 2026**

---

## THE PROBLEM

Pakistan has 140 million cricket fans and the 5th largest population on earth. **Yet there is zero prediction platform for them.**

Every existing model is fundamentally broken for this market:

**Betting is haram.** 96% of Pakistanis are Muslim. Polymarket, Kalshi, and every real-money prediction market is religiously impermissible. Pakistan blocked 46 betting apps in 2025.

**Fantasy sports just died.** India's Online Gaming Act (August 2025) banned all real-money gaming. Dream11 collapsed overnight. A $3B industry wiped out. The real-money model is dead across South Asia.

**Trust is broken.** Fake lottery apps, scam betting platforms, and rigged contests have made Pakistani users deeply skeptical. "Trust us" doesn't work anymore — users need verifiable proof, not corporate promises.

**No blockchain access.** Polymarket requires USDC and MetaMask. Pakistan's cricket fans have JazzCash, not crypto wallets. They need a chain that can bridge directly to mobile money — which is exactly what WireFluid was built for.

> **The result:** 140 million passionate cricket fans engage through WhatsApp arguments and chai-shop debates. Their predictions, knowledge, and passion are monetizable — but nobody has built the right platform on the right chain.

---

## THE SOLUTION

**CricCall** is an on-chain cricket prediction protocol deployed on **WireFluid** where users predict match outcomes using **free CALL tokens**, build reputation through **accumulated CALL balance** (winners take from losers' pool), unlock **real brand deals based on their CALL balance tier**, and win **sponsor-funded PKR prizes distributed by smart contracts**.

### How It Works

**1. Claim free CALL tokens daily.** Every user gets 100 free CALL tokens daily. Take YES/NO positions on match outcomes. CALL tokens are non-transferable and have zero monetary value.

**2. Markets move in real-time.** Like Polymarket, pool sizes shift dynamically as users predict. If 80% predict Pakistan wins, the YES pool grows larger. Live pool ratios pulse with collective intelligence throughout the match.

**3. Smart contracts resolve everything.** A cricket data oracle pushes match results on-chain to WireFluid via commit-reveal. The PredictionMarket contract auto-resolves: correct predictors receive proportional CALL from the losers' pool. Incorrect predictors lose their CALL. Zero human intervention, zero manipulation — verified on WireScan.

**4. Your CALL balance IS your reputation.** Win predictions, accumulate CALL. Lose predictions, lose CALL. Over time, the best cricket minds amass thousands of CALL — a non-purchasable, non-transferable proof of prediction skill. The leaderboard is sorted by CALL balance. You can't buy your way to the top.

**5. Unlock brand deals with your CALL balance.** Brands offer exclusive discounts and perks to users based on CALL balance tiers. Hold 500+ CALL? You unlock Dedicated Fan deals. Hold 2000+? Expert tier with KFC, Daraz, and Jazz offers. Brands pay CricCall for access to verified cricket superfans.

**6. Win sponsor-funded PKR prizes.** For every match, brands or the platform deposit real PKR (Pakistani Rupee stablecoin) into a SponsorVault smart contract on WireFluid. Top predictors automatically receive PKR prizes — redeemable directly to JazzCash/EasyPaisa via WireFluid's native fiat off-ramp. Fully transparent, fully on-chain.

---

## THE TWO-TOKEN HALAL ARCHITECTURE

This is the core insight that makes CricCall **architecturally halal** — not just halal by policy.

Islamic scholars agree that gambling (*maysir*) requires two simultaneous conditions: the participant risks something of monetary value, AND the participant can lose that monetary value. CricCall's two-token structure breaks both conditions:

| | **CALL Token (Prediction & Reputation)** | **PKR Token (Prize Money)** |
|---|---|---|
| **Source** | Free — 100 given daily | Funded by brands/platform only |
| **Monetary Value** | Zero — cannot be purchased or transferred | Real money (1 PKR = Rs. 1) |
| **Transferability** | Non-transferable | Fully transferable |
| **User Deposit** | Never — no payable function exists | Users never deposit PKR into prizes |
| **Mechanism** | Spent on predictions, winners take from losers' pool | On-chain escrow + Merkle claims |
| **Reputation** | Balance = leaderboard position = brand deal tier | N/A |
| **Halal Basis** | Losing CALL = losing something worth Rs. 0. **That is not gambling.** | Prize comes from Pepsi's budget, not from other users. **That is Ju'alah (Islamic reward contract).** |

> **The two tokens never mix.** There is no conversion path between CALL and PKR. You cannot turn CALL into money. You cannot buy CALL with PKR. The economic loops are completely separate. This is not a policy — it's an architectural constraint enforced by smart contract code deployed on WireFluid.

### Three Rules Enforced by Code

**1. CALL tokens can never be purchased.** No payable function exists in the contract. The moment CALL is buyable, it acquires monetary value and the halal argument collapses.

**2. CALL tokens can never be transferred.** The ERC-20 transfer function is disabled. No peer-to-peer transfer, no secondary market, no monetary value.

**3. The SponsorVault only accepts whitelisted sponsor deposits.** A `require()` statement rejects any deposit from a non-sponsor address. User funds can never enter the prize pool.

---

## WHY THIS NEEDS A BLOCKCHAIN

Every hackathon team claims they need blockchain. We actually do. Three reasons a centralized database cannot solve this:

### 01 — Trustless Prediction Resolution

In a country where 46 betting apps were blocked for fraud in 2025, users won't trust a company to fairly resolve predictions. Our PredictionMarket contract resolves outcomes using oracle-verified data on WireFluid. Neither CricCall nor any admin can alter results. The resolution logic is open-source and immutable. WireFluid's CometBFT consensus ensures **~5-second finality** — once a result is posted, it's permanent. No rollbacks, no "waiting for 12 confirmations." Trust is mathematical, not institutional.

### 02 — Provable Sponsor Transparency

When Foodpanda sponsors a challenge, they deposit real PKR into the SponsorVault contract — publicly visible on **WireScan** (WireFluid's block explorer). After resolution, the contract publishes a Merkle root of all winners. Anyone can verify: how much was deposited, how it was allocated, and who claimed prizes. This level of promotional accountability doesn't exist anywhere in Pakistan's advertising industry. Brands get auditable ROI. Users get proof that prizes are real.

### 03 — Non-Purchasable Reputation

The platform's value is meritocracy: the best cricket mind wins. If reputation were tradeable, wealthy users could buy "expert" status. CALL tokens on WireFluid are non-transferable — your CALL balance and leaderboard position are permanently bound to the wallet that earned them. Your cricket IQ is cryptographically proven, and it unlocks real brand deals that nobody can buy their way into.

---

## WHY WIREFLUID

We didn't pick WireFluid by default — it's the only chain that makes CricCall possible at scale.

### Sub-Second Fiat Off-Ramp — The Killer Feature

WireFluid's **5-second mobile money cashout** is the single most important feature for CricCall. When a user wins Rs. 200 in PKR from a Foodpanda PSL Challenge, they need that money in their JazzCash — not as a token they don't understand. WireFluid is the only EVM chain with a native local payment rail designed for Pakistan and emerging markets.

### $0.01 Gas Enables Micro-Predictions

Cricket generates thousands of predictable moments per match: every over, every wicket, every milestone. At Ethereum's gas fees, each prediction would cost more than the fun it creates. WireFluid's **$0.01 transaction fees** make ball-by-ball micro-predictions economically viable — unlocking the real-time engagement model that makes CricCall addictive.

### CometBFT Finality for Live Match Resolution

Cricket doesn't wait for block confirmations. When Babar Azam hits a six, 500,000 users need to see their prediction resolve instantly. WireFluid's **CometBFT consensus with ~5-second finality** means oracle results are permanent the moment they land. No probabilistic waiting, no reorg risk during the most emotionally charged moments of a match.

### Full EVM Compatibility — Zero Migration Friction

Our five Solidity smart contracts (CALLToken, PredictionMarket, SponsorVault, CricketOracle, PKRToken) deploy to WireFluid with **zero code changes** using standard Hardhat and MetaMask. WireFluid gives us the Ethereum developer ecosystem with Cosmos-grade performance.

### EIP-7702 Native Account Abstraction

WireFluid natively supports EIP-7702, enabling gasless transactions and sponsored gas without deploying ERC-4337 infrastructure, bundlers, or paymasters. Users connect any EVM wallet and our sponsor account can pay gas on their behalf.

### IBC Opens the South Asian Cricket Economy

Via **Cosmos IBC**, CricCall can accept sponsor deposits from any IBC-connected chain — expanding our brand deal marketplace to sponsors who are already on-chain across 50+ app-chains. A sponsor on Osmosis or Injective can fund a PSL challenge on WireFluid without a bridge. This is trustless interoperability no other EVM chain offers.

### Massive Genuine Transaction Volume for WireFluid

A single PSL T20 match generates 500,000+ predictions. A 34-match season = 17M+ on-chain transactions from real users, not bots or wash trading. CricCall becomes WireFluid's anchor consumer application — the proof that this chain works for real people at real scale.

---

## BRAND DEALS MARKETPLACE

A high CALL balance isn't just a number — it's proof that a user is an obsessively engaged cricket superfan. **CricCall turns that proof into a marketplace.**

The app has a "Deals" tab where brands offer exclusive discounts and perks tiered by CALL balance. Higher balance unlocks better deals. Users earn their way up. Brands get access to verified, engaged cricket fans — not random impressions.

| **CALL Balance** | **Tier** | **What Users Unlock** |
|---|---|---|
| **100-499** | **Casual Fan** | Basic deals: 10% off Foodpanda, free delivery on Daraz, introductory brand offers to hook users into checking the Deals tab regularly. |
| **500-1999** | **Dedicated Fan** | Better exclusives: Rs. 200 off PSL jerseys, buy-one-get-one KFC during match hours, 2GB free Jazz data on match days. Users feel genuinely rewarded for their knowledge. |
| **2000-4999** | **Expert** | Premium perks creating real FOMO: free Foodpanda meals during every PSL match, early access to ticket sales, exclusive merchandise drops from cricket brands. |
| **5000+** | **Superforecaster** | Ultra-rare status (~500-1000 users nationally). Free match tickets, brand ambassador invitations, cricket gear sponsorships. Brands compete for association with this tier. |

### Why Brands Pay for This

**The pitch to Foodpanda:** "We have 50,000 users with a CALL balance above 500. These are verified superfans active on their phones during every match. They're the ones ordering food at the innings break. We'll put your exclusive deal in front of only these 50,000 users — not wasted on people who don't care about cricket. Your redemption rate will be 5-10x a mass push notification."

Brands pay a monthly listing fee per tier plus per-redemption fees of Rs. 5-10 per coupon claimed.

> **The addiction loop:** A user at CALL balance 450 will predict on matches they'd otherwise skip just to cross the 500 threshold and unlock Dedicated tier deals. Users who stop predicting stagnate at their daily 100 claim while active winners keep climbing. This is daily engagement from a feature that costs almost nothing to run.

---

## HOW CRICCALL SERVES PSL DIRECTLY

CricCall isn't just inspired by PSL — it's a **fan engagement layer that PSL can plug into**.

**Real-Time Sentiment for Broadcasters.** "78% of CricCall users predict Islamabad United wins" — this is live on-chain data PSL can surface on broadcast graphics, social media, and streaming overlays. It turns passive viewership into interactive content.

**Sponsor Attribution PSL Can't Offer Today.** When Pepsi sponsors a PSL challenge on CricCall, the SponsorVault shows exactly how many fans engaged, predicted, won, and redeemed PKR. PSL can offer sponsors something no cricket board in the world can: **cryptographically verified fan engagement metrics.**

**Fan Retention Between Seasons.** PSL runs 34 matches over ~4 weeks. CricCall's CALL balance accumulation and brand deal system keeps fans engaged year-round through international matches, practice matches, and pre-season prediction leagues — all feeding back into PSL ecosystem engagement.

**A New Revenue Channel.** PSL can license the CricCall platform for official "PSL Predictions powered by WireFluid" — adding a digital fan engagement product to their commercial offering without building anything themselves.

---

## SPONSOR REWARD TRANSPARENCY

The SponsorVault is not a black box. It is a fully auditable, on-chain escrow system on WireFluid that makes every rupee traceable from sponsor deposit to winner redemption.

**DEPOSIT** — Foodpanda deposits Rs. 100,000 in PKR tokens into the SponsorVault contract. Transaction is publicly visible on **WireScan**. Anyone can verify the funds are real.

**RESOLVE** — Prediction market resolves via oracle. The backend ranks predictors and computes a Merkle tree of winners + PKR amounts. Only the Merkle root is posted on-chain — one transaction regardless of winner count.

**CLAIM** — Winners open the app and see "You won Rs. 200 from the Foodpanda PSL Challenge." They claim PKR via Merkle proof. PKR is redeemable via JazzCash mobile balance through WireFluid's local payment rails.

**AUDIT** — The SponsorVault exposes public state: `totalCommitted`, `totalAllocated`, `totalRedeemed`. A journalist, user, or Shariah auditor can reconstruct the full lifecycle of every campaign from on-chain data alone via WireScan.

> **Why this matters for Shariah compliance:** The Ju'alah contract requires three elements to be clearly defined: who offers the reward (sponsor), what the condition is (prediction accuracy), and what the reward is (specific PKR amount). The SponsorVault makes all three publicly verifiable and immutable at the time of commitment — before any predictions are made. This is cleaner than any paper-based Ju'alah contract in traditional Islamic finance.

---

## TECHNICAL ARCHITECTURE

### Smart Contracts (Solidity 0.8.28 — Deployed to WireFluid Testnet)

| **Contract** | **Description** |
|---|---|
| **CALLToken.sol** | Non-transferable ERC-20. Free 100 daily claim. Spent on predictions. Winners receive proportional CALL from losers' pool. Balance = reputation = leaderboard position. No payable functions, no transfers. |
| **PredictionMarket.sol** | Creates binary YES/NO markets for cricket outcomes. Users spend CALL to predict. Auto-resolves via oracle. Winners claim proportional share of total CALL pool. Losers' CALL redistributed to winners. |
| **CricketOracle.sol** | Accepts match results from authorized oracle service via commit-reveal scheme (prevents frontrunning). Triggers PredictionMarket resolution on result confirmation. Leverages CometBFT finality — no reorg risk. |
| **SponsorVault.sol** | Halal prize engine. Accepts PKR deposits from whitelisted sponsors only (`require()` rejects user funds). Stores Merkle roots of winner lists after resolution. Winners claim PKR via Merkle proof. Expiry clawback returns unclaimed funds to sponsor. Full audit trail on WireScan. |
| **PKRToken.sol** | Mintable ERC-20 representing the Pakistani Rupee. Admin mints to brands against fiat purchases. Fully transferable (real monetary value). Used as deposit token in SponsorVault. For hackathon — production would use official PKR stablecoin. |

### Contract Dependency Map

```
CALLToken (ERC-20, non-transferable, balance = reputation)
    │
    │  users spend CALL to predict
    │  market returns CALL to winners
    ▼
PredictionMarket (core engine)
    ▲
    │
CricketOracle (commit-reveal)

PKRToken ──→ SponsorVault (real money prizes, separate flow)
```

### Two-Token Separation (Enforced by Code)

```
CALL Token                              PKR Token
──────────                              ─────────
Free daily claim                        Admin mints against fiat
Non-transferable                        Fully transferable
Zero monetary value                     Real money (1 PKR = Rs. 1)
Prediction fuel + reputation            Prize distribution
Balance = leaderboard                   Redeemable to JazzCash

         NO CONNECTION
         No conversion
         No bridging
         No mixing
```

### Solving the Gas Fee Problem

Sending ERC-20 tokens to 2 million users individually would be economically catastrophic. CricCall optimizes:

**CALL pool redistribution is efficient.** Winners claim proportional CALL from the total pool — one transaction per winner, only when they actively claim.

**PKR rewards use Merkle claims, not mass distribution.** After resolution, we post one Merkle root on WireFluid (1 transaction at $0.01, regardless of winner count). Winners claim individually via Merkle proof. Cost scales with engaged users, not total users.

**Result:** This architecture handles 10 million users at roughly the same on-chain cost as 10,000 users. On-chain costs scale with markets and campaigns — not with user count. At WireFluid's $0.01 per transaction, even peak load is negligible.

---

## REVENUE MODEL

CALL tokens are free. Revenue comes from monetizing the audience, not the predictions — identical to how Instagram monetizes free posting.

| **Stream** | **How It Works** | **Projected Revenue (2M MAU)** |
|---|---|---|
| **Rewarded Video Ads** | Users watch 15-sec brand ads to earn bonus CALL tokens. 90-95% completion rate because user opts in. | $18,000-30,000 per match day at $3 eCPM with 3-5 ads per user |
| **Brand Deal Listings** | Monthly fees for brands to list offers in tiered Deals marketplace. Plus per-redemption fees. | Rs. 1-3M/month ($3,500-10,000) from 15-20 brand partners |
| **Sponsored Challenges** | Branded prediction campaigns during matches. Brand funds PKR prize pool via SponsorVault + pays platform fee. | Rs. 100K-500K per challenge ($350-1,750). Multiple per match. |
| **Premium Subscription** | CricCall Pro: unlimited daily CALL, AI insights, advanced analytics, ad-free. Rs. 100/week. | $7,000-14,000/month at 1-2% conversion rate |
| **Data Licensing** | Real-time prediction sentiment sold to broadcasters, PCB, PSL, brands. "78% predict Pakistan wins." | $10,000-20,000/month once established |

> **Conservative estimate at 2M MAU during cricket season: $200,000-400,000/month.** This scales linearly with users. At 10M MAU (achievable given Pakistan's demographics), revenue reaches $500K-1M/month.

---

## THE MARKET

| **255M** | **64%** | **27M** | **$25B** |
|---|---|---|---|
| Population | Under Age 30 | Crypto Users | Crypto Txns 2025 |

| **190M** | **80M+** | **1.4B** | **647%** |
|---|---|---|---|
| Mobile Connections | Mobile Wallets (JazzCash/EasyPaisa) | PSL Stream Views | PSL Digital Growth YoY |

> Pakistan passed the **Virtual Assets Act on March 7, 2026**, creating PVARA as a permanent blockchain regulator. The law explicitly requires Shariah compliance for licensed virtual asset services — a regulatory moat CricCall is purpose-built for. WireFluid's architecture (low fees, local payment rails, EVM compatibility) aligns directly with PVARA's vision of accessible, compliant blockchain services.

---

## USER EXPERIENCE FLOW

A user in Lahore opens CricCall during a Pakistan vs India match:

**CONNECT** — Connects wallet (MetaMask or any EVM wallet). No seed phrase confusion — EIP-7702 on WireFluid enables gasless transactions.

**CLAIM** — Taps "Claim Daily CALL" button. 100 CALL tokens minted to their wallet.

**PREDICT** — Taps "Will Pakistan score 180+?" — spends 50 of 100 free CALL on YES. Transaction on WireFluid at $0.01 gas.

**WATCH** — Pool sizes shift live as others predict. After 15 overs, YES pool surges as Pakistan reaches 140/2.

**WIN** — Pakistan finishes 192. Oracle pushes result to WireFluid — finalized in ~5 seconds via CometBFT. Contract auto-resolves. User's 50 CALL returns as 85 CALL (proportional share of losers' pool). Their CALL balance grows — reputation up.

**TIER UP** — CALL balance crosses 500. A notification: "You just unlocked Dedicated Fan deals!" New Foodpanda and KFC offers appear in the Deals tab.

**WIN PKR** — Top 50 predictor for this match. SponsorVault on WireFluid distributes Rs. 100 in PKR to their wallet — claimed with one tap via Merkle proof. Redeemable to JazzCash.

**SHARE** — Prediction card generated: "I predicted Pak 180+ at 62%. Season accuracy: 71%. CALL Balance: 1,247." Shared to WhatsApp. Three friends download CricCall.

> **The user touched WireFluid multiple times in this flow. They noticed it zero times. That's the point.**

---

## WHAT WE BUILT

| **Smart Contracts (on WireFluid Testnet)** | **Frontend & Infra** |
|---|---|
| **CALLToken.sol** — Non-transferable ERC-20, daily claim, balance = reputation, pool redistribution | **Next.js Web App** — Live markets, probability display, leaderboard, Deals tab, mobile-first |
| **PredictionMarket.sol** — Binary YES/NO markets, CALL spending, oracle resolution, proportional payouts | **Wallet Auth** — SIWE (Sign-In with Ethereum), any EVM wallet, EIP-7702 gasless UX |
| **CricketOracle.sol** — Commit-reveal match results, frontrun prevention, consumer notification | **Cricket Oracle Service** — Live API integration, on-chain result pushing to WireFluid, commit-reveal |
| **SponsorVault.sol** — Whitelisted PKR deposits, Merkle winner proofs, clawback, audit state | **Merkle Distribution Engine** — Winner computation, tree generation, root posting to WireFluid |
| **PKRToken.sol** — Mintable PKR stablecoin, admin-controlled, fully transferable real money | **NestJS Backend** — PostgreSQL, Redis, Casbin RBAC, MinIO storage |

**All contracts verified on WireScan. 120 tests passing. Deployed using Hardhat to WireFluid's EVM layer.**

---

## COMPETITIVE LANDSCAPE

No platform combines all three: Shariah-compliant architecture + on-chain transparency + cricket-specific design for Pakistan.

| | **CricCall** | **Polymarket** | **Dream11** | **Local Betting Apps** |
|---|---|---|---|---|
| **Shariah Compliant** | By architecture (two-token) | Real money risk | Real money risk | Haram by definition |
| **On-Chain Transparent** | WireFluid | Polygon | Centralized | Opaque |
| **Pakistan Legal** | PVARA aligned | Not accessible | Banned model | 46 apps blocked |
| **Cricket Focused** | Purpose-built | General | Fantasy format | Varies |
| **Zero User Risk** | Free CALL only | Requires USDC | Entry fees | Cash betting |
| **Mobile Money Integration** | Via WireFluid | Crypto only | N/A | Cash/hawala |

> CricCall occupies a unique position: the only platform that is simultaneously halal by smart contract design, transparent on-chain, legal under PVARA, and accessible to wallet users via WireFluid's infrastructure.

---

*Every blockchain hackathon produces DeFi forks and NFT marketplaces that nobody outside this room will ever use.*

*We're building something that a cricket fan in Lahore will use during every Pakistan match — predicting, earning CALL, climbing the leaderboard, unlocking deals, winning PKR.*

**That's real adoption.**

---

# CRICCALL

### *Predict Cricket. Earn Rewards. Zero Gambling.*

**Built on WireFluid. Built for Pakistan. Built for 140 million fans.**
