// weather/weather.service.spec.ts

import { Test, TestingModule } from '@nestjs/testing';
import { WeatherService } from './weather.service';
import { HttpService, HttpModule } from '@nestjs/axios';
import { of, throwError } from 'rxjs';
import { AxiosResponse } from 'axios';
import {
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { LocationQueryDto } from './dto/location-query.dto';

describe('WeatherService', () => {
  let service: WeatherService;
  let httpService: HttpService;

  beforeEach(async () => {
    process.env.OPEN_WEATHER_API_KEY = 'XYZ';
    const module: TestingModule = await Test.createTestingModule({
      imports: [HttpModule],
      providers: [WeatherService],
    }).compile();

    service = module.get<WeatherService>(WeatherService);
    httpService = module.get<HttpService>(HttpService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('getWeather', () => {
    it('should return weather information', (done) => {
      const query: LocationQueryDto = { lat: 40.7128, lon: -74.006 };

      const currentWeather = {
        data: { main: { temp: 25 }, weather: [{ main: 'Clear' }] },
      } as AxiosResponse;

      const forecast = {
        data: {
          list: [
            {
              dt_txt: '2023-01-01T15:00:00.000Z',
              main: { temp: 28 },
              weather: [{ main: 'Clear' }],
              dt: 1672585200,
            },
          ],
        },
      } as AxiosResponse;

      jest.spyOn(httpService, 'get').mockReturnValueOnce(of(currentWeather));
      jest.spyOn(httpService, 'get').mockReturnValueOnce(of(forecast));

      service.getWeather(query).subscribe((result) => {
        expect(result).toEqual({
          currentWeather: {
            temperature: 25,
            condition: 'Clear sky',
          },
          forecast: [
            {
              date: new Date(1672585200 * 1000),
              temperature: 28,
              condition: 'Clear sky',
            },
          ],
        });
        done();
      });
    });

    it('should return weather information for city/state', (done) => {
      const query: LocationQueryDto = {
        city: 'New York',
        state: 'NY',
        country: 'US',
      };

      const currentWeather = {
        data: { main: { temp: 25 }, weather: [{ main: 'Clear' }] },
      } as AxiosResponse;

      const forecast = {
        data: {
          list: [
            {
              dt_txt: '2023-01-01T15:00:00.000Z',
              main: { temp: 28 },
              weather: [{ main: 'Clear' }],
              dt: 1672585200,
            },
          ],
        },
      } as AxiosResponse;

      // Spy on httpService.get and return mocked data
      jest.spyOn(httpService, 'get').mockReturnValueOnce(of(currentWeather));
      jest.spyOn(httpService, 'get').mockReturnValueOnce(of(forecast));

      // Call the service method and subscribe to the result
      service.getWeather(query).subscribe((result) => {
        // Assert the expected result
        expect(result).toEqual({
          currentWeather: {
            temperature: 25,
            condition: 'Clear sky',
          },
          forecast: [
            {
              date: new Date(1672585200 * 1000),
              temperature: 28,
              condition: 'Clear sky',
            },
          ],
        });
        // Notify Jest that the asynchronous test is done
        done();
      });
    });

    it('should handle API error', (done) => {
      const query: LocationQueryDto = { lat: 40.7128, lon: -74.006 };

      const error = new InternalServerErrorException('API error');

      jest.spyOn(httpService, 'get').mockReturnValueOnce(throwError(error));

      service.getWeather(query).subscribe(
        () => {},
        (err) => {
          expect(err).toStrictEqual(error);
          done();
        },
      );
    });
  });

  describe('interpretWeatherCondition', () => {
    it('should interpret "clear" condition correctly', () => {
      const result = service['interpretWeatherCondition']('clear');
      expect(result).toEqual('Clear sky');
    });

    it('should interpret "clouds" condition correctly', () => {
      const result = service['interpretWeatherCondition']('clouds');
      expect(result).toEqual('Cloudy');
    });

    it('should interpret "rain" condition correctly', () => {
      const result = service['interpretWeatherCondition']('rain');
      expect(result).toEqual('Rainy');
    });

    it('should interpret "snow" condition correctly', () => {
      const result = service['interpretWeatherCondition']('snow');
      expect(result).toEqual('Snowy');
    });

    it('should interpret unknown condition correctly', () => {
      const result = service['interpretWeatherCondition']('unknown');
      expect(result).toEqual('Unknown');
    });
  });

  describe('interpretForecast', () => {
    it('should interpret forecast list correctly', () => {
      const forecastList = [
        { dt: 1639540800, weather: [{ main: 'clear' }], main: { temp: 25 } },
        { dt: 1639627200, weather: [{ main: 'clouds' }], main: { temp: 20 } },
      ];

      const result = service['interpretForecast'](forecastList);

      expect(result).toEqual([
        {
          date: new Date(1639540800000),
          condition: 'Clear sky',
          temperature: 25,
        },
        {
          date: new Date(1639627200000),
          condition: 'Cloudy',
          temperature: 20,
        },
      ]);
    });

    it('should handle empty forecast list', () => {
      const result = service['interpretForecast']([]);
      expect(result).toEqual([]);
    });
  });

  describe('validate', () => {
    it('should not throw an exception for valid input with lat and lon', () => {
      const query: LocationQueryDto = { lat: 40.7128, lon: -74.006 };
      expect(() => service['validate'](query)).not.toThrowError();
    });

    it('should not throw an exception for valid input with city and state', () => {
      const query: LocationQueryDto = {
        city: 'New York',
        state: 'NY',
        country: 'US',
      };
      expect(() => service['validate'](query)).not.toThrowError();
    });

    it('should not throw an exception for valid input with zip', () => {
      const query: LocationQueryDto = { zip: '10001' };
      expect(() => service['validate'](query)).not.toThrowError();
    });

    it('should throw NotFoundException for invalid input with no location specified', () => {
      const query: LocationQueryDto = {}; // Invalid input with no specified location
      expect(() => service['validate'](query)).toThrowError(NotFoundException);
    });
  });

  describe('getEndpoint', () => {
    it('should generate correct weather endpoint with coordinates', () => {
      const query: LocationQueryDto = { lat: 40.7128, lon: -74.006 };
      const result = service['getEndpoint']('weather', query);
      const expectedEndpoint = `https://api.openweathermap.org/data/2.5/weather?lat=${query.lat}&lon=${query.lon}&appid=${service['API_KEY']}`;
      expect(result).toEqual(expectedEndpoint);
    });

    it('should generate correct forecast endpoint with coordinates', () => {
      const query: LocationQueryDto = { lat: 40.7128, lon: -74.006 };
      const result = service['getEndpoint']('forecast', query);
      const expectedEndpoint = `https://api.openweathermap.org/data/2.5/forecast?lat=${query.lat}&lon=${query.lon}&appid=${service['API_KEY']}`;
      expect(result).toEqual(expectedEndpoint);
    });

    it('should generate correct weather endpoint with city and state', () => {
      const query: LocationQueryDto = {
        city: 'New York',
        state: 'NY',
        country: 'US',
      };
      const result = service['getEndpoint']('weather', query);
      const expectedEndpoint = `https://api.openweathermap.org/data/2.5/weather?q=${encodeURIComponent(
        query.city,
      )},${encodeURIComponent(query.state)},${encodeURIComponent(
        query.country,
      )}&appid=${service['API_KEY']}`;
      expect(result).toEqual(expectedEndpoint);
    });

    it('should generate correct forecast endpoint with city and state', () => {
      const query: LocationQueryDto = {
        city: 'New York',
        state: 'NY',
        country: 'US',
      };
      const result = service['getEndpoint']('forecast', query);
      const expectedEndpoint = `https://api.openweathermap.org/data/2.5/forecast?q=${encodeURIComponent(
        query.city,
      )},${encodeURIComponent(query.state)},${encodeURIComponent(
        query.country,
      )}&appid=${service['API_KEY']}`;
      console.log(expectedEndpoint);
      expect(result).toEqual(expectedEndpoint);
    });

    it('should generate correct weather endpoint with zip code', () => {
      const query: LocationQueryDto = { zip: '10001' };
      const result = service['getEndpoint']('weather', query);
      const expectedEndpoint = `https://api.openweathermap.org/data/2.5/weather?zip=${query.zip}&appid=${service['API_KEY']}`;
      expect(result).toEqual(expectedEndpoint);
    });

    it('should generate correct forecast endpoint with zip code', () => {
      const query: LocationQueryDto = { zip: '10001' };
      const result = service['getEndpoint']('forecast', query);
      const expectedEndpoint = `https://api.openweathermap.org/data/2.5/forecast?zip=${query.zip}&appid=${service['API_KEY']}`;
      expect(result).toEqual(expectedEndpoint);
    });

    it('should throw NotFoundException for invalid location input', () => {
      const query: LocationQueryDto = {};
      expect(() => service['getEndpoint']('weather', query)).toThrowError(
        NotFoundException,
      );
    });

    it('should throw NotFoundException for invalid endpoint type', () => {
      const query: LocationQueryDto = { lat: 40.7128, lon: -74.006 };
      expect(() =>
        service['getEndpoint']('invalidType' as any, query),
      ).toThrowError(NotFoundException);
    });
  });

  describe('getCurrentWeather', () => {
    it('should make a GET request for current weather', async () => {
      const query: LocationQueryDto = { lat: 40.7128, lon: -74.006 };
      const currentWeather = {
        data: { main: { temp: 25 }, weather: [{ main: 'Clear' }] },
      } as AxiosResponse;

      // Mock the http.get method to return an observable with the expected data
      jest.spyOn(httpService, 'get').mockReturnValueOnce(of(currentWeather));

      // Act
      const result = await service['getCurrentWeather'](query).toPromise();

      // Assert
      expect(httpService.get).toHaveBeenCalledWith(
        `https://api.openweathermap.org/data/2.5/weather?lat=${query.lat}&lon=${query.lon}&appid=${service['API_KEY']}`,
      );
      expect(result).toEqual(currentWeather.data);
    });

    it('should handle errors when getting current weather', async () => {
      // Arrange
      const query: LocationQueryDto = { lat: 40.7128, lon: -74.006 };
      const error = new Error('API error');

      // Mock the http.get method to return an observable that emits an error
      jest.spyOn(httpService, 'get').mockReturnValueOnce(throwError(error));

      // Act & Assert
      await expect(
        service['getCurrentWeather'](query).toPromise(),
      ).rejects.toThrowError('API error');
    });
  });

  describe('getForecast', () => {
    it('should make a GET request for forecast', async () => {
      // Arrange
      const query: LocationQueryDto = { lat: 40.7128, lon: -74.006 };
      const forecast = {
        data: {
          list: [
            {
              dt_txt: '2023-01-01T15:00:00.000Z',
              main: { temp: 28 },
              weather: [{ main: 'Clear' }],
              dt: 1672585200,
            },
          ],
        },
      } as AxiosResponse;
      jest.spyOn(httpService, 'get').mockReturnValueOnce(of(forecast));

      // Act
      const result = await service['getForecast'](query).toPromise();

      // Assert
      expect(httpService.get).toHaveBeenCalledWith(
        `https://api.openweathermap.org/data/2.5/forecast?lat=${query.lat}&lon=${query.lon}&appid=${service['API_KEY']}`,
      );
      expect(result).toEqual(forecast.data.list);
    });

    it('should handle errors when getting forecast', async () => {
      // Arrange
      const query: LocationQueryDto = { lat: 40.7128, lon: -74.006 };
      const error = new Error('API error');
      jest.spyOn(httpService, 'get').mockReturnValueOnce(throwError(error));

      // Act & Assert
      await expect(
        service['getForecast'](query).toPromise(),
      ).rejects.toThrowError('API error');
    });
  });
});
