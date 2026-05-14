import type { CurrentWeatherResponse } from '../types/weather.types';
import { WeatherInsights } from './WeatherInsights';
import { WeatherIcon } from './WeatherIcon';

interface CurrentWeatherCardProps {
  weather: CurrentWeatherResponse;
}

export function CurrentWeatherCard({ weather }: CurrentWeatherCardProps) {
  return (
    <section className="weather-card current-weather" aria-labelledby="current-weather-heading">
      <div className="card-header">
        <div>
          <p className="eyebrow">Current weather</p>
          <h2 id="current-weather-heading">
            {weather.location.name}
            {weather.location.country ? `, ${weather.location.country}` : ''}
          </h2>
        </div>
        <time dateTime={weather.observedAt}>{formatDateTime(weather.observedAt)}</time>
      </div>

      <div className="current-weather-body">
        <div className="current-weather-summary">
          <WeatherIcon condition={weather.condition} size="large" />
          <div>
            <div className="temperature">
              {formatNumber(weather.temperature.current)}
              <span>{formatTemperatureUnit(weather.temperature.unit)}</span>
            </div>
            <p className="condition">{weather.condition.description}</p>
          </div>
        </div>

        <dl className="weather-stats">
          <div>
            <dt>Feels like</dt>
            <dd>
              {weather.temperature.feelsLike === undefined
                ? 'Unavailable'
                : `${formatNumber(weather.temperature.feelsLike)}${formatTemperatureUnit(
                    weather.temperature.unit,
                  )}`}
            </dd>
          </div>
          <div>
            <dt>Humidity</dt>
            <dd>{weather.humidity.value}%</dd>
          </div>
          <div>
            <dt>Wind</dt>
            <dd>
              {formatNumber(weather.wind.speed)} {weather.wind.unit}
            </dd>
          </div>
        </dl>
      </div>

      <WeatherInsights insights={weather.insights} />
    </section>
  );
}

function formatDateTime(value: string): string {
  return new Intl.DateTimeFormat(undefined, {
    month: 'short',
    day: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
  }).format(new Date(value));
}

function formatNumber(value: number): string {
  return new Intl.NumberFormat(undefined, {
    maximumFractionDigits: 0,
  }).format(value);
}

function formatTemperatureUnit(unit: CurrentWeatherResponse['temperature']['unit']): string {
  if (unit === 'celsius') {
    return 'C';
  }

  if (unit === 'fahrenheit') {
    return 'F';
  }

  return 'K';
}
