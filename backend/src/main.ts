import { ValidationPipe } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { NestFactory } from '@nestjs/core';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import 'reflect-metadata';
import { AppModule } from './app.module';
import { HttpExceptionFilter } from './common/filters/http-exception.filter';
import { AppLogger } from './common/logger/app-logger.service';
import { HttpRequestLoggingMiddleware } from './common/middleware/http-request-logging.middleware';

async function bootstrap(): Promise<void> {
  const app = await NestFactory.create(AppModule);
  const configService = app.get(ConfigService);
  const appLogger = app.get(AppLogger);
  const allowedOrigins = getAllowedOrigins(configService);

  app.enableCors({
    origin: (
      origin: string | undefined,
      callback: (error: Error | null, allow?: boolean) => void,
    ): void => {
      if (!origin || allowedOrigins.includes(origin)) {
        callback(null, true);
        return;
      }

      callback(null, false);
    },
  });

  const requestLoggingMiddleware = new HttpRequestLoggingMiddleware(appLogger);
  app.use(requestLoggingMiddleware.use.bind(requestLoggingMiddleware));
  app.useGlobalFilters(new HttpExceptionFilter(appLogger));
  app.useGlobalPipes(
    new ValidationPipe({
      forbidNonWhitelisted: true,
      transform: true,
      whitelist: true,
    }),
  );

  const swaggerConfig = new DocumentBuilder()
    .setTitle('Weather API')
    .setDescription('Normalized weather API backed by OpenWeatherMap')
    .setVersion('0.1.0')
    .addTag('health')
    .addTag('weather')
    .build();

  const document = SwaggerModule.createDocument(app, swaggerConfig);
  SwaggerModule.setup('docs', app, document);

  const port = configService.get<number>('PORT') ?? 3000;
  await app.listen(port);

  appLogger.info('Bootstrap', 'application.started', {
    port,
    environment: configService.get<string>('NODE_ENV') ?? 'development',
    docsPath: '/docs',
  });
}

void bootstrap();

function getAllowedOrigins(configService: ConfigService): string[] {
  const configuredOrigins = configService.get<string>('CORS_ORIGIN');

  if (!configuredOrigins) {
    return ['http://localhost:5173', 'http://127.0.0.1:5173'];
  }

  return configuredOrigins
    .split(',')
    .map((origin) => origin.trim())
    .filter(Boolean);
}
