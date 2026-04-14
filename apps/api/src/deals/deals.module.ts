import { Module } from '@nestjs/common';
import {
  DealsController,
  UserDealsController,
  SponsorDealsController,
  AdminDealsController,
} from './deals.controller';
import { BrandProfileController } from './brand-profile.controller';
import { DealsService } from './deals.service';
import { BrandProfileService } from './brand-profile.service';

@Module({
  controllers: [
    DealsController,
    UserDealsController,
    SponsorDealsController,
    AdminDealsController,
    BrandProfileController,
  ],
  providers: [DealsService, BrandProfileService],
  exports: [DealsService, BrandProfileService],
})
export class DealsModule {}
