import {
  IsArray,
  IsBoolean,
  IsDateString,
  IsEnum,
  IsNotEmpty,
  IsOptional,
  IsString,
  MaxLength,
  ValidateNested,
} from 'class-validator';
import { Transform, Type } from 'class-transformer';

export enum SchoolTripStatus {
  SCHEDULED = 'SCHEDULED',
  IN_PROGRESS = 'IN_PROGRESS',
  COMPLETED = 'COMPLETED',
  CANCELLED = 'CANCELLED',
  DELAYED = 'DELAYED',
}

export enum PickupDropoffStatus {
  NOT_PICKED_UP = 'NOT_PICKED_UP',
  PICKED_UP = 'PICKED_UP',
  NOT_DROPPED_OFF = 'NOT_DROPPED_OFF',
  DROPPED_OFF = 'DROPPED_OFF',
  ABSENT = 'ABSENT',
  EXCUSED = 'EXCUSED',
}

export class CreateSchoolTripDto {
  @IsNotEmpty()
  @IsString()
  routeId: string;

  @IsOptional()
  @IsString()
  busId?: string;

  @IsOptional()
  @IsString()
  driverId?: string;

  @IsOptional()
  @IsString()
  minderId?: string;

  @IsNotEmpty()
  @IsDateString()
  tripDate: string;

  @IsOptional()
  @IsDateString()
  scheduledStartTime?: string; // Auto-generated if not provided based on route tripType

  @IsOptional()
  @IsDateString()
  scheduledEndTime?: string; // Auto-captured when trip ends

  @IsOptional()
  @IsEnum(SchoolTripStatus)
  status?: SchoolTripStatus;

  @IsOptional()
  @IsString()
  @MaxLength(1000)
  notes?: string;

  @IsOptional()
  @IsString()
  @MaxLength(200)
  startLocation?: string;

  @IsOptional()
  @IsString()
  @MaxLength(200)
  endLocation?: string;

  @IsOptional()
  @IsString()
  startGps?: string;

  @IsOptional()
  @IsString()
  endGps?: string;

  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CreateTripStudentDto)
  students?: CreateTripStudentDto[];

  @IsOptional()
  @Transform(({ value }) => {
    if (value === 'true' || value === true) return true;
    if (value === 'false' || value === false) return false;
    return undefined;
  })
  @IsBoolean()
  isActive?: boolean;
}

export class CreateTripStudentDto {
  @IsNotEmpty()
  @IsString()
  studentId: string;

  // All other fields (pickupLocation, dropoffLocation, GPS coordinates) 
  // will be automatically populated from student's parent's primary address
}

export class UpdateSchoolTripDto {
  @IsOptional()
  @IsString()
  routeId?: string;

  @IsOptional()
  @IsString()
  busId?: string | null;

  @IsOptional()
  @IsString()
  driverId?: string | null;

  @IsOptional()
  @IsString()
  minderId?: string | null;

  @IsOptional()
  @IsDateString()
  tripDate?: string;

  @IsOptional()
  @IsDateString()
  scheduledStartTime?: string;

  @IsOptional()
  @IsDateString()
  actualStartTime?: string;

  @IsOptional()
  @IsDateString()
  scheduledEndTime?: string;

  @IsOptional()
  @IsDateString()
  actualEndTime?: string;

  @IsOptional()
  @IsEnum(SchoolTripStatus)
  status?: SchoolTripStatus;

  @IsOptional()
  @IsString()
  @MaxLength(1000)
  notes?: string;

  @IsOptional()
  @IsString()
  @MaxLength(200)
  startLocation?: string;

  @IsOptional()
  @IsString()
  @MaxLength(200)
  endLocation?: string;

  @IsOptional()
  @IsString()
  startGps?: string;

  @IsOptional()
  @IsString()
  endGps?: string;

  @IsOptional()
  @Transform(({ value }) => {
    if (value === 'true' || value === true) return true;
    if (value === 'false' || value === false) return false;
    return undefined;
  })
  @IsBoolean()
  isActive?: boolean;
}

export class UpdateTripStudentDto {
  @IsOptional()
  @IsEnum(PickupDropoffStatus)
  pickupStatus?: PickupDropoffStatus;

  @IsOptional()
  @IsEnum(PickupDropoffStatus)
  dropoffStatus?: PickupDropoffStatus;

  @IsOptional()
  @IsDateString()
  actualPickupTime?: string;

  @IsOptional()
  @IsDateString()
  actualDropoffTime?: string;

  @IsOptional()
  @IsString()
  @MaxLength(200)
  pickupLocation?: string;

  @IsOptional()
  @IsString()
  @MaxLength(200)
  dropoffLocation?: string;

  @IsOptional()
  @IsString()
  pickupGps?: string;

  @IsOptional()
  @IsString()
  dropoffGps?: string;

  @IsOptional()
  @IsString()
  @MaxLength(500)
  notes?: string;
}

export enum RfidEventType {
  ENTERED_BUS = 'ENTERED_BUS',
  EXITED_BUS = 'EXITED_BUS',
}

export class LogRfidEventDto {
  @IsNotEmpty()
  @IsString()
  studentId: string; // Student ID to identify which student the RFID tag belongs to

  @IsNotEmpty()
  @IsString()
  rfidTagId: string;

  @IsNotEmpty()
  @IsEnum(RfidEventType)
  eventType: RfidEventType;

  @IsOptional()
  @IsString()
  deviceId?: string;

  @IsOptional()
  @IsString()
  @MaxLength(100)
  deviceLocation?: string;

  @IsOptional()
  @IsString()
  gpsCoordinates?: string;

  @IsOptional()
  @IsString()
  @MaxLength(500)
  notes?: string;

  @IsOptional()
  @IsDateString()
  scannedAt?: string; // Optional - defaults to now if not provided
}

