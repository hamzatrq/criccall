import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class PredictionsService {
  constructor(private readonly prisma: PrismaService) {}

  /**
   * Paginated list of all predictions for a market (admin use).
   */
  async getMarketPredictions(marketId: number, page = 1, limit = 20) {
    const skip = (page - 1) * limit;

    const [predictions, total] = await Promise.all([
      this.prisma.prediction.findMany({
        where: { marketId },
        include: {
          user: {
            select: {
              id: true,
              walletAddress: true,
              displayName: true,
              avatarUrl: true,
            },
          },
        },
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit,
      }),
      this.prisma.prediction.count({ where: { marketId } }),
    ]);

    return {
      data: predictions,
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  /**
   * Aggregate stats for a market: total predictors, pool sizes, position counts.
   */
  async getMarketSummary(marketId: number) {
    const market = await this.prisma.market.findUnique({
      where: { onChainId: marketId },
      select: {
        yesPool: true,
        noPool: true,
        totalPredictors: true,
        state: true,
        yesWon: true,
      },
    });

    if (!market) {
      throw new NotFoundException(`Market ${marketId} not found`);
    }

    const [yesCount, noCount] = await Promise.all([
      this.prisma.prediction.count({
        where: { marketId, position: 'yes' },
      }),
      this.prisma.prediction.count({
        where: { marketId, position: 'no' },
      }),
    ]);

    return {
      marketId,
      totalPredictors: market.totalPredictors,
      yesPool: market.yesPool,
      noPool: market.noPool,
      yesPositions: yesCount,
      noPositions: noCount,
      state: market.state,
      yesWon: market.yesWon,
    };
  }

  /**
   * After resolution, returns all correct predictors ranked by their CALL
   * amount on the winning side (descending). Used by Rewards module for
   * proportional PKR distribution.
   */
  async getWinnerRanking(marketId: number) {
    const market = await this.prisma.market.findUnique({
      where: { onChainId: marketId },
      select: {
        state: true,
        yesWon: true,
        yesPool: true,
        noPool: true,
      },
    });

    if (!market) {
      throw new NotFoundException(`Market ${marketId} not found`);
    }

    if (market.state !== 'resolved' || market.yesWon === null) {
      return {
        marketId,
        resolved: false,
        winners: [],
        totalWinningPool: '0',
        winningPosition: null,
      };
    }

    const winningPosition = market.yesWon ? 'yes' : 'no';
    const totalWinningPool = market.yesWon ? market.yesPool : market.noPool;

    const winners = await this.prisma.prediction.findMany({
      where: {
        marketId,
        position: winningPosition,
        result: 'won',
      },
      include: {
        user: {
          select: {
            id: true,
            walletAddress: true,
            displayName: true,
          },
        },
      },
      orderBy: { amount: 'desc' },
    });

    return {
      marketId,
      resolved: true,
      winningPosition,
      totalWinningPool,
      winners: winners.map((w) => ({
        userId: w.user.id,
        walletAddress: w.user.walletAddress,
        displayName: w.user.displayName,
        amount: w.amount,
        winnings: w.winnings,
      })),
    };
  }

  /**
   * Record a prediction from an indexed PredictionPlaced blockchain event.
   */
  async recordPrediction(
    userId: string,
    marketId: number,
    position: string,
    amount: string,
    txHash: string,
  ) {
    return this.prisma.$transaction(async (tx) => {
      const prediction = await tx.prediction.create({
        data: {
          userId,
          marketId,
          position,
          amount,
          txHash,
          result: 'pending',
        },
      });

      const poolField = position === 'yes' ? 'yesPool' : 'noPool';
      const currentMarket = await tx.market.findUnique({
        where: { onChainId: marketId },
        select: { yesPool: true, noPool: true },
      });

      if (currentMarket) {
        const currentPool = BigInt(currentMarket[poolField]);
        const newPool = (currentPool + BigInt(amount)).toString();

        await tx.market.update({
          where: { onChainId: marketId },
          data: {
            [poolField]: newPool,
            totalPredictors: { increment: 1 },
          },
        });
      }

      return prediction;
    });
  }

  /**
   * After market resolution, mark all predictions as won or lost.
   */
  async markResults(marketId: number, yesWon: boolean) {
    const winningPosition = yesWon ? 'yes' : 'no';
    const losingPosition = yesWon ? 'no' : 'yes';

    await Promise.all([
      this.prisma.prediction.updateMany({
        where: { marketId, position: winningPosition },
        data: { result: 'won' },
      }),
      this.prisma.prediction.updateMany({
        where: { marketId, position: losingPosition },
        data: { result: 'lost' },
      }),
    ]);
  }

  /**
   * For canceled markets, set all predictions to refunded.
   */
  async markRefunded(marketId: number) {
    await this.prisma.prediction.updateMany({
      where: { marketId },
      data: { result: 'refunded' },
    });
  }
}
