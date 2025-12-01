import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import * as request from 'supertest';
import { PrismaService } from '../../../src/database/prisma/prisma.service';
import { AppModule } from '../../../src/app.module';

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
    app.useGlobalPipes(
      new ValidationPipe({
        whitelist: true,
        forbidNonWhitelisted: true,
        transform: true,
      }),
    );

    prisma = moduleFixture.get<PrismaService>(PrismaService);

    await app.init();

    await prisma.installmentSchedule.deleteMany();
    await prisma.simulation.deleteMany();
    await prisma.customer.deleteMany();
    await prisma.user.deleteMany();

    // Create admin user
    const adminResponse = await request(app.getHttpServer())
      .post('/auth/register')
      .send({
        email: 'admin@ccb.com',
        password: 'admin123456',
        name: 'Admin User',
        role: 'ADMIN',
      });

    adminToken = adminResponse.body.data.access_token;

    // Create customer
    const customerResponse = await request(app.getHttpServer())
      .post('/customer')
      .set('Authorization', `Bearer ${adminToken}`)
      .send({
        name: 'João da Silva',
        cpf: '123.456.789-00',
        email: 'joao@email.com',
        phone: '(11) 98765-4321',
        interestRate: 12.5,
        creditScore: 750,
        monthlyIncome: 5000,
        riskCategory: 'LOW',
      });

    customerId = customerResponse.body.data.customer.id;

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
    await prisma.installmentSchedule.deleteMany();
    await prisma.simulation.deleteMany();
    await prisma.customer.deleteMany();
    await prisma.user.deleteMany();
    await prisma.$disconnect();
    await app.close();
  });

  describe('GET /simulations/:id/ccb', () => {
    it('should generate CCB HTML document', async () => {
      const response = await request(app.getHttpServer())
        .get(`/simulations/${simulationId}/ccb`)
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(200)
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
        .get(`/simulations/${simulationId}/ccb`)
        .expect(401);
    });

    it('should return 404 for non-existent simulation', async () => {
      const fakeId = '00000000-0000-0000-0000-000000000000';

      return request(app.getHttpServer())
        .get(`/simulations/${fakeId}/ccb`)
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(404)
        .expect((res) => {
          expect(res.body.message).toBe('Simulation not found');
        });
    });

    it('should return 400 for invalid UUID', async () => {
      return request(app.getHttpServer())
        .get('/simulations/invalid-uuid/ccb')
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(400);
    });
  });
});
