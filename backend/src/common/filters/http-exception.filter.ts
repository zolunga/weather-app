import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  HttpException,
  HttpStatus,
} from '@nestjs/common';
import { AppLogger } from '../logger/app-logger.service';

interface ErrorResponseBody {
  statusCode: number;
  error: string;
  message: string | string[];
  timestamp: string;
  path: string;
}

@Catch()
export class HttpExceptionFilter implements ExceptionFilter {
  private readonly logContext = 'HttpExceptionFilter';

  constructor(private readonly appLogger: AppLogger) {}

  catch(exception: unknown, host: ArgumentsHost): void {
    const context = host.switchToHttp();
    const response = context.getResponse();
    const request = context.getRequest();

    const statusCode =
      exception instanceof HttpException
        ? exception.getStatus()
        : HttpStatus.INTERNAL_SERVER_ERROR;

    const body: ErrorResponseBody = {
      statusCode,
      error: this.getErrorName(statusCode),
      message: this.getMessage(exception),
      timestamp: new Date().toISOString(),
      path: request.url,
    };

    if (!(exception instanceof HttpException) || statusCode >= 500) {
      this.appLogger.error(this.logContext, 'backend.unexpected_error', {
        statusCode,
        path: this.getRequestPath(request.url),
        method: request.method,
      });
    }

    response.status(statusCode).json(body);
  }

  private getMessage(exception: unknown): string | string[] {
    if (!(exception instanceof HttpException)) {
      return 'Internal server error';
    }

    const response = exception.getResponse();
    if (typeof response === 'string') {
      return response;
    }

    if (this.hasMessage(response)) {
      return response.message;
    }

    return exception.message;
  }

  private hasMessage(value: unknown): value is { message: string | string[] } {
    return (
      typeof value === 'object' &&
      value !== null &&
      'message' in value &&
      (typeof value.message === 'string' || Array.isArray(value.message))
    );
  }

  private getErrorName(statusCode: number): string {
    return HttpStatus[statusCode] ?? 'Error';
  }

  private getRequestPath(url: string): string {
    return url.split('?')[0];
  }
}
