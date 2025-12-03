import { INestApplication, ValidationPipe } from '@nestjs/common';
import * as request from 'supertest';
import { HttpExceptionFilter } from '../src/common/filters/http-exception.filter';
import { TransformInterceptor } from '../src/common/interceptors/transform.interceptor';
import { PrismaService } from '../src/database/prisma/prisma.service';

export function setupApp(app: INestApplication): INestApplication {
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }),
  );

  app.useGlobalFilters(new HttpExceptionFilter());
  app.useGlobalInterceptors(new TransformInterceptor());

  return app;
}

export async function cleanupDatabase(prisma: PrismaService): Promise<void> {
  await prisma.installmentSchedule.deleteMany();
  await prisma.simulation.deleteMany();
  await prisma.customer.deleteMany();
  await prisma.user.deleteMany();
}

export async function createAndLoginUser(
  app: INestApplication,
  email: string,
  password: string,
  name: string,
  role: string,
): Promise<string> {
  await request(app.getHttpServer()).post('/auth/register').send({
    email,
    password,
    name,
    role,
  });

  const res = await request(app.getHttpServer())
    .post('/auth/login')
    .send({ email, password });

  return res.body.data.accessToken;
}
