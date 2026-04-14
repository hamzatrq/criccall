import { Module } from '@nestjs/common';
import { OracleService } from './oracle.service';
import { OracleController } from './oracle.controller';
import { MatchPollerService } from './match-poller.service';

@Module({
  controllers: [OracleController],
  providers: [OracleService, MatchPollerService],
  exports: [OracleService],
})
export class OracleModule {}
