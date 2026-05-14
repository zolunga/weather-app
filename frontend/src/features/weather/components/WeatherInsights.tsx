import type { WeatherInsight } from '../types/weather.types';

interface WeatherInsightsProps {
  compact?: boolean;
  insights: WeatherInsight[];
}

export function WeatherInsights({ compact = false, insights }: WeatherInsightsProps) {
  if (insights.length === 0) {
    return null;
  }

  return (
    <div className={compact ? 'insights compact' : 'insights'} aria-label="Weather insights">
      {insights.map((insight) => (
        <p className={`insight insight-${insight.severity}`} key={`${insight.code}-${insight.message}`}>
          {insight.message}
        </p>
      ))}
    </div>
  );
}
