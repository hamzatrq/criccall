import { Controller, Get, Param, Query, UseGuards } from '@nestjs/common';
import { MarketsService } from './markets.service';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { Roles } from '../common/decorators/roles.decorator';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { PrismaService } from '../prisma/prisma.service';

@Controller('sponsor/campaigns')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('sponsor')
export class SponsorCampaignsController {
  constructor(
    private readonly marketsService: MarketsService,
    private readonly prisma: PrismaService,
  ) {}

  /**
   * GET /sponsor/campaigns
   * List all campaigns for the current sponsor user.
   */
  @Get()
  getMyCampaigns(@CurrentUser('id') userId: string) {
    return this.marketsService.getMyCampaigns(userId);
  }

  /**
   * GET /sponsor/campaigns/:id/stats
   * Campaign stats: redemptions, impressions, totals.
   */
  @Get(':id/stats')
  getCampaignStats(
    @Param('id') campaignId: string,
    @CurrentUser('id') userId: string,
  ) {
    return this.marketsService.getCampaignStats(campaignId, userId);
  }

  /**
   * GET /sponsor/campaigns/:id/winners
   * Winner list with PKR amounts for a specific campaign.
   */
  @Get(':id/winners')
  async getCampaignWinners(
    @Param('id') campaignId: string,
    @CurrentUser('id') userId: string,
    @Query('page') page: string = '1',
    @Query('limit') limit: string = '50',
  ) {
    // Verify campaign belongs to this sponsor
    const campaign = await this.prisma.marketCampaign.findFirst({
      where: { campaignId, sponsorId: userId },
    });
    if (!campaign) {
      return { data: [], meta: { page: 1, limit: 50, total: 0 } };
    }

    const pageNum = Math.max(1, parseInt(page, 10) || 1);
    const limitNum = Math.min(100, Math.max(1, parseInt(limit, 10) || 50));
    const skip = (pageNum - 1) * limitNum;

    const [winners, total] = await Promise.all([
      this.prisma.rewardWinner.findMany({
        where: {
          distribution: { campaignId },
        },
        include: {
          user: {
            select: {
              walletAddress: true,
              displayName: true,
              avatarUrl: true,
            },
          },
        },
        orderBy: { pkrAmount: 'desc' },
        skip,
        take: limitNum,
      }),
      this.prisma.rewardWinner.count({
        where: { distribution: { campaignId } },
      }),
    ]);

    return {
      data: winners.map((w) => ({
        walletAddress: w.walletAddress,
        displayName: w.user.displayName,
        avatarUrl: w.user.avatarUrl,
        pkrAmount: w.pkrAmount,
        callAmount: w.callAmount,
        claimed: w.claimed,
      })),
      meta: {
        page: pageNum,
        limit: limitNum,
        total,
        totalPages: Math.ceil(total / limitNum),
      },
    };
  }
}
