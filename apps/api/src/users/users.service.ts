import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { StorageService } from '../storage/storage.service';
import { WireFluidService } from '../wirefluid/wirefluid.service';
import { UpdateProfileDto } from './dto/update-profile.dto';
import { formatEther } from 'viem';

type Tier = 'new_fan' | 'casual' | 'dedicated' | 'expert' | 'superforecaster';

function computeTier(balance: string): Tier {
  const b = parseInt(balance, 10) || 0;
  if (b >= 5000) return 'superforecaster';
  if (b >= 2000) return 'expert';
  if (b >= 500) return 'dedicated';
  if (b >= 100) return 'casual';
  return 'new_fan';
}

@Injectable()
export class UsersService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly storage: StorageService,
    private readonly wirefluid: WireFluidService,
  ) {}

  /**
   * Sync on-chain CALL balance to DB for a user.
   * Reads balanceOf from CALLToken contract and updates cachedCallBalance + tier.
   */
  async syncBalance(userId: string) {
    const user = await this.prisma.user.findUnique({ where: { id: userId } });
    if (!user) throw new NotFoundException('User not found');

    try {
      const contract = this.wirefluid.getCallTokenContract();
      const publicClient = this.wirefluid.getPublicClient();

      const balance = await publicClient.readContract({
        address: contract.address as `0x${string}`,
        abi: contract.abi,
        functionName: 'balanceOf',
        args: [user.walletAddress as `0x${string}`],
      });

      const balanceStr = Math.floor(Number(formatEther(balance as bigint))).toString();
      const tier = computeTier(balanceStr);

      const updated = await this.prisma.user.update({
        where: { id: userId },
        data: { cachedCallBalance: balanceStr, tier },
      });

      return { walletAddress: updated.walletAddress, cachedCallBalance: updated.cachedCallBalance, tier: updated.tier };
    } catch (error) {
      // If chain read fails, return current cached values
      return { walletAddress: user.walletAddress, cachedCallBalance: user.cachedCallBalance, tier: user.tier };
    }
  }

  /** Full profile for the authenticated user */
  async getMe(userId: string) {
    const user = await this.prisma.user.findUnique({ where: { id: userId } });
    if (!user) throw new NotFoundException('User not found');
    return user;
  }

  /** Update display_name and/or favorite_team */
  async updateProfile(userId: string, dto: UpdateProfileDto) {
    const data: Record<string, string> = {};
    if (dto.displayName !== undefined) data.displayName = dto.displayName;
    if (dto.favoriteTeam !== undefined) data.favoriteTeam = dto.favoriteTeam;

    return this.prisma.user.update({
      where: { id: userId },
      data,
    });
  }

  /** Upload avatar to S3, save key in DB */
  async uploadAvatar(
    userId: string,
    walletAddress: string,
    file: Express.Multer.File,
  ) {
    const allowedMimes = ['image/png', 'image/jpeg', 'image/webp'];
    if (!allowedMimes.includes(file.mimetype)) {
      throw new BadRequestException(
        'Invalid file type. Only PNG, JPG, and WebP are allowed.',
      );
    }

    const key = this.storage.avatarKey(walletAddress);
    await this.storage.upload(key, file.buffer, file.mimetype);

    return this.prisma.user.update({
      where: { id: userId },
      data: { avatarUrl: key },
    });
  }

  /** Paginated prediction history */
  async getPredictions(userId: string, page: number, limit: number) {
    const skip = (page - 1) * limit;

    const [predictions, total] = await Promise.all([
      this.prisma.prediction.findMany({
        where: { userId },
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit,
        include: {
          market: {
            select: {
              question: true,
              state: true,
              yesWon: true,
            },
          },
        },
      }),
      this.prisma.prediction.count({ where: { userId } }),
    ]);

    return {
      data: predictions,
      meta: { page, limit, total, totalPages: Math.ceil(total / limit) },
    };
  }

  /** Reward claim history */
  async getRewards(userId: string) {
    return this.prisma.rewardClaim.findMany({
      where: { userId },
      orderBy: { claimedAt: 'desc' },
    });
  }

  /** User stats: balance, tier, predictions, win rate */
  async getStats(userId: string) {
    const user = await this.prisma.user.findUnique({ where: { id: userId } });
    if (!user) throw new NotFoundException('User not found');

    const [totalPredictions, correctPredictions, wonSum, lostSum] =
      await Promise.all([
        this.prisma.prediction.count({ where: { userId } }),
        this.prisma.prediction.count({
          where: { userId, result: 'won' },
        }),
        this.prisma.$queryRaw<[{ total: string }]>`
          SELECT COALESCE(SUM(CAST(winnings AS NUMERIC)), 0)::TEXT AS total
          FROM predictions WHERE user_id = ${userId} AND result = 'won'
        `,
        this.prisma.$queryRaw<[{ total: string }]>`
          SELECT COALESCE(SUM(CAST(amount AS NUMERIC)), 0)::TEXT AS total
          FROM predictions WHERE user_id = ${userId} AND result = 'lost'
        `,
      ]);

    const winRate =
      totalPredictions > 0
        ? Math.round((correctPredictions / totalPredictions) * 1000) / 10
        : 0;

    return {
      callBalance: user.cachedCallBalance,
      tier: computeTier(user.cachedCallBalance),
      totalPredictions,
      correctPredictions,
      winRate,
      totalCallWon: wonSum[0]?.total || '0',
      totalCallLost: lostSum[0]?.total || '0',
    };
  }

  /** Public profile (limited fields) */
  async getPublicProfile(walletAddress: string) {
    const user = await this.prisma.user.findUnique({
      where: { walletAddress },
      select: {
        walletAddress: true,
        displayName: true,
        avatarUrl: true,
        cachedCallBalance: true,
        tier: true,
        createdAt: true,
      },
    });
    if (!user) throw new NotFoundException('User not found');
    return user;
  }

  /** Leaderboard: top users by cached_call_balance (numeric sort via raw SQL) */
  async getLeaderboard(page: number, limit: number) {
    const offset = (page - 1) * limit;

    // Use raw SQL to sort by numeric value (cachedCallBalance is stored as string)
    const users = await this.prisma.$queryRaw<any[]>`
      SELECT
        u.wallet_address AS "walletAddress",
        u.display_name AS "displayName",
        u.avatar_url AS "avatarUrl",
        u.cached_call_balance AS "cachedCallBalance",
        u.tier,
        COUNT(p.id) AS "totalPredictions",
        COUNT(CASE WHEN p.result = 'won' THEN 1 END) AS "correctPredictions"
      FROM users u
      LEFT JOIN predictions p ON p.user_id = u.id
      GROUP BY u.id
      ORDER BY CAST(u.cached_call_balance AS NUMERIC) DESC
      LIMIT ${limit} OFFSET ${offset}
    `;

    const [{ count: total }] = await this.prisma.$queryRaw<[{ count: bigint }]>`
      SELECT COUNT(*) as count FROM users
    `;

    const enriched = users.map((u: any) => ({
      walletAddress: u.walletAddress,
      displayName: u.displayName,
      avatarUrl: u.avatarUrl,
      cachedCallBalance: u.cachedCallBalance,
      tier: u.tier,
      winRate:
        Number(u.totalPredictions) > 0
          ? Math.round((Number(u.correctPredictions) / Number(u.totalPredictions)) * 1000) / 10
          : 0,
    }));

    return {
      data: enriched,
      meta: { page, limit, total: Number(total), totalPages: Math.ceil(Number(total) / limit) },
    };
  }
}
