import { plainToInstance } from 'class-transformer';
import { validate } from 'class-validator';
import { WeatherQueryDto } from '../src/weather/dto/weather-query.dto';
import { WeatherUnits } from '../src/weather/types/weather-units.type';

describe('WeatherQueryDto', () => {
  it('trims location and defaults units to metric', async () => {
    const dto = plainToInstance(WeatherQueryDto, { location: ' Atlanta ' });

    const errors = await validate(dto);

    expect(errors).toHaveLength(0);
    expect(dto.location).toBe('Atlanta');
    expect(dto.units).toBe(WeatherUnits.Metric);
  });

  it('accepts metric, imperial, and standard units', async () => {
    for (const units of Object.values(WeatherUnits)) {
      const dto = plainToInstance(WeatherQueryDto, {
        location: 'Atlanta',
        units,
      });

      await expect(validate(dto)).resolves.toHaveLength(0);
    }
  });

  it('normalizes units casing before validation', async () => {
    const dto = plainToInstance(WeatherQueryDto, {
      location: 'Atlanta',
      units: 'METRIC',
    });

    const errors = await validate(dto);

    expect(errors).toHaveLength(0);
    expect(dto.units).toBe(WeatherUnits.Metric);
  });

  it('rejects empty location and unsupported units', async () => {
    const dto = plainToInstance(WeatherQueryDto, {
      location: '   ',
      units: 'rankine',
    });

    const errors = await validate(dto);

    expect(errors).toHaveLength(2);
    expect(errors.map((error) => error.property)).toEqual(
      expect.arrayContaining(['location', 'units']),
    );
  });
});
