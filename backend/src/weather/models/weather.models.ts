import {
  TemperatureUnit,
  WindSpeedUnit,
} from '../types/weather-units.type';

export type InsightSeverity = 'info' | 'advisory' | 'warning';

export interface Coordinates {
  latitude: number;
  longitude: number;
}

export interface WeatherLocation {
  name: string;
  country?: string;
  coordinates: Coordinates;
}

export interface WeatherCondition {
  main: string;
  description: string;
}

export interface Temperature {
  current: number;
  feelsLike?: number;
  unit: TemperatureUnit;
}

export interface Humidity {
  value: number;
  unit: 'percent';
}

export interface Wind {
  speed: number;
  unit: WindSpeedUnit;
  directionDegrees?: number;
}

export interface WeatherInsight {
  code: string;
  severity: InsightSeverity;
  message: string;
}

export interface CurrentWeather {
  location: WeatherLocation;
  observedAt: string;
  condition: WeatherCondition;
  temperature: Temperature;
  humidity: Humidity;
  wind: Wind;
  insights: WeatherInsight[];
}

export interface ForecastWeatherItem {
  forecastedAt: string;
  condition: WeatherCondition;
  temperature: Temperature;
  humidity: Humidity;
  wind: Wind;
  precipitationProbability?: number;
  insights: WeatherInsight[];
}

export interface WeatherForecast {
  location: WeatherLocation;
  items: ForecastWeatherItem[];
}
