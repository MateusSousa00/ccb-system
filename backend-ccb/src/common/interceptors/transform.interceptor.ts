import {
  CallHandler,
  ExecutionContext,
  Injectable,
  NestInterceptor,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { ApiResponseDto } from '../dto/api-response.dto';

@Injectable()
export class TransformInterceptor<T> implements NestInterceptor<
  T,
  ApiResponseDto<T>
> {
  intercept(
    context: ExecutionContext,
    next: CallHandler<T>,
  ): Observable<ApiResponseDto<T>> {
    return next.handle().pipe(
      map((data: T): ApiResponseDto<T> => {
        if (this.isApiResponseDto(data)) {
          return data;
        }

        return ApiResponseDto.success(data);
      }),
    );
  }

  private isApiResponseDto<T>(data: T): data is T & ApiResponseDto<T> {
    return (
      data !== null &&
      data !== undefined &&
      typeof data === 'object' &&
      'success' in data &&
      typeof (data as Record<string, unknown>).success === 'boolean'
    );
  }
}
