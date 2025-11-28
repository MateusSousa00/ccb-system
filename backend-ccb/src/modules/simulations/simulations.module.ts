import { Module } from '@nestjs/common';
import { SimulationsController } from './controllers/simulations.controller';
import { SimulationsService } from './services/simulations.service';

@Module({
  controllers: [SimulationsController],
  providers: [SimulationsService],
})
export class SimulationsModule {}
