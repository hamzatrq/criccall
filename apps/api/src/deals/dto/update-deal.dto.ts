import {
  IsString,
  IsOptional,
  IsInt,
  IsDateString,
  IsIn,
  IsBoolean,
  Min,
  MaxLength,
} from 'class-validator';

export class UpdateDealDto {
  @IsOptional()
  @IsString()
  @MaxLength(200)
  title?: string;

  @IsOptional()
  @IsString()
  @MaxLength(2000)
  description?: string;

  @IsOptional()
  @IsInt()
  @Min(0)
  minCall?: number;

  @IsOptional()
  @IsString()
  @IsIn(['coupon_code', 'link', 'qr_code'])
  dealType?: string;

  @IsOptional()
  @IsString()
  @MaxLength(200)
  couponCode?: string;

  @IsOptional()
  @IsString()
  @MaxLength(500)
  dealUrl?: string;

  @IsOptional()
  @IsInt()
  @Min(1)
  maxRedemptions?: number;

  @IsOptional()
  @IsDateString()
  startsAt?: string;

  @IsOptional()
  @IsDateString()
  expiresAt?: string;

  @IsOptional()
  @IsBoolean()
  active?: boolean;
}
