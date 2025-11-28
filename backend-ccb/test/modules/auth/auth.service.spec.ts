import { ConflictException, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { Test, TestingModule } from '@nestjs/testing';
import * as bcrypt from 'bcrypt';
import { PrismaService } from '../../../src/database/prisma/prisma.service';
import { LoginDto } from '../../../src/modules/auth/dto/login.dto';
import { RegisterDto } from '../../../src/modules/auth/dto/register.dto';
import { AuthService } from '../../../src/modules/auth/services/auth.service';

describe('AuthService', () => {
  let service: AuthService;
  let prisma: PrismaService;
  let jwtService: JwtService;

  const mockPrismaService = {
    user: {
      findUnique: jest.fn(),
      create: jest.fn(),
    },
  };

  const mockJwtService = {
    signAsync: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        {
          provide: PrismaService,
          useValue: mockPrismaService,
        },
        {
          provide: JwtService,
          useValue: mockJwtService,
        },
      ],
    }).compile();

    service = module.get<AuthService>(AuthService);
    prisma = module.get<PrismaService>(PrismaService);
    jwtService = module.get<JwtService>(JwtService);

    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('register', () => {
    const registerDto: RegisterDto = {
      email: 'test@example.com',
      name: 'John Doe',
      password: 'password123',
      role: 'OPERATOR',
    };

    it('should successfully register a new user', async () => {
      mockPrismaService.user.findUnique.mockResolvedValue(null);
      mockPrismaService.user.create.mockResolvedValue({
        id: '123',
        email: registerDto.email,
        name: registerDto.name,
        role: 'OPERATOR',
        createdAt: new Date(),
      });

      const result = await service.register(registerDto);

      expect(result).toHaveProperty('message', 'User registered successfully');
      expect(result).toHaveProperty('user');
      expect(mockPrismaService.user.create).toHaveBeenCalledWith(
        expect.objectContaining({
          // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
          data: expect.objectContaining({
            email: registerDto.email,
            name: registerDto.name,
          }),
        }),
      );
    });

    it('should throw ConflictException if email already exists', async () => {
      mockPrismaService.user.findUnique.mockResolvedValue({
        id: '123',
        email: registerDto.email,
      });

      await expect(service.register(registerDto)).rejects.toThrow(
        ConflictException,
      );

      await expect(service.register(registerDto)).rejects.toThrow(
        'Email already registered',
      );
    });

    it('should hash password before storing', async () => {
      mockPrismaService.user.findUnique.mockResolvedValue(null);
      mockPrismaService.user.create.mockResolvedValue({
        id: '123',
        email: registerDto.email,
        name: registerDto.name,
        role: 'OPERATOR',
        createdAt: new Date(),
      });

      const bcryptHashSpy = jest.spyOn(bcrypt, 'hash');

      await service.register(registerDto);

      expect(bcryptHashSpy).toHaveBeenCalledWith(registerDto.password, 10);
    });
  });

  describe('login', () => {
    const loginDto: LoginDto = {
      email: 'test@example',
      password: 'password123',
    };

    const mockUser = {
      id: '123',
      email: loginDto.email,
      password: 'hashedPassword',
      name: 'Mary Ann',
      role: 'OPERATOR',
    };

    it('should successfully login with valid credentials', async () => {
      mockPrismaService.user.findUnique.mockResolvedValue(mockUser);
      jest.spyOn(bcrypt, 'compare').mockResolvedValue(true as never);
      mockJwtService.signAsync.mockResolvedValue('jwt-token');

      const result = await service.login(loginDto);

      expect(result).toHaveProperty('accessToken', 'jwt-token');
      expect(result).toHaveProperty('user');
      expect(result.user.email).toBe(loginDto.email);
    });

    it('should throw UnauthorizedException if user not found', async () => {
      mockPrismaService.user.findUnique.mockResolvedValue(null);

      await expect(service.login(loginDto)).rejects.toThrow(
        UnauthorizedException,
      );
      await expect(service.login(loginDto)).rejects.toThrow(
        'Invalid credentials.',
      );
    });

    it('should throw UnauthorizedException if password is invalid', async () => {
      mockPrismaService.user.findUnique.mockResolvedValue(mockUser);
      jest.spyOn(bcrypt, 'compare').mockResolvedValue(false as never);

      await expect(service.login(loginDto)).rejects.toThrow(
        UnauthorizedException,
      );
      await expect(service.login(loginDto)).rejects.toThrow(
        'Invalid credentials.',
      );
    });

    it('should generate JWT with correct payload', async () => {
      mockPrismaService.user.findUnique.mockResolvedValue(mockUser);
      jest.spyOn(bcrypt, 'compare').mockResolvedValue(true as never);
      mockJwtService.signAsync.mockResolvedValue('jwt-token');

      await service.login(loginDto);

      expect(mockJwtService.signAsync).toHaveBeenCalledWith({
        sub: mockUser.id,
        email: mockUser.email,
        role: mockUser.role,
      });
    });
  });

  describe('validateUser', () => {
    it('should return user without password', async () => {
      const mockUser = {
        id: '123',
        email: 'test@example.com',
        name: 'Bob Bryan',
        role: 'OPERATOR',
      };

      mockPrismaService.user.findUnique.mockResolvedValue(mockUser);

      const result = await service.validateUser('123');

      expect(result).toEqual(mockUser);
      expect(result).not.toHaveProperty('password');
    });

    it('should return null if user not found', async () => {
      mockPrismaService.user.findUnique.mockResolvedValue(null);

      const result = await service.validateUser('999');

      expect(result).toBeNull();
    });
  });
});
