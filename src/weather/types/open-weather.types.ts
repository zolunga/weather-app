export interface OpenWeatherCondition {
  main: string;
  description: string;
}

export interface OpenWeatherCurrentResponse {
  coord: {
    lon: number;
    lat: number;
  };
  weather: OpenWeatherCondition[];
  main: {
    temp: number;
    feels_like: number;
    humidity: number;
  };
  wind: {
    speed: number;
    deg?: number;
  };
  dt: number;
  name: string;
  sys: {
    country?: string;
  };
}

export interface OpenWeatherForecastItem {
  dt: number;
  main: {
    temp: number;
    feels_like: number;
    humidity: number;
  };
  weather: OpenWeatherCondition[];
  wind: {
    speed: number;
    deg?: number;
  };
  pop?: number;
}

export interface OpenWeatherForecastResponse {
  city: {
    name: string;
    country?: string;
    coord: {
      lat: number;
      lon: number;
    };
  };
  list: OpenWeatherForecastItem[];
}
