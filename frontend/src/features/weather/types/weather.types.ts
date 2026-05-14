export type WeatherUnits = 'metric' | 'imperial';
export type TemperatureUnit = 'celsius' | 'fahrenheit' | 'kelvin';
export type WindSpeedUnit = 'm/s' | 'mph';
export type InsightSeverity = 'info' | 'advisory' | 'warning';

export interface WeatherSearchParams {
  location: string;
  units: WeatherUnits;
}

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

export interface CurrentWeatherResponse {
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

export interface ForecastWeatherResponse {
  location: WeatherLocation;
  items: ForecastWeatherItem[];
}
