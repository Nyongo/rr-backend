import {
  IsNumber,
  IsNotEmpty,
  IsOptional,
  Min,
  Max,
  IsString,
} from 'class-validator';

export class UpdateSchoolTripLocationDto {
  @IsString()
  @IsNotEmpty()
  tripId: string;

  @IsNumber()
  @IsNotEmpty()
  @Min(-90)
  @Max(90)
  latitude: number;

  @IsNumber()
  @IsNotEmpty()
  @Min(-180)
  @Max(180)
  longitude: number;

  @IsNumber()
  @IsOptional()
  @Min(0)
  speed?: number; // Speed in km/h

  @IsNumber()
  @IsOptional()
  @Min(0)
  @Max(360)
  heading?: number; // Direction in degrees (0-360)

  @IsNumber()
  @IsOptional()
  @Min(0)
  accuracy?: number; // GPS accuracy in meters
}

