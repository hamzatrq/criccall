import { Module } from '@nestjs/common';
import { RewardsController, RewardsAdminController } from './rewards.controller';
import { RewardsService } from './rewards.service';
import { PrismaModule } from '../prisma/prisma.module';
import { PredictionsModule } from '../predictions/predictions.module';

@Module({
  imports: [PrismaModule, PredictionsModule],
  controllers: [RewardsController, RewardsAdminController],
  providers: [RewardsService],
  exports: [RewardsService],
})
export class RewardsModule {}
