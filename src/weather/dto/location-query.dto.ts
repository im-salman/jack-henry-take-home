import { IsLatitude, IsLongitude, IsOptional, IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class LocationQueryDto {
  @IsOptional()
  @IsLatitude()
  @ApiProperty({
    description: 'Latitude of the location.',
    type: Number,
    example: 51.50598042775682,
    required: false,
  })
  lat?: number;

  @IsOptional()
  @IsLongitude()
  @ApiProperty({
    description: 'Longitude of the location.',
    type: Number,
    example: 7.101082448485377,
    required: false,
  })
  lon?: number;

  @IsOptional()
  @IsString()
  @ApiProperty({
    description: 'City name.',
    type: String,
    example: 'New York',
    required: false,
  })
  city?: string;

  @IsOptional()
  @IsString()
  @ApiProperty({
    description: 'State abbreviation.',
    type: String,
    example: 'NY',
    required: false,
  })
  state?: string;

  @IsOptional()
  @IsString()
  @ApiProperty({
    description: 'Country abbreviation.',
    type: String,
    example: 'US',
    required: false,
  })
  country?: string;

  @IsOptional()
  @IsString()
  @ApiProperty({
    description: 'Zip code.',
    type: String,
    example: '10001',
    required: false,
  })
  zip?: string;
}
