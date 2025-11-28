import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import { AuthUser } from '../../../modules/auth/interfaces/jwt-payload.interface';

interface RequestWithUser extends Request {
  user: AuthUser;
}

export const CurrentUser = createParamDecorator(
  (
    data: keyof AuthUser | undefined,
    ctx: ExecutionContext,
  ): AuthUser | string => {
    const request = ctx.switchToHttp().getRequest<RequestWithUser>();
    const user = request.user;

    if (!user) {
      throw new Error(
        'User not found in request. Did you forget to use JwtAuthGuard?',
      );
    }

    return data ? user[data] : user;
  },
);
