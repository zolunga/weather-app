import type { ApiError } from '../api/http-client';

interface ErrorMessageProps {
  error: unknown;
  title?: string;
}

export function ErrorMessage({ error, title = 'Unable to load weather' }: ErrorMessageProps) {
  return (
    <div className="message message-error" role="alert">
      <strong>{title}</strong>
      <p>{getErrorText(error)}</p>
    </div>
  );
}

function getErrorText(error: unknown): string {
  if (isApiError(error)) {
    return error.message;
  }

  if (error instanceof Error && error.message) {
    return error.message;
  }

  return 'Something went wrong. Please try again.';
}

function isApiError(error: unknown): error is ApiError {
  return error instanceof Error && error.name === 'ApiError';
}
