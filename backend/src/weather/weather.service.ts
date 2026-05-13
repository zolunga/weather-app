import { Inject, Injectable } from '@nestjs/common';
import {
  CurrentWeatherResponseDto,
  ForecastWeatherResponseDto,
} from './dto/weather-response.dto';
import { WeatherMapper } from './mappers/weather.mapper';
import {
  WEATHER_PROVIDER,
  WeatherProvider,
} from './providers/weather-provider.interface';
import {
  DEFAULT_WEATHER_UNITS,
  WeatherUnits,
} from './types/weather-units.type';
import { WeatherInsightsService } from './weather-insights.service';

@Injectable()
export class WeatherService {
  constructor(
    @Inject(WEATHER_PROVIDER)
    private readonly weatherProvider: WeatherProvider,
    private readonly weatherMapper: WeatherMapper,
    private readonly weatherInsightsService: WeatherInsightsService,
  ) {}

  async getCurrentWeather(
    location: string,
    units: WeatherUnits = DEFAULT_WEATHER_UNITS,
  ): Promise<CurrentWeatherResponseDto> {
    const vendorResponse = await this.weatherProvider.getCurrentWeather(
      location,
      units,
    );
    const currentWeather = this.weatherMapper.toCurrentWeather(vendorResponse, units);

    currentWeather.insights = this.weatherInsightsService.generate({
      conditionMain: currentWeather.condition.main,
      conditionDescription: currentWeather.condition.description,
      humidity: currentWeather.humidity.value,
      precipitationProbability: undefined,
      temperature: currentWeather.temperature.current,
      units,
      windSpeed: currentWeather.wind.speed,
    });

    return currentWeather;
  }

  async getForecast(
    location: string,
    units: WeatherUnits = DEFAULT_WEATHER_UNITS,
  ): Promise<ForecastWeatherResponseDto> {
    const vendorResponse = await this.weatherProvider.getForecast(location, units);
    const forecast = this.weatherMapper.toForecast(vendorResponse, units);

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

    return forecast;
  }
}
