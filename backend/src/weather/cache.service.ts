import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { AppLogger } from '../common/logger/app-logger.service';
import { WeatherUnits } from './types/weather-units.type';

const DEFAULT_CACHE_TTL_SECONDS = 600;

type WeatherCacheEndpoint = 'current' | 'forecast';

interface WeatherCacheKeyParts {
  endpoint: WeatherCacheEndpoint;
  location: string;
  units: WeatherUnits;
}

interface CacheEntry<T> {
  expiresAt: number;
  value: T;
}

@Injectable()
export class CacheService {
  private readonly cache = new Map<string, CacheEntry<unknown>>();
  private readonly ttlSeconds: number;

  constructor(
    private readonly configService: ConfigService,
    private readonly logger: AppLogger,
  ) {
    this.ttlSeconds = this.resolveTtlSeconds();
  }

  get<T>(keyParts: WeatherCacheKeyParts): T | undefined {
    const key = this.buildKey(keyParts);
    const entry = this.cache.get(key);
    const metadata = this.toLogMetadata(keyParts);

    if (!entry) {
      this.logger.info('CacheService', 'cache_miss', {
        ...metadata,
        reason: 'not_found',
      });
      return undefined;
    }

    if (Date.now() >= entry.expiresAt) {
      this.cache.delete(key);
      this.logger.info('CacheService', 'cache_miss', {
        ...metadata,
        reason: 'expired',
      });
      return undefined;
    }

    this.logger.info('CacheService', 'cache_hit', metadata);
    return entry.value as T;
  }

  set<T>(keyParts: WeatherCacheKeyParts, value: T): void {
    const key = this.buildKey(keyParts);

    this.cache.set(key, {
      expiresAt: Date.now() + this.ttlSeconds * 1000,
      value,
    });

    this.logger.info('CacheService', 'cache_set', {
      ...this.toLogMetadata(keyParts),
      ttlSeconds: this.ttlSeconds,
    });
  }

  private buildKey({ endpoint, location, units }: WeatherCacheKeyParts): string {
    return [endpoint, this.normalizeLocation(location), units].join(':');
  }

  private normalizeLocation(location: string): string {
    return location.trim().toLowerCase();
  }

  private resolveTtlSeconds(): number {
    const ttl = Number(
      this.configService.get<string>('WEATHER_CACHE_TTL_SECONDS') ??
        DEFAULT_CACHE_TTL_SECONDS,
    );

    return Number.isFinite(ttl) && ttl > 0 ? ttl : DEFAULT_CACHE_TTL_SECONDS;
  }

  private toLogMetadata({
    endpoint,
    location,
    units,
  }: WeatherCacheKeyParts): Record<string, string> {
    return {
      endpoint,
      location: this.normalizeLocation(location),
      units,
    };
  }
}
