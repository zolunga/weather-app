import { WeatherMapper } from '../src/weather/mappers/weather.mapper';
import { WeatherProvider } from '../src/weather/providers/weather-provider.interface';
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

  beforeEach(() => {
    provider = {
      getCurrentWeather: vi.fn().mockResolvedValue(currentResponse),
      getForecast: vi.fn().mockResolvedValue(forecastResponse),
    };

    service = new WeatherService(
      provider,
      new WeatherMapper(),
      new WeatherInsightsService(),
    );
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
});
