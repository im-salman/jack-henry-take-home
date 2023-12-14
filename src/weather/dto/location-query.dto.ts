import { IsLatitude, IsLongitude, IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class LocationQueryDto {
  @IsLatitude()
  @ApiProperty({
    description: 'Latitude of the location.',
    type: Number,
    example: 51.50598042775682,
    required: false,
  })
  lat?: number;

  @IsLongitude()
  @ApiProperty({
    description: 'Longitude of the location.',
    type: Number,
    example: 7.101082448485377,
    required: false,
  })
  lon?: number;

  @IsString()
  @ApiProperty({
    description: 'City name.',
    type: String,
    example: 'New York',
    required: false,
  })
  city?: string;

  @IsString()
  @ApiProperty({
    description: 'State abbreviation.',
    type: String,
    example: 'NY',
    required: false,
  })
  state?: string;

  @IsString()
  @ApiProperty({
    description: 'Country abbreviation.',
    type: String,
    example: 'US',
    required: false,
  })
  country?: string;

  @IsString()
  @ApiProperty({
    description: 'Zip code.',
    type: String,
    example: '10001',
    required: false,
  })
  zip?: string;
}
