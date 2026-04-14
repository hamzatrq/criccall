# Oracle Service Architecture

## Overview

Off-chain NestJS service that fetches cricket match results from external APIs and pushes them on-chain to CricketOracle.sol on WireFluid via commit-reveal. Also exposes an admin endpoint for manual resolution during demos.

## Data Flow

```
Cricket API (CricAPI)
    │
    │  polls every 30s during live match
    ▼
NestJS Oracle Service (apps/api — OracleModule)
    │
    │  detects match completion
    │  generates secret, computes commit hash
    ▼
CricketOracle.sol on WireFluid
    │
    │  commitResult(matchId, hash)
    │  ... ~5 seconds (1 block) ...
    │  revealResult(matchId, outcome, secret)
    ▼
PredictionMarket.sol
    │  onMatchResolved() triggered automatically
    │  market state → Resolved or Canceled
```

## Data Source

**Primary:** CricAPI (free tier for hackathon)
- Endpoint: `GET /matches` — list of live/completed matches
- Endpoint: `GET /match/:id` — match detail with result
- Coverage: International matches, PSL, IPL, major T20 leagues
- Delay: ~30 seconds from real result
- Rate limit: 100 requests/day on free tier (sufficient for demo)

**Post-hackathon:** Upgrade to SportRadar or multiple sources with consensus.

## Match Outcome Mapping

```
API Result              → Contract Outcome
─────────────────────────────────────────
Team A won              → Outcome.TeamA (1)
Team B won              → Outcome.TeamB (2)
Match drawn             → Outcome.Draw (3)
Match tied              → Outcome.Draw (3)
No result / Abandoned   → Outcome.NoResult (4)
```

## Service Components

### 1. MatchPollerService

Runs as a cron job. Polls the cricket API for active matches.

```
Every 30 seconds during active matches:
  1. GET /matches?status=live from CricAPI
  2. For each match we have a market for:
     - Check if status changed to "completed"
     - If completed → trigger OracleResolverService
  3. Store latest match state in DB
```

Configuration:
- `CRICKET_API_KEY` — CricAPI key
- `CRICKET_API_URL` — base URL
- `POLL_INTERVAL_MS` — 30000 (30s default)
- Active only when there are open/locked markets

### 2. OracleResolverService

Handles the commit-reveal flow when a match completes.

```
resolveMatch(matchId, outcome):
  1. Generate random 32-byte secret
  2. Compute commitHash = keccak256(abi.encode(matchId, outcome, secret))
  3. Call CricketOracle.commitResult(matchId, commitHash)
  4. Store secret in oracle_resolutions.secret column (PostgreSQL)
  5. Wait for tx confirmation (~5s on WireFluid)
  6. Retrieve secret from oracle_resolutions table
  7. Call CricketOracle.revealResult(matchId, outcome, secret)
  8. Update resolution record in PostgreSQL (audit trail)
  9. Clear secret from oracle_resolutions.secret column
```

Signing: Uses a dedicated oracle wallet. Private key in `ORACLE_PRIVATE_KEY` env var. This address must be added via `CricketOracle.addOracle()` before use.

### 3. AdminOracleController

REST endpoint for manual resolution during demos and testing.

```
POST /admin/oracle/resolve
Headers: Authorization: Bearer <admin-jwt>
Body: {
  "matchId": "PAK-IND-2026-04-15",
  "outcome": 1  // TeamA
}

→ Triggers OracleResolverService.resolveMatch()
→ Same commit-reveal flow as automated path
→ Returns: { txHash, matchId, outcome, status }
```

Protected by admin JWT guard. Only accessible to deployer/admin role.

### 4. OracleWalletService

Manages the oracle wallet used for signing on-chain transactions.

```
- Loads ORACLE_PRIVATE_KEY from env
- Creates viem WalletClient connected to WireFluid RPC
- Signs and submits commit/reveal transactions
- Monitors WIRE balance for gas (alerts if low)
```

## Database Schema

```sql
oracle_resolutions
├── id              UUID (PK)
├── match_id        VARCHAR (unique)
├── outcome         SMALLINT
├── secret          VARCHAR (nullable)      ← 32-byte secret, cleared after reveal
├── commit_tx_hash  VARCHAR
├── reveal_tx_hash  VARCHAR
├── source          ENUM('api', 'admin')
├── resolved_at     TIMESTAMP
├── created_at      TIMESTAMP
└── updated_at      TIMESTAMP
```

## Error Handling

| Scenario | Handling |
|---|---|
| API rate limit hit | Back off, retry after cooldown. Alert admin. |
| Commit tx fails | Retry up to 3 times with exponential backoff. Log failure. |
| Reveal tx fails | Critical — secret is in DB. Retry immediately. Alert admin. |
| Secret lost (DB issue) | Secret is unrecoverable. Match cannot be resolved via this commit. Admin must create a new commit-reveal cycle. |
| API returns ambiguous result | Do not resolve. Flag for manual review via admin endpoint. |
| Oracle wallet out of gas | Alert admin. Do not attempt transactions. |

## Security

- Oracle wallet private key stored in env, never in code or DB
- Secrets stored in PostgreSQL `oracle_resolutions.secret` column, cleared after reveal
- Admin endpoint behind JWT auth + admin role guard
- Commit-reveal prevents frontrunning even if oracle tx is visible in mempool
- Only whitelisted oracle addresses can call commitResult/revealResult on-chain

## Environment Variables

```
CRICKET_API_KEY=<cricapi-key>
CRICKET_API_URL=https://api.cricapi.com/v1
ORACLE_PRIVATE_KEY=<oracle-wallet-private-key>
POLL_INTERVAL_MS=30000
WIREFLUID_RPC_URL=https://evm.wirefluid.com
```

## Demo Strategy

During hackathon judging:
1. Show live market with predictions
2. Use admin endpoint to trigger resolution
3. Show market auto-resolve on-chain
4. Show winners claiming CALL tokens and PKR prizes

The admin endpoint exists purely for demo reliability. In production, MatchPollerService handles everything automatically.
