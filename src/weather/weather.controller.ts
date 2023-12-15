import { Controller, Get, Query } from '@nestjs/common';
import { ApiResponse, ApiTags } from '@nestjs/swagger';
import { WeatherService } from './weather.service';
import { LocationQueryDto } from './dto/location-query.dto';

@Controller('weather')
@ApiTags('Weather')
export class WeatherController {
  constructor(private readonly weatherService: WeatherService) {}

  @Get()
  @ApiResponse({
    status: 200,
    description: 'Weather information retrieved successfully.',
  })
  @ApiResponse({
    status: 404,
    description: 'Coordinates, city/state/country, or zip code not provided',
  })
  @ApiResponse({
    status: 400,
    description: '  Error: Bad Request',
  })
  getWeather(@Query() query: LocationQueryDto) {
    return this.weatherService.getWeather(query);
  }
}
