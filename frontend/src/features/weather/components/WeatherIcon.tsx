import {
  Cloud,
  CloudDrizzle,
  CloudFog,
  CloudLightning,
  CloudRain,
  CloudSnow,
  CloudSun,
  Sun,
  Wind,
  type LucideIcon,
} from 'lucide-react';
import type { WeatherCondition } from '../types/weather.types';

interface WeatherIconProps {
  condition: WeatherCondition;
  size?: 'large' | 'small';
}

export function WeatherIcon({ condition, size = 'small' }: WeatherIconProps) {
  const { Icon, label, tone } = getWeatherIconConfig(condition);

  return (
    <span className={`weather-icon weather-icon-${size} weather-icon-${tone}`} title={label}>
      <Icon aria-hidden="true" strokeWidth={2.1} />
      <span className="sr-only">{label}</span>
    </span>
  );
}

function getWeatherIconConfig(condition: WeatherCondition): {
  Icon: LucideIcon;
  label: string;
  tone: string;
} {
  const main = condition.main.toLowerCase();
  const description = condition.description.toLowerCase();
  const text = `${main} ${description}`;

  if (text.includes('thunderstorm')) {
    return { Icon: CloudLightning, label: 'Thunderstorm', tone: 'storm' };
  }

  if (text.includes('drizzle')) {
    return { Icon: CloudDrizzle, label: 'Drizzle', tone: 'rain' };
  }

  if (text.includes('rain')) {
    return { Icon: CloudRain, label: 'Rainy', tone: 'rain' };
  }

  if (text.includes('snow') || text.includes('sleet')) {
    return { Icon: CloudSnow, label: 'Snowy', tone: 'snow' };
  }

  if (text.includes('mist') || text.includes('fog') || text.includes('haze') || text.includes('smoke')) {
    return { Icon: CloudFog, label: 'Foggy', tone: 'fog' };
  }

  if (text.includes('squall') || text.includes('tornado')) {
    return { Icon: Wind, label: 'Windy', tone: 'wind' };
  }

  if (text.includes('cloud')) {
    return { Icon: main === 'clouds' && description.includes('few') ? CloudSun : Cloud, label: 'Cloudy', tone: 'cloud' };
  }

  return { Icon: Sun, label: 'Sunny', tone: 'sun' };
}
