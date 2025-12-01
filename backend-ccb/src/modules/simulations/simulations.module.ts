import { Module } from '@nestjs/common';
import { SimulationsController } from './controllers/simulations.controller';
import { LoanCalculatorService } from './services/loan-calculator.service';
import { SimulationsService } from './services/simulations.service';
import { CcbController } from './controllers/ccb.controller';
import { CcbGeneratorService } from './services/ccb-generator.service';

@Module({
  controllers: [SimulationsController, CcbController],
  providers: [SimulationsService, LoanCalculatorService, CcbGeneratorService],
  exports: [SimulationsService],
})
export class SimulationsModule {}
