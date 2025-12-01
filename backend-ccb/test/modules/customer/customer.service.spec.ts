import { ConflictException, NotFoundException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { RiskCategory } from '@prisma/client';
import { PrismaService } from '../../../src/database/prisma/prisma.service';
import { CreateCustomerDto } from '../../../src/modules/customer/dto/create-customer.dto';
import { QueryCustomerDto } from '../../../src/modules/customer/dto/query-customer.dto';
import { UpdateCustomerDto } from '../../../src/modules/customer/dto/update-customer.dto';
import { CustomerService } from '../../../src/modules/customer/services/customer.service';

describe('CustomerService', () => {
  let service: CustomerService;
  let prisma: PrismaService;

  const mockPrismaService = {
    customer: {
      findUnique: jest.fn(),
      findMany: jest.fn(),
      count: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
    },
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CustomerService,
        {
          provide: PrismaService,
          useValue: mockPrismaService,
        },
      ],
    }).compile();

    service = module.get<CustomerService>(CustomerService);
    prisma = module.get<PrismaService>(PrismaService);

    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('create', () => {
    const createDto: CreateCustomerDto = {
      name: 'João da Silva',
      cpf: '123.456.789-00',
      email: 'joao@example.com',
      phone: '(11) 98765-4321',
      interestRate: 12.5,
      creditScore: 750,
      monthlyIncome: 5000,
      riskCategory: RiskCategory.LOW,
    };

    it('should create a customer successfully', async () => {
      const mockCustomer = {
        id: 'uuid-123',
        ...createDto,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      mockPrismaService.customer.findUnique.mockResolvedValue(null);
      mockPrismaService.customer.create.mockResolvedValue(mockCustomer);

      const result = await service.create(createDto);

      expect(result).toHaveProperty('message', 'Customer created successfully');
      expect(result).toHaveProperty('customer');
      expect(result.customer.name).toBe(createDto.name);
      expect(mockPrismaService.customer.findUnique).toHaveBeenCalledWith({
        where: { cpf: createDto.cpf },
      });
      expect(mockPrismaService.customer.create).toHaveBeenCalledWith({
        data: createDto,
      });
    });

    it('should throw ConflictException if CPF already exists', async () => {
      mockPrismaService.customer.findUnique.mockResolvedValue({
        id: 'existing-id',
        cpf: createDto.cpf,
      });

      await expect(service.create(createDto)).rejects.toThrow(
        ConflictException,
      );
      await expect(service.create(createDto)).rejects.toThrow(
        'CPF already registered',
      );
      expect(mockPrismaService.customer.create).not.toHaveBeenCalled();
    });
  });

  describe('findAll', () => {
    const queryDto: QueryCustomerDto = {
      page: 1,
      limit: 10,
      sortBy: 'createdAt',
      sortOrder: 'desc',
    };

    it('should return paginated customers', async () => {
      const mockCustomers = [
        {
          id: '1',
          name: 'Customer 1',
          cpf: '111.111.111-11',
          email: 'c1@example.com',
          interestRate: 10,
          creditScore: 700,
          monthlyIncome: 4000,
          riskCategory: RiskCategory.LOW,
        },
        {
          id: '2',
          name: 'Customer 2',
          cpf: '222.222.222-22',
          email: 'c2@example.com',
          interestRate: 15,
          creditScore: 600,
          monthlyIncome: 3000,
          riskCategory: RiskCategory.MEDIUM,
        },
      ];

      mockPrismaService.customer.findMany.mockResolvedValue(mockCustomers);
      mockPrismaService.customer.count.mockResolvedValue(2);

      const result = await service.findAll(queryDto);

      expect(result.data).toEqual(mockCustomers);
      expect(result.meta).toEqual({
        total: 2,
        page: 1,
        limit: 10,
        totalPages: 1,
      });
      expect(mockPrismaService.customer.findMany).toHaveBeenCalledWith({
        where: {},
        skip: 0,
        take: 10,
        orderBy: {
          createdAt: 'desc',
        },
      });
    });

    it('should filter by name', async () => {
      const queryWithName: QueryCustomerDto = {
        ...queryDto,
        name: 'João',
      };

      mockPrismaService.customer.findMany.mockResolvedValue([]);
      mockPrismaService.customer.count.mockResolvedValue(0);

      await service.findAll(queryWithName);

      expect(mockPrismaService.customer.findMany).toHaveBeenCalledWith({
        where: {
          name: {
            contains: 'João',
            mode: 'insensitive',
          },
        },
        skip: 0,
        take: 10,
        orderBy: {
          createdAt: 'desc',
        },
      });
    });

    it('should filter by CPF', async () => {
      const queryWithCpf: QueryCustomerDto = {
        ...queryDto,
        cpf: '123.456.789-00',
      };

      mockPrismaService.customer.findMany.mockResolvedValue([]);
      mockPrismaService.customer.count.mockResolvedValue(0);

      await service.findAll(queryWithCpf);

      expect(mockPrismaService.customer.findMany).toHaveBeenCalledWith({
        where: {
          cpf: '123.456.789-00',
        },
        skip: 0,
        take: 10,
        orderBy: {
          createdAt: 'desc',
        },
      });
    });

    it('should filter by riskCategory', async () => {
      const queryWithRisk: QueryCustomerDto = {
        ...queryDto,
        riskCategory: RiskCategory.HIGH,
      };

      mockPrismaService.customer.findMany.mockResolvedValue([]);
      mockPrismaService.customer.count.mockResolvedValue(0);

      await service.findAll(queryWithRisk);

      expect(mockPrismaService.customer.findMany).toHaveBeenCalledWith({
        where: {
          riskCategory: RiskCategory.HIGH,
        },
        skip: 0,
        take: 10,
        orderBy: {
          createdAt: 'desc',
        },
      });
    });

    it('should calculate pagination correctly', async () => {
      const queryPage2: QueryCustomerDto = {
        page: 2,
        limit: 5,
        sortBy: 'createdAt',
        sortOrder: 'desc',
      };

      mockPrismaService.customer.findMany.mockResolvedValue([]);
      mockPrismaService.customer.count.mockResolvedValue(15);

      const result = await service.findAll(queryPage2);

      expect(result.meta).toEqual({
        total: 15,
        page: 2,
        limit: 5,
        totalPages: 3,
      });
      expect(mockPrismaService.customer.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          skip: 5, // (page 2 - 1) * limit 5
          take: 5,
        }),
      );
    });
  });

  describe('findOne', () => {
    it('should return a customer with simulations', async () => {
      const mockCustomer = {
        id: 'uuid-123',
        name: 'João da Silva',
        cpf: '123.456.789-00',
        email: 'joao@example.com',
        phone: '(11) 98765-4321',
        interestRate: 12.5,
        creditScore: 750,
        monthlyIncome: 5000,
        riskCategory: RiskCategory.LOW,
        createdAt: new Date(),
        updatedAt: new Date(),
        simulations: [
          {
            id: 'sim-1',
            requestedAmount: 10000,
            interestRate: 12.5,
            installments: 12,
            status: 'PENDING',
            createdAt: new Date(),
          },
        ],
      };

      mockPrismaService.customer.findUnique.mockResolvedValue(mockCustomer);

      const result = await service.findOne('uuid-123');

      expect(result).toEqual(mockCustomer);
      expect(result.simulations).toHaveLength(1);
      expect(mockPrismaService.customer.findUnique).toHaveBeenCalledWith({
        where: { id: 'uuid-123' },
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
    });

    it('should throw NotFoundException if customer not found', async () => {
      mockPrismaService.customer.findUnique.mockResolvedValue(null);

      await expect(service.findOne('non-existent-id')).rejects.toThrow(
        NotFoundException,
      );
      await expect(service.findOne('non-existent-id')).rejects.toThrow(
        'Customer not found',
      );
    });
  });

  describe('update', () => {
    const updateDto: UpdateCustomerDto = {
      creditScore: 800,
      riskCategory: RiskCategory.LOW,
    };

    it('should update a customer successfully', async () => {
      const mockExistingCustomer = {
        id: 'uuid-123',
        name: 'João da Silva',
        cpf: '123.456.789-00',
        email: 'joao@example.com',
        phone: '(11) 98765-4321',
        interestRate: 12.5,
        creditScore: 750,
        monthlyIncome: 5000,
        riskCategory: RiskCategory.MEDIUM,
        createdAt: new Date(),
        updatedAt: new Date(),
        simulations: [],
      };

      const mockUpdatedCustomer = {
        ...mockExistingCustomer,
        creditScore: 800,
        riskCategory: RiskCategory.LOW,
      };

      mockPrismaService.customer.findUnique.mockResolvedValue(
        mockExistingCustomer,
      );
      mockPrismaService.customer.update.mockResolvedValue(mockUpdatedCustomer);

      const result = await service.update('uuid-123', updateDto);

      expect(result).toHaveProperty('message', 'Customer updated successfully');
      expect(result.customer.creditScore).toBe(800);
      expect(mockPrismaService.customer.update).toHaveBeenCalledWith({
        where: { id: 'uuid-123' },
        data: updateDto,
      });
    });

    it('should throw NotFoundException if customer not found', async () => {
      mockPrismaService.customer.findUnique.mockResolvedValue(null);

      await expect(
        service.update('non-existent-id', updateDto),
      ).rejects.toThrow(NotFoundException);
    });

    it('should throw ConflictException if updating to existing CPF', async () => {
      const updateWithCpf: UpdateCustomerDto = {
        cpf: '999.999.999-99',
      };

      const mockExistingCustomer = {
        id: 'uuid-123',
        cpf: '123.456.789-00',
        name: 'João',
        email: 'joao@example.com',
        phone: '(11) 98765-4321',
        interestRate: 12.5,
        creditScore: 750,
        monthlyIncome: 5000,
        riskCategory: RiskCategory.LOW,
        createdAt: new Date(),
        updatedAt: new Date(),
        simulations: [],
      };

      const mockOtherCustomer = {
        id: 'uuid-456',
        cpf: '999.999.999-99',
        name: 'Outro',
        email: 'outro@example.com',
        phone: '(11) 11111-1111',
        interestRate: 10,
        creditScore: 600,
        monthlyIncome: 3000,
        riskCategory: RiskCategory.MEDIUM,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      mockPrismaService.customer.findUnique
        .mockResolvedValueOnce(mockExistingCustomer)
        .mockResolvedValueOnce(mockOtherCustomer);

      await expect(service.update('uuid-123', updateWithCpf)).rejects.toThrow(
        new ConflictException('CPF already registered'),
      );
    });

    it('should allow updating same customer CPF', async () => {
      const updateWithSameCpf: UpdateCustomerDto = {
        cpf: '123.456.789-00',
      };

      const mockCustomer = {
        id: 'uuid-123',
        cpf: '123.456.789-00',
        name: 'João',
      };

      mockPrismaService.customer.findUnique.mockResolvedValue(mockCustomer);
      mockPrismaService.customer.update.mockResolvedValue(mockCustomer);

      const result = await service.update('uuid-123', updateWithSameCpf);

      expect(result).toHaveProperty('message', 'Customer updated successfully');
      expect(mockPrismaService.customer.update).toHaveBeenCalled();
    });
  });

  describe('remove', () => {
    it('should delete a customer successfully', async () => {
      const mockCustomer = {
        id: 'uuid-123',
        name: 'João da Silva',
        simulations: [],
      };

      mockPrismaService.customer.findUnique.mockResolvedValue(mockCustomer);
      mockPrismaService.customer.delete.mockResolvedValue(mockCustomer);

      const result = await service.remove('uuid-123');

      expect(result).toHaveProperty('message', 'Customer deleted successfully');
      expect(mockPrismaService.customer.delete).toHaveBeenCalledWith({
        where: { id: 'uuid-123' },
      });
    });

    it('should throw NotFoundException if customer not found', async () => {
      mockPrismaService.customer.findUnique.mockResolvedValue(null);

      await expect(service.remove('non-existent-id')).rejects.toThrow(
        NotFoundException,
      );
      expect(mockPrismaService.customer.delete).not.toHaveBeenCalled();
    });
  });
});
