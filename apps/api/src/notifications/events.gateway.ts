import {
  WebSocketGateway,
  WebSocketServer,
  SubscribeMessage,
  OnGatewayConnection,
  OnGatewayDisconnect,
  ConnectedSocket,
  MessageBody,
} from '@nestjs/websockets';
import { Logger } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { Server, Socket } from 'socket.io';

@WebSocketGateway({ cors: { origin: '*' }, namespace: '/' })
export class EventsGateway
  implements OnGatewayConnection, OnGatewayDisconnect
{
  @WebSocketServer()
  server: Server;

  private readonly logger = new Logger(EventsGateway.name);

  constructor(private readonly jwtService: JwtService) {}

  async handleConnection(client: Socket) {
    try {
      const token =
        client.handshake.auth?.token ||
        (client.handshake.query?.token as string);

      if (!token) {
        this.logger.warn(`Client ${client.id} connected without token`);
        client.disconnect();
        return;
      }

      const payload = this.jwtService.verify(token);
      const walletAddress = payload.wallet;

      if (!walletAddress) {
        this.logger.warn(`Client ${client.id} token missing wallet`);
        client.disconnect();
        return;
      }

      // Store user info on the socket for later use
      (client as any).userId = payload.sub;
      (client as any).walletAddress = walletAddress;

      // Auto-join user's private room
      client.join(`user:${walletAddress}`);
      this.logger.log(
        `Client ${client.id} connected as ${walletAddress}`,
      );
    } catch (error) {
      this.logger.warn(
        `Client ${client.id} auth failed: ${error.message}`,
      );
      client.disconnect();
    }
  }

  handleDisconnect(client: Socket) {
    this.logger.log(`Client ${client.id} disconnected`);
  }

  // ── Room management ──────────────────────────────────────────────

  @SubscribeMessage('join:market')
  handleJoinMarket(
    @ConnectedSocket() client: Socket,
    @MessageBody() marketId: string,
  ) {
    client.join(`market:${marketId}`);
    this.logger.debug(`Client ${client.id} joined market:${marketId}`);
    return { event: 'join:market', data: { marketId, joined: true } };
  }

  @SubscribeMessage('leave:market')
  handleLeaveMarket(
    @ConnectedSocket() client: Socket,
    @MessageBody() marketId: string,
  ) {
    client.leave(`market:${marketId}`);
    this.logger.debug(`Client ${client.id} left market:${marketId}`);
    return { event: 'leave:market', data: { marketId, left: true } };
  }

  @SubscribeMessage('join:match')
  handleJoinMatch(
    @ConnectedSocket() client: Socket,
    @MessageBody() matchId: string,
  ) {
    client.join(`match:${matchId}`);
    this.logger.debug(`Client ${client.id} joined match:${matchId}`);
    return { event: 'join:match', data: { matchId, joined: true } };
  }

  @SubscribeMessage('leave:match')
  handleLeaveMatch(
    @ConnectedSocket() client: Socket,
    @MessageBody() matchId: string,
  ) {
    client.leave(`match:${matchId}`);
    this.logger.debug(`Client ${client.id} left match:${matchId}`);
    return { event: 'leave:match', data: { matchId, left: true } };
  }

  @SubscribeMessage('join:leaderboard')
  handleJoinLeaderboard(@ConnectedSocket() client: Socket) {
    client.join('leaderboard');
    this.logger.debug(`Client ${client.id} joined leaderboard`);
    return { event: 'join:leaderboard', data: { joined: true } };
  }

  @SubscribeMessage('leave:leaderboard')
  handleLeaveLeaderboard(@ConnectedSocket() client: Socket) {
    client.leave('leaderboard');
    this.logger.debug(`Client ${client.id} left leaderboard`);
    return { event: 'leave:leaderboard', data: { left: true } };
  }

  // ── Broadcast methods (called by other services) ─────────────────

  broadcastPoolUpdate(
    marketId: string | number,
    data: { yesPool: string; noPool: string; totalPredictors: number },
  ) {
    this.server.to(`market:${marketId}`).emit('pools', data);
  }

  broadcastMarketState(
    marketId: string | number,
    data: { state: string },
  ) {
    this.server.to(`market:${marketId}`).emit('state', data);
  }

  broadcastMarketResolved(
    marketId: string | number,
    data: { outcome: number; yesWon: boolean },
  ) {
    this.server.to(`market:${marketId}`).emit('resolved', data);
  }

  broadcastNewSponsor(marketId: string | number, sponsorData: any) {
    this.server.to(`market:${marketId}`).emit('sponsor', sponsorData);
  }

  broadcastMatchStatus(matchId: string, data: { status: string }) {
    this.server.to(`match:${matchId}`).emit('matchStatus', data);
  }

  broadcastMatchScore(matchId: string, scoreData: any) {
    this.server.to(`match:${matchId}`).emit('matchScore', scoreData);
  }

  notifyUser(walletAddress: string, notification: any) {
    this.server
      .to(`user:${walletAddress}`)
      .emit('notification', notification);
  }

  broadcastLeaderboardUpdate(data: any) {
    this.server.to('leaderboard').emit('leaderboard', data);
  }
}
