import {
  BadGatewayException,
  NotFoundException,
  ServiceUnavailableException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { AppLogger } from '../src/common/logger/app-logger.service';
import { OpenWeatherMapper } from '../src/weather/mappers/open-weather.mapper';
import { OpenWeatherProvider } from '../src/weather/providers/open-weather.provider';
import {
  OpenWeatherCurrentResponse,
  OpenWeatherForecastResponse,
} from '../src/weather/types/open-weather.types';
import { WeatherUnits } from '../src/weather/types/weather-units.type';
import { vi, type Mock, type Mocked } from 'vitest';

describe('OpenWeatherProvider', () => {
  const currentResponse: OpenWeatherCurrentResponse = {
    coord: { lat: 33.749, lon: -84.388 },
    weather: [{ main: 'Clear', description: 'clear sky' }],
    main: { temp: 22, feels_like: 21, humidity: 40 },
    wind: { speed: 2, deg: 180 },
    dt: 1778708400,
    name: 'Atlanta',
    sys: { country: 'US' },
  };

  const forecastResponse: OpenWeatherForecastResponse = {
    city: {
      name: 'Atlanta',
      country: 'US',
      coord: { lat: 33.749, lon: -84.388 },
    },
    list: [
      {
        dt: 1778722800,
        main: { temp: 20, feels_like: 19, humidity: 44 },
        weather: [{ main: 'Clouds', description: 'scattered clouds' }],
        wind: { speed: 2 },
        pop: 0.1,
      },
    ],
  };

  let configService: ConfigService;
  let appLogger: Mocked<AppLogger>;
  let provider: OpenWeatherProvider;
  let fetchMock: Mock;

  beforeEach(() => {
    configService = {
      get: vi.fn((key: string) => {
        const values: Record<string, string> = {
          OPENWEATHER_API_KEY: 'test-api-key',
          OPENWEATHER_BASE_URL: 'https://api.openweathermap.org',
        };

        return values[key];
      }),
    } as unknown as ConfigService;
    appLogger = {
      info: vi.fn(),
      warn: vi.fn(),
      error: vi.fn(),
    } as unknown as Mocked<AppLogger>;
    provider = new OpenWeatherProvider(
      configService,
      appLogger,
      new OpenWeatherMapper(),
    );
    fetchMock = vi.fn();
    global.fetch = fetchMock;
  });

  afterEach(() => {
    vi.resetAllMocks();
  });

  it('calls the current weather endpoint with expected query parameters', async () => {
    fetchMock.mockResolvedValue({
      ok: true,
      json: vi.fn().mockResolvedValue(currentResponse),
    });

    await provider.getCurrentWeather('Atlanta', WeatherUnits.Metric);

    const url = fetchMock.mock.calls[0][0] as URL;
    expect(url.pathname).toBe('/data/2.5/weather');
    expect(url.searchParams.get('q')).toBe('Atlanta');
    expect(url.searchParams.get('appid')).toBe('test-api-key');
    expect(url.searchParams.get('units')).toBe('metric');
  });

  it('maps current weather raw responses before returning', async () => {
    fetchMock.mockResolvedValue({
      ok: true,
      json: vi.fn().mockResolvedValue(currentResponse),
    });

    const result = await provider.getCurrentWeather('Atlanta', WeatherUnits.Metric);

    expect(result).toEqual({
      location: {
        name: 'Atlanta',
        country: 'US',
        coordinates: {
          latitude: 33.749,
          longitude: -84.388,
        },
      },
      observedAt: '2026-05-13T21:40:00.000Z',
      condition: {
        main: 'Clear',
        description: 'clear sky',
      },
      temperature: {
        current: 22,
        feelsLike: 21,
        unit: 'celsius',
      },
      humidity: {
        value: 40,
        unit: 'percent',
      },
      wind: {
        speed: 2,
        unit: 'm/s',
        directionDegrees: 180,
      },
      insights: [],
    });
  });

  it('maps forecast raw responses before returning', async () => {
    fetchMock.mockResolvedValue({
      ok: true,
      json: vi.fn().mockResolvedValue(forecastResponse),
    });

    const result = await provider.getForecast('Atlanta', WeatherUnits.Metric);

    expect(result).toEqual({
      location: {
        name: 'Atlanta',
        country: 'US',
        coordinates: {
          latitude: 33.749,
          longitude: -84.388,
        },
      },
      items: [
        {
          forecastedAt: '2026-05-14T01:40:00.000Z',
          condition: {
            main: 'Clouds',
            description: 'scattered clouds',
          },
          temperature: {
            current: 20,
            feelsLike: 19,
            unit: 'celsius',
          },
          humidity: {
            value: 44,
            unit: 'percent',
          },
          wind: {
            speed: 2,
            unit: 'm/s',
          },
          precipitationProbability: 0.1,
          insights: [],
        },
      ],
    });
  });

  it('maps OpenWeather 404 responses to NotFoundException', async () => {
    fetchMock.mockResolvedValue({ ok: false, status: 404 });

    await expect(provider.getCurrentWeather('Missing')).rejects.toBeInstanceOf(
      NotFoundException,
    );
    expect(appLogger.warn).toHaveBeenCalledWith(
      'OpenWeatherProvider',
      'openweather.location_not_found',
      {
        location: 'Missing',
        statusCode: 404,
      },
    );
  });

  it('maps OpenWeather auth failures to BadGatewayException', async () => {
    fetchMock.mockResolvedValue({ ok: false, status: 401 });

    await expect(provider.getForecast('Atlanta')).rejects.toBeInstanceOf(
      BadGatewayException,
    );
    expect(JSON.stringify(appLogger.error.mock.calls)).not.toContain('test-api-key');
  });

  it('maps OpenWeather rate limits to ServiceUnavailableException', async () => {
    fetchMock.mockResolvedValue({ ok: false, status: 429 });

    await expect(provider.getForecast('Atlanta')).rejects.toBeInstanceOf(
      ServiceUnavailableException,
    );
  });

  it('maps OpenWeather 5xx responses to ServiceUnavailableException', async () => {
    fetchMock.mockResolvedValue({ ok: false, status: 503 });

    await expect(provider.getCurrentWeather('Atlanta')).rejects.toBeInstanceOf(
      ServiceUnavailableException,
    );
  });

  it('maps network failures to BadGatewayException', async () => {
    fetchMock.mockRejectedValue(new Error('network failed'));

    await expect(provider.getCurrentWeather('Atlanta')).rejects.toBeInstanceOf(
      BadGatewayException,
    );
    expect(appLogger.warn).toHaveBeenCalledWith(
      'OpenWeatherProvider',
      'openweather.request_failed',
      {
        reason: 'network_error',
        vendorPath: '/data/2.5/weather',
      },
    );
  });

  it('fails clearly when the provider API key is not configured', async () => {
    const missingKeyConfig = {
      get: vi.fn((key: string) =>
        key === 'OPENWEATHER_BASE_URL' ? 'https://api.openweathermap.org' : undefined,
      ),
    } as unknown as ConfigService;

    const providerWithoutKey = new OpenWeatherProvider(
      missingKeyConfig,
      appLogger,
      new OpenWeatherMapper(),
    );

    await expect(providerWithoutKey.getCurrentWeather('Atlanta')).rejects.toBeInstanceOf(
      ServiceUnavailableException,
    );
  });
});
