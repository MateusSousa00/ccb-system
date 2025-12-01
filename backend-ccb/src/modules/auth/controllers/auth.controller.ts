import { Body, Controller, Get, Post } from '@nestjs/common';
import { Public } from '../../../common/decorators/public/public.decorator';
import { CurrentUser } from '../../../common/decorators/user/user.decorator';
import { LoginDto } from '../dto/login.dto';
import { RegisterDto } from '../dto/register.dto';
import { AuthUser } from '../interfaces/jwt-payload.interface';
import { AuthService } from '../services/auth.service';
import { ApiBearerAuth, ApiOperation, ApiResponse } from '@nestjs/swagger';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Public()
  @ApiOperation({
    summary: 'Register new user',
    description:
      'Create a new user account on the system. Public endpoint (does not require authentication).',
  })
  @ApiResponse({
    status: 201,
    description: 'User registered successfully',
    schema: {
      example: {
        success: true,
        date: {
          user: {
            id: 'uuid',
            name: 'João Silva',
            email: 'joao@email.com',
            role: 'OPERATOR',
            createdAt: '2024-01-01T00:00:00.000Z',
          },
          access_token: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...',
        },
      },
    },
  })
  @ApiResponse({
    status: 400,
    description: 'Bad Request',
  })
  @Post('register')
  async register(@Body() dto: RegisterDto) {
    return this.authService.register(dto);
  }

  @Public()
  @ApiOperation({
    summary: 'Log in',
    description:
      'Authenticates a user and returns a JWT token for access to protected endpoints. ' +
      'Public endpoint (does not require prior authentication).',
  })
  @ApiResponse({
    status: 200,
    description: 'Login successful',
    schema: {
      example: {
        success: true,
        date: {
          user: {
            id: 'uuid',
            name: 'João Silva',
            email: 'joao@email.com',
            role: 'OPERATOR',
          },
          access_token: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...',
        },
      },
    },
  })
  @ApiResponse({ status: 401, description: 'Not Authenticated' })
  @Post('login')
  async login(@Body() dto: LoginDto) {
    return this.authService.login(dto);
  }

  @Get('me')
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({
    summary: 'Get authenticated user profile',
    description:
      'Returns the data of the currently logged in user. Requires JWT authentication.',
  })
  @ApiResponse({
    status: 200,
    description: 'Profile returned successfully',
    schema: {
      example: {
        user: {
          id: 'uuid',
          email: 'joao@email.com',
          role: 'OPERATOR',
        },
      },
    },
  })
  @ApiResponse({ status: 401, description: 'Not authenticated' })
  getProfile(@CurrentUser() user: AuthUser) {
    return {
      user,
    };
  }
}
