import { Module } from '@nestjs/common';
import { CustomerController } from './controller/customer.controller';
import { CustomerService } from './service/customer.service';

@Module({
  controllers: [CustomerController],
  providers: [CustomerService],
  exports: [CustomerService],
})
export class CustomerModule {}
