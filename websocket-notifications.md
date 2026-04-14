# WebSocket Gateway & Notifications

## Overview

Socket.io for real-time updates during live matches. In-app notifications persisted in DB and delivered via WebSocket. Single module — notifications ride on the same WebSocket connection.

## WebSocket Channels

Users subscribe to channels based on what they're viewing:

```
market:{marketId}          ← pool updates, state changes, new sponsors
match:{matchId}            ← match status, live score
user:{walletAddress}       ← personal notifications (private, authenticated)
leaderboard                ← top balance changes
```

## Events Emitted

### Market Channel

```
market:{id}:pools          → { yesPool, noPool, totalPredictors }
market:{id}:state          → { state: 'locked' | 'resolved' | 'canceled' }
market:{id}:resolved       → { outcome, yesWon }
market:{id}:sponsor        → { sponsorName, logo, prizeAmount, totalPrize, tier }
```

### Match Channel

```
match:{id}:status          → { status: 'live' | 'completed' }
match:{id}:score           → { teamA: 145, teamB: null, overs: "15.3" }
```

### User Channel (Private)

```
user:{addr}:notification   → { id, type, title, body, data }
```

### Leaderboard

```
leaderboard:update         → { top10: [{ address, displayName, balance }] }
```

## Connection Flow

```
1. User opens app → connects Socket.io with JWT
2. Gateway validates JWT, joins user:{addr} room
3. User navigates to market → joins market:{id} room
4. PredictionPlaced event → broadcasts pool update to market room
5. User leaves market → leaves room
6. User always in user:{addr} room for notifications
```

## NestJS Gateway

```typescript
@WebSocketGateway({ cors: true })
class EventsGateway {

  @SubscribeMessage('join:market')
  handleJoinMarket(client, marketId) {
    client.join(`market:${marketId}`);
  }

  @SubscribeMessage('leave:market')
  handleLeaveMarket(client, marketId) {
    client.leave(`market:${marketId}`);
  }

  broadcastPoolUpdate(marketId, pools) {
    this.server.to(`market:${marketId}`).emit('pools', pools);
  }

  broadcastMarketResolved(marketId, outcome) {
    this.server.to(`market:${marketId}`).emit('resolved', outcome);
  }

  notifyUser(address, notification) {
    this.server.to(`user:${address}`).emit('notification', notification);
  }
}
```

## Notifications

### What Triggers Notifications

| Trigger | Type | Message |
|---|---|---|
| Market resolved — user won | `winnings` | "You won 85 CALL from PAK vs IND!" |
| Market resolved — user lost | `loss` | "PAK vs IND resolved. Better luck next time." |
| Market canceled | `canceled` | "PAK vs IND canceled. Your 50 CALL refunded." |
| PKR reward available | `reward` | "You won Rs. 500 PKR from Foodpanda! Claim now." |
| Tier upgrade | `tier_up` | "You reached Dedicated Fan! New deals unlocked." |
| New deal unlocked | `deal_unlocked` | "New deal from KFC — available at your tier!" |
| New sponsor joins market | `sponsor` | "PTCL added Rs. 10,50,000 to PAK vs IND!" |
| Match opening soon | `reminder` | "PAK vs IND opens in 30 minutes. Claim your CALL!" |

### Delivery Flow

```
Event occurs (e.g., MarketResolved)
    │
    ▼
NotificationService.create({ userId, type, title, body, data })
    │
    ├── 1. Insert into notifications table
    │
    └── 2. Push via WebSocket if user online
           gateway.notifyUser(address, notification)
```

User comes back online → fetches unread from DB via API.

### Database Schema

```sql
notifications
├── id              UUID (PK)
├── user_id         UUID (FK → users)
├── type            VARCHAR
├── title           VARCHAR
├── body            VARCHAR
├── data            JSONB (nullable)     ← { marketId, amount, campaignId, dealId }
├── read            BOOLEAN DEFAULT false
├── created_at      TIMESTAMP
└── updated_at      TIMESTAMP
```

### API Endpoints

```
GET    /notifications                ← My notifications (paginated)
GET    /notifications/unread-count   ← Badge count for UI
PATCH  /notifications/:id/read      ← Mark as read
PATCH  /notifications/read-all      ← Mark all as read
```

### Frontend — Notification Bell

```
┌─────────────────────────────────┐
│  🔔 (3)                         │
│                                  │
│  🏆 You won 85 CALL!            │  ← unread
│  PAK vs IND · 2 min ago         │
│                                  │
│  💰 Rs. 500 PKR available       │  ← unread
│  Foodpanda challenge · 5m        │
│                                  │
│  ⭐ Dedicated Fan!               │  ← unread
│  New deals unlocked · 10m        │
│                                  │
│  ❌ PAK vs AUS resolved          │  ← read (dimmed)
│  Better luck next time · 1h      │
└─────────────────────────────────┘
```

## Scaling (Post-Hackathon)

For hackathon: single NestJS instance with Socket.io. No Redis adapter needed.

For production: `@socket.io/redis-adapter` — multiple NestJS instances share WebSocket state via pub/sub. Not implemented for hackathon.

## Dependencies

- `@nestjs/websockets` + `@nestjs/platform-socket.io` — WebSocket gateway
- `socket.io-client` — frontend connection
