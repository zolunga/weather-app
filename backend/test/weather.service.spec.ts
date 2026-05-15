import { WeatherProvider } from '../src/weather/providers/weather-provider.interface';
import { CacheService } from '../src/weather/cache.service';
import { WeatherInsightsService } from '../src/weather/weather-insights.service';
import { WeatherService } from '../src/weather/weather.service';
import {
  CurrentWeather,
  WeatherForecast,
} from '../src/weather/models/weather.models';
import { WeatherUnits } from '../src/weather/types/weather-units.type';
import { vi, type Mocked } from 'vitest';

describe('WeatherService', () => {
  let provider: Mocked<WeatherProvider>;
  let service: WeatherService;
  let cacheService: CacheService;

  function createCurrentWeather(): CurrentWeather {
    return {
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
    };
  }

  function createForecast(): WeatherForecast {
    return {
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
            main: 'Clear',
            description: 'clear sky',
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
    };
  }

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
      getCurrentWeather: vi.fn().mockResolvedValue(createCurrentWeather()),
      getForecast: vi.fn().mockResolvedValue(createForecast()),
    };
    cacheService = createCacheService();

    service = new WeatherService(
      provider,
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

  it('passes requested units through provider and insights', async () => {
    provider.getCurrentWeather.mockResolvedValue({
      ...createCurrentWeather(),
      temperature: {
        current: 22,
        feelsLike: 21,
        unit: 'celsius',
      },
      wind: {
        speed: 2,
        unit: 'm/s',
        directionDegrees: 180,
      },
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
      .mockResolvedValueOnce(createCurrentWeather());

    await expect(service.getCurrentWeather('Atlanta')).rejects.toThrow(
      'OpenWeather failed',
    );
    const result = await service.getCurrentWeather('Atlanta');

    expect(provider.getCurrentWeather).toHaveBeenCalledTimes(2);
    expect(result.location.name).toBe('Atlanta');
  });
});
