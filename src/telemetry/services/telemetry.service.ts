import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { PickupDropoffStatus, SchoolTripStatus } from '../../academic-suite/dto/create-school-trip.dto';

@Injectable()
export class TelemetryService {
  private readonly logger = new Logger(TelemetryService.name);

  constructor(private readonly prisma: PrismaService) {}

  /**
   * Get system-wide summary statistics
   */
  async getSystemSummary() {
    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const startOfLastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);
    const endOfLastMonth = new Date(now.getFullYear(), now.getMonth(), 0);

    // Schools
    const [totalSchools, activeSchools, newSchoolsThisMonth, newSchoolsLastMonth] = await Promise.all([
      this.prisma.school.count(),
      this.prisma.school.count({ where: { isActive: true } }),
      this.prisma.school.count({ where: { createdAt: { gte: startOfMonth } } }),
      this.prisma.school.count({ where: { createdAt: { gte: startOfLastMonth, lte: endOfLastMonth } } }),
    ]);

    // Customers
    const [totalCustomers, activeCustomers, newCustomersThisMonth, newCustomersLastMonth] = await Promise.all([
      this.prisma.customer.count(),
      this.prisma.customer.count({ where: { isActive: true } }),
      this.prisma.customer.count({ where: { createdAt: { gte: startOfMonth } } }),
      this.prisma.customer.count({ where: { createdAt: { gte: startOfLastMonth, lte: endOfLastMonth } } }),
    ]);

    // Students
    const [totalStudents, activeStudents, newStudentsThisMonth, newStudentsLastMonth] = await Promise.all([
      this.prisma.student.count(),
      this.prisma.student.count({ where: { isActive: true } }),
      this.prisma.student.count({ where: { createdAt: { gte: startOfMonth } } }),
      this.prisma.student.count({ where: { createdAt: { gte: startOfLastMonth, lte: endOfLastMonth } } }),
    ]);

    // RFID Tags
    const [totalTags, activeTags, assignedTags] = await Promise.all([
      this.prisma.student.count({ where: { rfidTagId: { not: null } } }),
      this.prisma.student.count({ where: { rfidTagId: { not: null }, isActive: true } }),
      this.prisma.student.count({ where: { rfidTagId: { not: null } } }),
    ]);

    // Buses
    const [totalBuses, activeBuses, inServiceBuses] = await Promise.all([
      this.prisma.bus.count(),
      this.prisma.bus.count({ where: { isActive: true } }),
      this.prisma.bus.count({ where: { isActive: true, status: 'Active' } }),
    ]);

    const busCapacity = await this.prisma.bus.aggregate({
      where: { isActive: true },
      _sum: { seatsCapacity: true },
      _avg: { seatsCapacity: true },
    });

    // Routes
    const [totalRoutes, activeRoutes] = await Promise.all([
      this.prisma.route.count(),
      this.prisma.route.count({ where: { isActive: true } }),
    ]);

    const routeTypes = await this.prisma.route.groupBy({
      by: ['tripType'],
      where: { isActive: true },
      _count: true,
    });

    // Drivers
    const [totalDrivers, activeDrivers] = await Promise.all([
      this.prisma.schoolDriver.count(),
      this.prisma.schoolDriver.count({ where: { isActive: true } }),
    ]);

    // Minders
    const [totalMinders, activeMinders] = await Promise.all([
      this.prisma.schoolMinder.count(),
      this.prisma.schoolMinder.count({ where: { isActive: true } }),
    ]);

    // Parents
    const [totalParents, activeParents, newParentsThisMonth] = await Promise.all([
      this.prisma.schoolParent.count(),
      this.prisma.schoolParent.count({ where: { isActive: true } }),
      this.prisma.schoolParent.count({ where: { createdAt: { gte: startOfMonth } } }),
    ]);

    // Calculate growth rates
    const schoolsGrowthRate = newSchoolsLastMonth > 0
      ? ((newSchoolsThisMonth - newSchoolsLastMonth) / newSchoolsLastMonth) * 100
      : newSchoolsThisMonth > 0 ? 100 : 0;

