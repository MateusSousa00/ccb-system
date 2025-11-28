import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from '../../../database/prisma/prisma.service';
import { CreateSimulationDto } from '../dto/create-simulation.dto';
import { QuerySimulationDto } from '../dto/query-simulation.dto';
import { UpdateSimulationDto } from '../dto/update-simulation.dto';
import { LoanCalculatorService } from './loan-calculator.service';

@Injectable()
export class SimulationsService {
  constructor(
    private prisma: PrismaService,
    private calculator: LoanCalculatorService,
  ) {}

  async create(dto: CreateSimulationDto, createdById: string) {
    const customer = await this.prisma.customer.findUnique({
      where: { id: dto.customerId },
    });

    if (!customer) {
      throw new NotFoundException('Customer not found');
    }

    if (dto.requestedAmount < 100) {
      throw new BadRequestException('Minimum loan amount is R$ 100');
    }

    if (dto.installments < 1 || dto.installments > 360) {
      throw new BadRequestException('Installments must be between 1 and 360');
    }

    const calculation = this.calculator.calculate(
      dto.requestedAmount,
      dto.installments,
      Number(customer.interestRate), // Decimal → number
    );

    // 4. Criar simulação no banco
    const simulation = await this.prisma.simulation.create({
      data: {
        customerId: dto.customerId,
        createdById,
        requestedAmount: calculation.requestedAmount,
        installments: calculation.installments,
        interestRate: calculation.interestRate,
        installmentValue: calculation.installmentValue,
        totalAmount: calculation.totalAmount,
        totalInterest: calculation.totalInterest,
        status: 'PENDING',
      },
      include: {
        customer: {
          select: {
            id: true,
            name: true,
            cpf: true,
            email: true,
          },
        },
        createdBy: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
    });

    const schedule = this.calculator.generateSchedule(calculation);

    await this.prisma.installmentSchedule.createMany({
      data: schedule.map((item) => ({
        simulationId: simulation.id,
        installmentNumber: item.installmentNumber,
        dueDate: item.dueDate,
        principal: item.principal,
        interest: item.interest,
        total: item.total,
        balance: item.balance,
      })),
    });

    return {
      message: 'Simulation created successfully',
      simulation,
    };
  }

  async findAll(query: QuerySimulationDto) {
    const { page, limit, customerId, createdById, status, sortBy, sortOrder } =
      query;

    const skip = (page - 1) * limit;

    const where: Prisma.SimulationWhereInput = {};

    if (customerId) {
      where.customerId = customerId;
    }

    if (createdById) {
      where.createdById = createdById;
    }

    if (status) {
      where.status = status;
    }

    const orderBy: Prisma.SimulationOrderByWithRelationInput = {
      [sortBy]: sortOrder,
    };

    const [simulations, total] = await Promise.all([
      this.prisma.simulation.findMany({
        where,
        skip,
        take: limit,
        orderBy,
        include: {
          customer: {
            select: {
              id: true,
              name: true,
              cpf: true,
            },
          },
          createdBy: {
            select: {
              id: true,
              name: true,
              email: true,
            },
          },
        },
      }),
      this.prisma.simulation.count({ where }),
    ]);

    return {
      data: simulations,
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  async findOne(id: string) {
    const simulation = await this.prisma.simulation.findUnique({
      where: { id },
      include: {
        customer: {
          select: {
            id: true,
            name: true,
            cpf: true,
            email: true,
            phone: true,
            creditScore: true,
            monthlyIncome: true,
            riskCategory: true,
          },
        },
        createdBy: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
        schedule: {
          orderBy: {
            installmentNumber: 'asc',
          },
        },
      },
    });

    if (!simulation) {
      throw new NotFoundException('Simulation not found');
    }

    return simulation;
  }

  async update(id: string, dto: UpdateSimulationDto) {
    await this.findOne(id);

    const simulation = await this.prisma.simulation.update({
      where: { id },
      data: dto,
      include: {
        customer: {
          select: {
            id: true,
            name: true,
            cpf: true,
          },
        },
      },
    });

    return {
      message: 'Simulation updated successfully',
      simulation,
    };
  }

  async remove(id: string) {
    await this.findOne(id);

    // Cascade delete: InstallmentSchedule será deletado automaticamente (schema: onDelete: Cascade)
    await this.prisma.simulation.delete({
      where: { id },
    });

    return {
      message: 'Simulation deleted successfully',
    };
  }

  async getSchedule(id: string) {
    const simulation = await this.findOne(id);

    return {
      simulation: {
        id: simulation.id,
        requestedAmount: simulation.requestedAmount,
        installments: simulation.installments,
        installmentValue: simulation.installmentValue,
        totalAmount: simulation.totalAmount,
        totalInterest: simulation.totalInterest,
      },
      schedule: simulation.schedule,
    };
  }
}
