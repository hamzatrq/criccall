import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { ScheduleModule } from '@nestjs/schedule';
import { PrismaModule } from './prisma/prisma.module';
import { AuthModule } from './auth/auth.module';
import { StorageModule } from './storage/storage.module';
import { UsersModule } from './users/users.module';
import { WireFluidModule } from './wirefluid/wirefluid.module';
import { AdminModule } from './admin/admin.module';
import { PredictionsModule } from './predictions/predictions.module';
import { MarketsModule } from './markets/markets.module';
import { OracleModule } from './oracle/oracle.module';

@Module({
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
  ],
})
export class AppModule {}
