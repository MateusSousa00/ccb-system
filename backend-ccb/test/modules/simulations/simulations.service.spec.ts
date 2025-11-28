import { BadRequestException, NotFoundException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { SimulationStatus } from '@prisma/client';
import { PrismaService } from '../../../src/database/prisma/prisma.service';
import { CreateSimulationDto } from '../../../src/modules/simulations/dto/create-simulation.dto';
import { LoanCalculatorService } from '../../../src/modules/simulations/services/loan-calculator.service';
import { SimulationsService } from '../../../src/modules/simulations/services/simulations.service';

describe('SimulationsService', () => {
  let service: SimulationsService;
  let prisma: PrismaService;
  let calculator: LoanCalculatorService;

  const mockPrismaService = {
    customer: {
      findUnique: jest.fn(),
    },
    simulation: {
      create: jest.fn(),
      findMany: jest.fn(),
      count: jest.fn(),
      findUnique: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
    },
    installmentSchedule: {
      createMany: jest.fn(),
    },
  };

  const mockLoanCalculatorService = {
    calculate: jest.fn(),
    generateSchedule: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        SimulationsService,
        {
          provide: PrismaService,
          useValue: mockPrismaService,
        },
        {
          provide: LoanCalculatorService,
          useValue: mockLoanCalculatorService,
        },
      ],
    }).compile();

    service = module.get<SimulationsService>(SimulationsService);
    prisma = module.get<PrismaService>(PrismaService);
    calculator = module.get<LoanCalculatorService>(LoanCalculatorService);

    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('create', () => {
    const createDto: CreateSimulationDto = {
      customerId: 'customer-123',
      requestedAmount: 10000,
      installments: 12,
    };

    const mockCustomer = {
      id: 'customer-123',
      name: 'João Silva',
      cpf: '123.456.789-00',
      interestRate: 12.5,
    };

    const mockCalculation = {
      requestedAmount: 10000,
      installments: 12,
      interestRate: 12.5,
      installmentValue: 888.49,
      totalAmount: 10661.88,
      totalInterest: 661.88,
    };

    const mockSchedule = [
      {
        installmentNumber: 1,
        dueDate: new Date(),
        principal: 788.49,
        interest: 100,
        total: 888.49,
        balance: 9211.51,
      },
    ];

    it('should create simulation successfully', async () => {
      mockPrismaService.customer.findUnique.mockResolvedValue(mockCustomer);
      mockLoanCalculatorService.calculate.mockReturnValue(mockCalculation);
      mockLoanCalculatorService.generateSchedule.mockReturnValue(mockSchedule);
      mockPrismaService.simulation.create.mockResolvedValue({
        id: 'sim-123',
        ...mockCalculation,
        customerId: createDto.customerId,
        createdById: 'user-123',
        status: SimulationStatus.PENDING,
        createdAt: new Date(),
      });
      mockPrismaService.installmentSchedule.createMany.mockResolvedValue({
        count: 1,
      });

      const result = await service.create(createDto, 'user-123');

      expect(result).toHaveProperty(
        'message',
        'Simulation created successfully',
      );
      expect(result).toHaveProperty('simulation');
      expect(mockLoanCalculatorService.calculate).toHaveBeenCalledWith(
        10000,
        12,
        12.5,
      );
      expect(
        mockPrismaService.installmentSchedule.createMany,
      ).toHaveBeenCalled();
    });

    it('should throw NotFoundException if customer not found', async () => {
      mockPrismaService.customer.findUnique.mockResolvedValue(null);

      await expect(service.create(createDto, 'user-123')).rejects.toThrow(
        NotFoundException,
      );
      await expect(service.create(createDto, 'user-123')).rejects.toThrow(
        'Customer not found',
      );
    });

    it('should throw BadRequestException if amount is too low', async () => {
      const lowAmountDto = { ...createDto, requestedAmount: 50 };
      mockPrismaService.customer.findUnique.mockResolvedValue(mockCustomer);

      await expect(service.create(lowAmountDto, 'user-123')).rejects.toThrow(
        BadRequestException,
      );
      await expect(service.create(lowAmountDto, 'user-123')).rejects.toThrow(
        'Minimum loan amount is R$ 100',
      );
    });

    it('should throw BadRequestException if installments invalid', async () => {
      const invalidInstallmentsDto = { ...createDto, installments: 0 };
      mockPrismaService.customer.findUnique.mockResolvedValue(mockCustomer);

      await expect(
        service.create(invalidInstallmentsDto, 'user-123'),
      ).rejects.toThrow(BadRequestException);
    });

    it('should use customer interest rate', async () => {
      mockPrismaService.customer.findUnique.mockResolvedValue(mockCustomer);
      mockLoanCalculatorService.calculate.mockReturnValue(mockCalculation);
      mockLoanCalculatorService.generateSchedule.mockReturnValue(mockSchedule);
      mockPrismaService.simulation.create.mockResolvedValue({
        id: 'sim-123',
        ...mockCalculation,
      });
      mockPrismaService.installmentSchedule.createMany.mockResolvedValue({
        count: 1,
      });

      await service.create(createDto, 'user-123');

      // Verifica que usou a taxa do customer (12.5)
      expect(mockLoanCalculatorService.calculate).toHaveBeenCalledWith(
        10000,
        12,
        12.5,
      );
    });
  });

  describe('findAll', () => {
    it('should return paginated simulations', async () => {
      const mockSimulations = [
        {
          id: 'sim-1',
          requestedAmount: 10000,
          installments: 12,
          status: SimulationStatus.PENDING,
        },
      ];

      mockPrismaService.simulation.findMany.mockResolvedValue(mockSimulations);
      mockPrismaService.simulation.count.mockResolvedValue(1);

      const result = await service.findAll({
        page: 1,
        limit: 10,
        sortBy: 'createdAt',
        sortOrder: 'desc',
      });

      expect(result.data).toEqual(mockSimulations);
      expect(result.meta).toEqual({
        total: 1,
        page: 1,
        limit: 10,
        totalPages: 1,
      });
    });

    it('should filter by customerId', async () => {
      mockPrismaService.simulation.findMany.mockResolvedValue([]);
      mockPrismaService.simulation.count.mockResolvedValue(0);

      await service.findAll({
        page: 1,
        limit: 10,
        customerId: 'customer-123',
        sortBy: 'createdAt',
        sortOrder: 'desc',
      });

      expect(mockPrismaService.simulation.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({
            customerId: 'customer-123',
          }),
        }),
      );
    });

    it('should filter by status', async () => {
      mockPrismaService.simulation.findMany.mockResolvedValue([]);
      mockPrismaService.simulation.count.mockResolvedValue(0);

      await service.findAll({
        page: 1,
        limit: 10,
        status: SimulationStatus.APPROVED,
        sortBy: 'createdAt',
        sortOrder: 'desc',
      });

      expect(mockPrismaService.simulation.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({
            status: SimulationStatus.APPROVED,
          }),
        }),
      );
    });
  });

  describe('findOne', () => {
    it('should return simulation with schedule', async () => {
      const mockSimulation = {
        id: 'sim-123',
        requestedAmount: 10000,
        schedule: [
          {
            installmentNumber: 1,
            total: 888.49,
          },
        ],
      };

      mockPrismaService.simulation.findUnique.mockResolvedValue(mockSimulation);

      const result = await service.findOne('sim-123');

      expect(result).toEqual(mockSimulation);
      expect(result.schedule).toHaveLength(1);
    });

    it('should throw NotFoundException if not found', async () => {
      mockPrismaService.simulation.findUnique.mockResolvedValue(null);

      await expect(service.findOne('non-existent')).rejects.toThrow(
        NotFoundException,
      );
      await expect(service.findOne('non-existent')).rejects.toThrow(
        'Simulation not found',
      );
    });
  });

  describe('update', () => {
    it('should update simulation status', async () => {
      const mockSimulation = {
        id: 'sim-123',
        status: SimulationStatus.PENDING,
      };

      mockPrismaService.simulation.findUnique.mockResolvedValue(mockSimulation);
      mockPrismaService.simulation.update.mockResolvedValue({
        ...mockSimulation,
        status: SimulationStatus.APPROVED,
      });

      const result = await service.update('sim-123', {
        status: SimulationStatus.APPROVED,
      });

      expect(result).toHaveProperty(
        'message',
        'Simulation updated successfully',
      );
      expect(result.simulation.status).toBe(SimulationStatus.APPROVED);
    });
  });

  describe('remove', () => {
    it('should delete simulation', async () => {
      const mockSimulation = {
        id: 'sim-123',
      };

      mockPrismaService.simulation.findUnique.mockResolvedValue(mockSimulation);
      mockPrismaService.simulation.delete.mockResolvedValue(mockSimulation);

      const result = await service.remove('sim-123');

      expect(result).toHaveProperty(
        'message',
        'Simulation deleted successfully',
      );
      expect(mockPrismaService.simulation.delete).toHaveBeenCalledWith({
        where: { id: 'sim-123' },
      });
    });
  });
});
