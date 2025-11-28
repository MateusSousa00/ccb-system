import { Module } from '@nestjs/common';
import { SimulationsController } from './controllers/simulations.controller';
import { LoanCalculatorService } from './services/loan-calculator.service';
import { SimulationsService } from './services/simulations.service';

@Module({
  controllers: [SimulationsController],
  providers: [SimulationsService, LoanCalculatorService],
  exports: [SimulationsService],
})
export class SimulationsModule {}
