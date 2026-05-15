# Weather API

NestJS backend for the Weather App.

## Requirements

- Node.js 20 or newer
- npm
- OpenWeatherMap API key

## Setup

```bash
npm install
cp .env.example .env
```

Update `.env` with your OpenWeatherMap API key.

## Run

```bash
npm run start:dev
```

By default the API runs on `http://localhost:3000`.

## API Documentation

Swagger is enabled for local API exploration and request testing.

After starting the backend, open:

```text
http://localhost:3000/docs
```

## Environment

| Variable | Description |
| --- | --- |
| `PORT` | HTTP port for the NestJS server |
| `CORS_ORIGIN` | Comma-separated frontend origins allowed by CORS, for example `http://localhost:5173,http://127.0.0.1:5173` |
| `OPENWEATHER_API_KEY` | OpenWeatherMap API key |
| `OPENWEATHER_BASE_URL` | OpenWeatherMap base URL, usually `https://api.openweathermap.org` |
| `WEATHER_CACHE_TTL_SECONDS` | In-memory weather cache TTL in seconds. Defaults to `600` |

## Endpoints

- `GET /health`
- `GET /weather/current?location=Atlanta&units=metric`
- `GET /weather/forecast?location=Atlanta&units=metric`
- Swagger UI: `GET /docs`

Weather endpoints accept:

| Query param | Required | Values | Default |
| --- | --- | --- | --- |
| `location` | Yes | Any OpenWeatherMap-supported location text | none |
| `units` | No | `metric`, `imperial`, `standard` | `metric` |

Unit behavior:

| Value | Temperature | Wind speed |
| --- | --- | --- |
| `metric` | Celsius | m/s |
| `imperial` | Fahrenheit | mph |
| `standard` | Kelvin | m/s |

## Postman Import Examples

```bash
curl --location 'http://localhost:3000/health'
```

```bash
curl --location 'http://localhost:3000/weather/current?location=Atlanta&units=metric'
```

```bash
curl --location 'http://localhost:3000/weather/current?location=Atlanta&units=imperial'
```

```bash
curl --location 'http://localhost:3000/weather/current?location=Atlanta&units=standard'
```

```bash
curl --location 'http://localhost:3000/weather/forecast?location=Atlanta&units=metric'
```

```bash
curl --location 'http://localhost:3000/weather/forecast?location=Atlanta&units=imperial'
```

```bash
curl --location 'http://localhost:3000/weather/forecast?location=Atlanta&units=standard'
```

## Test and Build

```bash
npm run test
npm run test:e2e
npm run build
```

Tests run with Vitest. End-to-end API tests use Supertest against a NestJS
`TestingModule` and mock the weather provider, so they do not call OpenWeather
or require `OPENWEATHER_API_KEY`.

## Production readiness

- The app emits structured, JSON-friendly logs for startup, HTTP requests, OpenWeather failures, invalid locations, and unexpected backend errors.
- The backend uses an in-memory cache to reduce repeated external OpenWeather API calls for the same endpoint, normalized location, and units.
- Cached weather responses expire after 10 minutes by default. Override this with `WEATHER_CACHE_TTL_SECONDS=600`.
- For multi-instance production deployments, replace the in-memory cache with Redis or another distributed cache so instances share cached weather responses.
- HTTP request logs are emitted after each response finishes and include method, path, status code, duration, request ID when present, and user agent when present.
- Logs intentionally avoid sensitive data. OpenWeather API keys are never logged.
- In production, stdout/stderr logs should be shipped to Datadog, CloudWatch, Sentry, or another observability platform.
- Rate limiting is recommended before production to protect OpenWeather quota.
- End-to-end tests would be added before a real production deployment to cover the full frontend-to-backend weather lookup flow.

## Architecture Notes

- Controllers expose normalized API contracts and never return raw OpenWeather responses.
- `WeatherProvider` is an interface-style provider token, so OpenWeather can be replaced later.
- `OpenWeatherProvider` owns vendor URL construction, API key use, and upstream error mapping.
- `OpenWeatherMapper` translates OpenWeather payloads into normalized internal weather models.
- `WeatherInsightsService` contains the business logic for umbrella, humidity, wind, and comfort insights.
- `HttpExceptionFilter` centralizes error response shape.
