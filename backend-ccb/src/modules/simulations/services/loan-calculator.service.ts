import { Injectable } from '@nestjs/common';
import { InstallmentDetail, LoanCalculation } from '../dto/loan-calculator.dto';

@Injectable()
export class LoanCalculatorService {
  /**
   * Calcula empréstimo usando Tabela Price (Sistema Francês de Amortização)
   *
   * @param requestedAmount - Valor solicitado (principal)
   * @param installments - Número de parcelas
   * @param annualRate - Taxa de juros anual (ex: 12.5 = 12.5%)
   * @returns Cálculo completo do empréstimo
   */
  calculate(
    requestedAmount: number, //PV
    installments: number,
    annualRate: number,
  ): LoanCalculation {
    // Conversao da taxa anual para mensal (ex: 12% ano = 1% mes)
    const monthlyRate = annualRate / 12 / 100;

    // Referencia: Tabela Price => PMT = PV × [i × (1 + i)^n] / [(1 + i)^n - 1]
    const numerator = monthlyRate * Math.pow(1 + monthlyRate, installments); // [i × (1 + i)^n]
    const denominator = Math.pow(1 + monthlyRate, installments) - 1; // [(1 + i)^n - 1]

    const installmentValue = requestedAmount * (numerator / denominator);
    const totalAmount = installmentValue * installments;
    const totalInterest = totalAmount - requestedAmount;

    return {
      requestedAmount,
      installments,
      interestRate: annualRate,
      installmentValue: this.roundToTwo(installmentValue),
      totalAmount: this.roundToTwo(totalAmount),
      totalInterest: this.roundToTwo(totalInterest),
    };
  }

  /**
   * Gera cronograma de parcelas (amortização)
   */
  generateSchedule(calculation: LoanCalculation): Array<{
    installmentNumber: number;
    dueDate: Date;
    principal: number;
    interest: number;
    total: number;
    balance: number;
  }> {
    const schedule: InstallmentDetail[] = [];
    let balance = calculation.requestedAmount;
    const monthlyRate = calculation.interestRate / 12 / 100;
    const today = new Date();

    for (let i = 1; i <= calculation.installments; i++) {
      const interest = balance * monthlyRate;
      const principal = calculation.installmentValue - interest;
      balance -= principal;

      const dueDate = new Date(today);
      dueDate.setMonth(dueDate.getMonth() + i);

      schedule.push({
        installmentNumber: i,
        dueDate,
        principal: this.roundToTwo(principal),
        interest: this.roundToTwo(interest),
        total: this.roundToTwo(calculation.installmentValue),
        balance: this.roundToTwo(Math.max(0, balance)),
      });
    }

    return schedule;
  }

  private roundToTwo(num: number): number {
    return Math.round(num * 100) / 100;
  }
}
