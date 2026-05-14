import { render, screen } from '@testing-library/react';
import { currentWeatherFixture } from '../../../test/weather-fixtures';
import { CurrentWeatherCard } from './CurrentWeatherCard';

describe('CurrentWeatherCard', () => {
  it('renders weather data', () => {
    render(<CurrentWeatherCard weather={currentWeatherFixture} />);

    expect(screen.getByRole('heading', { name: /atlanta, us/i })).toBeInTheDocument();
    expect(screen.getByText(/clear sky/i)).toBeInTheDocument();
    expect(screen.getByText('72')).toBeInTheDocument();
    expect(screen.getByText(/63%/i)).toBeInTheDocument();
    expect(screen.getByText(/comfortable weather/i)).toBeInTheDocument();
  });
});
