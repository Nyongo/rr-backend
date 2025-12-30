import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Put,
  Query,
  UsePipes,
  ValidationPipe,
} from '@nestjs/common';
import {
  CreateSchoolTripDto,
  UpdateSchoolTripDto,
  CreateTripStudentDto,
  UpdateTripStudentDto,
  SchoolTripStatus,
  LogRfidEventDto,
  RfidEventType,
} from '../dto/create-school-trip.dto';
import { UpdateSchoolTripLocationDto } from '../dtos/update-school-trip-location.dto';
import { SchoolTripDbService } from '../services/school-trip-db.service';

@Controller('academic-suite/trips')
export class SchoolTripController {
  constructor(private readonly tripDb: SchoolTripDbService) {}

  @Post()
  @UsePipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
      transformOptions: { enableImplicitConversion: true },
    }),
  )
  async create(@Body() dto: CreateSchoolTripDto) {
    try {
      const created = await this.tripDb.create(dto);
      return { success: true, data: created };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to create trip',
      };
    }
  }

  @Get()
  async list(
    @Query('page') page?: string,
    @Query('pageSize') pageSize?: string,
    @Query('routeId') routeId?: string,
    @Query('status') status?: string,
    @Query('tripDate') tripDate?: string,
  ) {
    try {
      const p = Number(page) || 1;
      const ps = Number(pageSize) || 10;
      const validStatus =
        status &&
        Object.values(SchoolTripStatus).includes(status as SchoolTripStatus)
          ? (status as SchoolTripStatus)
          : undefined;

      const result = await this.tripDb.findAll(
        p,
        ps,
        routeId,
        validStatus,
        tripDate,
      );
      return {
        success: true,
        data: result.data,
        pagination: result.pagination,
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to fetch trips',
      };
    }
  }

  @Get(':id')
  async getById(@Param('id') id: string) {
    try {
      const trip = await this.tripDb.findById(id);
      if (!trip) {
        return { success: false, message: 'Trip not found' };
      }
      return { success: true, data: trip };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to fetch trip',
      };
    }
  }

  @Get(':id/students')
  async getTripStudents(@Param('id') id: string) {
    try {
      const trip = await this.tripDb.findById(id);
      if (!trip) {
        return { success: false, error: 'Trip not found' };
      }

      const students = await this.tripDb.getTripStudents(id);
      return { success: true, data: students };
    } catch (error) {
      return {
        success: false,
        error:
          error instanceof Error
            ? error.message
            : 'Failed to fetch trip students',
      };
    }
  }

  @Put(':id')
  @UsePipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
      transformOptions: { enableImplicitConversion: true },
    }),
  )
  async update(@Param('id') id: string, @Body() dto: UpdateSchoolTripDto) {
    try {
      const existingTrip = await this.tripDb.findById(id);
      if (!existingTrip) {
        return { success: false, error: 'Trip not found' };
      }

      const updated = await this.tripDb.update(id, dto);
      return { success: true, data: updated };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to update trip',
      };
    }
  }

  @Post(':id/students')
  @UsePipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
      transformOptions: { enableImplicitConversion: true },
    }),
  )
  async addStudent(@Param('id') id: string, @Body() dto: CreateTripStudentDto) {
    try {
      const existingTrip = await this.tripDb.findById(id);
      if (!existingTrip) {
        return { success: false, error: 'Trip not found' };
      }

      const tripStudent = await this.tripDb.addStudent(id, dto);
      return { success: true, data: tripStudent };
    } catch (error) {
      return {
        success: false,
        error:
          error instanceof Error
            ? error.message
            : 'Failed to add student to trip',
      };
    }
  }

  @Put(':id/students/:studentId')
  @UsePipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
      transformOptions: { enableImplicitConversion: true },
    }),
  )
  async updateStudent(
    @Param('id') id: string,
    @Param('studentId') studentId: string,
    @Body() dto: UpdateTripStudentDto,
  ) {
    try {
      const existingTrip = await this.tripDb.findById(id);
      if (!existingTrip) {
        return { success: false, error: 'Trip not found' };
      }

      const result = await this.tripDb.updateStudent(id, studentId, dto);
      return { success: true, data: result };
    } catch (error) {
      return {
        success: false,
        error:
          error instanceof Error
            ? error.message
            : 'Failed to update trip student',
      };
    }
  }

  @Delete(':id/students/:studentId')
  async removeStudent(
    @Param('id') id: string,
    @Param('studentId') studentId: string,
  ) {
    try {
      const existingTrip = await this.tripDb.findById(id);
      if (!existingTrip) {
        return { success: false, error: 'Trip not found' };
      }

      const result = await this.tripDb.removeStudent(id, studentId);
      return { success: true, data: result };
    } catch (error) {
      return {
        success: false,
        error:
          error instanceof Error
            ? error.message
            : 'Failed to remove student from trip',
      };
    }
  }

  @Delete(':id')
  async remove(@Param('id') id: string) {
    try {
      const existingTrip = await this.tripDb.findById(id);
      if (!existingTrip) {
        return { success: false, error: 'Trip not found' };
      }

      const deleted = await this.tripDb.delete(id);
      return { success: true, data: deleted };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to delete trip',
      };
    }
  }

  @Post(':id/rfid-log')
  @UsePipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
      transformOptions: { enableImplicitConversion: true },
    }),
  )
  async logRfidEvent(
    @Param('id') tripId: string,
    @Body() dto: LogRfidEventDto,
  ) {
    try {
      const existingTrip = await this.tripDb.findById(tripId);
      if (!existingTrip) {
        return { success: false, error: 'Trip not found' };
      }

      const rfidEvent = await this.tripDb.logRfidEventWithStudentId(
        tripId,
        dto.studentId,
        dto.rfidTagId,
        dto,
      );
      return { success: true, data: rfidEvent };
    } catch (error) {
      return {
        success: false,
        error:
          error instanceof Error ? error.message : 'Failed to log RFID event',
      };
    }
  }

  @Post(':id/rfid-log-by-tag')
  @UsePipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
      transformOptions: { enableImplicitConversion: true },
    }),
  )
  async logRfidEventByTag(
    @Param('id') tripId: string,
    @Body() dto: LogRfidEventDto,
  ) {
    try {
      const existingTrip = await this.tripDb.findById(tripId);
      if (!existingTrip) {
        return { success: false, error: 'Trip not found' };
      }

      const rfidEvent = await this.tripDb.logRfidEventByTag(
        tripId,
        dto.rfidTagId,
        dto,
      );
      return { success: true, data: rfidEvent };
    } catch (error) {
      return {
        success: false,
        error:
          error instanceof Error
            ? error.message
            : 'Failed to log RFID event by tag',
      };
    }
  }

  @Post(':id/rfid-log-bulk')
  @UsePipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
      transformOptions: { enableImplicitConversion: true },
    }),
  )
  async logBulkRfidEvents(
    @Param('id') tripId: string,
    @Body()
    dto: {
      events: Array<{
        rfidTagId: string;
        eventType: RfidEventType;
        scannedAt?: string;
      }>;
      deviceId?: string;
      deviceLocation?: string;
      gpsCoordinates?: string;
    },
  ) {
    try {
      const existingTrip = await this.tripDb.findById(tripId);
      if (!existingTrip) {
        return { success: false, error: 'Trip not found' };
      }

      const results = await this.tripDb.logBulkRfidEvents(
        tripId,
        dto.events,
        dto.deviceId,
        dto.deviceLocation,
        dto.gpsCoordinates,
      );
      return { success: true, data: results };
    } catch (error) {
      return {
        success: false,
        error:
          error instanceof Error
            ? error.message
            : 'Failed to log bulk RFID events',
      };
    }
  }

  @Get('active')
  async getActiveTrips(
    @Query('driverId') driverId?: string,
    @Query('minderId') minderId?: string,
  ) {
    try {
      const trips = await this.tripDb.findActiveTrips(driverId, minderId);
      return { success: true, data: trips };
    } catch (error) {
      return {
        success: false,
        error:
          error instanceof Error
            ? error.message
            : 'Failed to fetch active trips',
      };
    }
  }

  @Get('rfid-events')
  async getRfidEvents(
    @Query('tripId') tripId?: string,
    @Query('studentId') studentId?: string,
    @Query('eventType') eventType?: string,
    @Query('startDate') startDate?: string,
    @Query('endDate') endDate?: string,
  ) {
    try {
      const validEventType =
        eventType &&
        Object.values(RfidEventType).includes(eventType as RfidEventType)
          ? (eventType as RfidEventType)
          : undefined;

      const start = startDate ? new Date(startDate) : undefined;
      const end = endDate ? new Date(endDate) : undefined;

      const events = await this.tripDb.getRfidEvents(
        tripId,
        studentId,
        validEventType,
        start,
        end,
      );
      return { success: true, data: events };
    } catch (error) {
      return {
        success: false,
        error:
          error instanceof Error
            ? error.message
            : 'Failed to fetch RFID events',
      };
    }
  }

  @Get(':id/rfid-events')
  async getTripRfidEvents(@Param('id') id: string) {
    try {
      const existingTrip = await this.tripDb.findById(id);
      if (!existingTrip) {
        return { success: false, error: 'Trip not found' };
      }

      const events = await this.tripDb.getRfidEvents(id);
      return { success: true, data: events };
    } catch (error) {
      return {
        success: false,
        error:
          error instanceof Error
            ? error.message
            : 'Failed to fetch trip RFID events',
      };
    }
  }

  @Post(':id/location')
  @UsePipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }),
  )
  async updateLocation(
    @Param('id') id: string,
    @Body() data: Omit<UpdateSchoolTripLocationDto, 'tripId'>,
  ) {
    try {
      const location = await this.tripDb.updateTripLocation({
        ...data,
        tripId: id,
      });
      return { success: true, data: location };
    } catch (error) {
      return {
        success: false,
        error:
          error instanceof Error
            ? error.message
            : 'Failed to update trip location',
      };
    }
  }

  @Get(':id/location')
  async getCurrentLocation(@Param('id') id: string) {
    try {
      const location = await this.tripDb.getCurrentTripLocation(id);
      if (!location) {
        return {
          success: false,
          message: 'No location data found for this trip',
        };
      }
      return { success: true, data: location };
    } catch (error) {
      return {
        success: false,
        error:
          error instanceof Error
            ? error.message
            : 'Failed to fetch trip location',
      };
    }
  }

  @Get(':id/location/history')
  async getLocationHistory(
    @Param('id') id: string,
    @Query('limit') limit?: string,
    @Query('startTime') startTime?: string,
    @Query('endTime') endTime?: string,
  ) {
    try {
      const locations = await this.tripDb.getTripLocationHistory(
        id,
        limit ? Number(limit) : 100,
        startTime ? new Date(startTime) : undefined,
        endTime ? new Date(endTime) : undefined,
      );
      return { success: true, data: locations };
    } catch (error) {
      return {
        success: false,
        error:
          error instanceof Error
            ? error.message
            : 'Failed to fetch trip location history',
      };
    }
  }
}
