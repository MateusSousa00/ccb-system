import { ApiProperty } from '@nestjs/swagger';
import { Transform } from 'class-transformer';
import { IsInt, IsNotEmpty, IsUUID, Min } from 'class-validator';

export class CreateSimulationDto {
  @ApiProperty({
    description: 'UUID of the customer who will request the loan',
    example: 'a1b2c3d4-e5f6-7890-abcd-ef1234567890',
    format: 'uuid',
  })
  @IsUUID()
  customerId: string;

  @ApiProperty({
    description: 'Requested loan amount in reais (minimum R$100.00)',
    example: 10000,
    minimum: 100,
    type: Number,
  })
  @IsNotEmpty()
  @Transform(({ value }) => parseFloat(value))
  @Min(100, { message: 'Minimum loan amount is R$ 100' })
  requestedAmount: number;

  @ApiProperty({
    description: 'Number of installments for payment (minimum 1)',
    example: 12,
    minimum: 1,
    type: Number,
  })
  @IsInt()
  @Min(1)
  installments: number;
}
