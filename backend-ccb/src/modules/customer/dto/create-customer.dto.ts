import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
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
  @ApiProperty({
    description: 'Client Full name',
    example: 'João da Silva',
    minLength: 3,
    maxLength: 100,
  })
  @IsString()
  @MinLength(3)
  @MaxLength(100)
  name: string;

  @ApiProperty({
    description: 'Client`s CPF in format XXX.XXX.XXX-XX',
    example: '123.456.789-00',
    pattern: '^\\d{3}\\.\\d{3}\\.\\d{3}-\\d{2}$',
  })
  @IsString()
  @Matches(/^\d{3}\.\d{3}\.\d{3}-\d{2}$/, {
    message: 'CPF must be in format XXX.XXX.XXX-XX',
  })
  cpf: string;

  @ApiProperty({
    description: 'Client`s E-mail',
    example: 'joao.silva@email.com',
    format: 'email',
  })
  @IsEmail()
  email: string;

  @ApiPropertyOptional({
    description: 'Client`s Phone in format (XX) XXXXX-XXXX',
    example: '(11) 98765-4321',
    pattern: '^\\(\\d{2}\\)\\s\\d{4,5}-\\d{4}$',
  })
  @IsOptional()
  @IsString()
  @Matches(/^\(\d{2}\)\s\d{4,5}-\d{4}$/, {
    message: 'Phone must be in format (XX) XXXXX-XXXX',
  })
  phone?: string;

  @ApiProperty({
    description: 'Customer customized annual interest rate (0-100%)',
    example: 12.5,
    minimum: 0,
    maximum: 100,
    type: Number,
  })
  @IsNotEmpty()
  @Transform(({ value }) => parseFloat(value))
  @Min(0)
  @Max(100)
  interestRate: number; // Taxa anual (ex: 12.50 = 12.50% ao ano)

  @ApiProperty({
    description: 'Client Score credit (0-1000)',
    example: 750,
    minimum: 0,
    maximum: 1000,
  })
  @IsInt()
  @Min(0)
  @Max(1000)
  creditScore: number; // 0-1000

  @ApiProperty({
    description: 'Client`s monthly income in reais',
    example: 5000.0,
    minimum: 0,
    type: Number,
  })
  @IsNotEmpty()
  @Transform(({ value }) => parseFloat(value))
  @Min(0)
  monthlyIncome: number;

  @ApiProperty({
    description: 'Risk Category from client',
    enum: RiskCategory,
    example: RiskCategory.LOW,
  })
  @IsEnum(RiskCategory)
  riskCategory: RiskCategory;
}
