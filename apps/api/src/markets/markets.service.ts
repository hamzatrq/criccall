import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateMarketDto } from './dto/create-market.dto';
import { SponsorMarketDto, UpdateSponsorDto } from './dto/sponsor-market.dto';
import { randomUUID } from 'crypto';

@Injectable()
export class MarketsService {
  constructor(private readonly prisma: PrismaService) {}

  // ─── Public queries ───────────────────────────────────────

  async listMarkets(query: {
    page?: number;
    limit?: number;
    status?: string;
    tournament?: string;
    matchType?: string;
  }) {
    const page = Math.max(query.page ?? 1, 1);
    const limit = Math.min(Math.max(query.limit ?? 20, 1), 100);
    const skip = (page - 1) * limit;

    const where: any = {};
    if (query.status) where.state = query.status;
    if (query.tournament) where.match = { ...where.match, tournament: query.tournament };
    if (query.matchType) where.match = { ...where.match, matchType: query.matchType };

    const [markets, total] = await Promise.all([
      this.prisma.market.findMany({
        where,
        skip,
        take: limit,
        orderBy: { lockTime: 'asc' },
        include: {
          match: { include: { teamA: true, teamB: true } },
          campaigns: {
            orderBy: { prizeAmount: 'desc' },
            select: {
              id: true,
              campaignId: true,
              sponsorName: true,
              sponsorLogo: true,
              sponsorBanner: true,
              sponsorUrl: true,
              prizeAmount: true,
              tier: true,
            },
          },
        },
      }),
      this.prisma.market.count({ where }),
    ]);

    return { data: markets, meta: { page, limit, total, pages: Math.ceil(total / limit) } };
  }

  async getMarketById(id: string) {
    const market = await this.prisma.market.findUnique({
      where: { id },
      include: {
        match: { include: { teamA: true, teamB: true } },
        campaigns: {
          orderBy: { prizeAmount: 'desc' },
        },
      },
    });
    if (!market) throw new NotFoundException('Market not found');
    return market;
  }

  async getUserPositions(marketId: string, userId: string) {
    const market = await this.prisma.market.findUnique({ where: { id: marketId } });
    if (!market) throw new NotFoundException('Market not found');

    const predictions = await this.prisma.prediction.findMany({
      where: { marketId: market.onChainId, userId },
      orderBy: { createdAt: 'desc' },
    });

    return predictions;
  }

  async getMarketSponsors(marketId: string) {
    const market = await this.prisma.market.findUnique({ where: { id: marketId } });
    if (!market) throw new NotFoundException('Market not found');

    return this.prisma.marketCampaign.findMany({
      where: { marketId },
      orderBy: { prizeAmount: 'desc' },
    });
  }

  async getLiveMarkets() {
    return this.prisma.market.findMany({
      where: { state: { in: ['open', 'locked'] } },
      orderBy: { lockTime: 'asc' },
      include: {
        match: { include: { teamA: true, teamB: true } },
        campaigns: {
          orderBy: { prizeAmount: 'desc' },
          select: {
            id: true,
            campaignId: true,
            sponsorName: true,
            sponsorLogo: true,
            sponsorBanner: true,
            prizeAmount: true,
            tier: true,
          },
        },
      },
    });
  }

  async getResolvedMarkets() {
    return this.prisma.market.findMany({
      where: { state: 'resolved' },
      orderBy: { updatedAt: 'desc' },
      include: {
        match: { include: { teamA: true, teamB: true } },
        campaigns: {
          orderBy: { prizeAmount: 'desc' },
          select: {
            id: true,
            campaignId: true,
            sponsorName: true,
            sponsorLogo: true,
            prizeAmount: true,
            tier: true,
          },
        },
      },
    });
  }

  async getMarketsByMatch(matchId: string) {
    return this.prisma.market.findMany({
      where: { matchId },
      orderBy: { lockTime: 'asc' },
      include: {
        match: { include: { teamA: true, teamB: true } },
        campaigns: {
          orderBy: { prizeAmount: 'desc' },
          select: {
            id: true,
            campaignId: true,
            sponsorName: true,
            sponsorLogo: true,
            prizeAmount: true,
            tier: true,
          },
        },
      },
    });
  }

  // ─── Sponsor actions ─────────────────────────────────────

  async sponsorMarket(
    marketId: string,
    sponsorId: string,
    dto: SponsorMarketDto,
  ) {
    const market = await this.prisma.market.findUnique({ where: { id: marketId } });
    if (!market) throw new NotFoundException('Market not found');
    if (market.state !== 'open' && market.state !== 'locked') {
      throw new BadRequestException('Market is not accepting sponsors');
    }

    const campaignId = randomUUID();

    // Create the campaign
    const campaign = await this.prisma.marketCampaign.create({
      data: {
        marketId,
        campaignId,
        sponsorId,
        sponsorName: dto.sponsorName,
        sponsorLogo: dto.sponsorLogo,
        sponsorBanner: dto.sponsorBanner,
        sponsorUrl: dto.sponsorUrl,
        prizeAmount: dto.prizeAmount,
        tier: 'sponsor', // will be recomputed below
      },
    });

    // Recompute tiers and total prize for this market
    await this.recomputeTiersAndPrize(marketId);

    return this.prisma.marketCampaign.findUnique({ where: { id: campaign.id } });
  }

