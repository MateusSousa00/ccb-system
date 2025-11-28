export class ApiResponseDto<T> {
  success: boolean;
  data?: T;
  message?: string;

  constructor(success: boolean, data?: T, message?: string) {
    this.success = success;
    this.data = data;
    this.message = message;
  }

  static success<T>(data: T, message?: string): ApiResponseDto<T> {
    return new ApiResponseDto(true, data, message);
  }

  static error(message: string): ApiResponseDto<null> {
    return new ApiResponseDto(false, null, message);
  }
}
