import { INestApplication } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import * as request from 'supertest';
import { AppModule } from '../../../src/app.module';
import { PrismaService } from '../../../src/database/prisma/prisma.service';

describe('Auth (e2e)', () => {
  let app: INestApplication;
  let prisma: PrismaService;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();

    prisma = app.get<PrismaService>(PrismaService);

    await prisma.user.deleteMany();
    await prisma.customer.deleteMany();

    await app.init();
  });

  afterAll(async () => {
    await prisma.$disconnect();
    await app.close();
  });

  beforeEach(async () => {
    await prisma.user.deleteMany();
  });

  describe('/auth/register (POST)', () => {
    it('should register a new user', async () => {
      return await request(app.getHttpServer())
        .post('/auth/register')
        .send({
          email: 'test@example.com',
          password: 'password123',
          name: 'Test User',
        })
        .expect(201)
        .expect((res) => {
          expect(res.body.success).toBe(true);
          expect(res.body.data).toHaveProperty('accessToken');
          expect(res.body.data).toHaveProperty('user');
          expect(res.body.data.user.email).toBe('test@example.com');
          expect(res.body.data.user).not.toHaveProperty('password');
          expect(typeof res.body.data.accessToken).toBe('string');
          expect(res.body.data.accessToken.length).toBeGreaterThan(0);
        });
    });

    it('should fail with duplicate email', async () => {
      const userData = {
        email: 'duplicate@example.com',
        password: 'password123',
        name: 'Test User',
      };

      await request(app.getHttpServer()).post('/auth/register').send(userData);

      return request(app.getHttpServer())
        .post('/auth/register')
        .send(userData)
        .expect(409)
        .expect((res) => {
          expect(res.body.success).toBe(false);
          expect(res.body.message).toBe('Email already registered');
        });
    });

    it('should fail with invalid email', () => {
      return request(app.getHttpServer())
        .post('/auth/register')
        .send({
          email: 'invalid-email',
          password: 'password123',
          name: 'Test User',
        })
        .expect(400);
    });

    it('should fail with short password', () => {
      return request(app.getHttpServer())
        .post('/auth/register')
        .send({
          email: 'test@example.com',
          password: 'short',
          name: 'Test User',
        })
        .expect(400);
    });

    it('should allow immediate authentication with registration token', async () => {
      const registerRes = await request(app.getHttpServer())
        .post('/auth/register')
        .send({
          email: 'immediate@example.com',
          password: 'password123',
          name: 'Immediate User',
        })
        .expect(201);

      const accessToken = registerRes.body.data.accessToken;

      return request(app.getHttpServer())
        .get('/auth/me')
        .set('Authorization', `Bearer ${accessToken}`)
        .expect(200)
        .expect((res) => {
          expect(res.body.success).toBe(true);
          expect(res.body.data.user.email).toBe('immediate@example.com');
        });
    });
  });

  describe('/auth/login (POST)', () => {
    beforeEach(async () => {
      await request(app.getHttpServer()).post('/auth/register').send({
        email: 'login@example.com',
        password: 'password123',
        name: 'Login User',
      });
    });

    it('should login with valid credentials', () => {
      return request(app.getHttpServer())
        .post('/auth/login')
        .send({
          email: 'login@example.com',
          password: 'password123',
        })
        .expect(201)
        .expect((res) => {
          expect(res.body.success).toBe(true);
          expect(res.body.data).toHaveProperty('accessToken');
          expect(res.body.data).toHaveProperty('user');
        });
    });

    it('should fail with invalid email', () => {
      return request(app.getHttpServer())
        .post('/auth/login')
        .send({
          email: 'wrong@example.com',
          password: 'password123',
        })
        .expect(401)
        .expect((res) => {
          expect(res.body.message).toBe('Invalid credentials.');
        });
    });

    it('should fail with invalid password', () => {
      return request(app.getHttpServer())
        .post('/auth/login')
        .send({
          email: 'login@example.com',
          password: 'wrongpassword',
        })
        .expect(401)
        .expect((res) => {
          expect(res.body.message).toBe('Invalid credentials.');
        });
    });
  });

  describe('/auth/me (GET)', () => {
    let accessToken: string;

    beforeEach(async () => {
      await request(app.getHttpServer()).post('/auth/register').send({
        email: 'me@example.com',
        password: 'password123',
        name: 'Me User',
      });

      const loginRes = await request(app.getHttpServer())
        .post('/auth/login')
        .send({
          email: 'me@example.com',
          password: 'password123',
        });

      accessToken = loginRes.body.data.accessToken;
    });

    it('should get user profile with valid token', () => {
      return request(app.getHttpServer())
        .get('/auth/me')
        .set('Authorization', `Bearer ${accessToken}`)
        .expect(200)
        .expect((res) => {
          expect(res.body.success).toBe(true);
          expect(res.body.data.user.email).toBe('me@example.com');
        });
    });

    it('should fail without token', () => {
      return request(app.getHttpServer()).get('/auth/me').expect(401);
    });

    it('should fail with invalid token', () => {
      return request(app.getHttpServer())
        .get('/auth/me')
        .set('Authorization', 'Bearer invalid-token')
        .expect(401);
    });
  });
});
