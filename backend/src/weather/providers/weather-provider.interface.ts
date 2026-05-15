import { WeatherUnits } from '../types/weather-units.type';
import { CurrentWeather, WeatherForecast } from '../models/weather.models';

export const WEATHER_PROVIDER = Symbol('WEATHER_PROVIDER');

export interface WeatherProvider {
  getCurrentWeather(
    location: string,
    units: WeatherUnits,
  ): Promise<CurrentWeather>;
  getForecast(
    location: string,
    units: WeatherUnits,
  ): Promise<WeatherForecast>;
}
