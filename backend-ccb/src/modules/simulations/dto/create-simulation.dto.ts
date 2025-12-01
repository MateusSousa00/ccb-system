import { Transform } from 'class-transformer';
import { IsInt, IsNotEmpty, IsUUID, Min } from 'class-validator';

export class CreateSimulationDto {
  @IsUUID()
  customerId: string;

  @IsNotEmpty()
  @Transform(({ value }) => parseFloat(value))
  @Min(100, { message: 'Minimum loan amount is R$ 100' })
  requestedAmount: number;

  @IsInt()
  @Min(1)
  installments: number;
}
