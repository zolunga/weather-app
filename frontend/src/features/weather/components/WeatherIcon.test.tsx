import { render, screen } from '@testing-library/react';
import { WeatherIcon } from './WeatherIcon';

describe('WeatherIcon', () => {
  it('renders a sunny icon label for clear conditions', () => {
    render(<WeatherIcon condition={{ main: 'Clear', description: 'clear sky' }} />);

    expect(screen.getByText('Sunny')).toBeInTheDocument();
  });

  it('renders a rainy icon label for rain conditions', () => {
    render(<WeatherIcon condition={{ main: 'Rain', description: 'moderate rain' }} />);

    expect(screen.getByText('Rainy')).toBeInTheDocument();
  });

  it('renders a cloudy icon label for cloud conditions', () => {
    render(<WeatherIcon condition={{ main: 'Clouds', description: 'overcast clouds' }} />);

    expect(screen.getByText('Cloudy')).toBeInTheDocument();
  });
});
