import { Module } from '@nestjs/common';
import { WeatherController } from './weather.controller';
import { WeatherService } from './weather.service';
import { WeatherInsightsService } from './weather-insights.service';
import { CacheService } from './cache.service';
import { WeatherMapper } from './mappers/weather.mapper';
import { OpenWeatherProvider } from './providers/open-weather.provider';
import { WEATHER_PROVIDER } from './providers/weather-provider.interface';

@Module({
  controllers: [WeatherController],
  providers: [
    CacheService,
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
