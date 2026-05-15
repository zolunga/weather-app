import { Injectable, Logger } from '@nestjs/common';

type LogLevel = 'info' | 'warn' | 'error';

type LogMetadata = Record<string, string | number | boolean | null | undefined>;

interface LogEntry extends LogMetadata {
  event: string;
  level: LogLevel;
  timestamp: string;
  context: string;
}

@Injectable()
export class AppLogger {
  private readonly logger = new Logger('WeatherApi');

  info(context: string, event: string, metadata: LogMetadata = {}): void {
    this.logger.log(this.format('info', context, event, metadata));
  }

  warn(context: string, event: string, metadata: LogMetadata = {}): void {
    this.logger.warn(this.format('warn', context, event, metadata));
  }

  error(context: string, event: string, metadata: LogMetadata = {}): void {
    this.logger.error(this.format('error', context, event, metadata));
  }

  private format(
    level: LogLevel,
    context: string,
    event: string,
    metadata: LogMetadata,
  ): string {
    const entry: LogEntry = {
      event,
      level,
      timestamp: new Date().toISOString(),
      context,
      ...metadata,
    };

    return JSON.stringify(entry);
  }
}
