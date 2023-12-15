import {
  Injectable,
  InternalServerErrorException,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { Observable, forkJoin, throwError } from 'rxjs';
import { AxiosError } from 'axios';
import { map, catchError } from 'rxjs/operators';
import { LocationQueryDto } from './dto/location-query.dto';
import { ForecastItem, WeatherResponse } from './models/weather.model';
import {
  CurrentWeatherResponse,
  ForecastWeather,
} from './models/weather-open-api.model';

@Injectable()
export class WeatherService {
  private readonly logger = new Logger(WeatherService.name);

  private readonly API_KEY = process.env.OPEN_WEATHER_API_KEY;
  private readonly BASE_URL = 'https://api.openweathermap.org/data/2.5';

  constructor(private readonly http: HttpService) {}

  private getCurrentWeather(
    query: LocationQueryDto,
  ): Observable<CurrentWeatherResponse> {
    const endpoint = this.getEndpoint('weather', query);
    return this.http.get(endpoint).pipe(
      map((response) => response.data),
      catchError((error) => this.handleError(error)),
    );
  }

  private getForecast(query: LocationQueryDto): Observable<ForecastWeather[]> {
    this.validate(query);

    const endpoint = this.getEndpoint('forecast', query);
    return this.http.get(endpoint).pipe(
      map((response) => response.data.list),
      catchError((error) => this.handleError(error)),
    );
  }

  private getEndpoint(
    endpointType: 'weather' | 'forecast',
    query: LocationQueryDto,
  ): string {
    const { lat, lon, city, state, country, zip } = query;

    let endpoint: string;
    let queryParams: string;

    switch (endpointType) {
      case 'weather':
        endpoint = 'weather';
        break;
      case 'forecast':
        endpoint = 'forecast';
        break;
      default:
        throw new NotFoundException('Invalid endpoint type');
    }

    if (lat !== undefined && lon !== undefined) {
      queryParams = `lat=${lat}&lon=${lon}`;
    } else if (
      city !== undefined &&
      state !== undefined &&
      country !== undefined
    ) {
      const encodedCity = encodeURIComponent(city);
      const encodedState = encodeURIComponent(state);
      const encodedCountry = encodeURIComponent(country);
      queryParams = `q=${encodedCity},${encodedState},${encodedCountry}`;
    } else if (zip !== undefined) {
      queryParams = `zip=${zip}`;
    } else {
      throw new NotFoundException('Invalid location input');
    }

    return `${this.BASE_URL}/${endpoint}?${queryParams}&appid=${this.API_KEY}`;
  }

  public getWeather(query: LocationQueryDto): Observable<WeatherResponse> {
    this.validate(query);

    const currentWeather$ = this.getCurrentWeather(query);
    const forecast$ = this.getForecast(query);

    return forkJoin([currentWeather$, forecast$]).pipe(
      map(([currentWeather, forecast]) => {
        const interpretedForecast = this.interpretForecast(forecast);
        const interpretedCurrentWeather = {
          temperature: currentWeather.main.temp,
          condition: this.interpretWeatherCondition(
            currentWeather.weather[0].main,
          ),
        };

        return {
          currentWeather: interpretedCurrentWeather,
          forecast: interpretedForecast,
        };
      }),
      catchError((error) => this.handleError(error)),
    );
  }

  private interpretWeatherCondition(condition: string): string {
    switch (condition.toLowerCase()) {
      case 'clear':
        return 'Clear sky';
      case 'clouds':
        return 'Cloudy';
      case 'rain':
        return 'Rainy';
      case 'snow':
        return 'Snowy';
      default:
        return 'Unknown';
    }
  }

  private interpretForecast(forecastList: ForecastWeather[]): ForecastItem[] {
    const interpretedForecast = forecastList.map((forecastItem) => {
      const timestamp = forecastItem.dt * 1000; // Convert timestamp to milliseconds
      const date = new Date(timestamp);
      const condition = forecastItem.weather[0].main;
      const temperature = forecastItem.main.temp;

      return {
        date,
        condition: this.interpretWeatherCondition(condition),
        temperature,
      };
    });

    return interpretedForecast;
  }
  private validate(query: LocationQueryDto) {
    const { lat, lon, city, state, country, zip } = query;

    if (
      (lat === undefined || lon === undefined) &&
      (city === undefined || state === undefined || country === undefined) &&
      zip === undefined
    ) {
      throw new NotFoundException(
        'Coordinates, city/state/country, or zip code not provided',
      );
    }
  }

  private handleError(error: AxiosError) {
    this.logger.error(error);
    return throwError(() => new InternalServerErrorException(error.message));
  }
}
