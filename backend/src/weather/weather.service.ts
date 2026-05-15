import { Inject, Injectable } from '@nestjs/common';
import {
  WEATHER_PROVIDER,
  WeatherProvider,
} from './providers/weather-provider.interface';
import {
  DEFAULT_WEATHER_UNITS,
  WeatherUnits,
} from './types/weather-units.type';
import { CacheService } from './cache.service';
import { WeatherInsightsService } from './weather-insights.service';
import { CurrentWeather, WeatherForecast } from './models/weather.models';

@Injectable()
export class WeatherService {
  constructor(
    @Inject(WEATHER_PROVIDER)
    private readonly weatherProvider: WeatherProvider,
    private readonly weatherInsightsService: WeatherInsightsService,
    private readonly cacheService: CacheService,
  ) {}

  async getCurrentWeather(
    location: string,
    units: WeatherUnits = DEFAULT_WEATHER_UNITS,
  ): Promise<CurrentWeather> {
    const cacheKey = { endpoint: 'current' as const, location, units };
    const cachedWeather =
      this.cacheService.get<CurrentWeather>(cacheKey);

    if (cachedWeather) {
      return cachedWeather;
    }

    const currentWeather = await this.weatherProvider.getCurrentWeather(
      location,
      units,
    );

    currentWeather.insights = this.weatherInsightsService.generate({
      conditionMain: currentWeather.condition.main,
      conditionDescription: currentWeather.condition.description,
      humidity: currentWeather.humidity.value,
      precipitationProbability: undefined,
      temperature: currentWeather.temperature.current,
      units,
      windSpeed: currentWeather.wind.speed,
    });

    this.cacheService.set(cacheKey, currentWeather);

    return currentWeather;
  }

  async getForecast(
    location: string,
    units: WeatherUnits = DEFAULT_WEATHER_UNITS,
  ): Promise<WeatherForecast> {
    const cacheKey = { endpoint: 'forecast' as const, location, units };
    const cachedForecast =
      this.cacheService.get<WeatherForecast>(cacheKey);

    if (cachedForecast) {
      return cachedForecast;
    }

    const forecast = await this.weatherProvider.getForecast(location, units);

    forecast.items = forecast.items.map((item) => ({
      ...item,
      insights: this.weatherInsightsService.generate({
        conditionMain: item.condition.main,
        conditionDescription: item.condition.description,
        humidity: item.humidity.value,
        precipitationProbability: item.precipitationProbability,
        temperature: item.temperature.current,
        units,
        windSpeed: item.wind.speed,
      }),
    }));

    this.cacheService.set(cacheKey, forecast);

    return forecast;
  }
}
