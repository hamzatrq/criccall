# Authentication Architecture

## Overview

Wallet-only authentication. Fully decentralized — no custodial keys, no email/phone providers, no server-side key management. User connects any EVM wallet, signs a SIWE message, gets a JWT.

## Auth Flow

```
User clicks "Connect Wallet"
  → MetaMask / any EIP-6963 wallet pops up
  → Frontend builds SIWE message with nonce from backend
  → User signs message
  → Backend verifies signature using viem
  → Creates or finds user by wallet address
  → Returns JWT { userId, walletAddress }
  → All on-chain actions signed by user directly
  → EIP-7702 available for gasless UX
```

## UI

```
┌─────────────────────────────┐
│      Welcome to CricCall     │
│                              │
│   ┌──────────────────────┐  │
│   │   Connect Wallet     │  │
│   └──────────────────────┘  │
│                              │
│   MetaMask · WireFluid       │
│   or any EVM wallet          │
│                              │
└─────────────────────────────┘
```

## API Endpoints

```
GET  /auth/nonce          → Returns random nonce for SIWE message
POST /auth/verify         → { message, signature } → verifies → returns JWT
GET  /auth/me             → Returns current user from JWT
```

## Database Schema

```sql
users
├── id              UUID (PK)
├── wallet_address  VARCHAR (unique, not null)
├── created_at      TIMESTAMP
└── updated_at      TIMESTAMP
```

## NestJS Implementation

### Single Strategy

One Passport strategy: `SIWEStrategy` — validates wallet signature via viem, resolves to User entity.

### Guard

```
@UseGuards(JwtAuthGuard)          ← Every protected endpoint
@Get('/predictions')
getPredictions(@CurrentUser() user) {
  // user.id and user.walletAddress always present
}
```

### Transaction Signing

All users sign their own transactions. No server-side signing. Backend never holds private keys.

For gasless UX, EIP-7702 allows our sponsor account to pay gas while user retains full signing authority.

## Tech Stack

| Piece | Choice |
|---|---|
| Wallet Connect | viem + SIWE (EIP-4361) + EIP-6963 (wallet discovery) |
| JWT | NestJS Passport + @nestjs/jwt |
| Nonce Storage | Redis (short-lived, expires after 5 min) |

## Testing Matrix

| Test | Expected |
|---|---|
| Connect wallet creates user | ✓ |
| Duplicate wallet returns existing user | ✓ |
| Invalid signature rejected | ✓ |
| Expired nonce rejected | ✓ |
| JWT contains userId + walletAddress | ✓ |
| JWT works on all protected routes | ✓ |
| Disconnected wallet clears session | ✓ |

## Future Roadmap (Post-Hackathon)

- Embedded wallet SDK for phone/email signup
- Account abstraction onboarding for non-crypto users
- Social login with auto wallet generation
