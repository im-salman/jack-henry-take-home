type Coord = {
  lon: number;
  lat: number;
};

type WeatherIdThunderstorm =
  | 200
  | 201
  | 202
  | 210
  | 211
  | 212
  | 221
  | 230
  | 231
  | 232;
type WeatherIdDrizzle = 300 | 301 | 302 | 310 | 311 | 312 | 313 | 314 | 321;
type WeatherIdRain = 500 | 501 | 502 | 503 | 504 | 511 | 520 | 521 | 522 | 531;
type WeatherIdSnow =
  | 600
  | 601
  | 602
  | 611
  | 612
  | 613
  | 615
  | 616
  | 620
  | 621
  | 622;
type WeatherIdAtmosphere =
  | 701
  | 711
  | 721
  | 731
  | 741
  | 751
  | 761
  | 762
  | 771
  | 781;
type WeatherIdClear = 800;
type WeatherIdClouds = 801 | 802 | 803 | 804;
export type WeatherId =
  | WeatherIdThunderstorm
  | WeatherIdDrizzle
  | WeatherIdRain
  | WeatherIdSnow
  | WeatherIdAtmosphere
  | WeatherIdClear
  | WeatherIdClouds;

const weatherType = [
  'Thunderstorm',
  'Drizzle',
  'Rain',
  'Snow',
  'Mist',
  'Smoke',
  'Haze',
  'Dust',
  'Fog',
  'Sand',
  'Dust',
  'Ash',
  'Squall',
  'Tomado',
  'Clear',
  'Clouds',
] as const;
type WeatherType = (typeof weatherType)[number];

type WeatherIcon =
  | '01d'
  | '02d'
  | '03d'
  | '04d'
  | '09d'
  | '10d'
  | '11d'
  | '13d'
  | '50d'
  | '01n'
  | '02n'
  | '03n'
  | '04n'
  | '09n'
  | '10n'
  | '11n'
  | '13n'
  | '50n';

type Weather = {
  /**
   * ref: https://openweathermap.org/weather-conditions#Weather-Condition-Codes-2
   */
  id: WeatherId;
  main: WeatherType;
  description: string;
  /**
   * ref: https://openweathermap.org/weather-conditions#Icon-list
   */
  icon: WeatherIcon;
};

type Main = {
  /**
   * - default: kelvin
   * - metric: celsius
   * - inperial: fahrenheit
   */
  temp: number;
  /**
   * - default: kelvin
   * - metric: celsius
   * - inperial: fahrenheit
   */
  feels_like: number;
  /**
   * - default: kelvin
   * - metric: celsius
   * - inperial: fahrenheit
   * */
  temp_min: number;
  /**
   * - default: kelvin
   * - metric: celsius
   * - inperial: fahrenheit
   */
  temp_max: number;
  pressure: number;
  sea_level?: number;
  grnd_level?: number;
  humidity: number;
};

type Clouds = {
  all: number;
};

type Wind = {
  /**
   * - default: meter/sec
   * - metric: meter/sec
   * - inperial: miles/hour
   * */
  speed: number;
  deg: number;
  /**
   * - default: meter/sec
   * - metric: meter/sec
   * - inperial: miles/hour
   * */
  gust?: number;
};

type Rain = {
  '1h'?: number;
  '3h'?: number;
};

type Snow = {
  '1h'?: number;
  '3h'?: number;
};

/**
 * Current weather data API
 * ref: https://openweathermap.org/current
 */
export type CurrentWeatherResponse = {
  coord: Coord;
  weather: Weather[];
  main: Main;
  visibility: number;
  wind: Wind;
  rain?: Rain;
  snow?: Snow;
  clouds: Clouds;
  dt: number;
  /**  */
  sys: {
    country: string;
    sunrise: number;
    sunset: number;
  };
  /** UTC */
  timezone: number;
  id: number;
  name: string;
};

type City = {
  id: number;
  name: string;
  coord: Coord;
  country: string;
  population: number;
  timezone: number;
  /** Unix、UTC */
  sunrise: number;
  /** Unix、UTC */
  sunset: number;
};

export type ForecastWeather = {
  /** UNIX、UTC */
  dt: number;
  main: Main;
  weather: Weather[];
  clouds: Clouds;
  wind: Wind;
  visibility: number;
  pop: number;
  rain?: Pick<Rain, '3h'>;
  snow?: Pick<Snow, '3h'>;
  sys: {
    pod: 'n' | 'd';
  };
  /**
   * ISO、UTC
   * 2023-10-28 06:00:00
   */
  dt_txt: string;
};

export type ForecastWeatherResponse = {
  /** API */
  cnt: number;
  list: ForecastWeather[];
  city: City;
};
