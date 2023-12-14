// weather/weather.e2e-spec.ts

import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, InternalServerErrorException } from '@nestjs/common';
import { HttpModule, HttpService } from '@nestjs/axios';
import { AxiosResponse } from 'axios';
import { of, throwError } from 'rxjs';
import * as request from 'supertest';
import { LocationQueryDto } from './../src/weather/dto/location-query.dto';
import { WeatherService } from './../src/weather/weather.service';
import { WeatherController } from './../src/weather/weather.controller';

describe('WeatherService (e2e)', () => {
  let app: INestApplication;
  let httpService: HttpService;

  beforeEach(async () => {
    process.env.OPEN_WEATHER_API_KEY = 'XYZ';
    const module: TestingModule = await Test.createTestingModule({
      imports: [HttpModule],
      controllers: [WeatherController],
      providers: [WeatherService],
    }).compile();

    app = module.createNestApplication();
    httpService = module.get<HttpService>(HttpService);
    await app.init();
  });

  afterEach(async () => {
    await app.close();
  });

  describe('/weather (GET)', () => {
    it('should return weather information', async () => {
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

      const response = await request(app.getHttpServer())
        .get('/weather')
        .query(query)
        .expect(200);

      expect(response.body).toEqual({
        currentWeather: {
          temperature: 25,
          condition: 'Clear sky',
        },
        forecast: [
          {
            date: new Date(1672585200 * 1000).toISOString(),
            temperature: 28,
            condition: 'Clear sky',
          },
        ],
      });
    });

    it('should handle API error', async () => {
      const query: LocationQueryDto = { lat: 40.7128, lon: -74.006 };
      const error = new InternalServerErrorException('API error');

      jest.spyOn(httpService, 'get').mockReturnValueOnce(throwError(error));

      await request(app.getHttpServer())
        .get('/weather')
        .query(query)
        .expect(500, {
          message: 'API error',
          error: 'Internal Server Error',
          statusCode: 500,
        });
    });
  });
});
