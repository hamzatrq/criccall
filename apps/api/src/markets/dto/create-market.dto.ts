import {
  IsString,
  IsInt,
  IsDateString,
  IsNotEmpty,
  IsOptional,
} from 'class-validator';

export class CreateMarketDto {
  @IsString()
  @IsNotEmpty()
  matchId: string;

  @IsString()
  @IsNotEmpty()
  question: string;

  @IsDateString()
  lockTime: string;

  @IsInt()
  yesOutcome: number;

  @IsOptional()
  @IsInt()
  onChainId?: number;
}
