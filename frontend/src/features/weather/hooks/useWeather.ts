import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { getCurrentWeather, getForecastWeather } from '../../../api/weather.api';
import type { WeatherSearchParams } from '../types/weather.types';

export function useWeather() {
  const [submittedSearch, setSubmittedSearch] = useState<WeatherSearchParams | null>(null);
  const canFetch = Boolean(submittedSearch?.location.trim());

  const currentWeatherQuery = useQuery({
    queryKey: ['weather', 'current', submittedSearch],
    queryFn: () => getCurrentWeather(submittedSearch as WeatherSearchParams),
    enabled: canFetch,
    retry: 1,
  });

  const forecastQuery = useQuery({
    queryKey: ['weather', 'forecast', submittedSearch],
    queryFn: () => getForecastWeather(submittedSearch as WeatherSearchParams),
    enabled: canFetch,
    retry: false,
  });

  return {
    currentWeatherQuery,
    forecastQuery,
    hasSubmittedSearch: submittedSearch !== null,
    submittedSearch,
    submitSearch: setSubmittedSearch,
  };
}
