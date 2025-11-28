import { SimulationStatus } from '@prisma/client';
import { IsEnum, IsOptional } from 'class-validator';

export class UpdateSimulationDto {
  @IsOptional()
  @IsEnum(SimulationStatus)
  status?: SimulationStatus;
}
