import { Controller, Get, Param, UseGuards } from '@nestjs/common';
import { MarketsService } from './markets.service';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { Roles } from '../common/decorators/roles.decorator';
import { CurrentUser } from '../common/decorators/current-user.decorator';

@Controller('sponsor/campaigns')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('sponsor')
export class SponsorCampaignsController {
  constructor(private readonly marketsService: MarketsService) {}

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
}
