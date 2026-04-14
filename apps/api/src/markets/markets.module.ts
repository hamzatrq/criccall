import { Module } from '@nestjs/common';
import { MarketsController } from './markets.controller';
import { SponsorCampaignsController } from './sponsor-campaigns.controller';
import { MarketsService } from './markets.service';
import { PrismaModule } from '../prisma/prisma.module';

@Module({
  imports: [PrismaModule],
  controllers: [MarketsController, SponsorCampaignsController],
  providers: [MarketsService],
  exports: [MarketsService],
})
export class MarketsModule {}
