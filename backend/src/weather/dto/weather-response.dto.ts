import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  TemperatureUnit,
  WindSpeedUnit,
} from '../types/weather-units.type';

export type InsightSeverity = 'info' | 'advisory' | 'warning';

export class CoordinatesDto {
  @ApiProperty({ example: 33.749 })
  latitude: number;

  @ApiProperty({ example: -84.388 })
  longitude: number;
}

export class WeatherLocationDto {
  @ApiProperty({ example: 'Atlanta' })
  name: string;

  @ApiPropertyOptional({ example: 'US' })
  country?: string;

  @ApiProperty({ type: CoordinatesDto })
  coordinates: CoordinatesDto;
}

export class WeatherConditionDto {
  @ApiProperty({ example: 'Clear' })
  main: string;

  @ApiProperty({ example: 'clear sky' })
  description: string;
}

export class TemperatureDto {
  @ApiProperty({ example: 72.4 })
  current: number;

  @ApiPropertyOptional({ example: 70.8 })
  feelsLike?: number;

  @ApiProperty({ enum: ['celsius', 'fahrenheit', 'kelvin'], example: 'fahrenheit' })
  unit: TemperatureUnit;
}

export class HumidityDto {
  @ApiProperty({ example: 63 })
  value: number;

  @ApiProperty({ example: 'percent' })
  unit: 'percent';
}

export class WindDto {
  @ApiProperty({ example: 8.2 })
  speed: number;

  @ApiProperty({ enum: ['m/s', 'mph'], example: 'mph' })
  unit: WindSpeedUnit;

  @ApiPropertyOptional({ example: 210 })
  directionDegrees?: number;
}

export class WeatherInsightDto {
  @ApiProperty({ example: 'bring_umbrella' })
  code: string;

  @ApiProperty({ enum: ['info', 'advisory', 'warning'], example: 'advisory' })
  severity: InsightSeverity;

  @ApiProperty({ example: 'Bring an umbrella. Precipitation is likely.' })
  message: string;
}

export class CurrentWeatherResponseDto {
  @ApiProperty({ type: WeatherLocationDto })
  location: WeatherLocationDto;

  @ApiProperty({ example: '2026-05-13T19:00:00.000Z' })
  observedAt: string;

  @ApiProperty({ type: WeatherConditionDto })
  condition: WeatherConditionDto;

  @ApiProperty({ type: TemperatureDto })
  temperature: TemperatureDto;

  @ApiProperty({ type: HumidityDto })
  humidity: HumidityDto;

  @ApiProperty({ type: WindDto })
  wind: WindDto;

  @ApiProperty({ type: [WeatherInsightDto] })
  insights: WeatherInsightDto[];
}

export class ForecastWeatherItemDto {
  @ApiProperty({ example: '2026-05-13T21:00:00.000Z' })
  forecastedAt: string;

  @ApiProperty({ type: WeatherConditionDto })
  condition: WeatherConditionDto;

  @ApiProperty({ type: TemperatureDto })
  temperature: TemperatureDto;

  @ApiProperty({ type: HumidityDto })
  humidity: HumidityDto;

  @ApiProperty({ type: WindDto })
  wind: WindDto;

  @ApiPropertyOptional({ example: 0.67, minimum: 0, maximum: 1 })
  precipitationProbability?: number;

  @ApiProperty({ type: [WeatherInsightDto] })
  insights: WeatherInsightDto[];
}

export class ForecastWeatherResponseDto {
  @ApiProperty({ type: WeatherLocationDto })
  location: WeatherLocationDto;

  @ApiProperty({ type: [ForecastWeatherItemDto] })
  items: ForecastWeatherItemDto[];
}
