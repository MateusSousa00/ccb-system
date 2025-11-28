import { Controller } from '@nestjs/common';
import { SimulationsService } from '../services/simulations.service';

@Controller('simulations')
export class SimulationsController {
  constructor(private readonly simulationsService: SimulationsService) {}
}
