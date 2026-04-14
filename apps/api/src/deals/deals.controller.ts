import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Param,
  Body,
  Query,
  UseGuards,
  ParseIntPipe,
  DefaultValuePipe,
} from '@nestjs/common';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { Roles } from '../common/decorators/roles.decorator';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { DealsService } from './deals.service';
import { CreateDealDto } from './dto/create-deal.dto';
import { UpdateDealDto } from './dto/update-deal.dto';

// ─── User Endpoints ─────────────────────────────────────────

@Controller('deals')
export class DealsController {
  constructor(private readonly dealsService: DealsService) {}

  @Get()
  browseDeals(
    @Query('page', new DefaultValuePipe(1), ParseIntPipe) page: number,
    @Query('limit', new DefaultValuePipe(20), ParseIntPipe) limit: number,
    @Query('category') category?: string,
    @Query('unlocked') unlocked?: string,
  ) {
    const unlockedBool =
      unlocked === 'true' ? true : unlocked === 'false' ? false : undefined;
    return this.dealsService.browseDeals(
      page,
      limit,
      category,
      unlockedBool,
      undefined,
    );
  }

  @Get(':id')
  getDeal(
    @Param('id') id: string,
  ) {
    return this.dealsService.getDeal(id, undefined);
  }

  @Post(':id/redeem')
  @UseGuards(JwtAuthGuard)
  redeemDeal(
    @CurrentUser() user: { sub: string; wallet: string; role: string },
    @Param('id') id: string,
  ) {
    return this.dealsService.redeemDeal(id, user.sub);
  }
}

// ─── My Redeemed Deals (users/me/deals) ─────────────────────

@Controller('users')
export class UserDealsController {
  constructor(private readonly dealsService: DealsService) {}

  @Get('me/deals')
  @UseGuards(JwtAuthGuard)
  getMyDeals(
    @CurrentUser() user: { sub: string; wallet: string; role: string },
    @Query('page', new DefaultValuePipe(1), ParseIntPipe) page: number,
    @Query('limit', new DefaultValuePipe(20), ParseIntPipe) limit: number,
  ) {
    return this.dealsService.getMyRedeemedDeals(user.sub, page, limit);
  }
}

// ─── Sponsor Endpoints ──────────────────────────────────────

@Controller('sponsor/deals')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('sponsor')
export class SponsorDealsController {
  constructor(private readonly dealsService: DealsService) {}

  @Get()
  listMyDeals(
    @CurrentUser() user: { sub: string; wallet: string; role: string },
    @Query('page', new DefaultValuePipe(1), ParseIntPipe) page: number,
    @Query('limit', new DefaultValuePipe(20), ParseIntPipe) limit: number,
  ) {
    return this.dealsService.getSponsorDeals(user.sub, page, limit);
  }

  @Post()
  createDeal(
    @CurrentUser() user: { sub: string; wallet: string; role: string },
    @Body() dto: CreateDealDto,
  ) {
    return this.dealsService.createDeal(user.sub, dto);
  }

  @Patch(':id')
  updateDeal(
    @CurrentUser() user: { sub: string; wallet: string; role: string },
    @Param('id') id: string,
    @Body() dto: UpdateDealDto,
  ) {
    return this.dealsService.updateDeal(user.sub, id, dto);
  }

  @Delete(':id')
  deactivateDeal(
    @CurrentUser() user: { sub: string; wallet: string; role: string },
    @Param('id') id: string,
  ) {
    return this.dealsService.deactivateDeal(user.sub, id);
  }

  @Get(':id/analytics')
  getDealAnalytics(
    @CurrentUser() user: { sub: string; wallet: string; role: string },
    @Param('id') id: string,
  ) {
    return this.dealsService.getDealAnalytics(user.sub, id);
  }

  @Get(':id/redemptions')
  getDealRedemptions(
    @CurrentUser() user: { sub: string; wallet: string; role: string },
    @Param('id') id: string,
    @Query('page', new DefaultValuePipe(1), ParseIntPipe) page: number,
    @Query('limit', new DefaultValuePipe(20), ParseIntPipe) limit: number,
  ) {
    return this.dealsService.getDealRedemptions(user.sub, id, page, limit);
  }
}

// ─── Admin Endpoints ────────────────────────────────────────

@Controller('admin/deals')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('super_admin')
export class AdminDealsController {
  constructor(private readonly dealsService: DealsService) {}

  @Get()
  listAllDeals(
    @Query('page', new DefaultValuePipe(1), ParseIntPipe) page: number,
    @Query('limit', new DefaultValuePipe(20), ParseIntPipe) limit: number,
  ) {
    return this.dealsService.adminListDeals(page, limit);
  }

  @Patch(':id/verify')
  verifyDeal(@Param('id') id: string) {
    return this.dealsService.adminVerifyDeal(id);
  }

  @Delete(':id')
  removeDeal(@Param('id') id: string) {
    return this.dealsService.adminRemoveDeal(id);
  }
}
