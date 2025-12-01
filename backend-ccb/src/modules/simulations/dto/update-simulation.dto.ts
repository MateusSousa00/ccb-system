import { ApiProperty } from '@nestjs/swagger';
import { SimulationStatus } from '@prisma/client';
import { IsEnum, IsOptional } from 'class-validator';

export class UpdateSimulationDto {
  @ApiProperty({
    description: 'Simulation Status',
    enum: SimulationStatus,
    example: SimulationStatus.APPROVED,
    required: false,
  })
  @IsOptional()
  @IsEnum(SimulationStatus)
  status?: SimulationStatus;
}