  async updateSponsorCampaign(
    marketId: string,
    campaignId: string,
    sponsorId: string,
    dto: UpdateSponsorDto,
  ) {
    const campaign = await this.prisma.marketCampaign.findFirst({
      where: { campaignId, marketId, sponsorId },
    });
    if (!campaign) throw new NotFoundException('Campaign not found');

    return this.prisma.marketCampaign.update({
      where: { id: campaign.id },
      data: {
        ...(dto.sponsorLogo !== undefined && { sponsorLogo: dto.sponsorLogo }),
        ...(dto.sponsorBanner !== undefined && { sponsorBanner: dto.sponsorBanner }),
        ...(dto.sponsorUrl !== undefined && { sponsorUrl: dto.sponsorUrl }),
      },
    });
  }

  // ─── Sponsor campaign queries ─────────────────────────────

  async getMyCampaigns(userId: string) {
    return this.prisma.marketCampaign.findMany({
      where: { sponsorId: userId },
      orderBy: { createdAt: 'desc' },
      include: {
        market: {
          include: {
            match: { include: { teamA: true, teamB: true } },
          },
        },
      },
    });
  }

  async getCampaignStats(campaignId: string, userId: string) {
    const campaign = await this.prisma.marketCampaign.findFirst({
      where: { campaignId, sponsorId: userId },
      include: {
        market: {
          include: {
            match: { include: { teamA: true, teamB: true } },
          },
        },
      },
    });
    if (!campaign) throw new NotFoundException('Campaign not found');

    const distribution = await this.prisma.rewardDistribution.findFirst({
      where: { campaignId },
      include: {
        winners: true,
      },
    });

    const totalAllocated = distribution?.totalAllocated ?? '0';
    const winnerCount = distribution?.winnerCount ?? 0;
    const totalRedeemed = distribution
      ? distribution.winners
          .filter((w) => w.claimed)
          .reduce((sum, w) => sum + BigInt(w.pkrAmount), BigInt(0))
          .toString()
      : '0';
    const redemptions = distribution
      ? distribution.winners.filter((w) => w.claimed).length
      : 0;

    return {
      campaignId,
      sponsorName: campaign.sponsorName,
      tier: campaign.tier,
      prizeAmount: campaign.prizeAmount,
      status: campaign.status,
      market: campaign.market,
      totalAllocated,
      totalRedeemed,
      winnerCount,
      redemptions,
    };
  }

  // ─── Admin actions ────────────────────────────────────────

  async createMarket(dto: CreateMarketDto) {
    // Verify the match exists
    const match = await this.prisma.match.findUnique({
      where: { matchId: dto.matchId },
    });
    if (!match) throw new NotFoundException('Match not found');

    // Generate a temporary on-chain ID if not provided (will be updated after tx)
    const onChainId = dto.onChainId ?? Math.floor(Date.now() / 1000);

    return this.prisma.market.create({
      data: {
        matchId: dto.matchId,
        question: dto.question,
        lockTime: new Date(dto.lockTime),
        yesOutcome: dto.yesOutcome,
        onChainId,
      },
      include: {
        match: { include: { teamA: true, teamB: true } },
      },
    });
  }

  async getUpcomingMatches() {
    return this.prisma.match.findMany({
      where: { status: 'upcoming' },
      orderBy: { startTime: 'asc' },
      include: { teamA: true, teamB: true },
    });
  }

  // ─── Internal helpers ─────────────────────────────────────

  /**
   * Recompute sponsor tiers and total_prize for a market.
   * - Highest depositor = title
   * - Rs.50,000+ = gold
   * - Rest = sponsor
   */
  private async recomputeTiersAndPrize(marketId: string) {
    const campaigns = await this.prisma.marketCampaign.findMany({
      where: { marketId },
      orderBy: { prizeAmount: 'desc' },
    });

    if (campaigns.length === 0) return;

    // Find the highest prize amount
    let maxPrize = BigInt(0);
    for (const c of campaigns) {
      const amt = BigInt(c.prizeAmount);
      if (amt > maxPrize) maxPrize = amt;
    }

    const GOLD_THRESHOLD = BigInt(50000);
    let totalPrize = BigInt(0);

    const updates = campaigns.map((c) => {
      const amt = BigInt(c.prizeAmount);
      totalPrize += amt;

      let tier: string;
      if (amt === maxPrize) {
        tier = 'title';
      } else if (amt >= GOLD_THRESHOLD) {
        tier = 'gold';
      } else {
        tier = 'sponsor';
      }

      return this.prisma.marketCampaign.update({
        where: { id: c.id },
        data: { tier },
      });
    });

    await Promise.all([
      ...updates,
      this.prisma.market.update({
        where: { id: marketId },
        data: { totalPrize: totalPrize.toString() },
      }),
    ]);
  }
}
