import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsString } from 'class-validator';

export class LoginDto {
  @ApiProperty({
    description: 'User`s E-mail',
    example: 'admin@ccb.com',
    format: 'email',
  })
  @IsEmail()
  email: string;

  @ApiProperty({
    description: 'User`s Password',
    example: 'senha123',
    format: 'password',
  })
  @IsString()
  password: string;
}
