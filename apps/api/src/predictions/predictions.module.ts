import { Module } from '@nestjs/common';
import {
  PredictionsController,
  PredictionsPublicController,
  PredictionsUserController,
} from './predictions.controller';
import { PredictionsService } from './predictions.service';
import { PrismaModule } from '../prisma/prisma.module';

@Module({
  imports: [PrismaModule],
  controllers: [PredictionsPublicController, PredictionsUserController, PredictionsController],
  providers: [PredictionsService],
  exports: [PredictionsService],
})
export class PredictionsModule {}
