import { ApiProperty } from '@nestjs/swagger';

export class LoanCalculation {
  @ApiProperty({
    description: 'Original loan amount requested',
    example: 10000,
  })
  requestedAmount: number;
  @ApiProperty({
    description: 'Number of installments',
    example: 12,
  })
  installments: number;
  @ApiProperty({
    description: 'Annual interest rate applied (%)',
    example: 12.5,
  })
  interestRate: number;
  @ApiProperty({
    description: 'Fixed monthly installment value (Price Table)',
    example: 895.35,
  })
  installmentValue: number;
  @ApiProperty({
    description: 'Total amount to be paid (principal + interest)',
    example: 10744.2,
  })
  totalAmount: number;
  @ApiProperty({
    description: 'Total interest charged over the loan period',
    example: 744.2,
  })
  totalInterest: number;
}

export class InstallmentDetail {
  @ApiProperty({
    description: 'Installment sequential number',
    example: 1,
  })
  installmentNumber: number;
  @ApiProperty({
    description: 'Payment due date',
    example: '2024-02-01T00:00:00.000Z',
  })
  dueDate: Date;
  @ApiProperty({
    description: 'Principal amount (amortization) in this installment',
    example: 791.02,
  })
  principal: number;
  @ApiProperty({
    description: 'Interest amount in this installment',
    example: 104.33,
  })
  interest: number;
  @ApiProperty({
    description: 'Total installment value (principal + interest)',
    example: 895.35,
  })
  total: number;
  @ApiProperty({
    description: 'Remaining balance after this payment',
    example: 9208.98,
  })
  balance: number;
}
