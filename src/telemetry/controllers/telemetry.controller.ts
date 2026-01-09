import {
  Controller,
  Get,
  Query,
  HttpException,
  HttpStatus,
} from '@nestjs/common';
import { TelemetryService } from '../services/telemetry.service';

@Controller('admin/telemetry')
export class TelemetryController {
  constructor(private readonly telemetryService: TelemetryService) {}

  /**
   * GET /admin/telemetry/system-summary
   * System-wide summary statistics
   */
  @Get('system-summary')
  async getSystemSummary() {
    try {
      const data = await this.telemetryService.getSystemSummary();
      return { success: true, data };
    } catch (error) {
      throw new HttpException(
        {
          success: false,
          error: {
            code: 'INTERNAL_ERROR',
            message: error instanceof Error ? error.message : 'Failed to fetch system summary',
            details: {},
          },
        },
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  /**
   * GET /admin/telemetry/summary
   * Telemetry summary with performance metrics
   */
  @Get('summary')
  async getTelemetrySummary(
    @Query('from') from: string,
    @Query('to') to: string,
    @Query('compare') compare?: string,
  ) {
    try {
      if (!from || !to) {
        throw new HttpException(
          {
            success: false,
            error: {
              code: 'INVALID_DATE_RANGE',
              message: 'Both "from" and "to" date parameters are required',
              details: {},
            },
          },
          HttpStatus.BAD_REQUEST,
        );
      }

      const fromDate = new Date(from);
      const toDate = new Date(to);

      if (isNaN(fromDate.getTime()) || isNaN(toDate.getTime())) {
        throw new HttpException(
          {
            success: false,
            error: {
              code: 'INVALID_DATE_RANGE',
              message: 'Invalid date format. Use ISO 8601 format',
              details: {},
            },
          },
          HttpStatus.BAD_REQUEST,
        );
      }

      if (fromDate >= toDate) {
        throw new HttpException(
          {
            success: false,
            error: {
              code: 'INVALID_DATE_RANGE',
              message: 'The "from" date must be before the "to" date',
              details: {},
            },
          },
          HttpStatus.BAD_REQUEST,
        );
      }

      // Limit to 90 days
      const maxDays = 90;
      const daysDiff = (toDate.getTime() - fromDate.getTime()) / (1000 * 60 * 60 * 24);
      if (daysDiff > maxDays) {
        throw new HttpException(
          {
            success: false,
            error: {
              code: 'INVALID_DATE_RANGE',
              message: `Date range cannot exceed ${maxDays} days`,
              details: {},
            },
          },
          HttpStatus.BAD_REQUEST,
        );
      }

      const shouldCompare = compare === 'true' || compare === '1';
      const data = await this.telemetryService.getTelemetrySummary(
        fromDate,
        toDate,
        shouldCompare,
      );

      return { success: true, data };
    } catch (error) {
      if (error instanceof HttpException) {
        throw error;
      }
      throw new HttpException(
        {
          success: false,
          error: {
            code: 'INTERNAL_ERROR',
            message: error instanceof Error ? error.message : 'Failed to fetch telemetry summary',
            details: {},
          },
        },
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  /**
   * GET /admin/telemetry/daily
   * Daily statistics breakdown
   */
  @Get('daily')
  async getDailyStatistics(
    @Query('from') from: string,
    @Query('to') to: string,
  ) {
    try {
      if (!from || !to) {
        throw new HttpException(
          {
            success: false,
            error: {
              code: 'INVALID_DATE_RANGE',
              message: 'Both "from" and "to" date parameters are required',
              details: {},
            },
          },
          HttpStatus.BAD_REQUEST,
        );
      }

      const fromDate = new Date(from);
      const toDate = new Date(to);

      if (isNaN(fromDate.getTime()) || isNaN(toDate.getTime())) {
        throw new HttpException(
          {
            success: false,
            error: {
              code: 'INVALID_DATE_RANGE',
              message: 'Invalid date format. Use ISO 8601 format',
              details: {},
            },
          },
          HttpStatus.BAD_REQUEST,
        );
      }

      if (fromDate >= toDate) {
        throw new HttpException(
          {
            success: false,
            error: {
              code: 'INVALID_DATE_RANGE',
              message: 'The "from" date must be before the "to" date',
              details: {},
            },
          },
          HttpStatus.BAD_REQUEST,
        );
      }

      const data = await this.telemetryService.getDailyStatistics(fromDate, toDate);
      return { success: true, data };
    } catch (error) {
      if (error instanceof HttpException) {
        throw error;
      }
      throw new HttpException(
        {
          success: false,
          error: {
            code: 'INTERNAL_ERROR',
            message: error instanceof Error ? error.message : 'Failed to fetch daily statistics',
            details: {},
          },
        },
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  /**
   * GET /admin/telemetry/devices
   * Device performance metrics
   */
  @Get('devices')
  async getDevicePerformance(
    @Query('from') from: string,
    @Query('to') to: string,
    @Query('deviceId') deviceId?: string,
    @Query('busId') busId?: string,
  ) {
    try {
      if (!from || !to) {
        throw new HttpException(
          {
            success: false,
            error: {
              code: 'INVALID_DATE_RANGE',
              message: 'Both "from" and "to" date parameters are required',
              details: {},
            },
          },
          HttpStatus.BAD_REQUEST,
        );
      }

      const fromDate = new Date(from);
      const toDate = new Date(to);

      if (isNaN(fromDate.getTime()) || isNaN(toDate.getTime())) {
        throw new HttpException(
          {
            success: false,
            error: {
              code: 'INVALID_DATE_RANGE',
              message: 'Invalid date format. Use ISO 8601 format',
              details: {},
            },
          },
          HttpStatus.BAD_REQUEST,
        );
      }

      const data = await this.telemetryService.getDevicePerformance(
        fromDate,
        toDate,
        deviceId,
        busId,
      );

      return { success: true, data };
    } catch (error) {
      if (error instanceof HttpException) {
        throw error;
      }
      throw new HttpException(
        {
          success: false,
          error: {
            code: 'INTERNAL_ERROR',
            message: error instanceof Error ? error.message : 'Failed to fetch device performance',
            details: {},
          },
        },
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  /**
   * GET /admin/telemetry/routes
   * Route performance metrics
   */
  @Get('routes')
  async getRoutePerformance(
    @Query('from') from: string,
    @Query('to') to: string,
    @Query('routeId') routeId?: string,
  ) {
    try {
      if (!from || !to) {
        throw new HttpException(
          {
            success: false,
            error: {
              code: 'INVALID_DATE_RANGE',
              message: 'Both "from" and "to" date parameters are required',
              details: {},
            },
          },
          HttpStatus.BAD_REQUEST,
        );
      }

      const fromDate = new Date(from);
      const toDate = new Date(to);

      if (isNaN(fromDate.getTime()) || isNaN(toDate.getTime())) {
        throw new HttpException(
          {
            success: false,
            error: {
              code: 'INVALID_DATE_RANGE',
              message: 'Invalid date format. Use ISO 8601 format',
              details: {},
            },
          },
          HttpStatus.BAD_REQUEST,
        );
      }

      const data = await this.telemetryService.getRoutePerformance(
        fromDate,
        toDate,
        routeId,
      );

      return { success: true, data };
    } catch (error) {
      if (error instanceof HttpException) {
        throw error;
      }
      throw new HttpException(
        {
          success: false,
          error: {
            code: 'INTERNAL_ERROR',
            message: error instanceof Error ? error.message : 'Failed to fetch route performance',
            details: {},
          },
        },
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  /**
   * GET /admin/telemetry/rfid-failures
   * RFID failures list
   */
  @Get('rfid-failures')
  async getRfidFailures(
    @Query('from') from?: string,
    @Query('to') to?: string,
    @Query('deviceId') deviceId?: string,
    @Query('busId') busId?: string,
    @Query('studentId') studentId?: string,
    @Query('page') page?: string,
    @Query('pageSize') pageSize?: string,
    @Query('search') search?: string,
  ) {
    try {
      const fromDate = from ? new Date(from) : undefined;
      const toDate = to ? new Date(to) : undefined;

      if (fromDate && isNaN(fromDate.getTime())) {
        throw new HttpException(
          {
            success: false,
            error: {
              code: 'INVALID_DATE_RANGE',
              message: 'Invalid "from" date format',
              details: {},
            },
          },
          HttpStatus.BAD_REQUEST,
        );
      }

      if (toDate && isNaN(toDate.getTime())) {
        throw new HttpException(
          {
            success: false,
            error: {
              code: 'INVALID_DATE_RANGE',
              message: 'Invalid "to" date format',
              details: {},
            },
          },
          HttpStatus.BAD_REQUEST,
        );
      }

      const pageNum = page ? parseInt(page, 10) : 1;
      const pageSizeNum = pageSize ? parseInt(pageSize, 10) : 50;

      const data = await this.telemetryService.getRfidFailures(
        fromDate,
        toDate,
        deviceId,
        busId,
        studentId,
        pageNum,
        pageSizeNum,
      );

      return { success: true, data };
    } catch (error) {
      if (error instanceof HttpException) {
        throw error;
      }
      throw new HttpException(
        {
          success: false,
          error: {
            code: 'INTERNAL_ERROR',
            message: error instanceof Error ? error.message : 'Failed to fetch RFID failures',
            details: {},
          },
        },
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  /**
   * GET /admin/telemetry/sms-failures
   * SMS failures list
   */
  @Get('sms-failures')
  async getSmsFailures(
    @Query('from') from?: string,
    @Query('to') to?: string,
    @Query('tripId') tripId?: string,
    @Query('parentId') parentId?: string,
    @Query('page') page?: string,
    @Query('pageSize') pageSize?: string,
    @Query('search') search?: string,
  ) {
    try {
      const fromDate = from ? new Date(from) : undefined;
      const toDate = to ? new Date(to) : undefined;

      if (fromDate && isNaN(fromDate.getTime())) {
        throw new HttpException(
          {
            success: false,
            error: {
              code: 'INVALID_DATE_RANGE',
              message: 'Invalid "from" date format',
              details: {},
            },
          },
          HttpStatus.BAD_REQUEST,
        );
      }

      if (toDate && isNaN(toDate.getTime())) {
        throw new HttpException(
          {
            success: false,
            error: {
              code: 'INVALID_DATE_RANGE',
              message: 'Invalid "to" date format',
              details: {},
            },
          },
          HttpStatus.BAD_REQUEST,
        );
      }

      const pageNum = page ? parseInt(page, 10) : 1;
      const pageSizeNum = pageSize ? parseInt(pageSize, 10) : 50;

      const data = await this.telemetryService.getSmsFailures(
        fromDate,
        toDate,
        tripId,
        parentId,
        pageNum,
        pageSizeNum,
      );

      return { success: true, data };
    } catch (error) {
      if (error instanceof HttpException) {
        throw error;
      }
      throw new HttpException(
        {
          success: false,
          error: {
            code: 'INTERNAL_ERROR',
            message: error instanceof Error ? error.message : 'Failed to fetch SMS failures',
            details: {},
          },
        },
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  /**
   * GET /admin/telemetry/failure-reasons
   * Failure reasons breakdown
   */
  @Get('failure-reasons')
  async getFailureReasons(
    @Query('from') from: string,
    @Query('to') to: string,
    @Query('type') type?: string,
  ) {
    try {
      if (!from || !to) {
        throw new HttpException(
          {
            success: false,
            error: {
              code: 'INVALID_DATE_RANGE',
              message: 'Both "from" and "to" date parameters are required',
              details: {},
            },
          },
          HttpStatus.BAD_REQUEST,
        );
      }

      const fromDate = new Date(from);
      const toDate = new Date(to);

      if (isNaN(fromDate.getTime()) || isNaN(toDate.getTime())) {
        throw new HttpException(
          {
            success: false,
            error: {
              code: 'INVALID_DATE_RANGE',
              message: 'Invalid date format. Use ISO 8601 format',
              details: {},
            },
          },
          HttpStatus.BAD_REQUEST,
        );
      }

      const failureType = (type === 'rfid' || type === 'sms' ? type : 'all') as 'rfid' | 'sms' | 'all';

      const data = await this.telemetryService.getFailureReasons(
        fromDate,
        toDate,
        failureType,
      );

      return { success: true, data };
    } catch (error) {
      if (error instanceof HttpException) {
        throw error;
      }
      throw new HttpException(
        {
          success: false,
          error: {
            code: 'INTERNAL_ERROR',
            message: error instanceof Error ? error.message : 'Failed to fetch failure reasons',
            details: {},
          },
        },
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }
}
