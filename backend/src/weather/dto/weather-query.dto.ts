import { Transform } from 'class-transformer';
import { IsEnum, IsNotEmpty, IsOptional, IsString, MaxLength } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  DEFAULT_WEATHER_UNITS,
  WeatherUnits,
} from '../types/weather-units.type';

export class WeatherQueryDto {
  @ApiProperty({
    description: 'City, or location name text accepted by OpenWeatherMap',
    example: 'Atlanta',
  })
  @Transform(({ value }) => (typeof value === 'string' ? value.trim() : value))
  @IsString()
  @IsNotEmpty()
  @MaxLength(100)
  location: string;

  @ApiPropertyOptional({
    description: 'Unit system returned by the API',
    enum: WeatherUnits,
    default: DEFAULT_WEATHER_UNITS,
    example: WeatherUnits.Metric,
  })
  @Transform(({ value }) => (typeof value === 'string' ? value.trim().toLowerCase() : value))
  @IsOptional()
  @IsEnum(WeatherUnits)
  units?: WeatherUnits = DEFAULT_WEATHER_UNITS;
}
