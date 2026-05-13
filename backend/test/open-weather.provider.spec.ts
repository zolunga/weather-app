import {
  BadGatewayException,
  NotFoundException,
  ServiceUnavailableException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { OpenWeatherProvider } from '../src/weather/providers/open-weather.provider';
import { WeatherUnits } from '../src/weather/types/weather-units.type';
import { vi, type Mock } from 'vitest';

describe('OpenWeatherProvider', () => {
  let configService: ConfigService;
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
    provider = new OpenWeatherProvider(configService);
    fetchMock = vi.fn();
    global.fetch = fetchMock;
  });

  afterEach(() => {
    vi.resetAllMocks();
  });

  it('calls the current weather endpoint with expected query parameters', async () => {
    fetchMock.mockResolvedValue({
      ok: true,
      json: vi.fn().mockResolvedValue({ name: 'Atlanta' }),
    });

    await provider.getCurrentWeather('Atlanta', WeatherUnits.Metric);

    const url = fetchMock.mock.calls[0][0] as URL;
    expect(url.pathname).toBe('/data/2.5/weather');
    expect(url.searchParams.get('q')).toBe('Atlanta');
    expect(url.searchParams.get('appid')).toBe('test-api-key');
    expect(url.searchParams.get('units')).toBe('metric');
  });

  it('maps OpenWeather 404 responses to NotFoundException', async () => {
    fetchMock.mockResolvedValue({ ok: false, status: 404 });

    await expect(provider.getCurrentWeather('Missing')).rejects.toBeInstanceOf(
      NotFoundException,
    );
  });

  it('maps OpenWeather auth failures to BadGatewayException', async () => {
    fetchMock.mockResolvedValue({ ok: false, status: 401 });

    await expect(provider.getForecast('Atlanta')).rejects.toBeInstanceOf(
      BadGatewayException,
    );
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
  });

  it('fails clearly when the provider API key is not configured', async () => {
    const missingKeyConfig = {
      get: vi.fn((key: string) =>
        key === 'OPENWEATHER_BASE_URL' ? 'https://api.openweathermap.org' : undefined,
      ),
    } as unknown as ConfigService;

    const providerWithoutKey = new OpenWeatherProvider(missingKeyConfig);

    await expect(providerWithoutKey.getCurrentWeather('Atlanta')).rejects.toBeInstanceOf(
      ServiceUnavailableException,
    );
  });
});
