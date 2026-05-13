import { Injectable } from '@nestjs/common';
import {
  CurrentWeatherResponseDto,
  ForecastWeatherResponseDto,
} from '../dto/weather-response.dto';
import {
  OpenWeatherCurrentResponse,
  OpenWeatherForecastResponse,
} from '../types/open-weather.types';
import {
  DEFAULT_WEATHER_UNITS,
  getTemperatureUnit,
  getWindSpeedUnit,
  WeatherUnits,
} from '../types/weather-units.type';

@Injectable()
export class WeatherMapper {
  toCurrentWeather(
    response: OpenWeatherCurrentResponse,
    units: WeatherUnits = DEFAULT_WEATHER_UNITS,
  ): CurrentWeatherResponseDto {
    const condition = response.weather[0];

    return {
      location: {
        name: response.name,
        country: response.sys.country,
        coordinates: {
          latitude: response.coord.lat,
          longitude: response.coord.lon,
        },
      },
      observedAt: this.toIsoString(response.dt),
      condition: {
        main: condition?.main ?? 'Unknown',
        description: condition?.description ?? 'No description available',
      },
      temperature: {
        current: response.main.temp,
        feelsLike: response.main.feels_like,
        unit: getTemperatureUnit(units),
      },
      humidity: {
        value: response.main.humidity,
        unit: 'percent',
      },
      wind: {
        speed: response.wind.speed,
        unit: getWindSpeedUnit(units),
        directionDegrees: response.wind.deg,
      },
      insights: [],
    };
  }

  toForecast(
    response: OpenWeatherForecastResponse,
    units: WeatherUnits = DEFAULT_WEATHER_UNITS,
  ): ForecastWeatherResponseDto {
    return {
      location: {
        name: response.city.name,
        country: response.city.country,
        coordinates: {
          latitude: response.city.coord.lat,
          longitude: response.city.coord.lon,
        },
      },
      items: response.list.map((item) => {
        const condition = item.weather[0];

        return {
          forecastedAt: this.toIsoString(item.dt),
          condition: {
            main: condition?.main ?? 'Unknown',
            description: condition?.description ?? 'No description available',
          },
          temperature: {
            current: item.main.temp,
            feelsLike: item.main.feels_like,
            unit: getTemperatureUnit(units),
          },
          humidity: {
            value: item.main.humidity,
            unit: 'percent' as const,
          },
          wind: {
            speed: item.wind.speed,
            unit: getWindSpeedUnit(units),
            directionDegrees: item.wind.deg,
          },
          precipitationProbability: item.pop,
          insights: [],
        };
      }),
    };
  }

  private toIsoString(unixTimestampSeconds: number): string {
    return new Date(unixTimestampSeconds * 1000).toISOString();
  }
}
