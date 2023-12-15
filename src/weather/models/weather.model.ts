export interface CurrentWeather {
  temperature: number;
  condition: string;
}

export interface ForecastItem {
  date: Date;
  temperature: number;
  condition: string;
}

export interface WeatherResponse {
  currentWeather: CurrentWeather;
  forecast: ForecastItem[];
}
