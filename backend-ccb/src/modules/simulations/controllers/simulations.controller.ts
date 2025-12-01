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
import { ApiOperation, ApiParam, ApiResponse } from '@nestjs/swagger';

@Controller('simulations')
export class SimulationsController {
  constructor(private readonly simulationsService: SimulationsService) {}

  @Post()
  @Roles('ADMIN', 'OPERATOR')
  @ApiOperation({
    summary: 'Create new loan simulation',
    description:
      'Create a CCB loan simulation with automatic installment calculation using Price Table. ' +
      'Requires authentication and role ADMIN or OPERATOR.',
  })
  @ApiResponse({
    status: 201,
    description: 'Simulation successfully created!',
    schema: {
      example: {
        success: true,
        data: {
          simulation: {
            id: 'uuid',
            customerId: 'uuid',
            requestedAmount: 10000,
            installments: 12,
            interestRate: 12.5,
            monthlyPayment: 895.35,
            totalAmount: 10744.2,
            totalInterest: 744.2,
            status: 'PENDING',
            createdById: 'uuid',
            createdAt: '2024-01-01T00:00:00.000Z',
            updatedAt: '2024-01-01T00:00:00.000Z',
          },
        },
      },
    },
  })
  @ApiResponse({ status: 400, description: 'Bad Request' })
  @ApiResponse({ status: 401, description: 'Not Authenticated' })
  @ApiResponse({
    status: 403,
    description: 'Forbidden (must be ADMIN or OPERATOR)',
  })
  @ApiResponse({ status: 404, description: 'Not Found' })
  create(@Body() dto: CreateSimulationDto, @CurrentUser() user: AuthUser) {
    return this.simulationsService.create(dto, user.id);
  }

  @Get()
  @ApiOperation({
    summary: 'List all simulations',
    description: 'Return paginated list of simulations with optional filters',
  })
  @ApiResponse({
    status: 200,
    description: 'Simulations List successfully returned!',
  })
  @ApiResponse({ status: 401, description: 'Not Authenticated' })
  findAll(@Query() query: QuerySimulationDto) {
    return this.simulationsService.findAll(query);
  }

  @Get(':id')
  @ApiOperation({
    summary: 'Search Simulation by ID',
    description: 'Return all details from a specific simulation.',
  })
  @ApiParam({
    name: 'id',
    description: 'Simulation UUID',
    example: 'a1b2c3d4-e5f6-7890-abcd-ef1234567890',
  })
  @ApiResponse({
    status: 200,
    description: 'Founded Simulation successfully',
  })
  @ApiResponse({ status: 401, description: 'Not Authenticated' })
  @ApiResponse({ status: 404, description: 'Not Found' })
  findOne(@Param('id') id: string) {
    return this.simulationsService.findOne(id);
  }

  @Get(':id/schedule')
  @ApiOperation({
    summary: 'Get installment schedule',
    description:
      'Returns the detailed schedule of all simulation installments (Price Table), ' +
      'including installment amount, interest, amortization and outstanding balance for each month',
  })
  @ApiParam({
    name: 'id',
    description: 'Simulation UUID',
    example: 'a1b2c3d4-e5f6-7890-abcd-ef1234567890',
  })
  @ApiResponse({
    status: 200,
    description: 'Schedule returned successfully',
    schema: {
      example: {
        success: true,
        data: {
          schedule: [
            {
              installmentNumber: 1,
              dueDate: '2024-02-01T00:00:00.000Z',
              installmentAmount: 895.35,
              principalAmount: 791.02,
              interestAmount: 104.33,
              balance: 9208.98,
            },
            // ... 11 more
          ],
        },
      },
    },
  })
  @ApiResponse({ status: 401, description: 'Not Authorized' })
  @ApiResponse({ status: 404, description: 'Not Found' })
  getSchedule(@Param('id') id: string) {
    return this.simulationsService.getSchedule(id);
  }

  @Patch(':id')
  @Roles('ADMIN', 'OPERATOR')
  @ApiOperation({
    summary: 'Update simulation status',
    description:
      'Updates the status of a simulation (PENDING, APPROVED, REJECTED, COMPLETED). ' +
      'Requires authentication and role ADMIN or OPERATOR.',
  })
  @ApiParam({
    name: 'id',
    description: 'Simulation UUID',
    example: 'a1b2c3d4-e5f6-7890-abcd-ef1234567890',
  })
  @ApiResponse({
    status: 200,
    description: 'Simulation updated successfully',
  })
  @ApiResponse({ status: 400, description: 'Bad Request' })
  @ApiResponse({ status: 401, description: 'Not Authenticated' })
  @ApiResponse({
    status: 403,
    description: 'Forbidden (must be ADMIN ou OPERATOR)',
  })
  @ApiResponse({ status: 404, description: 'Not Found' })
  update(@Param('id') id: string, @Body() dto: UpdateSimulationDto) {
    return this.simulationsService.update(id, dto);
  }

  @Delete(':id')
  @Roles('ADMIN')
  @ApiOperation({
    summary: 'Delete simulation',
    description:
      'Permanently removes a simulation from the system. Requires ADMIN role.',
  })
  @ApiParam({
    name: 'id',
    description: 'Simulation UUID',
    example: 'a1b2c3d4-e5f6-7890-abcd-ef1234567890',
  })
  @ApiResponse({
    status: 200,
    description: 'Simulation deleted successfully',
  })
  @ApiResponse({ status: 401, description: 'Not authenticated' })
  @ApiResponse({ status: 403, description: 'Forbidden (requires ADMIN)' })
  @ApiResponse({ status: 404, description: 'Not Found' })
  remove(@Param('id') id: string) {
    return this.simulationsService.remove(id);
  }
}
