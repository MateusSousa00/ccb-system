import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { PrismaService } from './database/prisma/prisma.service';
import { AuthModule } from './modules/auth/auth.module';
import { CustomerModule } from './modules/customer/customer.module';
import { SimulationsModule } from './modules/simulations/simulations.module';

@Module({
  imports: [AuthModule, CustomerModule, SimulationsModule],
  controllers: [AppController],
  providers: [AppService, PrismaService],
})
export class AppModule {}
