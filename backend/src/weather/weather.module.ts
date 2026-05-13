import { Module } from '@nestjs/common';
import { WeatherController } from './weather.controller';
import { WeatherService } from './weather.service';
import { WeatherInsightsService } from './weather-insights.service';
import { WeatherMapper } from './mappers/weather.mapper';
import { OpenWeatherProvider } from './providers/open-weather.provider';
import { WEATHER_PROVIDER } from './providers/weather-provider.interface';

@Module({
  controllers: [WeatherController],
  providers: [
    WeatherService,
    WeatherInsightsService,
    WeatherMapper,
    {
      provide: WEATHER_PROVIDER,
      useClass: OpenWeatherProvider,
    },
  ],
})
export class WeatherModule {}
