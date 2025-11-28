import { LoanCalculatorService } from '../../../src/modules/simulations/services/loan-calculator.service';

describe('LoanCalculatorService', () => {
  let service: LoanCalculatorService;

  beforeEach(() => {
    service = new LoanCalculatorService();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('calculate', () => {
    it('should calculate loan correctly with known values', () => {
      // Caso de teste conhecido: R$ 10.000, 12 meses, 12% ao ano
      const result = service.calculate(10000, 12, 12);

      // Valores calculados com calculadora financeira HP12C
      expect(result.requestedAmount).toBe(10000);
      expect(result.installments).toBe(12);
      expect(result.interestRate).toBe(12);
      expect(result.installmentValue).toBeCloseTo(888.49, 2);
      expect(result.totalAmount).toBeCloseTo(10661.85, 2);
      expect(result.totalInterest).toBeCloseTo(661.85, 2);
    });

    it('should calculate with different interest rate', () => {
      // R$ 5.000, 6 meses, 24% ao ano (2% ao mês)
      const result = service.calculate(5000, 6, 24);

      expect(result.installmentValue).toBeCloseTo(892.63, 2);
      expect(result.totalAmount).toBeCloseTo(5355.77, 2);
      expect(result.totalInterest).toBeCloseTo(355.77, 2);
    });

    it('should calculate with single installment', () => {
      // R$ 1.000, 1 mês, 12% ao ano
      const result = service.calculate(1000, 1, 12);

      // Com 1 parcela: parcela = principal + juros de 1 mês
      // Juros = 1000 * (12/12/100) = 1000 * 0.01 = 10
      expect(result.installmentValue).toBeCloseTo(1010, 2);
      expect(result.totalAmount).toBeCloseTo(1010, 2);
      expect(result.totalInterest).toBeCloseTo(10, 2);
    });

    it('should calculate with long-term loan', () => {
      // R$ 100.000, 360 meses (30 anos), 9.6% ao ano
      const result = service.calculate(100000, 360, 9.6);

      expect(result.installmentValue).toBeCloseTo(848.16, 2);
      expect(result.totalAmount).toBeCloseTo(305337.59, 2);
      expect(result.totalInterest).toBeCloseTo(205337.59, 2);
    });

    it('should round values to 2 decimal places', () => {
      const result = service.calculate(10000, 12, 12);

      // Verificar que não há mais de 2 casas decimais
      expect(
        result.installmentValue.toString().split('.')[1]?.length || 0,
      ).toBeLessThanOrEqual(2);
      expect(
        result.totalAmount.toString().split('.')[1]?.length || 0,
      ).toBeLessThanOrEqual(2);
      expect(
        result.totalInterest.toString().split('.')[1]?.length || 0,
      ).toBeLessThanOrEqual(2);
    });
  });

  describe('generateSchedule', () => {
    it('should generate correct number of installments', () => {
      const calculation = service.calculate(10000, 12, 12);
      const schedule = service.generateSchedule(calculation);

      expect(schedule).toHaveLength(12);
    });

    it('should have decreasing balance', () => {
      const calculation = service.calculate(10000, 12, 12);
      const schedule = service.generateSchedule(calculation);

      // Primeira parcela tem maior saldo
      expect(schedule[0].balance).toBeGreaterThan(schedule[11].balance);

      // Última parcela tem saldo zero (ou próximo por arredondamento)
      expect(schedule[11].balance).toBeCloseTo(0, 1);
    });

    it('should have decreasing interest and increasing principal', () => {
      const calculation = service.calculate(10000, 12, 12);
      const schedule = service.generateSchedule(calculation);

      // Primeira parcela tem mais juros
      expect(schedule[0].interest).toBeGreaterThan(schedule[11].interest);

      // Última parcela tem mais principal
      expect(schedule[0].principal).toBeLessThan(schedule[11].principal);
    });

    it('should have consistent installment value', () => {
      const calculation = service.calculate(10000, 12, 12);
      const schedule = service.generateSchedule(calculation);

      // Todas as parcelas têm o mesmo valor total
      schedule.forEach((installment) => {
        expect(installment.total).toBeCloseTo(calculation.installmentValue, 2);
      });
    });

    it('should have correct installment numbers', () => {
      const calculation = service.calculate(10000, 12, 12);
      const schedule = service.generateSchedule(calculation);

      schedule.forEach((installment, index) => {
        expect(installment.installmentNumber).toBe(index + 1);
      });
    });

    it('should have due dates in the future', () => {
      const calculation = service.calculate(10000, 12, 12);
      const schedule = service.generateSchedule(calculation);

      const today = new Date();

      schedule.forEach((installment, index) => {
        expect(installment.dueDate.getTime()).toBeGreaterThan(today.getTime());

        // Cada parcela vence 1 mês depois da anterior
        if (index > 0) {
          const prevDate = schedule[index - 1].dueDate;
          const currentDate = installment.dueDate;

          // Diferença aproximada de 1 mês (28-31 dias)
          const daysDiff =
            (currentDate.getTime() - prevDate.getTime()) /
            (1000 * 60 * 60 * 24);
          expect(daysDiff).toBeGreaterThanOrEqual(28);
          expect(daysDiff).toBeLessThanOrEqual(31);
        }
      });
    });

    it('should sum principal to equal requested amount', () => {
      const calculation = service.calculate(10000, 12, 12);
      const schedule = service.generateSchedule(calculation);

      const totalPrincipal = schedule.reduce(
        (sum, installment) => sum + installment.principal,
        0,
      );

      // Soma dos principais deve ser igual ao valor emprestado (com margem de arredondamento)
      expect(totalPrincipal).toBeCloseTo(calculation.requestedAmount, 0);
    });

    it('should sum interest to equal total interest', () => {
      const calculation = service.calculate(10000, 12, 12);
      const schedule = service.generateSchedule(calculation);

      const totalInterest = schedule.reduce(
        (sum, installment) => sum + installment.interest,
        0,
      );

      // Soma dos juros deve ser igual ao total de juros (com margem de arredondamento)
      expect(totalInterest).toBeCloseTo(calculation.totalInterest, 0);
    });
  });
});
