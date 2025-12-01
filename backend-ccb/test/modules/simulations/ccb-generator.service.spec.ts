import { Test, TestingModule } from '@nestjs/testing';
import { CcbGeneratorService } from '../../../src/modules/simulations/services/ccb-generator.service';

describe('CcbGeneratorService', () => {
  let service: CcbGeneratorService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [CcbGeneratorService],
    }).compile();

    service = module.get<CcbGeneratorService>(CcbGeneratorService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('generateHtml', () => {
    it('should generate HTML with customer data', async () => {
      const mockSimulation: any = {
        id: 'test-uuid-123',
        createdAt: new Date('2024-01-01'),
        status: 'PENDING',
        requestedAmount: 10000,
        installmentValue: 895.35,
        installments: 12,
        interestRate: 12.5,
        totalAmount: 10744.2,
        totalInterest: 744.2,
        customer: {
          id: 'customer-uuid',
          name: 'João da Silva',
          cpf: '123.456.789-00',
          email: 'joao@email.com',
          phone: '(11) 98765-4321',
          interestRate: 12.5,
          creditScore: 750,
          monthlyIncome: 5000,
          riskCategory: 'LOW',
        },
        createdBy: {
          id: 'user-uuid',
          name: 'Admin User',
          email: 'admin@ccb.com',
        },
        schedule: [
          {
            installmentNumber: 1,
            dueDate: new Date('2024-02-01'),
            principal: 791.02,
            interest: 104.33,
            total: 895.35,
            balance: 9208.98,
          },
        ],
      };

      const html = await service.generateHtml(mockSimulation);

      expect(html).toContain('CÉDULA DE CRÉDITO BANCÁRIO');
      expect(html).toContain('João da Silva');
      expect(html).toContain('123.456.789-00');
      expect(html).toContain('test-uuid-123');
      expect(html).toContain('R$');
      expect(html).toContain('10.000,00');
      expect(html).toContain('12.5');
      expect(html).toContain('<tr>');
      expect(html).toContain('<table>');
      expect(html).toContain('CRONOGRAMA DE PAGAMENTO');
    });

    it('should handle missing optional fields gracefully', async () => {
      const mockSimulation: any = {
        id: 'test-uuid',
        createdAt: new Date(),
        status: 'PENDING',
        requestedAmount: '1000',
        installmentValue: '100',
        installments: 10,
        interestRate: '10',
        totalAmount: '1000',
        totalInterest: '0',
        customer: {
          name: 'Test User',
          cpf: '000.000.000-00',
          email: 'test@test.com',
          phone: null, // optional
          interestRate: '10',
          creditScore: null, // optional
          monthlyIncome: null, // optional
          riskCategory: null, // optional
        },
        createdBy: {
          name: 'Admin',
          email: 'admin@test.com',
        },
        schedule: [],
      };

      const html = await service.generateHtml(mockSimulation);

      expect(html).toContain('Não informado');
      expect(html).toContain('N/A');
    });
  });
});
