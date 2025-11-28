import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Query,
} from '@nestjs/common';
import { Roles } from '../../../common/decorators/roles/roles.decorator';
import { CurrentUser } from '../../../common/decorators/user/user.decorator';
import { AuthUser } from '../../auth/interfaces/jwt-payload.interface';
import { CreateSimulationDto } from '../dto/create-simulation.dto';
import { QuerySimulationDto } from '../dto/query-simulation.dto';
import { UpdateSimulationDto } from '../dto/update-simulation.dto';
import { SimulationsService } from '../services/simulations.service';

@Controller('simulations')
export class SimulationsController {
  constructor(private readonly simulationsService: SimulationsService) {}

  @Post()
  @Roles('ADMIN', 'OPERATOR')
  create(@Body() dto: CreateSimulationDto, @CurrentUser() user: AuthUser) {
    return this.simulationsService.create(dto, user.id);
  }

  @Get()
  findAll(@Query() query: QuerySimulationDto) {
    return this.simulationsService.findAll(query);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.simulationsService.findOne(id);
  }

  @Get(':id/schedule')
  getSchedule(@Param('id') id: string) {
    return this.simulationsService.getSchedule(id);
  }

  @Patch(':id')
  @Roles('ADMIN', 'OPERATOR')
  update(@Param('id') id: string, @Body() dto: UpdateSimulationDto) {
    return this.simulationsService.update(id, dto);
  }

  @Delete(':id')
  @Roles('ADMIN')
  remove(@Param('id') id: string) {
    return this.simulationsService.remove(id);
  }
}
