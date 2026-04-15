import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  ParseIntPipe,
  Query,
  UseGuards,
} from '@nestjs/common';
import { PredictionsService } from './predictions.service';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { Roles } from '../common/decorators/roles.decorator';
import { CurrentUser } from '../common/decorators/current-user.decorator';

/**
 * Public predictions endpoints (no auth required).
 */
@Controller('predictions')
export class PredictionsPublicController {
  constructor(private readonly predictionsService: PredictionsService) {}

  /**
   * GET /predictions/market/:marketId/summary
   * Aggregate stats: total predictors, pool sizes. Public data shown on market cards.
   */
  @Get('market/:marketId/summary')
  async getMarketSummary(
    @Param('marketId', ParseIntPipe) marketId: number,
  ) {
    return this.predictionsService.getMarketSummary(marketId);
  }
}

/**
 * Authenticated user predictions endpoints.
 */
@Controller('predictions')
@UseGuards(JwtAuthGuard)
export class PredictionsUserController {
  constructor(private readonly predictionsService: PredictionsService) {}

  /**
   * POST /predictions/record
   * Record a prediction after successful on-chain transaction.
   */
  @Post('record')
  async recordPrediction(
    @CurrentUser() user: any,
    @Body() body: { marketId: number; position: string; amount: string; txHash: string },
  ) {
    return this.predictionsService.recordPrediction(
      user.sub,
      body.marketId,
      body.position,
      body.amount,
      body.txHash,
    );
  }
}

/**
 * Admin-only predictions endpoints.
 */
@Controller('predictions')
@UseGuards(JwtAuthGuard, RolesGuard)
export class PredictionsController {
  constructor(private readonly predictionsService: PredictionsService) {}

  /**
   * GET /predictions/market/:marketId
   * All predictions for a market — admin only.
   */
  @Get('market/:marketId')
  @Roles('super_admin')
  async getMarketPredictions(
    @Param('marketId', ParseIntPipe) marketId: number,
    @Query('page') page?: string,
    @Query('limit') limit?: string,
  ) {
    return this.predictionsService.getMarketPredictions(
      marketId,
      page ? parseInt(page, 10) : 1,
      limit ? parseInt(limit, 10) : 20,
    );
  }

  /**
   * GET /predictions/market/:marketId/ranking
   * Winners ranked by conviction (CALL amount) after resolution.
   */
  @Get('market/:marketId/ranking')
  @Roles('super_admin')
  async getWinnerRanking(
    @Param('marketId', ParseIntPipe) marketId: number,
  ) {
    return this.predictionsService.getWinnerRanking(marketId);
  }
}
