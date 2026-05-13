import { Injectable } from '@nestjs/common';
import { WeatherInsightDto } from './dto/weather-response.dto';
import { WeatherUnits } from './types/weather-units.type';

interface WeatherInsightInput {
  conditionMain: string;
  conditionDescription: string;
  humidity: number;
  precipitationProbability?: number;
  temperature: number;
  units: WeatherUnits;
  windSpeed: number;
}

@Injectable()
export class WeatherInsightsService {
  private readonly highHumidityThreshold = 70;
  private readonly windyThresholdMph = 20;
  private readonly umbrellaProbabilityThreshold = 0.45;
  private readonly comfortableTemperatureRange = { min: 60, max: 78 };

  generate(input: WeatherInsightInput): WeatherInsightDto[] {
    const insights: WeatherInsightDto[] = [];
    const temperatureFahrenheit = this.toFahrenheit(input.temperature, input.units);
    const windSpeedMph = this.toMph(input.windSpeed, input.units);
    const conditionText = `${input.conditionMain} ${input.conditionDescription}`.toLowerCase();
    const hasWetWeather = ['rain', 'drizzle', 'thunderstorm', 'snow'].some((keyword) =>
      conditionText.includes(keyword),
    );

    if (
      hasWetWeather ||
      (input.precipitationProbability ?? 0) >= this.umbrellaProbabilityThreshold
    ) {
      insights.push({
        code: 'bring_umbrella',
        severity: 'advisory',
        message: 'Bring an umbrella. Precipitation is likely.',
      });
    }

    if (input.humidity >= this.highHumidityThreshold) {
      insights.push({
        code: 'high_humidity',
        severity: 'warning',
        message: 'High humidity may make conditions feel uncomfortable.',
      });
    }

    if (windSpeedMph >= this.windyThresholdMph) {
      insights.push({
        code: 'windy_day',
        severity: 'warning',
        message: 'Expect a windy day. Secure loose outdoor items.',
      });
    }

    const isComfortable =
      temperatureFahrenheit >= this.comfortableTemperatureRange.min &&
      temperatureFahrenheit <= this.comfortableTemperatureRange.max &&
      input.humidity < this.highHumidityThreshold &&
      windSpeedMph < this.windyThresholdMph &&
      insights.length === 0;

    if (isComfortable) {
      insights.push({
        code: 'comfortable_weather',
        severity: 'info',
        message: 'Comfortable weather for spending time outside.',
      });
    }

    return insights;
  }

  private toFahrenheit(temperature: number, units: WeatherUnits): number {
    if (units === WeatherUnits.Metric) {
      return temperature * 1.8 + 32;
    }

    if (units === WeatherUnits.Standard) {
      return (temperature - 273.15) * 1.8 + 32;
    }

    return temperature;
  }

  private toMph(windSpeed: number, units: WeatherUnits): number {
    return units === WeatherUnits.Imperial ? windSpeed : windSpeed * 2.23694;
  }
}
