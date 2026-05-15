import {
  BadGatewayException,
  Injectable,
  NotFoundException,
  ServiceUnavailableException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { AppLogger } from '../../common/logger/app-logger.service';
import {
  OpenWeatherCurrentResponse,
  OpenWeatherForecastResponse,
} from '../types/open-weather.types';
import {
  DEFAULT_WEATHER_UNITS,
  WeatherUnits,
} from '../types/weather-units.type';
import { WeatherProvider } from './weather-provider.interface';

@Injectable()
export class OpenWeatherProvider implements WeatherProvider {
  private readonly logContext = 'OpenWeatherProvider';

  constructor(
    private readonly configService: ConfigService,
    private readonly appLogger: AppLogger,
  ) {}

  async getCurrentWeather(
    location: string,
    units: WeatherUnits = DEFAULT_WEATHER_UNITS,
  ): Promise<OpenWeatherCurrentResponse> {
    const url = this.buildUrl('/data/2.5/weather', location, units);
    return this.fetchJson<OpenWeatherCurrentResponse>(url, location);
  }

  async getForecast(
    location: string,
    units: WeatherUnits = DEFAULT_WEATHER_UNITS,
  ): Promise<OpenWeatherForecastResponse> {
    const url = this.buildUrl('/data/2.5/forecast', location, units);
    return this.fetchJson<OpenWeatherForecastResponse>(url, location);
  }

  private buildUrl(path: string, location: string, units: WeatherUnits): URL {
    const baseUrl =
      this.configService.get<string>('OPENWEATHER_BASE_URL') ??
      'https://api.openweathermap.org';
    const apiKey = this.configService.get<string>('OPENWEATHER_API_KEY');

    if (!apiKey) {
      throw new ServiceUnavailableException(
        'Weather provider API key is not configured',
      );
    }

    const url = new URL(path, baseUrl.replace(/\/$/, ''));
    url.searchParams.set('q', location);
    url.searchParams.set('appid', apiKey);
    url.searchParams.set('units', units);

    return url;
  }

  private async fetchJson<T>(url: URL, location: string): Promise<T> {
    let response: Response;

    try {
      response = await fetch(url);
    } catch {
      this.appLogger.warn(this.logContext, 'openweather.request_failed', {
        reason: 'network_error',
        vendorPath: url.pathname,
      });
      throw new BadGatewayException('Weather provider is unavailable');
    }

    if (!response.ok) {
      throw this.mapProviderError(response.status, location);
    }

    try {
      return (await response.json()) as T;
    } catch {
      this.appLogger.warn(this.logContext, 'openweather.request_failed', {
        reason: 'invalid_json',
        vendorPath: url.pathname,
        statusCode: response.status,
      });
      throw new BadGatewayException('Weather provider returned invalid JSON');
    }
  }

  private mapProviderError(statusCode: number, location: string): Error {
    if (statusCode === 404) {
      this.appLogger.warn(this.logContext, 'openweather.location_not_found', {
        statusCode,
        location,
      });
      return new NotFoundException(`Location "${location}" was not found`);
    }

    if (statusCode === 401 || statusCode === 403) {
      this.appLogger.error(this.logContext, 'openweather.request_failed', {
        reason: 'credentials_rejected',
        statusCode,
      });
      return new BadGatewayException('Weather provider rejected the API credentials');
    }

    if (statusCode === 429 || statusCode >= 500) {
      this.appLogger.warn(this.logContext, 'openweather.request_failed', {
        reason: statusCode === 429 ? 'rate_limited' : 'provider_unavailable',
        statusCode,
      });
      return new ServiceUnavailableException(
        'Weather provider is temporarily unavailable',
      );
    }

    this.appLogger.warn(this.logContext, 'openweather.request_failed', {
      reason: 'unexpected_status',
      statusCode,
    });
    return new BadGatewayException('Weather provider returned an unexpected error');
  }
}
