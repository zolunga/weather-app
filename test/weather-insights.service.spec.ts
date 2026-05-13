import { WeatherInsightsService } from '../src/weather/weather-insights.service';
import { WeatherUnits } from '../src/weather/types/weather-units.type';

describe('WeatherInsightsService', () => {
  const service = new WeatherInsightsService();

  it('recommends an umbrella for wet weather', () => {
    const insights = service.generate({
      conditionMain: 'Rain',
      conditionDescription: 'moderate rain',
      humidity: 55,
      temperature: 68,
      units: WeatherUnits.Imperial,
      windSpeed: 8,
    });

    expect(insights).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ code: 'bring_umbrella' }),
      ]),
    );
  });

  it('warns about high humidity', () => {
    const insights = service.generate({
      conditionMain: 'Clouds',
      conditionDescription: 'broken clouds',
      humidity: 74,
      temperature: 79,
      units: WeatherUnits.Imperial,
      windSpeed: 6,
    });

    expect(insights).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ code: 'high_humidity' }),
      ]),
    );
  });

  it('warns about windy conditions', () => {
    const insights = service.generate({
      conditionMain: 'Clear',
      conditionDescription: 'clear sky',
      humidity: 45,
      temperature: 66,
      units: WeatherUnits.Imperial,
      windSpeed: 23,
    });

    expect(insights).toEqual(
      expect.arrayContaining([expect.objectContaining({ code: 'windy_day' })]),
    );
  });

  it('marks mild, dry, calm weather as comfortable', () => {
    const insights = service.generate({
      conditionMain: 'Clear',
      conditionDescription: 'clear sky',
      humidity: 42,
      temperature: 72,
      units: WeatherUnits.Imperial,
      windSpeed: 5,
    });

    expect(insights).toEqual([
      expect.objectContaining({ code: 'comfortable_weather' }),
    ]);
  });

  it('can return multiple warnings for mixed conditions', () => {
    const insights = service.generate({
      conditionMain: 'Thunderstorm',
      conditionDescription: 'thunderstorm with heavy rain',
      humidity: 82,
      precipitationProbability: 0.91,
      temperature: 81,
      units: WeatherUnits.Imperial,
      windSpeed: 25,
    });

    expect(insights.map((insight) => insight.code)).toEqual([
      'bring_umbrella',
      'high_humidity',
      'windy_day',
    ]);
  });

  it('applies comfort thresholds consistently for metric units', () => {
    const insights = service.generate({
      conditionMain: 'Clear',
      conditionDescription: 'clear sky',
      humidity: 42,
      temperature: 22,
      units: WeatherUnits.Metric,
      windSpeed: 2,
    });

    expect(insights).toEqual([
      expect.objectContaining({ code: 'comfortable_weather' }),
    ]);
  });

  it('applies wind thresholds consistently for standard units', () => {
    const insights = service.generate({
      conditionMain: 'Clear',
      conditionDescription: 'clear sky',
      humidity: 42,
      temperature: 295,
      units: WeatherUnits.Standard,
      windSpeed: 10,
    });

    expect(insights).toEqual(
      expect.arrayContaining([expect.objectContaining({ code: 'windy_day' })]),
    );
  });
});
