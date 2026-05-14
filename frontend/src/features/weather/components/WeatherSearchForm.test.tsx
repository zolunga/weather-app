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
});
