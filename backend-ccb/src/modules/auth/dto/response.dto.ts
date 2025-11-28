import { Exclude, Expose } from 'class-transformer';

export class UserResponseDto {
  @Expose()
  id: string;

  @Expose()
  email: string;

  @Expose()
  name: string;

  @Expose()
  role: string;

  @Expose()
  createdAt: Date;

  @Exclude()
  password: string;
}

export class LoginResponseDto {
  accessToken: string;
  user: UserResponseDto;
}

export class RegisterResponseDto {
  message: string;
  user: UserResponseDto;
}
