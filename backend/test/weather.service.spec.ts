import { WeatherMapper } from '../src/weather/mappers/weather.mapper';
import { WeatherProvider } from '../src/weather/providers/weather-provider.interface';
import { CacheService } from '../src/weather/cache.service';
import { WeatherInsightsService } from '../src/weather/weather-insights.service';
import { WeatherService } from '../src/weather/weather.service';
import {
  OpenWeatherCurrentResponse,
  OpenWeatherForecastResponse,
} from '../src/weather/types/open-weather.types';
import { WeatherUnits } from '../src/weather/types/weather-units.type';
import { vi, type Mocked } from 'vitest';

describe('WeatherService', () => {
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
        weather: [{ main: 'Clear', description: 'clear sky' }],
        wind: { speed: 2 },
        pop: 0.1,
      },
    ],
  };

  let provider: Mocked<WeatherProvider>;
  let service: WeatherService;
  let cacheService: CacheService;

  function createCacheService(ttlSeconds = 600): CacheService {
    return new CacheService(
      {
        get: vi.fn().mockReturnValue(String(ttlSeconds)),
      } as never,
      {
        info: vi.fn(),
        warn: vi.fn(),
        error: vi.fn(),
      } as never,
    );
  }

  beforeEach(() => {
    provider = {
      getCurrentWeather: vi.fn().mockResolvedValue(currentResponse),
      getForecast: vi.fn().mockResolvedValue(forecastResponse),
    };
    cacheService = createCacheService();

    service = new WeatherService(
      provider,
      new WeatherMapper(),
      new WeatherInsightsService(),
      cacheService,
    );
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('returns normalized current weather with generated insights', async () => {
    const result = await service.getCurrentWeather('Atlanta');

    expect(provider.getCurrentWeather).toHaveBeenCalledWith(
      'Atlanta',
      WeatherUnits.Metric,
    );
    expect(result.location.name).toBe('Atlanta');
    expect(result.insights).toEqual([
      expect.objectContaining({ code: 'comfortable_weather' }),
    ]);
  });

  it('returns normalized forecast with generated item insights', async () => {
    const result = await service.getForecast('Atlanta');

    expect(provider.getForecast).toHaveBeenCalledWith(
      'Atlanta',
      WeatherUnits.Metric,
    );
    expect(result.items).toHaveLength(1);
    expect(result.items[0].insights).toEqual([
      expect.objectContaining({ code: 'comfortable_weather' }),
    ]);
  });

  it('passes requested units through provider, mapper, and insights', async () => {
    provider.getCurrentWeather.mockResolvedValue({
      ...currentResponse,
      main: { temp: 22, feels_like: 21, humidity: 40 },
      wind: { speed: 2, deg: 180 },
    });

    const result = await service.getCurrentWeather('Atlanta', WeatherUnits.Metric);

    expect(provider.getCurrentWeather).toHaveBeenCalledWith(
      'Atlanta',
      WeatherUnits.Metric,
    );
    expect(result.temperature.unit).toBe('celsius');
    expect(result.wind.unit).toBe('m/s');
    expect(result.insights).toEqual([
      expect.objectContaining({ code: 'comfortable_weather' }),
    ]);
  });

  it('returns cached current weather on cache hit', async () => {
    const firstResult = await service.getCurrentWeather(' Atlanta ');
    const secondResult = await service.getCurrentWeather('atlanta');

    expect(provider.getCurrentWeather).toHaveBeenCalledOnce();
    expect(secondResult).toBe(firstResult);
  });

  it('calls provider and caches current weather on cache miss', async () => {
    const result = await service.getCurrentWeather('Atlanta');

    expect(provider.getCurrentWeather).toHaveBeenCalledWith(
      'Atlanta',
      WeatherUnits.Metric,
    );
    expect(result.location.name).toBe('Atlanta');
  });

  it('refreshes current weather after cached value expires', async () => {
    vi.useFakeTimers();
    cacheService = createCacheService(1);
    service = new WeatherService(
      provider,
      new WeatherMapper(),
      new WeatherInsightsService(),
      cacheService,
    );

    await service.getCurrentWeather('Atlanta');
    vi.advanceTimersByTime(1_001);
    await service.getCurrentWeather('Atlanta');

    expect(provider.getCurrentWeather).toHaveBeenCalledTimes(2);
  });

  it('uses different cache keys for different units', async () => {
    await service.getCurrentWeather('Atlanta', WeatherUnits.Metric);
    await service.getCurrentWeather('Atlanta', WeatherUnits.Imperial);
    await service.getCurrentWeather('atlanta', WeatherUnits.Metric);

    expect(provider.getCurrentWeather).toHaveBeenCalledTimes(2);
    expect(provider.getCurrentWeather).toHaveBeenNthCalledWith(
      1,
      'Atlanta',
      WeatherUnits.Metric,
    );
    expect(provider.getCurrentWeather).toHaveBeenNthCalledWith(
      2,
      'Atlanta',
      WeatherUnits.Imperial,
    );
  });

  it('does not cache failed provider responses', async () => {
    provider.getCurrentWeather
      .mockRejectedValueOnce(new Error('OpenWeather failed'))
      .mockResolvedValueOnce(currentResponse);

    await expect(service.getCurrentWeather('Atlanta')).rejects.toThrow(
      'OpenWeather failed',
    );
    const result = await service.getCurrentWeather('Atlanta');

    expect(provider.getCurrentWeather).toHaveBeenCalledTimes(2);
    expect(result.location.name).toBe('Atlanta');
  });
});