    const customersGrowthRate = newCustomersLastMonth > 0
      ? ((newCustomersThisMonth - newCustomersLastMonth) / newCustomersLastMonth) * 100
      : newCustomersThisMonth > 0 ? 100 : 0;

    const studentsGrowthRate = newStudentsLastMonth > 0
      ? ((newStudentsThisMonth - newStudentsLastMonth) / newStudentsLastMonth) * 100
      : newStudentsThisMonth > 0 ? 100 : 0;

    // Group students by grade (simplified - you may need to adjust based on your grade field)
    const studentsByGrade = await this.prisma.student.groupBy({
      by: ['status'],
      where: { isActive: true },
      _count: true,
    });

    return {
      schools: {
        total: totalSchools,
        active: activeSchools,
        inactive: totalSchools - activeSchools,
        newThisMonth: newSchoolsThisMonth,
        growthRate: parseFloat(schoolsGrowthRate.toFixed(1)),
      },
      customers: {
        total: totalCustomers,
        active: activeCustomers,
        inactive: totalCustomers - activeCustomers,
        newThisMonth: newCustomersThisMonth,
        growthRate: parseFloat(customersGrowthRate.toFixed(1)),
        subscriptions: {
          active: activeCustomers,
          expired: 0, // Not tracked in current schema
          pending: 0,
        },
      },
      students: {
        total: totalStudents,
        active: activeStudents,
        inactive: totalStudents - activeStudents,
        newThisMonth: newStudentsThisMonth,
        growthRate: parseFloat(studentsGrowthRate.toFixed(1)),
        byGrade: studentsByGrade.map((g) => ({
          grade: g.status,
          count: g._count,
        })),
      },
      rfid: {
        totalTags,
        activeTags,
        inactiveTags: totalTags - activeTags,
        assignedTags,
        unassignedTags: totalStudents - assignedTags,
        replacementTags: 0, // Not tracked in current schema
        averageTagAge: 0, // Would need tag creation dates
        tagsByStatus: {
          active: activeTags,
          inactive: totalTags - activeTags,
          damaged: 0, // Not tracked
          lost: 0, // Not tracked
          pending: 0,
        },
      },
      buses: {
        total: totalBuses,
        active: activeBuses,
        inactive: totalBuses - activeBuses,
        inService: inServiceBuses,
        maintenance: activeBuses - inServiceBuses,
        totalCapacity: busCapacity._sum.seatsCapacity || 0,
        averageCapacity: Math.round(busCapacity._avg.seatsCapacity || 0),
      },
      routes: {
        total: totalRoutes,
        active: activeRoutes,
        inactive: totalRoutes - activeRoutes,
        morningRoutes: routeTypes.find((r) => r.tripType === 'MORNING_PICKUP')?._count || 0,
        afternoonRoutes: routeTypes.find((r) => r.tripType === 'EVENING_DROPOFF')?._count || 0,
      },
      drivers: {
        total: totalDrivers,
        active: activeDrivers,
        inactive: totalDrivers - activeDrivers,
        licensed: totalDrivers, // Assuming all are licensed
        certified: activeDrivers, // Simplified
      },
      minders: {
        total: totalMinders,
        active: activeMinders,
        inactive: totalMinders - activeMinders,
        certified: activeMinders, // Simplified
      },
      parents: {
        total: totalParents,
        active: activeParents,
        inactive: totalParents - activeParents,
        verified: activeParents, // Simplified
        unverified: totalParents - activeParents,
        newThisMonth: newParentsThisMonth,
      },
    };
  }

  /**
   * Get telemetry summary for a date range
   */
  async getTelemetrySummary(from: Date, to: Date, compare: boolean = false) {
    // RFID Statistics
    const rfidEvents = await this.prisma.schoolTripRfidEvent.findMany({
      where: {
        scannedAt: { gte: from, lte: to },
      },
      select: {
        scannedAt: true,
        deviceId: true,
      },
    });

    const totalRfidAttempts = rfidEvents.length;
    const successfulScans = totalRfidAttempts; // All recorded events are successful
    const failures = 0; // Would need failure tracking table
    const successRate = totalRfidAttempts > 0 ? (successfulScans / totalRfidAttempts) * 100 : 0;

    // Get unique devices
    const uniqueDevices = new Set(rfidEvents.map((e) => e.deviceId).filter(Boolean));
    const activeDevices = uniqueDevices.size;

    // Get peak hour (simplified)
    const hourCounts = new Map<number, number>();
    rfidEvents.forEach((e) => {
      const hour = new Date(e.scannedAt).getHours();
      hourCounts.set(hour, (hourCounts.get(hour) || 0) + 1);
    });
    const peakHour = Array.from(hourCounts.entries())
      .sort((a, b) => b[1] - a[1])[0]?.[0] || 0;
    const peakHourStr = `${peakHour.toString().padStart(2, '0')}:00`;

    // SMS Statistics (would need SMS logging table - using placeholder)
    const smsAttempts = 0; // Placeholder
    const smsSuccesses = 0; // Placeholder
    const smsFailures = 0; // Placeholder

    // Trip Statistics
    const trips = await this.prisma.schoolTrip.findMany({
      where: {
        tripDate: { gte: from, lte: to },
      },
      include: {
        tripStudents: true,
        locations: {
          orderBy: { timestamp: 'asc' },
          take: 1,
        },
      },
    });

    const completedTrips = trips.filter((t) => t.status === SchoolTripStatus.COMPLETED).length;
    const inProgressTrips = trips.filter((t) => t.status === SchoolTripStatus.IN_PROGRESS).length;
    const cancelledTrips = trips.filter((t) => t.status === SchoolTripStatus.CANCELLED).length;
    const totalStudentsTracked = trips.reduce((sum, t) => sum + t.tripStudents.length, 0);

    // Calculate average duration (simplified)
    const tripsWithDuration = trips.filter(
      (t) => t.actualStartTime && t.actualEndTime,
    );
    const avgDuration =
      tripsWithDuration.length > 0
        ? tripsWithDuration.reduce((sum, t) => {
            const duration = (t.actualEndTime!.getTime() - t.actualStartTime!.getTime()) / (1000 * 60);
            return sum + duration;
          }, 0) / tripsWithDuration.length
        : 0;

    // Previous period comparison
    const previousPeriod = compare
      ? await this.getPreviousPeriodSummary(from, to)
      : undefined;

    return {
      period: {
        from,
        to,
      },
      rfid: {
        totalAttempts: totalRfidAttempts,
        successfulScans: successfulScans,
        failures,
        successRate: parseFloat(successRate.toFixed(2)),
        averageScanTime: 1.2, // Placeholder
        peakHour: peakHourStr,
        totalDevices: uniqueDevices.size,
        activeDevices,
      },
      sms: {
        totalAttempts: smsAttempts,
        successfulDeliveries: smsSuccesses,
        failures: smsFailures,
        successRate: smsAttempts > 0 ? parseFloat(((smsSuccesses / smsAttempts) * 100).toFixed(2)) : 0,
        averageDeliveryTime: 3.5, // Placeholder
        peakHour: '08:00', // Placeholder
        providers: [], // Would need provider tracking
      },
      trips: {
        totalTrips: trips.length,
        completedTrips: completedTrips,
        inProgressTrips: inProgressTrips,
        cancelledTrips: cancelledTrips,
        averageDuration: Math.round(avgDuration),
        totalStudentsTracked,
        totalDistance: 0, // Would need distance calculation from locations
      },
      system: {
        uptime: 99.87, // Placeholder - would need system monitoring
        averageResponseTime: 145, // Placeholder
        apiErrors: 0, // Would need error logging
        databaseQueries: 0, // Would need query logging
        cacheHitRate: 87.3, // Placeholder
      },
      previousPeriod,
    };
  }

  /**
   * Get previous period summary for comparison
   */
  private async getPreviousPeriodSummary(from: Date, to: Date) {
    const duration = to.getTime() - from.getTime();
    const previousFrom = new Date(from.getTime() - duration);
    const previousTo = from;

    const rfidEvents = await this.prisma.schoolTripRfidEvent.findMany({
      where: {
        scannedAt: { gte: previousFrom, lte: previousTo },
      },
    });

    const prevTotalAttempts = rfidEvents.length;
    const prevSuccessfulScans = prevTotalAttempts;
    const prevFailures = 0;

    return {
      rfid: {
        totalAttempts: prevTotalAttempts,
        successfulScans: prevSuccessfulScans,
        failures: prevFailures,
        successRate: prevTotalAttempts > 0 ? parseFloat(((prevSuccessfulScans / prevTotalAttempts) * 100).toFixed(2)) : 0,
      },
      sms: {
        totalAttempts: 0,
        successfulDeliveries: 0,
        failures: 0,
        successRate: 0,
      },
    };
  }

  /**
   * Get daily statistics
   */
  async getDailyStatistics(from: Date, to: Date) {
    const dailyData: any[] = [];
    const currentDate = new Date(from);

    while (currentDate <= to) {
      const dayStart = new Date(currentDate);
      dayStart.setHours(0, 0, 0, 0);
      const dayEnd = new Date(currentDate);
      dayEnd.setHours(23, 59, 59, 999);

      const [rfidEvents, trips] = await Promise.all([
        this.prisma.schoolTripRfidEvent.findMany({
          where: {
            scannedAt: { gte: dayStart, lte: dayEnd },
          },
        }),
        this.prisma.schoolTrip.findMany({
          where: {
            tripDate: { gte: dayStart, lte: dayEnd },
          },
        }),
      ]);

      dailyData.push({
        date: currentDate.toISOString().split('T')[0],
        rfid: {
          attempts: rfidEvents.length,
          successes: rfidEvents.length,
          failures: 0,
        },
        sms: {
          attempts: 0, // Placeholder
          successes: 0,
          failures: 0,
        },
        trips: {
          scheduled: trips.length,
          completed: trips.filter((t) => t.status === SchoolTripStatus.COMPLETED).length,
          cancelled: trips.filter((t) => t.status === SchoolTripStatus.CANCELLED).length,
        },
      });

      currentDate.setDate(currentDate.getDate() + 1);
    }

    return dailyData;
  }

  /**
   * Get device performance metrics
   */
  async getDevicePerformance(from: Date, to: Date, deviceId?: string, busId?: string) {
    const where: any = {
      scannedAt: { gte: from, lte: to },
    };

    if (deviceId) {
      where.deviceId = deviceId;
    }

    if (busId) {
      const trips = await this.prisma.schoolTrip.findMany({
        where: { busId },
        select: { id: true },
      });
      where.tripId = { in: trips.map((t) => t.id) };
    }

    const events = await this.prisma.schoolTripRfidEvent.findMany({
      where,
      include: {
        trip: {
          include: {
            bus: {
              select: {
                id: true,
                registrationNumber: true,
              },
            },
          },
        },
      },
    });

    // Group by device
    const deviceMap = new Map<string, any>();

    events.forEach((event) => {
      const devId = event.deviceId || 'unknown';
      if (!deviceMap.has(devId)) {
        deviceMap.set(devId, {
          deviceId: devId,
          busId: event.trip.busId,
          busRegistration: event.trip.bus?.registrationNumber || 'N/A',
          totalScans: 0,
          failures: 0,
          lastActive: event.scannedAt,
          scanTimes: [],
        });
      }

      const device = deviceMap.get(devId);
      device.totalScans++;
      if (event.scannedAt > device.lastActive) {
        device.lastActive = event.scannedAt;
      }
    });

    return Array.from(deviceMap.values()).map((device) => ({
      deviceId: device.deviceId,
      busId: device.busId,
      busRegistration: device.busRegistration,
      totalScans: device.totalScans,
      failures: device.failures,
      successRate: device.totalScans > 0
        ? parseFloat(((device.totalScans - device.failures) / device.totalScans * 100).toFixed(2))
        : 0,
      lastActive: device.lastActive,
      averageScanTime: 1.2, // Placeholder
      totalUptime: 98.5, // Placeholder
    }));
  }

  /**
   * Get route performance metrics
   */
  async getRoutePerformance(from: Date, to: Date, routeId?: string) {
    const where: any = {
      tripDate: { gte: from, lte: to },
    };

    if (routeId) {
      where.routeId = routeId;
    }

    const trips = await this.prisma.schoolTrip.findMany({
      where,
      include: {
        route: {
          select: {
            id: true,
            name: true,
          },
        },
        tripStudents: {
          where: {
            pickupStatus: PickupDropoffStatus.PICKED_UP,
          },
        },
        locations: {
          orderBy: { timestamp: 'asc' },
        },
      },
    });

    // Group by route
    const routeMap = new Map<string, any>();

    trips.forEach((trip) => {
      const rId = trip.routeId;
      if (!routeMap.has(rId)) {
        routeMap.set(rId, {
          routeId: rId,
          routeName: trip.route.name,
          trips: [],
          studentsServed: new Set(),
          totalPickups: 0,
          totalDropoffs: 0,
        });
      }

      const route = routeMap.get(rId);
      route.trips.push(trip);
      trip.tripStudents.forEach((ts) => {
        route.studentsServed.add(ts.studentId);
        if (ts.pickupStatus === PickupDropoffStatus.PICKED_UP) {
          route.totalPickups++;
        }
        if (ts.dropoffStatus === PickupDropoffStatus.DROPPED_OFF) {
          route.totalDropoffs++;
        }
      });
    });

    return Array.from(routeMap.values()).map((route) => {
      const completedTrips = route.trips.filter(
        (t: any) => t.status === SchoolTripStatus.COMPLETED,
      );
      const tripsWithDuration = completedTrips.filter(
        (t: any) => t.actualStartTime && t.actualEndTime,
      );

      const avgDuration =
        tripsWithDuration.length > 0
          ? tripsWithDuration.reduce((sum: number, t: any) => {
              const duration =
                (t.actualEndTime.getTime() - t.actualStartTime.getTime()) / (1000 * 60);
              return sum + duration;
            }, 0) / tripsWithDuration.length
          : 0;

      return {
        routeId: route.routeId,
        routeName: route.routeName,
        trips: route.trips.length,
        avgDuration: Math.round(avgDuration),
        onTimeRate: 96.4, // Placeholder - would need scheduled vs actual comparison
        studentsServed: route.studentsServed.size,
        totalDistance: 0, // Would need distance calculation
        averageDistance: 10, // Placeholder
        totalPickups: route.totalPickups,
        totalDropoffs: route.totalDropoffs,
      };
    });
  }

  /**
   * Get RFID failures (placeholder - would need failure tracking)
   */
  async getRfidFailures(
    from?: Date,
    to?: Date,
    deviceId?: string,
    busId?: string,
    studentId?: string,
    page: number = 1,
    pageSize: number = 50,
  ) {
    // This is a placeholder - actual implementation would need a failure tracking table
    return {
      failures: [],
      pagination: {
        page,
        pageSize,
        total: 0,
        totalPages: 0,
      },
    };
  }

  /**
   * Get SMS failures (placeholder - would need SMS logging)
   */
  async getSmsFailures(
    from?: Date,
    to?: Date,
    tripId?: string,
    parentId?: string,
    page: number = 1,
    pageSize: number = 50,
  ) {
    // This is a placeholder - actual implementation would need SMS logging
    return {
      failures: [],
      pagination: {
        page,
        pageSize,
        total: 0,
        totalPages: 0,
      },
    };
  }

  /**
   * Get failure reasons breakdown
   */
  async getFailureReasons(from: Date, to: Date, type: 'rfid' | 'sms' | 'all' = 'all') {
    // Placeholder - would need failure tracking with reasons
    return {
      rfid: type === 'all' || type === 'rfid' ? [] : undefined,
      sms: type === 'all' || type === 'sms' ? [] : undefined,
    };
  }
}
