import type { CurrentWeatherResponse, ForecastWeatherItem } from '../features/weather/types/weather.types';

export const currentWeatherFixture: CurrentWeatherResponse = {
  location: {
    name: 'Atlanta',
    country: 'US',
    coordinates: {
      latitude: 33.749,
      longitude: -84.388,
    },
  },
  observedAt: '2026-05-13T19:00:00.000Z',
  condition: {
    main: 'Clear',
    description: 'clear sky',
  },
  temperature: {
    current: 72.4,
    feelsLike: 70.8,
    unit: 'fahrenheit',
  },
  humidity: {
    value: 63,
    unit: 'percent',
  },
  wind: {
    speed: 8.2,
    unit: 'mph',
    directionDegrees: 210,
  },
  insights: [
    {
      code: 'comfortable_weather',
      severity: 'info',
      message: 'Comfortable weather for spending time outside.',
    },
  ],
};

export const forecastItemFixture: ForecastWeatherItem = {
  forecastedAt: '2026-05-13T21:00:00.000Z',
  condition: {
    main: 'Rain',
    description: 'light rain',
  },
  temperature: {
    current: 70,
    feelsLike: 69,
    unit: 'fahrenheit',
  },
  humidity: {
    value: 71,
    unit: 'percent',
  },
  wind: {
    speed: 9,
    unit: 'mph',
  },
  precipitationProbability: 0.67,
  insights: [
    {
      code: 'bring_umbrella',
      severity: 'advisory',
      message: 'Bring an umbrella. Precipitation is likely.',
    },
  ],
};
