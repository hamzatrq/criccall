import {
  Controller,
  Get,
  Post,
  Patch,
  Param,
  Query,
  Body,
  UseGuards,
} from '@nestjs/common';
import { MarketsService } from './markets.service';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { Roles } from '../common/decorators/roles.decorator';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { CreateMarketDto } from './dto/create-market.dto';
import { SponsorMarketDto, UpdateSponsorDto } from './dto/sponsor-market.dto';

@Controller()
export class MarketsController {
  constructor(private readonly marketsService: MarketsService) {}

  // ─── Public endpoints ──────────────────────────────────────
  // IMPORTANT: static routes (/live, /resolved) BEFORE parameterised /:id

  @Get('markets')
  listMarkets(
    @Query('page') page?: string,
    @Query('limit') limit?: string,
    @Query('status') status?: string,
    @Query('tournament') tournament?: string,
    @Query('matchType') matchType?: string,
  ) {
    return this.marketsService.listMarkets({
      page: page ? parseInt(page, 10) : undefined,
      limit: limit ? parseInt(limit, 10) : undefined,
      status,
      tournament,
      matchType,
    });
  }

  @Get('markets/live')
  getLiveMarkets() {
    return this.marketsService.getLiveMarkets();
  }

  @Get('markets/resolved')
  getResolvedMarkets() {
    return this.marketsService.getResolvedMarkets();
  }

  @Get('markets/match/:matchId')
  getMarketsByMatch(@Param('matchId') matchId: string) {
    return this.marketsService.getMarketsByMatch(matchId);
  }

  @Get('markets/:id')
  getMarketById(@Param('id') id: string) {
    return this.marketsService.getMarketById(id);
  }

  @Get('markets/:id/positions')
  @UseGuards(JwtAuthGuard)
  getUserPositions(
    @Param('id') id: string,
    @CurrentUser('id') userId: string,
  ) {
    return this.marketsService.getUserPositions(id, userId);
  }

  @Get('markets/:id/sponsors')
  getMarketSponsors(@Param('id') id: string) {
    return this.marketsService.getMarketSponsors(id);
  }

  // ─── Sponsor endpoints ────────────────────────────────────

  @Post('markets/:id/sponsor')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('sponsor')
  sponsorMarket(
    @Param('id') id: string,
    @CurrentUser('id') sponsorId: string,
    @Body() dto: SponsorMarketDto,
  ) {
    return this.marketsService.sponsorMarket(id, sponsorId, dto);
  }

  @Patch('markets/:id/sponsor/:campaignId')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('sponsor')
  updateSponsorCampaign(
    @Param('id') id: string,
    @Param('campaignId') campaignId: string,
    @CurrentUser('id') sponsorId: string,
    @Body() dto: UpdateSponsorDto,
  ) {
    return this.marketsService.updateSponsorCampaign(id, campaignId, sponsorId, dto);
  }

  // ─── Admin endpoints ──────────────────────────────────────

  @Post('admin/markets')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('super_admin')
  createMarket(@Body() dto: CreateMarketDto) {
    return this.marketsService.createMarket(dto);
  }

  @Get('admin/matches/upcoming')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('super_admin')
  getUpcomingMatches() {
    return this.marketsService.getUpcomingMatches();
  }

  @Post('admin/matches/sync')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('super_admin')
  syncMatches() {
    // Placeholder for cricket API sync
    return { message: 'Match sync triggered (placeholder)' };
  }
}
