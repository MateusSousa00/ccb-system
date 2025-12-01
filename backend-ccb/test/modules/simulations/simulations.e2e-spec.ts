import { INestApplication } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { RiskCategory, SimulationStatus } from '@prisma/client';
import * as request from 'supertest';
import { AppModule } from '../../../src/app.module';
import { PrismaService } from '../../../src/database/prisma/prisma.service';

describe('Simulations (e2e)', () => {
  let app: INestApplication;
  let prisma: PrismaService;
  let adminToken: string;
  let operatorToken: string;
  let customerId: string;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    prisma = app.get<PrismaService>(PrismaService);

    await app.init();

    await prisma.installmentSchedule.deleteMany();
    await prisma.simulation.deleteMany();
    await prisma.customer.deleteMany();
    await prisma.user.deleteMany();

    // Create Admin
    await request(app.getHttpServer()).post('/auth/register').send({
      email: 'admin@test.com',
      password: 'password123',
      name: 'Admin User',
      role: 'ADMIN',
    });

    const adminLoginRes = await request(app.getHttpServer())
      .post('/auth/login')
      .send({
        email: 'admin@test.com',
        password: 'password123',
      });

    if (!adminLoginRes.body.data?.accessToken) {
      throw new Error('Failed to get admin token');
    }
    adminToken = adminLoginRes.body.data.accessToken;

    // Create OPERATOR
    await request(app.getHttpServer()).post('/auth/register').send({
      email: 'operator@test.com',
      password: 'password123',
      name: 'Operator User',
      role: 'OPERATOR',
    });

    const operatorLoginRes = await request(app.getHttpServer())
      .post('/auth/login')
      .send({
        email: 'operator@test.com',
        password: 'password123',
      });

    if (!operatorLoginRes.body.data?.accessToken) {
      throw new Error('Failed to get operator token');
    }
    operatorToken = operatorLoginRes.body.data.accessToken;

    // Create Customer
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
  });

  afterAll(async () => {
    await prisma.$disconnect();
    await app.close();
  });

  beforeEach(async () => {
    await prisma.installmentSchedule.deleteMany();
    await prisma.simulation.deleteMany();
  });

  describe('/simulations (POST)', () => {
    const validSimulation = {
      customerId: '',
      requestedAmount: 10000,
      installments: 12,
    };

    it('should create simulation as ADMIN', async () => {
      return await request(app.getHttpServer())
        .post('/simulations')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({ ...validSimulation, customerId })
        .expect(201)
        .expect((res) => {
          expect(res.body.success).toBe(true);
          expect(res.body.data).toHaveProperty('simulation');
          expect(Number(res.body.data.simulation.requestedAmount)).toBe(10000);
          expect(Number(res.body.data.simulation.installments)).toBe(12);
          expect(Number(res.body.data.simulation.interestRate)).toBe(12.5);
          expect(res.body.data.simulation.status).toBe('PENDING');
          expect(res.body.data.simulation).toHaveProperty('installmentValue');
          expect(res.body.data.simulation).toHaveProperty('totalAmount');
          expect(res.body.data.simulation).toHaveProperty('totalInterest');
        });
    });

    it('should create simulation as OPERATOR', async () => {
      return await request(app.getHttpServer())
        .post('/simulations')
        .set('Authorization', `Bearer ${operatorToken}`)
        .send({ ...validSimulation, customerId })
        .expect(201);
    });

    it('should fail without authentication', async () => {
      return await request(app.getHttpServer())
        .post('/simulations')
        .send({ ...validSimulation, customerId })
        .expect(401);
    });

    it('should fail with non-existent customer', async () => {
      const nonExistentUuid = '00000000-0000-0000-0000-000000000000';
      return await request(app.getHttpServer())
        .post('/simulations')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({ ...validSimulation, customerId: nonExistentUuid })
        .expect(404)
        .expect((res) => {
          expect(res.body.message).toBe('Customer not found');
        });
    });

    it('should fail with amount below minimum', async () => {
      return await request(app.getHttpServer())
        .post('/simulations')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          customerId,
          requestedAmount: 50,
          installments: 12,
        })
        .expect(400)
        .expect((res) => {
          expect(res.body.message).toBe('Minimum loan amount is R$ 100');
        });
    });

    it('should fail with invalid installments (0)', async () => {
      return await request(app.getHttpServer())
        .post('/simulations')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          customerId,
          requestedAmount: 10000,
          installments: 0,
        })
        .expect(400);
    });

    it('should fail with invalid installments (>360)', async () => {
      return await request(app.getHttpServer())
        .post('/simulations')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          customerId,
          requestedAmount: 10000,
          installments: 400,
        })
        .expect(400);
    });

    it('should use customer interest rate', async () => {
      const res = await request(app.getHttpServer())
        .post('/simulations')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({ ...validSimulation, customerId });

      expect(Number(res.body.data.simulation.interestRate)).toBe(12.5);
    });

    it('should create installment schedule automatically', async () => {
      const res = await request(app.getHttpServer())
        .post('/simulations')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({ ...validSimulation, customerId });

      const simulationId = res.body.data.simulation.id;

      const schedule = await prisma.installmentSchedule.findMany({
        where: { simulationId },
      });

      expect(schedule).toHaveLength(12);
      expect(schedule[0].installmentNumber).toBe(1);
      expect(schedule[11].installmentNumber).toBe(12);
    });
  });

  describe('/simulations (GET)', () => {
    beforeEach(async () => {
      await request(app.getHttpServer())
        .post('/simulations')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          customerId,
          requestedAmount: 10000,
          installments: 12,
        });

      await request(app.getHttpServer())
        .post('/simulations')
        .set('Authorization', `Bearer ${operatorToken}`)
        .send({
          customerId,
          requestedAmount: 5000,
          installments: 6,
        });
    });

    it('should list all simulations with pagination', async () => {
      return await request(app.getHttpServer())
        .get('/simulations?page=1&limit=10')
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(200)
        .expect((res) => {
          expect(res.body.success).toBe(true);
          expect(res.body.data).toHaveProperty('data');
          expect(res.body.data).toHaveProperty('meta');
          expect(res.body.data.data).toHaveLength(2);
          expect(res.body.data.meta.total).toBe(2);
        });
    });

    it('should filter by customerId', async () => {
      return await request(app.getHttpServer())
        .get(`/simulations?customerId=${customerId}`)
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(200)
        .expect((res) => {
          expect(res.body.data.data).toHaveLength(2);
          res.body.data.data.forEach((sim: any) => {
            expect(sim.customerId).toBe(customerId);
          });
        });
    });

    it('should filter by status', async () => {
      return await request(app.getHttpServer())
        .get('/simulations?status=PENDING')
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(200)
        .expect((res) => {
          expect(res.body.data.data).toHaveLength(2);
          res.body.data.data.forEach((sim: any) => {
            expect(sim.status).toBe('PENDING');
          });
        });
    });

    it('should return empty array for non-existent status', async () => {
      return await request(app.getHttpServer())
        .get('/simulations?status=CONVERTED')
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(200)
        .expect((res) => {
          expect(res.body.data.data).toHaveLength(0);
        });
    });
  });

  describe('/simulations/:id (GET)', () => {
    let simulationId: string;

    beforeEach(async () => {
      const res = await request(app.getHttpServer())
        .post('/simulations')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          customerId,
          requestedAmount: 10000,
          installments: 12,
        });

      simulationId = res.body.data.simulation.id;
    });

    it('should get simulation by id with schedule', async () => {
      return await request(app.getHttpServer())
        .get(`/simulations/${simulationId}`)
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(200)
        .expect((res) => {
          expect(res.body.success).toBe(true);
          expect(res.body.data.id).toBe(simulationId);
          expect(res.body.data).toHaveProperty('customer');
          expect(res.body.data).toHaveProperty('createdBy');
          expect(res.body.data).toHaveProperty('schedule');
          expect(res.body.data.schedule).toHaveLength(12);
        });
    });

    it('should return 404 for non-existent simulation', async () => {
      return await request(app.getHttpServer())
        .get('/simulations/non-existent-id')
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(404)
        .expect((res) => {
          expect(res.body.message).toBe('Simulation not found');
        });
    });
  });

  describe('/simulations/:id/schedule (GET)', () => {
    let simulationId: string;

    beforeEach(async () => {
      const res = await request(app.getHttpServer())
        .post('/simulations')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          customerId,
          requestedAmount: 10000,
          installments: 12,
        });

      simulationId = res.body.data.simulation.id;
    });

    it('should get installment schedule', async () => {
      return await request(app.getHttpServer())
        .get(`/simulations/${simulationId}/schedule`)
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(200)
        .expect((res) => {
          expect(res.body.success).toBe(true);
          expect(res.body.data).toHaveProperty('simulation');
          expect(res.body.data).toHaveProperty('schedule');
          expect(res.body.data.schedule).toHaveLength(12);

          const firstInstallment = res.body.data.schedule[0];
          expect(firstInstallment).toHaveProperty('installmentNumber', 1);
          expect(firstInstallment).toHaveProperty('dueDate');
          expect(firstInstallment).toHaveProperty('principal');
          expect(firstInstallment).toHaveProperty('interest');
          expect(firstInstallment).toHaveProperty('total');
          expect(firstInstallment).toHaveProperty('balance');
        });
    });

    it('should have decreasing balance in schedule', async () => {
      const res = await request(app.getHttpServer())
        .get(`/simulations/${simulationId}/schedule`)
        .set('Authorization', `Bearer ${adminToken}`);

      const schedule = res.body.data.schedule;

      expect(Number(schedule[0].balance)).toBeGreaterThan(Number(schedule[11].balance));

      expect(Number(schedule[11].balance)).toBeLessThan(10);
    });
  });

  describe('/simulations/:id (PATCH)', () => {
    let simulationId: string;

    beforeEach(async () => {
      const res = await request(app.getHttpServer())
        .post('/simulations')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          customerId,
          requestedAmount: 10000,
          installments: 12,
        });

      simulationId = res.body.data.simulation.id;
    });

    it('should update simulation status as ADMIN', async () => {
      return await request(app.getHttpServer())
        .patch(`/simulations/${simulationId}`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          status: SimulationStatus.APPROVED,
        })
        .expect(200)
        .expect((res) => {
          expect(res.body.data.simulation.status).toBe('APPROVED');
        });
    });

    it('should update simulation status as OPERATOR', async () => {
      return await request(app.getHttpServer())
        .patch(`/simulations/${simulationId}`)
        .set('Authorization', `Bearer ${operatorToken}`)
        .send({
          status: SimulationStatus.APPROVED,
        })
        .expect(200);
    });

    it('should return 404 for non-existent simulation', async () => {
      return await request(app.getHttpServer())
        .patch('/simulations/non-existent-id')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          status: SimulationStatus.APPROVED,
        })
        .expect(404);
    });

    it('should fail with invalid status', async () => {
      return await request(app.getHttpServer())
        .patch(`/simulations/${simulationId}`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          status: 'INVALID_STATUS',
        })
        .expect(400);
    });
  });

  describe('/simulations/:id (DELETE)', () => {
    let simulationId: string;

    beforeEach(async () => {
      const res = await request(app.getHttpServer())
        .post('/simulations')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          customerId,
          requestedAmount: 10000,
          installments: 12,
        });

      simulationId = res.body.data.simulation.id;
    });

    it('should delete simulation as ADMIN', async () => {
      await request(app.getHttpServer())
        .delete(`/simulations/${simulationId}`)
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(200)
        .expect((res) => {
          expect(res.body.data.message).toBe('Simulation deleted successfully');
        });

      await request(app.getHttpServer())
        .get(`/simulations/${simulationId}`)
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(404);
    });

    it('should delete installment schedule on cascade', async () => {
      const scheduleBefore = await prisma.installmentSchedule.findMany({
        where: { simulationId },
      });
      expect(scheduleBefore).toHaveLength(12);

      await request(app.getHttpServer())
        .delete(`/simulations/${simulationId}`)
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(200);

      const scheduleAfter = await prisma.installmentSchedule.findMany({
        where: { simulationId },
      });
      expect(scheduleAfter).toHaveLength(0);
    });

    it('should NOT delete simulation as OPERATOR (403)', async () => {
      return await request(app.getHttpServer())
        .delete(`/simulations/${simulationId}`)
        .set('Authorization', `Bearer ${operatorToken}`)
        .expect(403)
        .expect((res) => {
          expect(res.body.message).toContain('Required roles: ADMIN');
        });
    });

    it('should return 404 for non-existent simulation', async () => {
      return await request(app.getHttpServer())
        .delete('/simulations/non-existent-id')
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(404);
    });
  });
});
