import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { WeatherSearchForm } from './WeatherSearchForm';

describe('WeatherSearchForm', () => {
  it('calls submit with location and units', async () => {
    const user = userEvent.setup();
    const handleSubmit = vi.fn();

    render(<WeatherSearchForm onSubmit={handleSubmit} />);

    await user.type(screen.getByLabelText(/location/i), ' Charleston ');
    await user.click(screen.getByRole('button', { name: /imperial/i }));
    await user.click(screen.getByRole('button', { name: /search/i }));

    expect(handleSubmit).toHaveBeenCalledWith({
      location: 'Charleston',
      units: 'imperial',
    });
  });

  it('submits when pressing enter in the location input', async () => {
    const user = userEvent.setup();
    const handleSubmit = vi.fn();

    render(<WeatherSearchForm onSubmit={handleSubmit} />);

    await user.type(screen.getByLabelText(/location/i), 'Merida{Enter}');

    expect(handleSubmit).toHaveBeenCalledWith({
      location: 'Merida',
      units: 'metric',
    });
  });

  it('submits the current location when units change', async () => {
    const user = userEvent.setup();
    const handleSubmit = vi.fn();

    render(<WeatherSearchForm onSubmit={handleSubmit} />);

    await user.type(screen.getByLabelText(/location/i), 'Cancun');
    await user.click(screen.getByRole('button', { name: /imperial/i }));

    expect(handleSubmit).toHaveBeenCalledWith({
      location: 'Cancun',
      units: 'imperial',
    });
  });

  it('disables search and unit selection while loading', () => {
    render(<WeatherSearchForm isLoading onSubmit={vi.fn()} />);

    expect(screen.getByRole('button', { name: /searching/i })).toBeDisabled();
    expect(screen.getByRole('button', { name: /metric/i })).toBeDisabled();
    expect(screen.getByRole('button', { name: /imperial/i })).toBeDisabled();
  });

  it('does not submit with enter while loading', async () => {
    const user = userEvent.setup();
    const handleSubmit = vi.fn();

    render(<WeatherSearchForm isLoading onSubmit={handleSubmit} />);

    await user.type(screen.getByLabelText(/location/i), 'Tulum{Enter}');

    expect(handleSubmit).not.toHaveBeenCalled();
  });
});
