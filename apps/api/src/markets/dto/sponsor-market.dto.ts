import { IsString, IsNotEmpty, IsOptional } from 'class-validator';

export class SponsorMarketDto {
  @IsString()
  @IsNotEmpty()
  prizeAmount: string;

  @IsString()
  @IsNotEmpty()
  sponsorName: string;

  @IsString()
  @IsOptional()
  sponsorLogo?: string;

  @IsString()
  @IsOptional()
  sponsorBanner?: string;

  @IsString()
  @IsOptional()
  sponsorUrl?: string;
}

export class UpdateSponsorDto {
  @IsString()
  @IsOptional()
  sponsorLogo?: string;

  @IsString()
  @IsOptional()
  sponsorBanner?: string;

  @IsString()
  @IsOptional()
  sponsorUrl?: string;
}
