import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { WeatherPage } from './features/weather/weather-page';

const queryClient = new QueryClient();

export function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <WeatherPage />
    </QueryClientProvider>
  );
}
