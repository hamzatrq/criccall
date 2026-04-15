import {
  Injectable,
  NotFoundException,
  ForbiddenException,
  BadRequestException,
  ConflictException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateDealDto } from './dto/create-deal.dto';
import { UpdateDealDto } from './dto/update-deal.dto';

@Injectable()
export class DealsService {
  constructor(private readonly prisma: PrismaService) {}

  // ─── User Endpoints ───────────────────────────────────────

  async browseDeals(
    page: number,
    limit: number,
    category?: string,
    unlocked?: boolean,
    userId?: string,
  ) {
    const now = new Date();
    const skip = (page - 1) * limit;

    const where: any = {
      active: true,
      startsAt: { lte: now },
      expiresAt: { gt: now },
    };

    if (category) {
      where.brand = {
        category: { equals: category, mode: 'insensitive' },
      };
    }

    // Get user's CALL balance if filtering by unlock status
    let userBalance = 0;
    if (userId) {
      const user = await this.prisma.user.findUnique({
        where: { id: userId },
        select: { cachedCallBalance: true },
      });
      userBalance = Number(user?.cachedCallBalance || '0');
    }

    if (unlocked === true) {
      where.minCall = { lte: userBalance };
    } else if (unlocked === false) {
      where.minCall = { gt: userBalance };
    }

    const [deals, total] = await Promise.all([
      this.prisma.deal.findMany({
        where,
        include: {
          brand: {
            select: {
              id: true,
              brandName: true,
              brandLogo: true,
              category: true,
              verified: true,
            },
          },
        },
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit,
      }),
      this.prisma.deal.count({ where }),
    ]);

    // Add unlock status for each deal
    const enriched = deals.map((deal) => ({
      ...deal,
      unlocked: userBalance >= deal.minCall,
      callNeeded: Math.max(0, deal.minCall - userBalance),
    }));

    return {
      data: enriched,
      meta: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  async getDeal(dealId: string, userId?: string) {
    const deal = await this.prisma.deal.findUnique({
      where: { id: dealId },
      include: {
        brand: {
          select: {
            id: true,
            brandName: true,
            brandLogo: true,
            brandBanner: true,
            brandUrl: true,
            category: true,
            verified: true,
          },
        },
      },
    });

    if (!deal) {
      throw new NotFoundException('Deal not found');
    }

    let unlocked = false;
    let callNeeded = deal.minCall;
    let alreadyRedeemed = false;

    if (userId) {
      const user = await this.prisma.user.findUnique({
        where: { id: userId },
        select: { cachedCallBalance: true },
      });
      const balance = Number(user?.cachedCallBalance || '0');
      unlocked = balance >= deal.minCall;
      callNeeded = Math.max(0, deal.minCall - balance);

      const redemption = await this.prisma.dealRedemption.findUnique({
        where: { dealId_userId: { dealId, userId } },
      });
      alreadyRedeemed = !!redemption;
    }

    return {
      ...deal,
      unlocked,
      callNeeded,
      alreadyRedeemed,
    };
  }

  async redeemDeal(dealId: string, userId: string) {
    const deal = await this.prisma.deal.findUnique({
      where: { id: dealId },
    });

    if (!deal) {
      throw new NotFoundException('Deal not found');
    }

    // 1. Check deal is active and within date range
    const now = new Date();
    if (!deal.active) {
      throw new BadRequestException('Deal is not active');
    }
    if (now < deal.startsAt) {
      throw new BadRequestException('Deal has not started yet');
    }
    if (now > deal.expiresAt) {
      throw new BadRequestException('Deal has expired');
    }

    // 2. Check max redemptions (pre-check, atomic check in transaction below)
    if (deal.maxRedemptions && deal.totalRedeemed >= deal.maxRedemptions) {
      throw new BadRequestException('Deal has reached maximum redemptions');
    }

    // 3. Get user's CALL balance (stored as human-readable integer string, not wei)
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: { cachedCallBalance: true },
    });
    const callBalance = Number(user?.cachedCallBalance || '0');

    // 4. Check min CALL threshold
    if (callBalance < deal.minCall) {
      throw new ForbiddenException(
        `Insufficient CALL balance. Need ${deal.minCall}, have ${callBalance}`,
      );
    }

    // 5. Check user hasn't already redeemed (unique constraint will also catch this)
    const existing = await this.prisma.dealRedemption.findUnique({
      where: { dealId_userId: { dealId, userId } },
    });
    if (existing) {
      throw new ConflictException('You have already redeemed this deal');
    }

    // 6. Insert redemption and atomically increment totalRedeemed (race-safe)
    const [redemption] = await this.prisma.$transaction([
      this.prisma.dealRedemption.create({
        data: {
          dealId,
          userId,
          redeemedAt: now,
          callBalance,
        },
      }),
      // Conditional update: only increment if under max (prevents race condition)
      this.prisma.$executeRaw`
        UPDATE deals SET total_redeemed = total_redeemed + 1
        WHERE id = ${dealId}
        AND (max_redemptions IS NULL OR total_redeemed < max_redemptions)
      `,
    ]);

    // 7. Return coupon code / deal URL
    return {
      redemptionId: redemption.id,
      dealId: deal.id,
      title: deal.title,
      dealType: deal.dealType,
      couponCode: deal.couponCode,
      dealUrl: deal.dealUrl,
      expiresAt: deal.expiresAt,
      message: 'Deal redeemed successfully!',
    };
  }

