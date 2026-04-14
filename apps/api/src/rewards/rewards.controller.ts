import { Controller, Get, Post, Param, UseGuards } from '@nestjs/common';
import { RewardsService } from './rewards.service';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { Roles } from '../common/decorators/roles.decorator';
import { CurrentUser } from '../common/decorators/current-user.decorator';

// ── User endpoints ────────────────────────────────────────────────────────

@Controller('rewards')
@UseGuards(JwtAuthGuard)
export class RewardsController {
  constructor(private readonly rewards: RewardsService) {}

  @Get('me')
  getMyRewards(@CurrentUser('id') userId: string) {
    return this.rewards.getMyRewards(userId);
  }

  @Get('me/unclaimed')
  getUnclaimedRewards(@CurrentUser('id') userId: string) {
    return this.rewards.getUnclaimedRewards(userId);
  }

  @Get(':campaignId/proof')
  getMerkleProof(
    @Param('campaignId') campaignId: string,
    @CurrentUser('id') userId: string,
  ) {
    return this.rewards.getMerkleProof(campaignId, userId);
  }
}

// ── Admin endpoints ───────────────────────────────────────────────────────

@Controller('admin/rewards')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('super_admin')
export class RewardsAdminController {
  constructor(private readonly rewards: RewardsService) {}

  @Post(':marketId/distribute')
  distributeRewards(@Param('marketId') marketId: string) {
    return this.rewards.distributeRewards(marketId);
  }

  @Get(':marketId/status')
  getDistributionStatus(@Param('marketId') marketId: string) {
    return this.rewards.getDistributionStatus(marketId);
  }
}
