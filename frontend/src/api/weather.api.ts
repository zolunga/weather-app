import { getJson } from './http-client';
import type {
  CurrentWeatherResponse,
  ForecastWeatherResponse,
  WeatherSearchParams,
} from '../features/weather/types/weather.types';

export function getCurrentWeather({
  location,
  units,
}: WeatherSearchParams): Promise<CurrentWeatherResponse> {
  return getJson<CurrentWeatherResponse>('/weather/current', { location, units });
}

export function getForecastWeather({
  location,
  units,
}: WeatherSearchParams): Promise<ForecastWeatherResponse> {
  return getJson<ForecastWeatherResponse>('/weather/forecast', { location, units });
}
