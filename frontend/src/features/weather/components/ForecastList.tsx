import type { ForecastWeatherItem } from '../types/weather.types';
import { WeatherInsights } from './WeatherInsights';
import { WeatherIcon } from './WeatherIcon';

interface ForecastListProps {
  items: ForecastWeatherItem[];
}

export function ForecastList({ items }: ForecastListProps) {
  if (items.length === 0) {
    return null;
  }

  return (
    <section className="forecast-section" aria-labelledby="forecast-heading">
      <div className="section-heading">
        <p className="eyebrow">Forecast</p>
        <h2 id="forecast-heading">Next conditions</h2>
      </div>
      <div className="forecast-list">
        {items.slice(0, 8).map((item) => (
          <article className="forecast-item" key={item.forecastedAt}>
            <div className="forecast-item-header">
              <div>
                <time dateTime={item.forecastedAt}>{formatForecastDate(item.forecastedAt)}</time>
                <p>{item.condition.description}</p>
              </div>
              <WeatherIcon condition={item.condition} />
            </div>
            <div className="forecast-temp">
              {formatNumber(item.temperature.current)}
              {formatTemperatureUnit(item.temperature.unit)}
            </div>
            <dl>
              <div>
                <dt>Humidity</dt>
                <dd>{item.humidity.value}%</dd>
              </div>
              <div>
                <dt>Wind</dt>
                <dd>
                  {formatNumber(item.wind.speed)} {item.wind.unit}
                </dd>
              </div>
              {item.precipitationProbability !== undefined ? (
                <div>
                  <dt>Precip.</dt>
                  <dd>{Math.round(item.precipitationProbability * 100)}%</dd>
                </div>
              ) : null}
            </dl>
            <WeatherInsights insights={item.insights} compact />
          </article>
        ))}
      </div>
    </section>
  );
}

function formatForecastDate(value: string): string {
  return new Intl.DateTimeFormat(undefined, {
    weekday: 'short',
    hour: 'numeric',
  }).format(new Date(value));
}

function formatNumber(value: number): string {
  return new Intl.NumberFormat(undefined, {
    maximumFractionDigits: 0,
  }).format(value);
}

function formatTemperatureUnit(unit: ForecastWeatherItem['temperature']['unit']): string {
  if (unit === 'celsius') {
    return 'C';
  }

  if (unit === 'fahrenheit') {
    return 'F';
  }

  return 'K';
}
