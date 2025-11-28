import { SimulationStatus } from '@prisma/client';
import { Type } from 'class-transformer';
import { IsEnum, IsInt, IsOptional, IsUUID, Min } from 'class-validator';

export class QuerySimulationDto {
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  page: number = 1;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  limit: number = 10;

  @IsOptional()
  @IsUUID()
  customerId?: string;

  @IsOptional()
  @IsUUID()
  createdById?: string;

  @IsOptional()
  @IsEnum(SimulationStatus)
  status?: SimulationStatus;

  @IsOptional()
  sortBy: string = 'createdAt';

  @IsOptional()
  sortOrder: 'asc' | 'desc' = 'desc';
}
