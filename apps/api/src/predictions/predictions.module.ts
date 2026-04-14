import { Module } from '@nestjs/common';
import {
  PredictionsController,
  PredictionsPublicController,
} from './predictions.controller';
import { PredictionsService } from './predictions.service';
import { PrismaModule } from '../prisma/prisma.module';

@Module({
  imports: [PrismaModule],
  controllers: [PredictionsPublicController, PredictionsController],
  providers: [PredictionsService],
  exports: [PredictionsService],
})
export class PredictionsModule {}
