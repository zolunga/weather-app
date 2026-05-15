import { Injectable, NestMiddleware } from '@nestjs/common';
import { AppLogger } from '../logger/app-logger.service';

interface RequestLike {
  method?: string;
  originalUrl?: string;
  url?: string;
  headers?: Record<string, string | string[] | undefined>;
}

interface ResponseLike {
  statusCode?: number;
  on(event: 'finish', listener: () => void): void;
}

type NextFunctionLike = () => void;

@Injectable()
export class HttpRequestLoggingMiddleware implements NestMiddleware {
  private readonly logContext = 'HttpRequest';

  constructor(private readonly appLogger: AppLogger) {}

  use(req: RequestLike, res: ResponseLike, next: NextFunctionLike): void {
    const startedAt = Date.now();

    res.on('finish', () => {
      const statusCode = res.statusCode ?? 0;
      const metadata = {
        method: req.method ?? 'UNKNOWN',
        path: this.getRequestPath(req.originalUrl ?? req.url ?? ''),
        statusCode,
        durationMs: Date.now() - startedAt,
        requestId: this.getHeader(req, 'x-request-id'),
        userAgent: this.getHeader(req, 'user-agent'),
      };

      if (statusCode >= 500) {
        this.appLogger.error(this.logContext, 'http.request_completed', metadata);
        return;
      }

      if (statusCode >= 400) {
        this.appLogger.warn(this.logContext, 'http.request_completed', metadata);
        return;
      }

      this.appLogger.info(this.logContext, 'http.request_completed', metadata);
    });

    next();
  }

  private getHeader(req: RequestLike, name: string): string | undefined {
    const value = req.headers?.[name];

    if (Array.isArray(value)) {
      return value[0];
    }

    return value;
  }

  private getRequestPath(url: string): string {
    return url.split('?')[0];
  }
}
