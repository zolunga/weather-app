import {
  OpenWeatherCurrentResponse,
  OpenWeatherForecastResponse,
} from '../types/open-weather.types';
import { WeatherUnits } from '../types/weather-units.type';

export const WEATHER_PROVIDER = Symbol('WEATHER_PROVIDER');

export interface WeatherProvider {
  getCurrentWeather(
    location: string,
    units: WeatherUnits,
  ): Promise<OpenWeatherCurrentResponse>;
  getForecast(
    location: string,
    units: WeatherUnits,
  ): Promise<OpenWeatherForecastResponse>;
}
