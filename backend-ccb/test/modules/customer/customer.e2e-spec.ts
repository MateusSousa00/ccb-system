import { INestApplication } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { RiskCategory } from '@prisma/client';
import * as request from 'supertest';
import { AppModule } from '../../../src/app.module';
import { PrismaService } from '../../../src/database/prisma/prisma.service';
import { setupApp, cleanupDatabase, createAndLoginUser } from '../../setup-app';

describe('Customer (e2e)', () => {
  let app: INestApplication;
  let prisma: PrismaService;
  let adminToken: string;
  let operatorToken: string;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    setupApp(app);

    prisma = app.get<PrismaService>(PrismaService);

    await cleanupDatabase(prisma);
    await app.init();

    adminToken = await createAndLoginUser(
      app,
      'admin@test.com',
      'password123',
      'Admin User',
      'ADMIN',
    );

    operatorToken = await createAndLoginUser(
      app,
      'operator@test.com',
      'password123',
      'Operator User',
      'OPERATOR',
    );
  });

  afterAll(async () => {
    await prisma.$disconnect();
    await app.close();
  });

  beforeEach(async () => {
    await prisma.customer.deleteMany();
  });

  describe('/customer (POST)', () => {
    const validCustomer = {
      name: 'João da Silva',
      cpf: '123.456.789-00',
      email: 'joao@example.com',
      phone: '(11) 98765-4321',
      interestRate: 12.5,
      creditScore: 750,
      monthlyIncome: 5000,
      riskCategory: RiskCategory.LOW,
    };

    it('should create customer as ADMIN', () => {
      return request(app.getHttpServer())
        .post('/customer')
        .set('Authorization', `Bearer ${adminToken}`)
        .send(validCustomer)
        .expect(201)
        .expect((res) => {
          expect(res.body.success).toBe(true);
          expect(res.body.data).toHaveProperty('customer');
          expect(res.body.data.customer.name).toBe(validCustomer.name);
          expect(res.body.data.customer.cpf).toBe(validCustomer.cpf);
        });
    });

    it('should create customer as OPERATOR', () => {
      return request(app.getHttpServer())
        .post('/customer')
        .set('Authorization', `Bearer ${operatorToken}`)
        .send(validCustomer)
        .expect(201);
    });

    it('should fail without authentication', () => {
      return request(app.getHttpServer())
        .post('/customer')
        .send(validCustomer)
        .expect(401);
    });

    it('should fail with duplicate CPF', async () => {
      await request(app.getHttpServer())
        .post('/customer')
        .set('Authorization', `Bearer ${adminToken}`)
        .send(validCustomer);

      return request(app.getHttpServer())
        .post('/customer')
        .set('Authorization', `Bearer ${adminToken}`)
        .send(validCustomer)
        .expect(409)
        .expect((res) => {
          expect(res.body.message).toBe('CPF already registered');
        });
    });

    it('should fail with invalid CPF format', () => {
      return request(app.getHttpServer())
        .post('/customer')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          ...validCustomer,
          cpf: '12345678900',
        })
        .expect(400);
    });

    it('should fail with invalid phone format', () => {
      return request(app.getHttpServer())
        .post('/customer')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          ...validCustomer,
          phone: '11987654321',
        })
        .expect(400);
    });

    it('should fail with invalid email', () => {
      return request(app.getHttpServer())
        .post('/customer')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          ...validCustomer,
          email: 'invalid-email',
        })
        .expect(400);
    });

    it('should fail with creditScore out of range', () => {
      return request(app.getHttpServer())
        .post('/customer')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          ...validCustomer,
          creditScore: 1500,
        })
        .expect(400);
    });
  });

  describe('/customer (GET)', () => {
    beforeEach(async () => {
      await request(app.getHttpServer())
        .post('/customer')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          name: 'Customer 1',
          cpf: '111.111.111-11',
          email: 'c1@example.com',
          interestRate: 10,
          creditScore: 700,
          monthlyIncome: 4000,
          riskCategory: RiskCategory.LOW,
        });

      await request(app.getHttpServer())
        .post('/customer')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          name: 'Customer 2',
          cpf: '222.222.222-22',
          email: 'c2@example.com',
          interestRate: 15,
          creditScore: 600,
          monthlyIncome: 3000,
          riskCategory: RiskCategory.MEDIUM,
        });

      await request(app.getHttpServer())
        .post('/customer')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          name: 'João Silva',
          cpf: '333.333.333-33',
          email: 'joao@example.com',
          interestRate: 20,
          creditScore: 500,
          monthlyIncome: 2000,
          riskCategory: RiskCategory.HIGH,
        });
    });

    it('should list all customers with pagination', () => {
      return request(app.getHttpServer())
        .get('/customer?page=1&limit=10')
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(200)
        .expect((res) => {
          expect(res.body.success).toBe(true);
          expect(res.body.data).toHaveProperty('data');
          expect(res.body.data).toHaveProperty('meta');
          expect(res.body.data.data).toHaveLength(3);
          expect(res.body.data.meta.total).toBe(3);
          expect(res.body.data.meta.page).toBe(1);
          expect(res.body.data.meta.limit).toBe(10);
        });
    });

    it('should filter by name', () => {
      return request(app.getHttpServer())
        .get('/customer?name=João')
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(200)
        .expect((res) => {
          expect(res.body.data.data).toHaveLength(1);
          expect(res.body.data.data[0].name).toBe('João Silva');
        });
    });

    it('should filter by CPF', () => {
      return request(app.getHttpServer())
        .get('/customer?cpf=111.111.111-11')
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(200)
        .expect((res) => {
          expect(res.body.data.data).toHaveLength(1);
          expect(res.body.data.data[0].cpf).toBe('111.111.111-11');
        });
    });

    it('should filter by riskCategory', () => {
      return request(app.getHttpServer())
        .get('/customer?riskCategory=HIGH')
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(200)
        .expect((res) => {
          expect(res.body.data.data).toHaveLength(1);
          expect(res.body.data.data[0].riskCategory).toBe(RiskCategory.HIGH);
        });
    });
  });

  describe('/customer/:id (GET)', () => {
    let customerId: string;

    beforeEach(async () => {
      const res = await request(app.getHttpServer())
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

      customerId = res.body.data.customer.id;
    });

    it('should get customer by id', () => {
      return request(app.getHttpServer())
        .get(`/customer/${customerId}`)
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(200)
        .expect((res) => {
          expect(res.body.success).toBe(true);
          expect(res.body.data.id).toBe(customerId);
          expect(res.body.data.name).toBe('João da Silva');
          expect(res.body.data).toHaveProperty('simulations');
        });
    });

    it('should return 404 for non-existent customer', () => {
      return request(app.getHttpServer())
        .get('/customer/non-existent-id')
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(404)
        .expect((res) => {
          expect(res.body.message).toBe('Customer not found');
        });
    });
  });

  describe('/customer/:id (PATCH)', () => {
    let customerId: string;

    beforeEach(async () => {
      const res = await request(app.getHttpServer())
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

      customerId = res.body.data.customer.id;
    });

    it('should update customer as ADMIN', () => {
      return request(app.getHttpServer())
        .patch(`/customer/${customerId}`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          creditScore: 800,
          riskCategory: RiskCategory.LOW,
        })
        .expect(200)
        .expect((res) => {
          expect(res.body.data.customer.creditScore).toBe(800);
        });
    });

    it('should update customer as OPERATOR', () => {
      return request(app.getHttpServer())
        .patch(`/customer/${customerId}`)
        .set('Authorization', `Bearer ${operatorToken}`)
        .send({
          creditScore: 800,
        })
        .expect(200);
    });

    it('should return 404 for non-existent customer', () => {
      return request(app.getHttpServer())
        .patch('/customer/non-existent-id')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          creditScore: 800,
        })
        .expect(404);
    });
  });

  describe('/customer/:id (DELETE)', () => {
    let customerId: string;

    beforeEach(async () => {
      const res = await request(app.getHttpServer())
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

      customerId = res.body.data.customer.id;
    });

    it('should delete customer as ADMIN', () => {
      return request(app.getHttpServer())
        .delete(`/customer/${customerId}`)
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(200)
        .expect((res) => {
          expect(res.body.data.message).toBe('Customer deleted successfully');
        });
    });

    it('should NOT delete customer as OPERATOR (403)', () => {
      return request(app.getHttpServer())
        .delete(`/customer/${customerId}`)
        .set('Authorization', `Bearer ${operatorToken}`)
        .expect(403)
        .expect((res) => {
          expect(res.body.message).toContain('Required roles: ADMIN');
        });
    });

    it('should return 404 for non-existent customer', () => {
      return request(app.getHttpServer())
        .delete('/customer/non-existent-id')
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(404);
    });
  });
});
