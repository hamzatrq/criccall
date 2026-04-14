# Roles & Access Control

## Overview

Unified RBAC using Casbin across NestJS API and Solidity contracts. Three roles: `super_admin`, `sponsor`, `user`. Casbin is the fast off-chain check, Solidity is the trustless on-chain check. Double gate.

## Roles

| Role | Who | Description |
|---|---|---|
| **super_admin** | CricCall team | Full system access. Owns contracts, manages oracle, mints PKR. |
| **sponsor** | Brand partners (Foodpanda, KFC, etc.) | Create campaigns, deposit PKR, view analytics, clawback. |
| **user** | Cricket fans | Predict, claim CALL tokens, claim PKR rewards, view deals, view profile. |

Role inheritance: `super_admin → sponsor → user`. Each higher role inherits all lower permissions.

## Casbin Model

```ini
[request_definition]
r = sub, obj, act

[policy_definition]
p = sub, obj, act

[role_definition]
g = _, _

[policy_effect]
e = some(where (p.eft == allow))

[matchers]
m = g(r.sub, p.sub) && r.obj == p.obj && r.act == p.act
```

## Casbin Policies

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
p, sponsor, campaigns, clawback
p, sponsor, campaigns, view

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

Casbin policies map to on-chain access control. Backend checks Casbin first, contracts enforce at Solidity level.

| Casbin Policy | Contract Function | Solidity Guard |
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
  └─ super_admin role in Casbin

Oracle Wallet (1)
  └─ authorizedOracles on CricketOracle.sol
  └─ Used only by Oracle Service internally
  └─ Not a Casbin user — service-level key

Sponsor Wallets (N)
  └─ whitelistedSponsors on SponsorVault.sol
  └─ sponsor role in Casbin
  └─ Each brand has their own wallet

User Wallets (N)
  └─ No special on-chain role
  └─ user role in Casbin
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

Role stored in users table. Loaded into Casbin enforcer on authentication.

## NestJS Integration

### Guard

```typescript
@UseGuards(JwtAuthGuard, CasbinGuard)
@CasbinResource('markets')
@CasbinAction('create')
@Post('/markets')
createMarket() { ... }
```

### CasbinGuard Logic

```
1. Extract user from JWT
2. Load role from user record
3. Enforcer.enforce(role, resource, action)
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

`node-casbin` with `typeorm-adapter` for policy persistence in PostgreSQL. Policies loaded once on app startup, cached in memory.
