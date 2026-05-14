import { ErrorMessage } from '../../components/ErrorMessage';
import { LoadingState } from '../../components/LoadingState';
import { CurrentWeatherCard } from './components/CurrentWeatherCard';
import { ForecastList } from './components/ForecastList';
import { WeatherSearchForm } from './components/WeatherSearchForm';
import { useWeather } from './hooks/useWeather';

export function WeatherPage() {
  const {
    currentWeatherQuery,
    forecastQuery,
    hasSubmittedSearch,
    submitSearch,
  } = useWeather();
  const isLoading = currentWeatherQuery.isFetching || forecastQuery.isFetching;

  return (
    <main className="app-shell">
      <section className="hero" aria-labelledby="app-title">
        <div>
          <p className="eyebrow">Weather App</p>
          <h1 id="app-title">Reliable local weather, built for quick decisions.</h1>
          <p>
            Search a location to see current conditions, forecast details, and practical
            recommendations from the backend.
          </p>
        </div>
        <WeatherSearchForm isLoading={isLoading} onSubmit={submitSearch} />
      </section>

      <section className="results" aria-live="polite">
        {!hasSubmittedSearch ? (
          <div className="empty-state">
            <h2>Search for a location</h2>
            <p>Enter a city or place name to load weather conditions.</p>
          </div>
        ) : null}

        {currentWeatherQuery.isLoading ? <LoadingState /> : null}

        {currentWeatherQuery.isError ? <ErrorMessage error={currentWeatherQuery.error} /> : null}

        {currentWeatherQuery.data ? <CurrentWeatherCard weather={currentWeatherQuery.data} /> : null}

        {forecastQuery.isLoading && currentWeatherQuery.data ? (
          <LoadingState message="Loading forecast..." />
        ) : null}

        {forecastQuery.isError && currentWeatherQuery.data ? (
          <ErrorMessage
            error={forecastQuery.error}
            title="Forecast unavailable"
          />
        ) : null}

        {forecastQuery.data ? <ForecastList items={forecastQuery.data.items} /> : null}
      </section>
    </main>
  );
}
