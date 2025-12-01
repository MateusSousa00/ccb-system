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
import { CreateCustomerDto } from '../dto/create-customer.dto';
import { QueryCustomerDto } from '../dto/query-customer.dto';
import { UpdateCustomerDto } from '../dto/update-customer.dto';
import { CustomerService } from '../services/customer.service';
import { ApiOperation, ApiParam, ApiResponse } from '@nestjs/swagger';

@Controller('customer')
export class CustomerController {
  constructor(private readonly customerService: CustomerService) {}

  @Post()
  @Roles('ADMIN', 'OPERATOR')
  @ApiOperation({
    summary: 'Create new client',
    description:
      'Register a new customer in the system with personal, financial data and risk category. ' +
      'Requires authentication and role ADMIN or OPERATOR.',
  })
  @ApiResponse({
    status: 201,
    description: 'Client created successfully',
  })
  @ApiResponse({
    status: 400,
    description: 'Invalid data or CPF already registered',
  })
  @ApiResponse({ status: 401, description: 'Not authenticated' })
  @ApiResponse({
    status: 403,
    description: 'Forbidden (must be ADMIN or OPERATOR)',
  })
  create(@Body() dto: CreateCustomerDto) {
    return this.customerService.create(dto);
  }

  @Get()
  @ApiOperation({
    summary: 'List all customers',
    description: 'Returns paginated list of customers with optional filters',
  })
  @ApiResponse({
    status: 200,
    description: 'Customer list returned successfully',
  })
  @ApiResponse({ status: 401, description: 'Not Authenticated' })
  findAll(@Query() query: QueryCustomerDto) {
    return this.customerService.findAll(query);
  }

  @Get(':id')
  @ApiOperation({
    summary: 'Search customer by ID',
    description: 'Returns the full details of a specific customer',
  })
  @ApiParam({
    name: 'id',
    description: 'client UUID',
    example: 'a1b2c3d4-e5f6-7890-abcd-ef1234567890',
  })
  @ApiResponse({
    status: 200,
    description: 'Client found successfully',
  })
  @ApiResponse({ status: 401, description: 'Not authenticated' })
  @ApiResponse({ status: 404, description: 'Not Found' })
  findOne(@Param('id') id: string) {
    return this.customerService.findOne(id);
  }

  @Patch(':id')
  @Roles('ADMIN', 'OPERATOR')
  @ApiOperation({
    summary: 'Update customer data',
    description:
      'Updates information for an existing customer. Requires authentication and role ADMIN or OPERATOR.',
  })
  @ApiParam({
    name: 'id',
    description: 'client UUID',
    example: 'a1b2c3d4-e5f6-7890-abcd-ef1234567890',
  })
  @ApiResponse({
    status: 200,
    description: 'Client updated successfully',
  })
  @ApiResponse({ status: 400, description: 'Bad Request' })
  @ApiResponse({ status: 401, description: 'Not authenticated' })
  @ApiResponse({
    status: 403,
    description: 'Forbidden (must be ADMIN or OPERATOR)',
  })
  @ApiResponse({ status: 404, description: 'Not Found' })
  update(@Param('id') id: string, @Body() dto: UpdateCustomerDto) {
    return this.customerService.update(id, dto);
  }

  @Delete(':id')
  @Roles('ADMIN')
  @ApiOperation({
    summary: 'Delete client',
    description:
      'Permanently removes a client from the system. Requires ADMIN role.',
  })
  @ApiParam({
    name: 'id',
    description: 'client UUID',
    example: 'a1b2c3d4-e5f6-7890-abcd-ef1234567890',
  })
  @ApiResponse({
    status: 200,
    description: 'Client deleted successfully',
  })
  @ApiResponse({ status: 401, description: 'Not authenticated' })
  @ApiResponse({ status: 403, description: 'Forbidden (requires ADMIN)' })
  @ApiResponse({ status: 404, description: 'Not Found' })
  remove(@Param('id') id: string) {
    return this.customerService.remove(id);
  }
}
