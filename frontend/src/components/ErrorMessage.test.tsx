import { render, screen } from '@testing-library/react';
import { ApiError } from '../api/http-client';
import { ErrorMessage } from './ErrorMessage';

describe('ErrorMessage', () => {
  it('renders backend error message', () => {
    render(<ErrorMessage error={new ApiError('Location not found', 404)} />);

    expect(screen.getByRole('alert')).toHaveTextContent('Location not found');
  });
});
