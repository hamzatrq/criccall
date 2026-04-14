import {
  Body,
  Controller,
  Post,
  UseGuards,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { Roles } from '../common/decorators/roles.decorator';
import { OracleService } from './oracle.service';
import { ResolveMatchDto } from './dto/resolve-match.dto';

@Controller('admin/oracle')
@UseGuards(JwtAuthGuard, RolesGuard)
export class OracleController {
  constructor(private readonly oracleService: OracleService) {}

  @Post('resolve')
  @Roles('super_admin')
  @HttpCode(HttpStatus.OK)
  async resolveMatch(@Body() dto: ResolveMatchDto) {
    const resolution = await this.oracleService.resolveMatch(
      dto.matchId,
      dto.outcome,
      'admin',
    );

    return {
      txHash: resolution.revealTxHash,
      matchId: resolution.matchId,
      outcome: resolution.outcome,
      status: 'resolved',
    };
  }
}
