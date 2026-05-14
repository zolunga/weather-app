import type { WeatherUnits } from '../features/weather/types/weather.types';

interface UnitToggleProps {
  value: WeatherUnits;
  onChange: (units: WeatherUnits) => void;
}

export function UnitToggle({ value, onChange }: UnitToggleProps) {
  return (
    <div className="unit-toggle" aria-label="Units">
      <button
        type="button"
        className={value === 'metric' ? 'active' : ''}
        aria-pressed={value === 'metric'}
        onClick={() => onChange('metric')}
      >
        Metric
      </button>
      <button
        type="button"
        className={value === 'imperial' ? 'active' : ''}
        aria-pressed={value === 'imperial'}
        onClick={() => onChange('imperial')}
      >
        Imperial
      </button>
    </div>
  );
}
