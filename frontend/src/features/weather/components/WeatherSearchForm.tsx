import { FormEvent, useState } from 'react';
import { UnitToggle } from '../../../components/UnitToggle';
import type { WeatherSearchParams, WeatherUnits } from '../types/weather.types';

interface WeatherSearchFormProps {
  isLoading?: boolean;
  onSubmit: (params: WeatherSearchParams) => void;
}

export function WeatherSearchForm({ isLoading = false, onSubmit }: WeatherSearchFormProps) {
  const [location, setLocation] = useState('');
  const [units, setUnits] = useState<WeatherUnits>('metric');
  const trimmedLocation = location.trim();

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!trimmedLocation || isLoading) {
      return;
    }

    onSubmit({ location: trimmedLocation, units });
  }

  function handleUnitsChange(nextUnits: WeatherUnits) {
    setUnits(nextUnits);

    if (!trimmedLocation || isLoading || nextUnits === units) {
      return;
    }

    onSubmit({ location: trimmedLocation, units: nextUnits });
  }

  return (
    <form className="search-form" onSubmit={handleSubmit}>
      <label htmlFor="weather-location">Location</label>
      <div className="search-row">
        <input
          id="weather-location"
          name="location"
          type="search"
          autoComplete="address-level2"
          placeholder="Search city or place"
          value={location}
          onChange={(event) => setLocation(event.target.value)}
        />
        <button type="submit" disabled={!trimmedLocation || isLoading}>
          {isLoading ? 'Searching' : 'Search'}
        </button>
      </div>
      <UnitToggle disabled={isLoading} value={units} onChange={handleUnitsChange} />
    </form>
  );
}
