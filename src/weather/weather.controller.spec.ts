import { Test, TestingModule } from '@nestjs/testing';
import { WeatherController } from './weather.controller';
import { WeatherService } from './weather.service';
import { HttpModule } from '@nestjs/axios';
import { of } from 'rxjs';
import { LocationQueryDto } from './dto/location-query.dto';

describe('WeatherController', () => {
  let controller: WeatherController;
  let weatherService: WeatherService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [HttpModule],
      controllers: [WeatherController],
      providers: [WeatherService],
    }).compile();

    controller = module.get<WeatherController>(WeatherController);
    weatherService = module.get<WeatherService>(WeatherService);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('getWeather', () => {
    it('should call weatherService.getWeather', async () => {
      const query: LocationQueryDto = { lat: 40.7128, lon: -74.006 };
      const getWeatherSpy = jest
        .spyOn(weatherService, 'getWeather')
        .mockReturnValueOnce(
          of({
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
          }),
        );

      // Call the controller method
      await controller.getWeather(query);

      // Verify if the service method was called
      expect(getWeatherSpy).toHaveBeenCalled();
    });
  });
});
