export interface LoanCalculation {
  requestedAmount: number;
  installments: number;
  interestRate: number;
  installmentValue: number;
  totalAmount: number;
  totalInterest: number;
}

export interface InstallmentDetail {
  installmentNumber: number;
  dueDate: Date;
  principal: number;
  interest: number;
  total: number;
  balance: number;
}
