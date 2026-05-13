import { Controller, Get, Query } from '@nestjs/common';
import {
  ApiBadRequestResponse,
  ApiBadGatewayResponse,
  ApiNotFoundResponse,
  ApiOkResponse,
  ApiOperation,
  ApiServiceUnavailableResponse,
  ApiTags,
} from '@nestjs/swagger';
import { WeatherQueryDto } from './dto/weather-query.dto';
import {
  CurrentWeatherResponseDto,
  ForecastWeatherResponseDto,
} from './dto/weather-response.dto';
import { WeatherService } from './weather.service';

@ApiTags('weather')
@Controller('weather')
export class WeatherController {
  constructor(private readonly weatherService: WeatherService) {}

  @Get('current')
  @ApiOperation({ summary: 'Get normalized current weather by location' })
  @ApiOkResponse({ type: CurrentWeatherResponseDto })
  @ApiBadRequestResponse({ description: 'Invalid query parameters' })
  @ApiNotFoundResponse({ description: 'Location not found' })
  @ApiBadGatewayResponse({ description: 'Weather provider returned an unexpected error' })
  @ApiServiceUnavailableResponse({ description: 'Weather provider is unavailable or rate limited' })
  getCurrentWeather(
    @Query() query: WeatherQueryDto,
  ): Promise<CurrentWeatherResponseDto> {
    return this.weatherService.getCurrentWeather(query.location, query.units);
  }

  @Get('forecast')
  @ApiOperation({ summary: 'Get normalized 5-day forecast by location' })
  @ApiOkResponse({ type: ForecastWeatherResponseDto })
  @ApiBadRequestResponse({ description: 'Invalid query parameters' })
  @ApiNotFoundResponse({ description: 'Location not found' })
  @ApiBadGatewayResponse({ description: 'Weather provider returned an unexpected error' })
  @ApiServiceUnavailableResponse({ description: 'Weather provider is unavailable or rate limited' })
  getForecast(
    @Query() query: WeatherQueryDto,
  ): Promise<ForecastWeatherResponseDto> {
    return this.weatherService.getForecast(query.location, query.units);
  }
}
