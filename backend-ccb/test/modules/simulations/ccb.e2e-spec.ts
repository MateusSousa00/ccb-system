import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { PrismaService } from '../../../src/database/prisma/prisma.service';
import { AppModule } from '../../../src/app.module';
import { setupApp, cleanupDatabase, createAndLoginUser } from '../../setup-app';
import { RiskCategory } from '@prisma/client';

describe('CCB Generation (e2e)', () => {
  let app: INestApplication;
  let prisma: PrismaService;
  let adminToken: string;
  let customerId: string;
  let simulationId: string;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    setupApp(app);

    prisma = moduleFixture.get<PrismaService>(PrismaService);

    await cleanupDatabase(prisma);
    await app.init();

    adminToken = await createAndLoginUser(
      app,
      'admin@test.com',
      'password123',
      'Admin User',
      'ADMIN',
    );

    // Create customer
    const customerRes = await request(app.getHttpServer())
      .post('/customer')
      .set('Authorization', `Bearer ${adminToken}`)
      .send({
        name: 'João da Silva',
        cpf: '123.456.789-00',
        email: 'joao@example.com',
        interestRate: 12.5,
        creditScore: 750,
        monthlyIncome: 5000,
        riskCategory: RiskCategory.LOW,
      });

    customerId = customerRes.body.data.customer.id;

    // Create simulation
    const simulationResponse = await request(app.getHttpServer())
      .post('/simulations')
      .set('Authorization', `Bearer ${adminToken}`)
      .send({
        customerId,
        requestedAmount: 10000,
        installments: 12,
      });

    simulationId = simulationResponse.body.data.simulation.id;
  });

  afterAll(async () => {
    await cleanupDatabase(prisma);
    await prisma.$disconnect();
    await app.close();
  });

  describe('POST /simulations/:id/ccb', () => {
    it('should generate CCB HTML document', async () => {
      const response = await request(app.getHttpServer())
        .post(`/simulations/${simulationId}/ccb`)
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(201)
        .expect('Content-Type', /html/);

      // Validate HTML content
      expect(response.text).toContain('CÉDULA DE CRÉDITO BANCÁRIO');
      expect(response.text).toContain('João da Silva');
      expect(response.text).toContain('123.456.789-00');
      expect(response.text).toContain(simulationId);
      expect(response.text).toContain('R$');
      expect(response.text).toContain('<table>');
      expect(response.text).toContain('CRONOGRAMA DE PAGAMENTO');
    });

    it('should return 401 without authentication', async () => {
      return request(app.getHttpServer())
        .post(`/simulations/${simulationId}/ccb`)
        .expect(401);
    });

    it('should return 404 for non-existent simulation', async () => {
      const fakeId = '00000000-0000-0000-0000-000000000000';

      return request(app.getHttpServer())
        .post(`/simulations/${fakeId}/ccb`)
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(404)
        .expect((res) => {
          expect(res.body.message).toBe('Simulation not found');
        });
    });

    it('should return 404 for invalid UUID', async () => {
      const fakeId = '00000000-0000-0000-0000-000000000000';
      return request(app.getHttpServer())
        .post(`/simulations/${fakeId}/ccb`)
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(404);
    });
  });
});
