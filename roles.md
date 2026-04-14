# Roles & Access Control

## Overview

RBAC using a simplified `RolesGuard` with role hierarchy in NestJS, plus Solidity on-chain access control. Three roles: `super_admin`, `sponsor`, `user`. The guard is the fast off-chain check, Solidity is the trustless on-chain check. Double gate.

## Roles

| Role | Who | Description |
|---|---|---|
| **super_admin** | CricCall team | Full system access. Owns contracts, manages oracle, mints PKR. |
| **sponsor** | Brand partners (Foodpanda, KFC, etc.) | Create campaigns, deposit PKR, view analytics, clawback. |
| **user** | Cricket fans | Predict, claim CALL tokens, claim PKR rewards, view deals, view profile. |

Role inheritance: `super_admin → sponsor → user`. Each higher role inherits all lower permissions.

## Access Control Policy

The following policy table documents the access control intent. The implementation uses a simplified `RolesGuard` with role hierarchy (`super_admin > sponsor > user`) rather than a full Casbin enforcer.

```csv
# Super Admin
p, super_admin, markets, create
p, super_admin, markets, resolve
p, super_admin, oracle, commit
p, super_admin, oracle, reveal
p, super_admin, sponsors, manage
p, super_admin, winners, post_root
p, super_admin, pkr, mint
p, super_admin, users, manage

# Sponsor
p, sponsor, campaigns, create
p, sponsor, campaigns, update
p, sponsor, campaigns, clawback
p, sponsor, campaigns, view
p, sponsor, campaigns, stats

# User
p, user, call, claim
p, user, markets, predict
p, user, markets, view
p, user, winnings, claim
p, user, refunds, claim
p, user, rewards, claim
p, user, profile, view
p, user, profile, edit
p, user, deals, view
p, user, leaderboard, view

# Role Inheritance
g, super_admin, sponsor
g, super_admin, user
g, sponsor, user
```

## Solidity Role Mapping

RolesGuard policies map to on-chain access control. Backend checks RolesGuard first, contracts enforce at Solidity level.

| Policy | Contract Function | Solidity Guard |
|---|---|---|
| `super_admin, markets, create` | `market.createMarket()` | `onlyOwner` |
| `super_admin, oracle, commit` | `oracle.commitResult()` | `authorizedOracles[msg.sender]` |
| `super_admin, oracle, reveal` | `oracle.revealResult()` | `authorizedOracles[msg.sender]` |
| `super_admin, winners, post_root` | `vault.postWinnerRoot()` | `onlyOwner` |
| `super_admin, pkr, mint` | `pkr.mint()` | `onlyOwner` |
| `super_admin, sponsors, manage` | `vault.addSponsor()` / `vault.removeSponsor()` | `onlyOwner` |
| `sponsor, campaigns, create` | `vault.createCampaign()` | `whitelistedSponsors[msg.sender]` |
| `sponsor, campaigns, clawback` | `vault.clawback()` | `msg.sender == campaign.sponsor` |
| `user, call, claim` | `call.claimDaily()` | Anyone |
| `user, markets, predict` | `market.predict()` | Anyone (before lockTime) |
| `user, winnings, claim` | `market.claimWinnings()` | Anyone (pool verified) |
| `user, rewards, claim` | `vault.claim()` | Anyone (Merkle proof verified) |

## Wallet Architecture

```
Deployer Wallet (1)
  └─ Owns all contracts (onlyOwner)
  └─ Mints PKR tokens
  └─ super_admin role in DB

Oracle Wallet (1)
  └─ authorizedOracles on CricketOracle.sol
  └─ Used only by Oracle Service internally
  └─ Not a DB user — service-level key

Sponsor Wallets (N)
  └─ whitelistedSponsors on SponsorVault.sol
  └─ sponsor role in DB
  └─ Each brand has their own wallet

User Wallets (N)
  └─ No special on-chain role
  └─ user role in DB
  └─ Connect via MetaMask / SIWE
```

Two backend-managed wallets: owner and oracle. Oracle wallet is a service-level key configured via environment variable and used only internally by the Oracle module.

## Database Schema

```sql
users
├── id              UUID (PK)
├── wallet_address  VARCHAR (unique, not null)
├── role            VARCHAR DEFAULT 'user'
├── display_name    VARCHAR (nullable)
├── avatar_url      VARCHAR (nullable)
├── created_at      TIMESTAMP
└── updated_at      TIMESTAMP
```

Role stored in users table. Checked by RolesGuard on each request.

## NestJS Integration

### Guard

```typescript
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('super_admin')
@Post('/markets')
createMarket() { ... }
```

### RolesGuard Logic

```
1. Extract user from JWT
2. Load role from user record
3. Check if user's role meets the required role (using hierarchy: super_admin > sponsor > user)
4. Allow or deny
```

### Role Assignment

- New users via SIWE → assigned `user` role by default
- Sponsor role → super_admin promotes via admin endpoint
- Super admin → seeded in DB on deployment, or assigned via direct DB update

```
POST /admin/users/:walletAddress/role
Body: { "role": "sponsor" }
Guard: super_admin only
```

## Package

Simplified `RolesGuard` implemented as a custom NestJS guard with `@Roles()` decorator. No external RBAC library needed. Role hierarchy is hardcoded: `super_admin > sponsor > user`. Database access via `prisma` + `@prisma/client` (PostgreSQL on Railway).
