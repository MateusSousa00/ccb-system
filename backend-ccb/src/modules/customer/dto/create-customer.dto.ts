import { RiskCategory } from '@prisma/client';
import { Transform } from 'class-transformer';
import {
  IsEmail,
  IsEnum,
  IsInt,
  IsNotEmpty,
  IsOptional,
  IsString,
  Matches,
  Max,
  MaxLength,
  Min,
  MinLength,
} from 'class-validator';

export class CreateCustomerDto {
  @IsString()
  @MinLength(3)
  @MaxLength(100)
  name: string;

  @IsString()
  @Matches(/^\d{3}\.\d{3}\.\d{3}-\d{2}$/, {
    message: 'CPF must be in format XXX.XXX.XXX-XX',
  })
  cpf: string;

  @IsEmail()
  email: string;

  @IsOptional()
  @IsString()
  @Matches(/^\(\d{2}\)\s\d{4,5}-\d{4}$/, {
    message: 'Phone must be in format (XX) XXXXX-XXXX',
  })
  phone?: string;

  @IsNotEmpty()
  @Transform(({ value }) => parseFloat(value))
  @Min(0)
  @Max(100)
  interestRate: number; // Taxa anual (ex: 12.50 = 12.50% ao ano)

  @IsInt()
  @Min(0)
  @Max(1000)
  creditScore: number; // 0-1000

  @IsNotEmpty()
  @Transform(({ value }) => parseFloat(value))
  @Min(0)
  monthlyIncome: number;

  @IsEnum(RiskCategory)
  riskCategory: RiskCategory;
}
