import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { ScheduleModule } from '@nestjs/schedule';
import { HealthController } from './health.controller';
import { PrismaModule } from './prisma/prisma.module';
import { AuthModule } from './auth/auth.module';
import { StorageModule } from './storage/storage.module';
import { UsersModule } from './users/users.module';
import { WireFluidModule } from './wirefluid/wirefluid.module';
import { AdminModule } from './admin/admin.module';
import { PredictionsModule } from './predictions/predictions.module';
import { MarketsModule } from './markets/markets.module';
import { OracleModule } from './oracle/oracle.module';
import { RewardsModule } from './rewards/rewards.module';
import { DealsModule } from './deals/deals.module';
import { NotificationsModule } from './notifications/notifications.module';

@Module({
  controllers: [HealthController],
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    ScheduleModule.forRoot(),
    PrismaModule,
    StorageModule,
    AuthModule,
    UsersModule,
    WireFluidModule,
    AdminModule,
    PredictionsModule,
    MarketsModule,
    OracleModule,
    RewardsModule,
    DealsModule,
    NotificationsModule,
  ],
})
export class AppModule {}
