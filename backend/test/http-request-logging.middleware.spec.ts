import { EventEmitter } from 'node:events';
import { AppLogger } from '../src/common/logger/app-logger.service';
import { HttpRequestLoggingMiddleware } from '../src/common/middleware/http-request-logging.middleware';
import { vi, type Mocked } from 'vitest';

class MockResponse extends EventEmitter {
  constructor(public statusCode: number) {
    super();
  }
}

describe('HttpRequestLoggingMiddleware', () => {
  let appLogger: Mocked<AppLogger>;
  let middleware: HttpRequestLoggingMiddleware;

  beforeEach(() => {
    appLogger = {
      info: vi.fn(),
      warn: vi.fn(),
      error: vi.fn(),
    } as unknown as Mocked<AppLogger>;
    middleware = new HttpRequestLoggingMiddleware(appLogger);
    vi.spyOn(Date, 'now').mockReturnValueOnce(100).mockReturnValueOnce(137);
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('logs successful requests at info level after response finish', () => {
    const response = new MockResponse(200);
    const next = vi.fn();

    middleware.use(
      {
        method: 'GET',
        originalUrl: '/health?apiKey=secret',
        headers: {
          'user-agent': 'vitest',
          'x-request-id': 'request-123',
          authorization: 'Bearer secret',
        },
      },
      response,
      next,
    );
    response.emit('finish');

    expect(next).toHaveBeenCalledOnce();
    expect(appLogger.info).toHaveBeenCalledWith(
      'HttpRequest',
      'http.request_completed',
      {
        method: 'GET',
        path: '/health',
        statusCode: 200,
        durationMs: 37,
        requestId: 'request-123',
        userAgent: 'vitest',
      },
    );
    expect(JSON.stringify(appLogger.info.mock.calls)).not.toContain('secret');
  });

  it('logs 4xx requests at warn level', () => {
    const response = new MockResponse(404);

    middleware.use(
      { method: 'GET', originalUrl: '/weather/current', headers: {} },
      response,
      vi.fn(),
    );
    response.emit('finish');

    expect(appLogger.warn).toHaveBeenCalledWith(
      'HttpRequest',
      'http.request_completed',
      expect.objectContaining({ statusCode: 404 }),
    );
  });

  it('logs 5xx requests at error level', () => {
    const response = new MockResponse(503);

    middleware.use(
      { method: 'GET', originalUrl: '/weather/current', headers: {} },
      response,
      vi.fn(),
    );
    response.emit('finish');

    expect(appLogger.error).toHaveBeenCalledWith(
      'HttpRequest',
      'http.request_completed',
      expect.objectContaining({ statusCode: 503 }),
    );
  });
});
