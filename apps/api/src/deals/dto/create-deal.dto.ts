import {
  IsString,
  IsOptional,
  IsInt,
  IsDateString,
  IsIn,
  Min,
  MaxLength,
} from 'class-validator';

export class CreateDealDto {
  @IsString()
  @MaxLength(200)
  title: string;

  @IsOptional()
  @IsString()
  @MaxLength(2000)
  description?: string;

  @IsInt()
  @Min(0)
  minCall: number;

  @IsString()
  @IsIn(['coupon_code', 'link', 'qr_code'])
  dealType: string;

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

  @IsDateString()
  startsAt: string;

  @IsDateString()
  expiresAt: string;
}
