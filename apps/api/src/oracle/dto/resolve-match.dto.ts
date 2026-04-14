import { IsString, IsNotEmpty, IsInt, Min, Max } from 'class-validator';

export class ResolveMatchDto {
  @IsString()
  @IsNotEmpty()
  matchId: string;

  @IsInt()
  @Min(1)
  @Max(4)
  outcome: number; // 1=TeamA, 2=TeamB, 3=Draw, 4=NoResult
}
