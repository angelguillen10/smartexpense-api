import { IsString, IsNumber, IsEnum, IsOptional } from 'class-validator';

export class CreateBudgetDto {
  @IsString()
  category: string;

  @IsNumber()
  limit: number;

  @IsEnum(['monthly', 'weekly', 'yearly'])
  period: 'monthly' | 'weekly' | 'yearly';

  @IsOptional()
  @IsNumber()
  alertThreshold?: number;
}