  async getMyRedeemedDeals(userId: string, page: number, limit: number) {
    const skip = (page - 1) * limit;

    const [redemptions, total] = await Promise.all([
      this.prisma.dealRedemption.findMany({
        where: { userId },
        include: {
          deal: {
            include: {
              brand: {
                select: {
                  brandName: true,
                  brandLogo: true,
                  category: true,
                },
              },
            },
          },
        },
        orderBy: { redeemedAt: 'desc' },
        skip,
        take: limit,
      }),
      this.prisma.dealRedemption.count({ where: { userId } }),
    ]);

    return {
      data: redemptions,
      meta: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  // ─── Sponsor Endpoints ────────────────────────────────────

  async getSponsorDeals(userId: string, page: number, limit: number) {
    const brand = await this.prisma.brandProfile.findUnique({
      where: { userId },
    });
    if (!brand) {
      throw new NotFoundException('Brand profile not found. Create one first.');
    }

    const skip = (page - 1) * limit;

    const [deals, total] = await Promise.all([
      this.prisma.deal.findMany({
        where: { brandId: brand.id },
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit,
      }),
      this.prisma.deal.count({ where: { brandId: brand.id } }),
    ]);

    return {
      data: deals,
      meta: { page, limit, total, totalPages: Math.ceil(total / limit) },
    };
  }

  async createDeal(userId: string, dto: CreateDealDto) {
    const brand = await this.prisma.brandProfile.findUnique({
      where: { userId },
    });
    if (!brand) {
      throw new NotFoundException('Brand profile not found. Create one first.');
    }

    return this.prisma.deal.create({
      data: {
        brandId: brand.id,
        title: dto.title,
        description: dto.description,
        minCall: dto.minCall,
        dealType: dto.dealType,
        couponCode: dto.couponCode,
        dealUrl: dto.dealUrl,
        maxRedemptions: dto.maxRedemptions,
        startsAt: new Date(dto.startsAt),
        expiresAt: new Date(dto.expiresAt),
      },
    });
  }

  async updateDeal(userId: string, dealId: string, dto: UpdateDealDto) {
    const deal = await this.getOwnedDeal(userId, dealId);

    const data: any = {};
    if (dto.title !== undefined) data.title = dto.title;
    if (dto.description !== undefined) data.description = dto.description;
    if (dto.minCall !== undefined) data.minCall = dto.minCall;
    if (dto.dealType !== undefined) data.dealType = dto.dealType;
    if (dto.couponCode !== undefined) data.couponCode = dto.couponCode;
    if (dto.dealUrl !== undefined) data.dealUrl = dto.dealUrl;
    if (dto.maxRedemptions !== undefined)
      data.maxRedemptions = dto.maxRedemptions;
    if (dto.startsAt !== undefined) data.startsAt = new Date(dto.startsAt);
    if (dto.expiresAt !== undefined) data.expiresAt = new Date(dto.expiresAt);
    if (dto.active !== undefined) data.active = dto.active;

    return this.prisma.deal.update({
      where: { id: deal.id },
      data,
    });
  }

  async deactivateDeal(userId: string, dealId: string) {
    const deal = await this.getOwnedDeal(userId, dealId);

    return this.prisma.deal.update({
      where: { id: deal.id },
      data: { active: false },
    });
  }

  async getDealAnalytics(userId: string, dealId: string) {
    const deal = await this.getOwnedDeal(userId, dealId);

    // Redemptions grouped by day
    const redemptionsByDay = await this.prisma.dealRedemption.groupBy({
      by: ['redeemedAt'],
      where: { dealId: deal.id },
      _count: { id: true },
    });

    // Aggregate by date (Prisma groupBy on DateTime gives exact timestamps,
    // so we use raw SQL for proper date grouping)
    const dailyRedemptions: { date: string; count: number }[] =
      await this.prisma.$queryRaw`
        SELECT
          DATE("redeemed_at") as date,
          COUNT(*)::int as count
        FROM deal_redemptions
        WHERE deal_id = ${deal.id}
        GROUP BY DATE("redeemed_at")
        ORDER BY date ASC
      `;

    // Average CALL balance of redeemers
    const avgResult = await this.prisma.dealRedemption.aggregate({
      where: { dealId: deal.id },
      _avg: { callBalance: true },
    });

    // Eligible users: count users where cachedCallBalance >= deal.minCall
    const eligibleResult: { count: number }[] = await this.prisma.$queryRaw`
      SELECT COUNT(*)::int as count
      FROM users
      WHERE CAST(cached_call_balance AS INTEGER) >= ${deal.minCall}
    `;

    return {
      dealId: deal.id,
      title: deal.title,
      totalRedemptions: deal.totalRedeemed,
      maxRedemptions: deal.maxRedemptions,
      redemptionsByDay: dailyRedemptions,
      avgCallBalance: Math.round(avgResult._avg.callBalance || 0),
      eligibleUsers: eligibleResult[0]?.count || 0,
    };
  }

  async getDealRedemptions(
    userId: string,
    dealId: string,
    page: number,
    limit: number,
  ) {
    const deal = await this.getOwnedDeal(userId, dealId);
    const skip = (page - 1) * limit;

    const [redemptions, total] = await Promise.all([
      this.prisma.dealRedemption.findMany({
        where: { dealId: deal.id },
        include: {
          user: {
            select: {
              id: true,
              walletAddress: true,
              displayName: true,
              tier: true,
            },
          },
        },
        orderBy: { redeemedAt: 'desc' },
        skip,
        take: limit,
      }),
      this.prisma.dealRedemption.count({ where: { dealId: deal.id } }),
    ]);

    return {
      data: redemptions,
      meta: { page, limit, total, totalPages: Math.ceil(total / limit) },
    };
  }

  // ─── Admin Endpoints ──────────────────────────────────────

  async adminListDeals(page: number, limit: number) {
    const skip = (page - 1) * limit;

    const [deals, total] = await Promise.all([
      this.prisma.deal.findMany({
        include: {
          brand: {
            select: {
              id: true,
              brandName: true,
              category: true,
              verified: true,
            },
          },
        },
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit,
      }),
      this.prisma.deal.count(),
    ]);

    return {
      data: deals,
      meta: { page, limit, total, totalPages: Math.ceil(total / limit) },
    };
  }

  async adminVerifyDeal(dealId: string) {
    const deal = await this.prisma.deal.findUnique({
      where: { id: dealId },
      include: { brand: true },
    });
    if (!deal) {
      throw new NotFoundException('Deal not found');
    }

    // Verify the brand profile associated with the deal
    await this.prisma.brandProfile.update({
      where: { id: deal.brandId },
      data: { verified: true },
    });

    return { message: 'Deal brand verified successfully', dealId };
  }

  async adminRemoveDeal(dealId: string) {
    const deal = await this.prisma.deal.findUnique({
      where: { id: dealId },
    });
    if (!deal) {
      throw new NotFoundException('Deal not found');
    }

    return this.prisma.deal.update({
      where: { id: dealId },
      data: { active: false },
    });
  }

  // ─── Helpers ──────────────────────────────────────────────

  private async getOwnedDeal(userId: string, dealId: string) {
    const brand = await this.prisma.brandProfile.findUnique({
      where: { userId },
    });
    if (!brand) {
      throw new NotFoundException('Brand profile not found');
    }

    const deal = await this.prisma.deal.findUnique({
      where: { id: dealId },
    });
    if (!deal) {
      throw new NotFoundException('Deal not found');
    }
    if (deal.brandId !== brand.id) {
      throw new ForbiddenException('You do not own this deal');
    }

    return deal;
  }
}
