import { INestApplication, NotFoundException, ValidationPipe } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import request from 'supertest';
import { vi, type Mocked } from 'vitest';
import { AppModule } from '../src/app.module';
import { AppLogger } from '../src/common/logger/app-logger.service';
import { HttpExceptionFilter } from '../src/common/filters/http-exception.filter';
import {
  WEATHER_PROVIDER,
  WeatherProvider,
} from '../src/weather/providers/weather-provider.interface';
import {
  CurrentWeather,
  WeatherForecast,
} from '../src/weather/models/weather.models';
import { WeatherUnits } from '../src/weather/types/weather-units.type';

describe('App e2e', () => {
  const currentWeatherResponse: CurrentWeather = {
    location: {
      name: 'Mexico City',
      country: 'MX',
      coordinates: {
        latitude: 19.4326,
        longitude: -99.1332,
      },
    },
    observedAt: '2026-05-15T12:00:00.000Z',
    condition: {
      main: 'Clear',
      description: 'clear sky',
    },
    temperature: {
      current: 23,
      feelsLike: 22,
      unit: 'celsius',
    },
    humidity: {
      value: 45,
      unit: 'percent',
    },
    wind: {
      speed: 2.5,
      unit: 'm/s',
      directionDegrees: 130,
    },
    insights: [],
  };

  const forecastResponse: WeatherForecast = {
    location: {
      name: 'Mexico City',
      country: 'MX',
      coordinates: {
        latitude: 19.4326,
        longitude: -99.1332,
      },
    },
    items: [
      {
        forecastedAt: '2026-05-15T15:00:00.000Z',
        condition: {
          main: 'Clouds',
          description: 'scattered clouds',
        },
        temperature: {
          current: 24,
          feelsLike: 23,
          unit: 'celsius',
        },
        humidity: {
          value: 48,
          unit: 'percent',
        },
        wind: {
          speed: 3.1,
          unit: 'm/s',
          directionDegrees: 150,
        },
        precipitationProbability: 0.2,
        insights: [],
      },
      {
        forecastedAt: '2026-05-15T18:00:00.000Z',
        condition: {
          main: 'Rain',
          description: 'light rain',
        },
        temperature: {
          current: 21,
          feelsLike: 21,
          unit: 'celsius',
        },
        humidity: {
          value: 74,
          unit: 'percent',
        },
        wind: {
          speed: 4.2,
          unit: 'm/s',
          directionDegrees: 170,
        },
        precipitationProbability: 0.62,
        insights: [],
      },
    ],
  };

  let app: INestApplication;
  let provider: Mocked<WeatherProvider>;

  beforeEach(async () => {
    provider = {
      getCurrentWeather: vi.fn().mockResolvedValue(structuredClone(currentWeatherResponse)),
      getForecast: vi.fn().mockResolvedValue(structuredClone(forecastResponse)),
    };

    const logger = {
      error: vi.fn(),
      info: vi.fn(),
      warn: vi.fn(),
    };

    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    })
      .overrideProvider(WEATHER_PROVIDER)
      .useValue(provider)
      .overrideProvider(AppLogger)
      .useValue(logger)
      .compile();

    app = moduleFixture.createNestApplication();
    app.useGlobalFilters(new HttpExceptionFilter(app.get(AppLogger)));
    app.useGlobalPipes(
      new ValidationPipe({
        forbidNonWhitelisted: true,
        transform: true,
        whitelist: true,
      }),
    );

    await app.init();
  });

  afterEach(async () => {
    await app.close();
  });

  it('GET /health returns app status', async () => {
    const response = await request(app.getHttpServer())
      .get('/health')
      .expect(200);

    expect(response.body).toEqual({
      status: 'ok',
      timestamp: expect.any(String),
      uptimeSeconds: expect.any(Number),
    });
  });

  it('GET /weather/current returns normalized current weather with insights', async () => {
    const response = await request(app.getHttpServer())
      .get('/weather/current')
      .query({ location: 'Mexico City', units: 'metric' })
      .expect(200);

    expect(provider.getCurrentWeather).toHaveBeenCalledWith(
      'Mexico City',
      WeatherUnits.Metric,
    );
    expect(response.body).toEqual({
      location: {
        name: 'Mexico City',
        country: 'MX',
        coordinates: {
          latitude: 19.4326,
          longitude: -99.1332,
        },
      },
      observedAt: '2026-05-15T12:00:00.000Z',
      condition: {
        main: 'Clear',
        description: 'clear sky',
      },
      temperature: {
        current: 23,
        feelsLike: 22,
        unit: 'celsius',
      },
      humidity: {
        value: 45,
        unit: 'percent',
      },
      wind: {
        speed: 2.5,
        unit: 'm/s',
        directionDegrees: 130,
      },
      insights: [
        {
          code: 'comfortable_weather',
          severity: 'info',
          message: 'Comfortable weather for spending time outside.',
        },
      ],
    });
  });

  it('GET /weather/forecast returns normalized forecast', async () => {
    const response = await request(app.getHttpServer())
      .get('/weather/forecast')
      .query({ location: 'Mexico City', units: 'metric' })
      .expect(200);

    expect(provider.getForecast).toHaveBeenCalledWith(
      'Mexico City',
      WeatherUnits.Metric,
    );
    expect(response.body).toEqual({
      location: {
        name: 'Mexico City',
        country: 'MX',
        coordinates: {
          latitude: 19.4326,
          longitude: -99.1332,
        },
      },
      items: [
        {
          forecastedAt: '2026-05-15T15:00:00.000Z',
          condition: {
            main: 'Clouds',
            description: 'scattered clouds',
          },
          temperature: {
            current: 24,
            feelsLike: 23,
            unit: 'celsius',
          },
          humidity: {
            value: 48,
            unit: 'percent',
          },
          wind: {
            speed: 3.1,
            unit: 'm/s',
            directionDegrees: 150,
          },
          precipitationProbability: 0.2,
          insights: [
            {
              code: 'comfortable_weather',
              severity: 'info',
              message: 'Comfortable weather for spending time outside.',
            },
          ],
        },
        {
          forecastedAt: '2026-05-15T18:00:00.000Z',
          condition: {
            main: 'Rain',
            description: 'light rain',
          },
          temperature: {
            current: 21,
            feelsLike: 21,
            unit: 'celsius',
          },
          humidity: {
            value: 74,
            unit: 'percent',
          },
          wind: {
            speed: 4.2,
            unit: 'm/s',
            directionDegrees: 170,
          },
          precipitationProbability: 0.62,
          insights: [
            {
              code: 'bring_umbrella',
              severity: 'advisory',
              message: 'Bring an umbrella. Precipitation is likely.',
            },
            {
              code: 'high_humidity',
              severity: 'warning',
              message: 'High humidity may make conditions feel uncomfortable.',
            },
          ],
        },
      ],
    });
  });

  it('GET /weather/current without location returns 400', async () => {
    const response = await request(app.getHttpServer())
      .get('/weather/current')
      .query({ units: 'metric' })
      .expect(400);

    expect(provider.getCurrentWeather).not.toHaveBeenCalled();
    expect(response.body).toEqual({
      statusCode: 400,
      error: 'BAD_REQUEST',
      message: expect.arrayContaining([
        'location should not be empty',
        'location must be a string',
      ]),
      timestamp: expect.any(String),
      path: '/weather/current?units=metric',
    });
  });

  it('GET /weather/current with invalid units returns 400', async () => {
    const response = await request(app.getHttpServer())
      .get('/weather/current')
      .query({ location: 'Mexico City', units: 'invalid' })
      .expect(400);

    expect(provider.getCurrentWeather).not.toHaveBeenCalled();
    expect(response.body).toEqual({
      statusCode: 400,
      error: 'BAD_REQUEST',
      message: expect.arrayContaining([
        'units must be one of the following values: metric, imperial, standard',
      ]),
      timestamp: expect.any(String),
      path: '/weather/current?location=Mexico%20City&units=invalid',
    });
  });

  it('GET /weather/current returns provider not found response', async () => {
    provider.getCurrentWeather.mockRejectedValueOnce(
      new NotFoundException('Location "Mexico City" was not found'),
    );

    const response = await request(app.getHttpServer())
      .get('/weather/current')
      .query({ location: 'Mexico City', units: 'metric' })
      .expect(404);

    expect(response.body).toEqual({
      statusCode: 404,
      error: 'NOT_FOUND',
      message: 'Location "Mexico City" was not found',
      timestamp: expect.any(String),
      path: '/weather/current?location=Mexico%20City&units=metric',
    });
  });

  it('serves repeated current weather requests from cache', async () => {
    const firstResponse = await request(app.getHttpServer())
      .get('/weather/current')
      .query({ location: 'Mexico City', units: 'metric' })
      .expect(200);

    const secondResponse = await request(app.getHttpServer())
      .get('/weather/current')
      .query({ location: 'Mexico City', units: 'metric' })
      .expect(200);

    expect(provider.getCurrentWeather).toHaveBeenCalledOnce();
    expect(secondResponse.body).toEqual(firstResponse.body);
  });
});
