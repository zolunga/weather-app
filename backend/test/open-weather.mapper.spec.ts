import { OpenWeatherMapper } from '../src/weather/mappers/open-weather.mapper';
import {
  OpenWeatherCurrentResponse,
  OpenWeatherForecastResponse,
} from '../src/weather/types/open-weather.types';
import { WeatherUnits } from '../src/weather/types/weather-units.type';

describe('OpenWeatherMapper', () => {
  const mapper = new OpenWeatherMapper();

  it('maps OpenWeather current weather into a normalized DTO using metric units by default', () => {
    const response: OpenWeatherCurrentResponse = {
      coord: { lat: 33.749, lon: -84.388 },
      weather: [{ main: 'Clear', description: 'clear sky' }],
      main: { temp: 72.4, feels_like: 70.9, humidity: 48 },
      wind: { speed: 7.1, deg: 210 },
      dt: 1778708400,
      name: 'Atlanta',
      sys: { country: 'US' },
    };

    expect(mapper.toCurrentWeather(response)).toEqual({
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
        current: 72.4,
        feelsLike: 70.9,
        unit: 'celsius',
      },
      humidity: {
        value: 48,
        unit: 'percent',
      },
      wind: {
        speed: 7.1,
        unit: 'm/s',
        directionDegrees: 210,
      },
      insights: [],
    });
  });

  it('maps OpenWeather forecast items into normalized DTOs', () => {
    const response: OpenWeatherForecastResponse = {
      city: {
        name: 'Atlanta',
        country: 'US',
        coord: { lat: 33.749, lon: -84.388 },
      },
      list: [
        {
          dt: 1778722800,
          main: { temp: 80.2, feels_like: 83.5, humidity: 72 },
          weather: [{ main: 'Rain', description: 'light rain' }],
          wind: { speed: 13.4, deg: 185 },
          pop: 0.62,
        },
      ],
    };

    expect(mapper.toForecast(response, WeatherUnits.Metric)).toEqual({
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
            main: 'Rain',
            description: 'light rain',
          },
          temperature: {
            current: 80.2,
            feelsLike: 83.5,
            unit: 'celsius',
          },
          humidity: {
            value: 72,
            unit: 'percent',
          },
          wind: {
            speed: 13.4,
            unit: 'm/s',
            directionDegrees: 185,
          },
          precipitationProbability: 0.62,
          insights: [],
        },
      ],
    });
  });

  it('uses Kelvin for standard temperature units', () => {
    const response: OpenWeatherCurrentResponse = {
      coord: { lat: 33.749, lon: -84.388 },
      weather: [{ main: 'Clear', description: 'clear sky' }],
      main: { temp: 295.15, feels_like: 294.8, humidity: 48 },
      wind: { speed: 3.1 },
      dt: 1778708400,
      name: 'Atlanta',
      sys: { country: 'US' },
    };

    const result = mapper.toCurrentWeather(response, WeatherUnits.Standard);

    expect(result.temperature.unit).toBe('kelvin');
    expect(result.wind.unit).toBe('m/s');
  });
});
