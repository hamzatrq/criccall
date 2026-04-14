import {
  Controller,
  Get,
  Post,
  Patch,
  Body,
  UseGuards,
} from '@nestjs/common';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { Roles } from '../common/decorators/roles.decorator';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { BrandProfileService } from './brand-profile.service';
import {
  IsString,
  IsOptional,
  IsIn,
  MaxLength,
} from 'class-validator';

class CreateBrandProfileDto {
  @IsString()
  @MaxLength(200)
  brandName: string;

  @IsOptional()
  @IsString()
  @MaxLength(2000)
  description?: string;

  @IsString()
  @IsIn(['food', 'telecom', 'ecommerce', 'entertainment', 'sports', 'other'])
  category: string;

  @IsOptional()
  @IsString()
  @MaxLength(500)
  brandUrl?: string;
}

class UpdateBrandProfileDto {
  @IsOptional()
  @IsString()
  @MaxLength(200)
  brandName?: string;

  @IsOptional()
  @IsString()
  @MaxLength(2000)
  description?: string;

  @IsOptional()
  @IsString()
  @IsIn(['food', 'telecom', 'ecommerce', 'entertainment', 'sports', 'other'])
  category?: string;

  @IsOptional()
  @IsString()
  @MaxLength(500)
  brandUrl?: string;
}

@Controller('sponsor/profile')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('sponsor')
export class BrandProfileController {
  constructor(private readonly brandProfileService: BrandProfileService) {}

  @Get()
  getProfile(
    @CurrentUser() user: { sub: string; wallet: string; role: string },
  ) {
    return this.brandProfileService.getProfile(user.sub);
  }

  @Post()
  createProfile(
    @CurrentUser() user: { sub: string; wallet: string; role: string },
    @Body() dto: CreateBrandProfileDto,
  ) {
    return this.brandProfileService.createProfile(user.sub, dto);
  }

  @Patch()
  updateProfile(
    @CurrentUser() user: { sub: string; wallet: string; role: string },
    @Body() dto: UpdateBrandProfileDto,
  ) {
    return this.brandProfileService.updateProfile(user.sub, dto);
  }
}
