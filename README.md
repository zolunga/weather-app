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

## Environment

| Variable | Description |
| --- | --- |
| `PORT` | HTTP port for the NestJS server |
| `OPENWEATHER_API_KEY` | OpenWeatherMap API key |
| `OPENWEATHER_BASE_URL` | OpenWeatherMap base URL, usually `https://api.openweathermap.org` |

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
npm run build
```

Tests run with Vitest.

## Architecture Notes

- Controllers expose normalized API contracts and never return raw OpenWeather responses.
- `WeatherProvider` is an interface-style provider token, so OpenWeather can be replaced later.
- `OpenWeatherProvider` owns vendor URL construction, API key use, and upstream error mapping.
- `WeatherMapper` translates vendor payloads into internal response DTOs.
- `WeatherInsightsService` contains the business logic for umbrella, humidity, wind, and comfort insights.
- `HttpExceptionFilter` centralizes error response shape.
