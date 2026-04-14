import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Interval } from '@nestjs/schedule';
import { PrismaService } from '../prisma/prisma.service';
import { OracleService } from './oracle.service';

@Injectable()
export class MatchPollerService {
  private readonly logger = new Logger(MatchPollerService.name);
  private readonly pollIntervalMs: number;

  constructor(
    private readonly prisma: PrismaService,
    private readonly oracleService: OracleService,
    private readonly config: ConfigService,
  ) {
    this.pollIntervalMs =
      this.config.get<number>('POLL_INTERVAL_MS') ?? 30_000;
  }

  /**
   * Polls CricAPI for completed matches at a fixed interval.
   *
   * For hackathon: placeholder that logs polling activity.
   * In production this would:
   *   1. GET /matches?status=live from CricAPI
   *   2. Check each match against open/locked markets in DB
   *   3. If a match completed, map the result to an outcome (1-4)
   *   4. Call oracleService.resolveMatch() to trigger commit-reveal
   */
  @Interval(30_000)
  async pollMatchResults() {
    this.logger.debug('Polling CricAPI for match results...');

    try {
      // Find matches that are live and have open/locked markets
      const liveMatches = await this.prisma.match.findMany({
        where: { status: 'live' },
        include: {
          markets: {
            where: { state: { in: ['open', 'locked'] } },
          },
        },
      });

      if (liveMatches.length === 0) {
        this.logger.debug('No live matches with active markets found.');
        return;
      }

      this.logger.log(
        `Found ${liveMatches.length} live match(es) with active markets.`,
      );

      // TODO: Integrate CricAPI to fetch real match results
      // For each completed match:
      //   const outcome = mapCricApiResultToOutcome(apiResult);
      //   await this.oracleService.resolveMatch(match.matchId, outcome, 'api');

      for (const match of liveMatches) {
        this.logger.debug(
          `Checking match ${match.matchId} — markets: ${match.markets.length}`,
        );
        // Placeholder: actual API call would go here
        // const result = await this.fetchMatchResult(match.matchId);
        // if (result.status === 'completed') {
        //   await this.oracleService.resolveMatch(match.matchId, result.outcome, 'api');
        // }
      }
    } catch (error) {
      this.logger.error(
        `Match polling failed: ${error.message}`,
        error.stack,
      );
    }
  }
}
