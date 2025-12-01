import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from '../../../database/prisma/prisma.service';
import { CreateCustomerDto } from '../dto/create-customer.dto';
import { QueryCustomerDto } from '../dto/query-customer.dto';
import { UpdateCustomerDto } from '../dto/update-customer.dto';

@Injectable()
export class CustomerService {
  constructor(private prisma: PrismaService) {}
  async create(dto: CreateCustomerDto) {
    const existingCustomer = await this.prisma.customer.findUnique({
      where: { cpf: dto.cpf },
    });

    if (existingCustomer) {
      throw new ConflictException('CPF already registered');
    }

    const customer = await this.prisma.customer.create({
      data: {
        name: dto.name,
        cpf: dto.cpf,
        email: dto.email,
        phone: dto.phone,
        interestRate: dto.interestRate,
        creditScore: dto.creditScore,
        monthlyIncome: dto.monthlyIncome,
        riskCategory: dto.riskCategory,
      },
    });

    return {
      message: 'Customer created successfully',
      customer,
    };
  }

  async findAll(query: QueryCustomerDto) {
    const { page, limit, name, cpf, riskCategory, sortBy, sortOrder } = query;

    const skip = (page - 1) * limit;

    const where: Prisma.CustomerWhereInput = {};

    if (name) {
      where.name = {
        contains: name,
        mode: 'insensitive',
      };
    }

    if (cpf) {
      where.cpf = cpf;
    }

    if (riskCategory) {
      where.riskCategory = riskCategory;
    }

    const [customers, total] = await Promise.all([
      this.prisma.customer.findMany({
        where,
        skip,
        take: limit,
        orderBy: {
          [sortBy]: sortOrder,
        },
      }),
      this.prisma.customer.count({ where }),
    ]);

    return {
      data: customers,
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  async findOne(id: string) {
    const customer = await this.prisma.customer.findUnique({
      where: { id },
      include: {
        simulations: {
          select: {
            id: true,
            requestedAmount: true,
            interestRate: true,
            installments: true,
            status: true,
            createdAt: true,
          },
        },
      },
    });

    if (!customer) {
      throw new NotFoundException('Customer not found');
    }

    return customer;
  }

  async update(id: string, dto: UpdateCustomerDto) {
    await this.findOne(id);

    if (dto.cpf) {
      const existingCustomer = await this.prisma.customer.findUnique({
        where: { cpf: dto.cpf },
      });

      if (existingCustomer && existingCustomer.id !== id) {
        throw new ConflictException('CPF already registered');
      }
    }

    const customer = await this.prisma.customer.update({
      where: { id },
      data: dto,
    });

    return {
      message: 'Customer updated successfully',
      customer,
    };
  }

  async remove(id: string) {
    await this.findOne(id);

    await this.prisma.customer.delete({
      where: { id },
    });

    return {
      message: 'Customer deleted successfully',
    };
  }
}
