interface LoadingStateProps {
  message?: string;
}

export function LoadingState({ message = 'Loading weather data...' }: LoadingStateProps) {
  return (
    <div className="message message-loading" role="status" aria-live="polite">
      <span className="spinner" aria-hidden="true" />
      <span>{message}</span>
    </div>
  );
}
