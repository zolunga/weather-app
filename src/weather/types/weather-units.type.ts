export enum WeatherUnits {
  Metric = 'metric',
  Imperial = 'imperial',
  Standard = 'standard',
}

export type TemperatureUnit = 'celsius' | 'fahrenheit' | 'kelvin';
export type WindSpeedUnit = 'm/s' | 'mph';

export const DEFAULT_WEATHER_UNITS = WeatherUnits.Metric;

export function getTemperatureUnit(units: WeatherUnits): TemperatureUnit {
  if (units === WeatherUnits.Metric) {
    return 'celsius';
  }

  if (units === WeatherUnits.Standard) {
    return 'kelvin';
  }

  return 'fahrenheit';
}

export function getWindSpeedUnit(units: WeatherUnits): WindSpeedUnit {
  return units === WeatherUnits.Imperial ? 'mph' : 'm/s';
}
