import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import {
  CreateSchoolTripDto,
  UpdateSchoolTripDto,
  CreateTripStudentDto,
  UpdateTripStudentDto,
  SchoolTripStatus,
  PickupDropoffStatus,
  LogRfidEventDto,
  RfidEventType,
} from '../dto/create-school-trip.dto';
import { UpdateSchoolTripLocationDto } from '../dtos/update-school-trip-location.dto';
import { SmsService } from '../../common/services/sms.service';
import { MailService } from '../../common/services/mail.service';
import { ConfigService } from '@nestjs/config';
import * as crypto from 'crypto';

@Injectable()
export class SchoolTripDbService {
  private readonly logger = new Logger(SchoolTripDbService.name);
  private trackingGateway: any; // Will be injected via setter to avoid circular dependency
  private smsService: SmsService | null = null;
  private mailService: MailService | null = null;
  private configService: ConfigService | null = null;

  constructor(private readonly prisma: PrismaService) {}

  /**
   * Set services (called from module to avoid circular dependency)
   */
  setServices(
    smsService: SmsService,
    mailService: MailService,
    configService: ConfigService,
  ) {
    this.smsService = smsService;
    this.mailService = mailService;
    this.configService = configService;
  }

  /**
   * Set the tracking gateway (called from module to avoid circular dependency)
   */
  setTrackingGateway(gateway: any) {
    this.trackingGateway = gateway;
  }

  async create(data: CreateSchoolTripDto) {
    const tripId = crypto.randomUUID();

    // Fetch route to get tripType for auto-generating scheduledStartTime
    const route = await this.prisma.route.findUnique({
      where: { id: data.routeId },
      select: { tripType: true },
    });

    if (!route) {
      throw new Error('Route not found');
    }

    // Auto-generate scheduledStartTime based on tripDate and route tripType
    const tripDate = new Date(data.tripDate);
    let scheduledStartTime: Date;

    if (data.scheduledStartTime) {
      scheduledStartTime = new Date(data.scheduledStartTime);
    } else {
      // Default times based on tripType
      scheduledStartTime = new Date(tripDate);
      switch (route.tripType) {
        case 'MORNING_PICKUP':
          scheduledStartTime.setHours(7, 0, 0, 0); // 7:00 AM
          break;
        case 'EVENING_DROPOFF':
          scheduledStartTime.setHours(15, 0, 0, 0); // 3:00 PM
          break;
        case 'FIELD_TRIP':
        case 'EXTRA_CURRICULUM':
          scheduledStartTime.setHours(8, 0, 0, 0); // 8:00 AM
          break;
        case 'EMERGENCY':
          scheduledStartTime.setHours(
            new Date().getHours(),
            new Date().getMinutes(),
            0,
            0,
          );
          break;
        default:
          scheduledStartTime.setHours(7, 0, 0, 0);
      }
    }

    // Prepare trip data
    const tripData: any = {
      id: tripId,
      routeId: data.routeId,
      busId: data.busId || null,
      driverId: data.driverId || null,
      minderId: data.minderId || null,
      tripDate: tripDate,
      scheduledStartTime: scheduledStartTime,
      scheduledEndTime: null, // Will be auto-captured when trip ends
      status: data.status || SchoolTripStatus.IN_PROGRESS,
      notes: data.notes,
      startLocation: data.startLocation,
      endLocation: data.endLocation,
      startGps: data.startGps,
      endGps: data.endGps,
      isActive: data.isActive ?? true,
    };

    // Create trip with students in a transaction
    const trip = await this.prisma.$transaction(async (tx) => {
      const createdTrip = await tx.schoolTrip.create({
        data: tripData,
        include: {
          route: {
            select: {
              id: true,
              name: true,
              tripType: true,
            },
          },
          bus: {
            select: {
              id: true,
              registrationNumber: true,
              make: true,
              model: true,
            },
          },
          driver: {
            select: {
              id: true,
              name: true,
              phoneNumber: true,
              pin: true,
            },
          },
          minder: {
            select: {
              id: true,
              name: true,
              phoneNumber: true,
              pin: true,
            },
          },
        },
      });

      // Add students if provided - auto-populate locations from parent's primary address
      if (data.students && data.students.length > 0) {
        // Fetch all students with their parent's primary address
        const studentIds = data.students.map((s) => s.studentId);
        const studentsWithAddresses = await tx.student.findMany({
          where: { id: { in: studentIds } },
          include: {
            parent: {
              include: {
                addresses: {
                  where: { isPrimary: true, status: 'Active' },
                  take: 1,
                },
              },
            },
          },
        });

        // Create a map for quick lookup
        const studentAddressMap = new Map(
          studentsWithAddresses.map((student) => [
            student.id,
            student.parent.addresses[0] || null,
          ]),
        );

        const tripStudentData = data.students.map((student) => {
          const primaryAddress = studentAddressMap.get(student.studentId);

          // Build GPS string from latitude and longitude if available
          const gpsString =
            primaryAddress?.latitude && primaryAddress?.longitude
              ? `${primaryAddress.latitude},${primaryAddress.longitude}`
              : null;

          return {
            id: crypto.randomUUID(),
            tripId: createdTrip.id,
            studentId: student.studentId,
            scheduledPickupTime: null, // Can be set later if needed
            scheduledDropoffTime: null, // Can be set later if needed
            pickupLocation: primaryAddress?.location || null,
            dropoffLocation: primaryAddress?.location || null, // Same location for pickup/dropoff
            pickupGps: gpsString,
            dropoffGps: gpsString,
            notes: null,
          };
        });

        await tx.schoolTripStudent.createMany({
          data: tripStudentData,
          skipDuplicates: true,
        });
      }

      // Fetch trip with all relations
      return tx.schoolTrip.findUnique({
        where: { id: createdTrip.id },
        include: {
          route: {
            select: {
              id: true,
              name: true,
              tripType: true,
            },
          },
          bus: {
            select: {
              id: true,
              registrationNumber: true,
              make: true,
              model: true,
            },
          },
          driver: {
            select: {
              id: true,
              name: true,
              phoneNumber: true,
              pin: true,
            },
          },
          minder: {
            select: {
              id: true,
              name: true,
              phoneNumber: true,
              pin: true,
            },
          },
          tripStudents: {
            include: {
              student: {
                select: {
                  id: true,
                  name: true,
                  admissionNumber: true,
                  gender: true,
                  rfidTagId: true,
                },
              },
            },
          },
        },
      });
    });

    return trip;
  }

  async findActiveTrips(driverId?: string, minderId?: string) {
    const where: any = {
      status: {
        in: [SchoolTripStatus.SCHEDULED, SchoolTripStatus.IN_PROGRESS],
      },
      isActive: true,
    };

    if (driverId) where.driverId = driverId;
    if (minderId) where.minderId = minderId;

    return this.prisma.schoolTrip.findMany({
      where,
      orderBy: { tripDate: 'desc' },
      include: {
        route: {
          select: {
            id: true,
            name: true,
            tripType: true,
            school: {
              select: {
                id: true,
                name: true,
              },
            },
          },
        },
        bus: {
          select: {
            id: true,
            registrationNumber: true,
            make: true,
            model: true,
          },
        },
        driver: {
          select: {
            id: true,
            name: true,
            phoneNumber: true,
            pin: true,
          },
        },
        minder: {
          select: {
            id: true,
            name: true,
            phoneNumber: true,
            pin: true,
          },
        },
        tripStudents: {
          select: {
            id: true,
            student: {
              select: {
                id: true,
                name: true,
                admissionNumber: true,
                rfidTagId: true,
              },
            },
          },
        },
      },
    });
  }

  async findByMinder(
    minderId: string,
    page: number = 1,
    pageSize: number = 10,
    status?: SchoolTripStatus,
    tripDate?: string,
  ) {
    this.logger.log(`Finding trips for minder ${minderId}`);

    const skip = (page - 1) * pageSize;
    const where: any = {
      minderId: minderId,
    };

    if (status) where.status = status;
    if (tripDate) {
      const date = new Date(tripDate);
      const startOfDay = new Date(date.setHours(0, 0, 0, 0));
      const endOfDay = new Date(date.setHours(23, 59, 59, 999));
      where.tripDate = {
        gte: startOfDay,
        lte: endOfDay,
      };
    }

    const [data, totalItems] = await Promise.all([
      this.prisma.schoolTrip.findMany({
        where,
        skip,
        take: pageSize,
        orderBy: { tripDate: 'desc' },
        include: {
          route: {
            select: {
              id: true,
              name: true,
              tripType: true,
            },
          },
          bus: {
            select: {
              id: true,
              registrationNumber: true,
              make: true,
              model: true,
            },
          },
          driver: {
            select: {
              id: true,
              name: true,
              phoneNumber: true,
              pin: true,
            },
          },
          minder: {
            select: {
              id: true,
              name: true,
              phoneNumber: true,
              pin: true,
            },
          },
          tripStudents: {
            select: {
              id: true,
              student: {
                select: {
                  id: true,
                  name: true,
                  admissionNumber: true,
                  rfidTagId: true,
                },
              },
            },
          },
        },
      }),
      this.prisma.schoolTrip.count({ where }),
    ]);

    const totalPages = Math.ceil(totalItems / pageSize);

    return {
      data,
      pagination: {
        page,
        pageSize,
        totalItems,
        totalPages,
      },
    };
  }

  async findAll(
    page: number = 1,
    pageSize: number = 10,
    routeId?: string,
    status?: SchoolTripStatus,
    tripDate?: string,
  ) {
    const skip = (page - 1) * pageSize;
    const where: any = {};
    if (routeId) where.routeId = routeId;
    if (status) where.status = status;
    if (tripDate) {
      const date = new Date(tripDate);
      const startOfDay = new Date(date.setHours(0, 0, 0, 0));
      const endOfDay = new Date(date.setHours(23, 59, 59, 999));
      where.tripDate = {
        gte: startOfDay,
        lte: endOfDay,
      };
    }

    const [data, totalItems] = await Promise.all([
      this.prisma.schoolTrip.findMany({
        where,
        skip,
        take: pageSize,
        orderBy: { tripDate: 'desc' },
        include: {
          route: {
            select: {
              id: true,
              name: true,
              tripType: true,
            },
          },
          bus: {
            select: {
              id: true,
              registrationNumber: true,
              make: true,
              model: true,
            },
          },
          driver: {
            select: {
              id: true,
              name: true,
              phoneNumber: true,
              pin: true,
            },
          },
          minder: {
            select: {
              id: true,
              name: true,
              phoneNumber: true,
              pin: true,
            },
          },
          tripStudents: {
            include: {
              student: {
                select: {
                  id: true,
                  name: true,
                  admissionNumber: true,
                  rfidTagId: true,
                },
              },
            },
          },
        },
      }),
      this.prisma.schoolTrip.count({ where }),
    ]);

    return {
      data,
      pagination: {
        page,
        pageSize,
        totalItems,
        totalPages: Math.ceil(totalItems / pageSize),
      },
    };
  }

  async findById(id: string) {
    return this.prisma.schoolTrip.findUnique({
      where: { id },
      include: {
        route: {
          select: {
            id: true,
            name: true,
            tripType: true,
            school: {
              select: {
                id: true,
                name: true,
              },
            },
          },
        },
        bus: {
          select: {
            id: true,
            registrationNumber: true,
            make: true,
            model: true,
          },
        },
        driver: {
          select: {
            id: true,
            name: true,
            phoneNumber: true,
            pin: true,
          },
        },
        minder: {
          select: {
            id: true,
            name: true,
            phoneNumber: true,
            pin: true,
          },
        },
        tripStudents: {
          include: {
            student: {
              select: {
                id: true,
                name: true,
                admissionNumber: true,
                gender: true,
                rfidTagId: true,
                parent: {
                  select: {
                    id: true,
                    name: true,
                    phoneNumber: true,
                  },
                },
              },
            },
          },
        },
      },
    });
  }

  async update(id: string, data: UpdateSchoolTripDto) {
    // Fetch current trip to check status change
    const currentTrip = await this.prisma.schoolTrip.findUnique({
      where: { id },
      select: { status: true, scheduledEndTime: true },
    });

    if (!currentTrip) {
      throw new Error('Trip not found');
    }

    const updateData: any = {
      updatedAt: new Date(),
    };

    if (data.routeId !== undefined) updateData.routeId = data.routeId;
    if (data.tripDate !== undefined)
      updateData.tripDate = new Date(data.tripDate);
    if (data.scheduledStartTime !== undefined)
      updateData.scheduledStartTime = new Date(data.scheduledStartTime);
    if (data.actualStartTime !== undefined)
      updateData.actualStartTime = data.actualStartTime
        ? new Date(data.actualStartTime)
        : null;
    if (data.actualEndTime !== undefined)
      updateData.actualEndTime = data.actualEndTime
        ? new Date(data.actualEndTime)
        : null;

    // Auto-capture scheduledEndTime when status changes to COMPLETED
    if (data.status !== undefined) {
      updateData.status = data.status;
      if (
        data.status === SchoolTripStatus.COMPLETED &&
        currentTrip.status !== SchoolTripStatus.COMPLETED &&
        !currentTrip.scheduledEndTime
      ) {
        updateData.scheduledEndTime = new Date();
      }
    }

    // Allow manual override of scheduledEndTime if provided
    if (data.scheduledEndTime !== undefined) {
      updateData.scheduledEndTime = data.scheduledEndTime
        ? new Date(data.scheduledEndTime)
        : null;
    }
    if (data.notes !== undefined) updateData.notes = data.notes;
    if (data.startLocation !== undefined)
      updateData.startLocation = data.startLocation;
    if (data.endLocation !== undefined)
      updateData.endLocation = data.endLocation;
    if (data.startGps !== undefined) updateData.startGps = data.startGps;
    if (data.endGps !== undefined) updateData.endGps = data.endGps;
    if (data.isActive !== undefined) updateData.isActive = data.isActive;

    // Handle busId, driverId, minderId - null removes the association
    if (data.busId !== undefined) {
      updateData.busId =
        data.busId === '' || data.busId === null ? null : data.busId;
    }
    if (data.driverId !== undefined) {
      updateData.driverId =
        data.driverId === '' || data.driverId === null ? null : data.driverId;
    }
    if (data.minderId !== undefined) {
      updateData.minderId =
        data.minderId === '' || data.minderId === null ? null : data.minderId;
    }

    return this.prisma.schoolTrip.update({
      where: { id },
      data: updateData,
      include: {
        route: {
          select: {
            id: true,
            name: true,
            tripType: true,
          },
        },
        bus: {
          select: {
            id: true,
            registrationNumber: true,
            make: true,
            model: true,
          },
        },
        driver: {
          select: {
            id: true,
            name: true,
            phoneNumber: true,
            pin: true,
          },
        },
        minder: {
          select: {
            id: true,
            name: true,
            phoneNumber: true,
            pin: true,
          },
        },
        tripStudents: {
          include: {
            student: {
              select: {
                id: true,
                name: true,
                admissionNumber: true,
                rfidTagId: true,
              },
            },
          },
        },
      },
    });
  }

  async delete(id: string) {
    return this.prisma.schoolTrip.delete({ where: { id } });
  }

  async addStudent(tripId: string, data: CreateTripStudentDto) {
    const existingTripStudent = await this.prisma.schoolTripStudent.findFirst({
      where: {
        tripId,
        studentId: data.studentId,
      },
    });

    if (existingTripStudent) {
      throw new Error('Student is already assigned to this trip');
    }

    // Fetch student with parent's primary address
    const student = await this.prisma.student.findUnique({
      where: { id: data.studentId },
      include: {
        parent: {
          include: {
            addresses: {
              where: { isPrimary: true, status: 'Active' },
              take: 1,
            },
          },
        },
      },
    });

    if (!student) {
      throw new Error('Student not found');
    }

    const primaryAddress = student.parent.addresses[0] || null;
    const gpsString =
      primaryAddress?.latitude && primaryAddress?.longitude
        ? `${primaryAddress.latitude},${primaryAddress.longitude}`
        : null;

    return this.prisma.schoolTripStudent.create({
      data: {
        id: crypto.randomUUID(),
        tripId,
        studentId: data.studentId,
        scheduledPickupTime: null,
        scheduledDropoffTime: null,
        pickupLocation: primaryAddress?.location || null,
        dropoffLocation: primaryAddress?.location || null,
        pickupGps: gpsString,
        dropoffGps: gpsString,
        notes: null,
      },
      include: {
        student: {
          select: {
            id: true,
            name: true,
            admissionNumber: true,
            gender: true,
            rfidTagId: true,
          },
        },
      },
    });
  }

  async updateStudent(
    tripId: string,
    studentId: string,
    data: UpdateTripStudentDto,
  ) {
    const updateData: any = {
      updatedAt: new Date(),
    };

    if (data.pickupStatus !== undefined)
      updateData.pickupStatus = data.pickupStatus;
    if (data.dropoffStatus !== undefined)
      updateData.dropoffStatus = data.dropoffStatus;
    if (data.actualPickupTime !== undefined)
      updateData.actualPickupTime = data.actualPickupTime
        ? new Date(data.actualPickupTime)
        : null;
    if (data.actualDropoffTime !== undefined)
      updateData.actualDropoffTime = data.actualDropoffTime
        ? new Date(data.actualDropoffTime)
        : null;
    if (data.pickupLocation !== undefined)
      updateData.pickupLocation = data.pickupLocation;
    if (data.dropoffLocation !== undefined)
      updateData.dropoffLocation = data.dropoffLocation;
    if (data.pickupGps !== undefined) updateData.pickupGps = data.pickupGps;
    if (data.dropoffGps !== undefined) updateData.dropoffGps = data.dropoffGps;
    if (data.notes !== undefined) updateData.notes = data.notes;

    return this.prisma.schoolTripStudent.updateMany({
      where: {
        tripId,
        studentId,
      },
      data: updateData,
    });
  }

  async removeStudent(tripId: string, studentId: string) {
    return this.prisma.schoolTripStudent.deleteMany({
      where: {
        tripId,
        studentId,
      },
    });
  }

  async getTripStudents(tripId: string) {
    return this.prisma.schoolTripStudent.findMany({
      where: { tripId },
      include: {
        student: {
          select: {
            id: true,
            name: true,
            admissionNumber: true,
            gender: true,
            rfidTagId: true,
            parent: {
              select: {
                id: true,
                name: true,
                phoneNumber: true,
              },
            },
          },
        },
      },
    });
  }

  async logRfidEventWithStudentId(
    tripId: string,
    studentId: string,
    rfidTagId: string,
    data: LogRfidEventDto,
  ) {
    // Verify trip exists
    const trip = await this.prisma.schoolTrip.findUnique({
      where: { id: tripId },
      select: { id: true, status: true },
    });

    if (!trip) {
      throw new Error('Trip not found');
    }

    // Find trip student record
    const tripStudent = await this.prisma.schoolTripStudent.findFirst({
      where: {
        tripId,
        studentId,
      },
    });

    if (!tripStudent) {
      throw new Error('Student is not assigned to this trip');
    }

    const scannedAt = data.scannedAt ? new Date(data.scannedAt) : new Date();

    // Create RFID event in transaction
    const result = await this.prisma.$transaction(async (tx) => {
      // Create RFID event
      const rfidEvent = await tx.schoolTripRfidEvent.create({
        data: {
          id: crypto.randomUUID(),
          tripId,
          tripStudentId: tripStudent.id,
          studentId,
          eventType: data.eventType,
          rfidTagId,
          deviceId: data.deviceId,
          deviceLocation: data.deviceLocation,
          gpsCoordinates: data.gpsCoordinates,
          scannedAt,
          notes: data.notes,
        },
      });

      // Auto-update student status based on RFID event
      const updateData: any = {};
      let shouldNotify = false;

      if (data.eventType === RfidEventType.ENTERED_BUS) {
        this.logger.log(
          `ENTERED_BUS event for student ${studentId} on trip ${tripId}`,
        );
        this.logger.debug(
          `Current tripStudent state: actualPickupTime=${tripStudent.actualPickupTime}, trackingToken=${tripStudent.trackingToken ? 'exists' : 'null'}, pickupStatus=${tripStudent.pickupStatus}`,
        );

        // Student entered bus - update pickup status
        updateData.pickupStatus = PickupDropoffStatus.PICKED_UP;
        if (!tripStudent.actualPickupTime) {
          updateData.actualPickupTime = scannedAt;
          shouldNotify = true; // Only notify on first pickup
          this.logger.log(
            `First pickup detected for student ${studentId} - will send notification`,
          );
        } else {
          this.logger.debug(
            `Student ${studentId} already has pickup time - notification skipped`,
          );
        }
        if (data.gpsCoordinates && !tripStudent.pickupGps) {
          updateData.pickupGps = data.gpsCoordinates;
        }
        if (data.deviceLocation && !tripStudent.pickupLocation) {
          updateData.pickupLocation = data.deviceLocation;
        }

        // Generate tracking token if not exists
        if (!tripStudent.trackingToken) {
          const newToken = this.generateTrackingToken();
          updateData.trackingToken = newToken;
          this.logger.log(
            `Generated new tracking token for student ${studentId}: ${newToken.substring(0, 8)}...`,
          );
        } else {
          this.logger.debug(`Student ${studentId} already has tracking token`);
        }
      } else if (data.eventType === RfidEventType.EXITED_BUS) {
        // Student exited bus - update dropoff status
        updateData.dropoffStatus = PickupDropoffStatus.DROPPED_OFF;
        if (!tripStudent.actualDropoffTime) {
          updateData.actualDropoffTime = scannedAt;
        }
        if (data.gpsCoordinates && !tripStudent.dropoffGps) {
          updateData.dropoffGps = data.gpsCoordinates;
        }
        if (data.deviceLocation && !tripStudent.dropoffLocation) {
          updateData.dropoffLocation = data.deviceLocation;
        }
      }

      // Update trip student if status changed
      let updatedTripStudent = null;
      let generatedTrackingToken = null;

      if (Object.keys(updateData).length > 0) {
        updatedTripStudent = await tx.schoolTripStudent.update({
          where: { id: tripStudent.id },
          data: updateData,
          select: {
            id: true,
            trackingToken: true,
            pickupStatus: true,
            dropoffStatus: true,
            actualPickupTime: true,
          },
        });

        // Store the generated token if it was just created
        if (updateData.trackingToken) {
          generatedTrackingToken = updateData.trackingToken;
        } else if (updatedTripStudent.trackingToken) {
          generatedTrackingToken = updatedTripStudent.trackingToken;
        }
      }

      return {
        rfidEvent,
        updatedTripStudent,
        shouldNotify,
        generatedTrackingToken,
      };
    });

    // Send notification if student was just picked up (first time)
    // Do this outside the transaction to avoid blocking and transaction issues
    const trackingToken =
      result.generatedTrackingToken || result.updatedTripStudent?.trackingToken;

    if (result.shouldNotify && trackingToken) {
      this.logger.log(
        `Student ${studentId} was picked up. Sending notification with tracking token: ${trackingToken.substring(0, 8)}...`,
      );

      // Fetch student with parent details for notification
      const studentWithParent = await this.prisma.student.findUnique({
        where: { id: studentId },
        include: {
          parent: {
            select: {
              id: true,
              name: true,
              phoneNumber: true,
              email: true,
            },
          },
        },
      });

      if (studentWithParent && studentWithParent.parent) {
        this.logger.log(
          `Parent found for student ${studentWithParent.name}: ${studentWithParent.parent.name} (Phone: ${studentWithParent.parent.phoneNumber || 'N/A'}, Email: ${studentWithParent.parent.email || 'N/A'})`,
        );
        // Send notification asynchronously (don't await to avoid blocking)
        this.sendPickupNotification(
          trackingToken,
          studentWithParent,
          tripId,
        ).catch((error) => {
          this.logger.error(
            `Failed to send pickup notification: ${error.message}`,
            error,
          );
        });
      } else {
        this.logger.warn(
          `Student ${studentId} picked up but no parent information found. Student: ${!!studentWithParent}, Parent: ${studentWithParent?.parent ? 'exists' : 'null'}. Cannot send notification.`,
        );
      }
    } else {
      if (!result.shouldNotify) {
        this.logger.debug(
          `Student ${studentId} pickup notification skipped - not first pickup`,
        );
      } else if (!trackingToken) {
        this.logger.warn(
          `Student ${studentId} was picked up but no tracking token was generated or found.`,
        );
      }
    }

    // Return event with student details
    return this.prisma.schoolTripRfidEvent.findUnique({
      where: { id: result.rfidEvent.id },
      include: {
        student: {
          select: {
            id: true,
            name: true,
            admissionNumber: true,
            rfidTagId: true,
          },
        },
        tripStudent: {
          select: {
            pickupStatus: true,
            dropoffStatus: true,
            actualPickupTime: true,
            actualDropoffTime: true,
          },
        },
      },
    });
  }

  async getRfidEvents(
    tripId?: string,
    studentId?: string,
    eventType?: RfidEventType,
    startDate?: Date,
    endDate?: Date,
  ) {
    const where: any = {};
    if (tripId) where.tripId = tripId;
    if (studentId) where.studentId = studentId;
    if (eventType) where.eventType = eventType;
    if (startDate || endDate) {
      where.scannedAt = {};
      if (startDate) where.scannedAt.gte = startDate;
      if (endDate) where.scannedAt.lte = endDate;
    }

    return this.prisma.schoolTripRfidEvent.findMany({
      where,
      orderBy: { scannedAt: 'desc' },
      include: {
        student: {
          select: {
            id: true,
            name: true,
            admissionNumber: true,
            rfidTagId: true,
          },
        },
        trip: {
          select: {
            id: true,
            tripDate: true,
            status: true,
          },
        },
      },
    });
  }

  async logRfidEventByTag(
    tripId: string,
    rfidTagId: string,
    data: LogRfidEventDto,
  ) {
    // Find student by RFID tag
    const student = await (this.prisma.student.findFirst as any)({
      where: {
        rfidTagId,
        isActive: true,
      },
      select: {
        id: true,
        name: true,
        admissionNumber: true,
      },
    });

    if (!student) {
      throw new Error(`No active student found with RFID tag: ${rfidTagId}`);
    }

    // Use the existing method with studentId
    return this.logRfidEventWithStudentId(tripId, student.id, rfidTagId, data);
  }

  async logBulkRfidEvents(
    tripId: string,
    events: Array<{
      rfidTagId: string;
      eventType: RfidEventType;
      scannedAt?: string;
    }>,
    deviceId?: string,
    deviceLocation?: string,
    gpsCoordinates?: string,
  ) {
    // Verify trip exists
    const trip = await this.prisma.schoolTrip.findUnique({
      where: { id: tripId },
      select: { id: true, status: true },
    });

    if (!trip) {
      throw new Error('Trip not found');
    }

    // Process events in transaction
    const results = await this.prisma.$transaction(async (tx) => {
      const processedEvents = [];

      for (const event of events) {
        try {
          // Find student by RFID tag
          const student = await (tx.student.findFirst as any)({
            where: {
              rfidTagId: event.rfidTagId,
              isActive: true,
            },
            select: { id: true },
          });

          if (!student) {
            processedEvents.push({
              rfidTagId: event.rfidTagId,
              success: false,
              error: `No active student found with RFID tag: ${event.rfidTagId}`,
            });
            continue;
          }

          // Find trip student record
          const tripStudent = await tx.schoolTripStudent.findFirst({
            where: {
              tripId,
              studentId: student.id,
            },
          });

          if (!tripStudent) {
            processedEvents.push({
              rfidTagId: event.rfidTagId,
              studentId: student.id,
              success: false,
              error: 'Student is not assigned to this trip',
            });
            continue;
          }

          const scannedAt = event.scannedAt
            ? new Date(event.scannedAt)
            : new Date();

          // Create RFID event
          const rfidEvent = await tx.schoolTripRfidEvent.create({
            data: {
              id: crypto.randomUUID(),
              tripId,
              tripStudentId: tripStudent.id,
              studentId: student.id,
              eventType: event.eventType,
              rfidTagId: event.rfidTagId,
              deviceId,
              deviceLocation,
              gpsCoordinates,
              scannedAt,
            },
          });

          // Auto-update student status
          const updateData: any = {};
          let shouldNotify = false;

          if (event.eventType === RfidEventType.ENTERED_BUS) {
            updateData.pickupStatus = PickupDropoffStatus.PICKED_UP;
            if (!tripStudent.actualPickupTime) {
              updateData.actualPickupTime = scannedAt;
              shouldNotify = true; // Only notify on first pickup
            }
            if (gpsCoordinates && !tripStudent.pickupGps) {
              updateData.pickupGps = gpsCoordinates;
            }
            if (deviceLocation && !tripStudent.pickupLocation) {
              updateData.pickupLocation = deviceLocation;
            }

            // Generate tracking token if not exists
            if (!tripStudent.trackingToken) {
              updateData.trackingToken = this.generateTrackingToken();
            }
          } else if (event.eventType === RfidEventType.EXITED_BUS) {
            updateData.dropoffStatus = PickupDropoffStatus.DROPPED_OFF;
            if (!tripStudent.actualDropoffTime) {
              updateData.actualDropoffTime = scannedAt;
            }
            if (gpsCoordinates && !tripStudent.dropoffGps) {
              updateData.dropoffGps = gpsCoordinates;
            }
            if (deviceLocation && !tripStudent.dropoffLocation) {
              updateData.dropoffLocation = deviceLocation;
            }
          }

          let updatedTripStudent = null;
          if (Object.keys(updateData).length > 0) {
            updatedTripStudent = await tx.schoolTripStudent.update({
              where: { id: tripStudent.id },
              data: updateData,
            });
          }

          processedEvents.push({
            rfidTagId: event.rfidTagId,
            studentId: student.id,
            success: true,
            eventId: rfidEvent.id,
            shouldNotify,
            trackingToken: updatedTripStudent?.trackingToken,
          });
        } catch (error) {
          processedEvents.push({
            rfidTagId: event.rfidTagId,
            success: false,
            error:
              error instanceof Error ? error.message : 'Unknown error occurred',
          });
        }
      }

      return processedEvents;
    });

    // Send notifications for all students that were picked up
    // Do this outside the transaction to avoid blocking
    for (const event of results) {
      if (
        event.success &&
        (event as any).shouldNotify &&
        (event as any).trackingToken &&
        (event as any).studentId
      ) {
        const studentId = (event as any).studentId;
        const trackingToken = (event as any).trackingToken;

        // Fetch student with parent details for notification
        const studentWithParent = await this.prisma.student.findUnique({
          where: { id: studentId },
          include: {
            parent: {
              select: {
                id: true,
                name: true,
                phoneNumber: true,
                email: true,
              },
            },
          },
        });

        if (studentWithParent && studentWithParent.parent) {
          // Send notification asynchronously
          this.sendPickupNotification(
            trackingToken,
            studentWithParent,
            tripId,
          ).catch((error) => {
            this.logger.error(
              `Failed to send pickup notification for student ${studentId}: ${error.message}`,
              error,
            );
          });
        }
      }
    }

    return results;
  }

  /**
   * Update school trip location and broadcast to connected clients
   */
  async updateTripLocation(data: UpdateSchoolTripLocationDto) {
    this.logger.log(`Updating location for school trip ${data.tripId}`);

    // Verify trip exists and is in progress
    const trip = await this.findById(data.tripId);
    if (!trip) {
      throw new Error(`School trip with ID ${data.tripId} not found`);
    }
    if (trip.status !== SchoolTripStatus.IN_PROGRESS) {
      throw new Error(
        `Cannot update location. School trip status is: ${trip.status}`,
      );
    }

    // Save location to database
    const location = await this.prisma.schoolTripLocation.create({
      data: {
        tripId: data.tripId,
        latitude: data.latitude,
        longitude: data.longitude,
        speed: data.speed,
        heading: data.heading,
        accuracy: data.accuracy,
        timestamp: new Date(),
      },
    });

    // Broadcast location update via WebSocket
    if (this.trackingGateway) {
      try {
        const locationPayload = {
          tripId: data.tripId,
          latitude: data.latitude,
          longitude: data.longitude,
          timestamp: location.timestamp,
          speed: data.speed,
          heading: data.heading,
          accuracy: data.accuracy,
        };

        // Broadcast to trip subscribers (existing functionality)
        this.trackingGateway.broadcastLocationUpdate(locationPayload);

        // Also broadcast to student tracking subscribers
        // Find all students on this trip who have been picked up, not dropped off, and have tracking tokens
        const activeTripStudents = await this.prisma.schoolTripStudent.findMany(
          {
            where: {
              tripId: data.tripId,
              pickupStatus: PickupDropoffStatus.PICKED_UP,
              trackingToken: { not: null },
              dropoffStatus: {
                not: PickupDropoffStatus.DROPPED_OFF,
              },
            },
            select: {
              trackingToken: true,
            },
          },
        );

        // Broadcast to each student's tracking subscribers
        for (const tripStudent of activeTripStudents) {
          if (tripStudent.trackingToken) {
            this.trackingGateway.broadcastToStudentTracking(
              tripStudent.trackingToken,
              locationPayload,
            );
          }
        }
      } catch (error) {
        this.logger.warn(
          `Failed to broadcast location update via WebSocket: ${error}`,
        );
        // Continue even if broadcast fails - location is already saved
      }
    }

    return location;
  }

  /**
   * Get location history for a school trip
   */
  async getTripLocationHistory(
    tripId: string,
    limit: number = 100,
    startTime?: Date,
    endTime?: Date,
  ) {
    this.logger.log(`Fetching location history for school trip ${tripId}`);

    // Verify trip exists
    await this.findById(tripId);

    const where: any = { tripId };
    if (startTime || endTime) {
      where.timestamp = {};
      if (startTime) {
        where.timestamp.gte = startTime;
      }
      if (endTime) {
        where.timestamp.lte = endTime;
      }
    }

    const locations = await this.prisma.schoolTripLocation.findMany({
      where,
      orderBy: { timestamp: 'asc' },
      take: limit,
    });

    return locations;
  }

  /**
   * Get current location of a school trip (most recent)
   */
  async getCurrentTripLocation(tripId: string) {
    this.logger.log(`Fetching current location for school trip ${tripId}`);

    // Verify trip exists
    await this.findById(tripId);

    const location = await this.prisma.schoolTripLocation.findFirst({
      where: { tripId },
      orderBy: { timestamp: 'desc' },
    });

    return location;
  }

  /**
   * Get student location history based on trip locations between pickup and dropoff
   * @param limit - Optional limit. If not provided, returns all locations
   */
  async getStudentLocationHistory(
    tripId: string,
    studentId: string,
    limit?: number,
  ) {
    this.logger.log(
      `Fetching location history for student ${studentId} on trip ${tripId}`,
    );

    // Get trip student record to find pickup and dropoff times
    const tripStudent = await this.prisma.schoolTripStudent.findFirst({
      where: {
        tripId,
        studentId,
      },
      select: {
        actualPickupTime: true,
        actualDropoffTime: true,
        pickupStatus: true,
        dropoffStatus: true,
      },
    });

    if (!tripStudent) {
      throw new Error('Student is not assigned to this trip');
    }

    // If student hasn't been picked up yet, return empty array
    if (tripStudent.pickupStatus !== PickupDropoffStatus.PICKED_UP) {
      return [];
    }

    // Build where clause for location query
    const where: any = { tripId };
    if (tripStudent.actualPickupTime) {
      where.timestamp = { gte: tripStudent.actualPickupTime };
    }
    if (tripStudent.actualDropoffTime) {
      where.timestamp = {
        ...where.timestamp,
        lte: tripStudent.actualDropoffTime,
      };
    }

    const queryOptions: any = {
      where,
      orderBy: { timestamp: 'asc' },
    };

    // Only apply limit if provided
    if (limit !== undefined && limit !== null) {
      queryOptions.take = limit;
    }

    const locations =
      await this.prisma.schoolTripLocation.findMany(queryOptions);

    return locations;
  }

  /**
   * Get trip student by tracking token
   */
  async getTripStudentByTrackingToken(trackingToken: string) {
    return this.prisma.schoolTripStudent.findUnique({
      where: { trackingToken },
      include: {
        student: {
          select: {
            id: true,
            name: true,
            admissionNumber: true,
            gender: true,
          },
        },
        trip: {
          select: {
            id: true,
            tripDate: true,
            status: true,
            route: {
              select: {
                id: true,
                name: true,
                tripType: true,
              },
            },
            bus: {
              select: {
                id: true,
                registrationNumber: true,
                make: true,
                model: true,
              },
            },
            driver: {
              select: {
                id: true,
                name: true,
                phoneNumber: true,
              },
            },
          },
        },
      },
    });
  }

  /**
   * Generate a secure tracking token
   */
  private generateTrackingToken(): string {
    return crypto.randomBytes(32).toString('hex');
  }

  /**
   * Send pickup notification to parent via SMS and Email
   */
  private async sendPickupNotification(
    trackingToken: string,
    student: any,
    tripId: string,
  ): Promise<void> {
    this.logger.log(
      `Attempting to send pickup notification for student ${student.name} (ID: ${student.id})`,
    );

    if (!this.smsService || !this.mailService || !this.configService) {
      this.logger.error(
        `SMS/Mail services not initialized! SMS: ${!!this.smsService}, Mail: ${!!this.mailService}, Config: ${!!this.configService}`,
      );
      return;
    }

    const baseUrl =
      this.configService.get<string>('APP_URL') || 'http://localhost:3000';
    const trackingUrl = `${baseUrl}/academic-suite/track/${trackingToken}`;

    const studentName = student.name;
    const parentName = student.parent.name;
    const parentPhone = student.parent.phoneNumber;
    const parentEmail = student.parent.email;

    // SMS message
    const smsMessage = `Hello ${parentName}, ${studentName} has been picked up and is on the way to school. Track their location: ${trackingUrl}`;

    // Email message
    const emailSubject = `${studentName} has been picked up`;
    const emailHtml = `
      <h2>Student Pickup Notification</h2>
      <p>Hello ${parentName},</p>
      <p><strong>${studentName}</strong> has been picked up and is on the way to school.</p>
      <p>You can track their location in real-time using the link below:</p>
      <p><a href="${trackingUrl}" style="background-color: #4CAF50; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px; display: inline-block;">Track ${studentName}'s Location</a></p>
      <p>Or copy this link: ${trackingUrl}</p>
      <p>This tracking link will remain active until your child is dropped off.</p>
      <p>Best regards,<br>School Transport Team</p>
    `;

    // Send SMS if phone number is available
    if (parentPhone) {
      try {
        await this.smsService.sendSms(parentPhone, smsMessage);
        this.logger.log(
          `SMS notification sent to ${parentPhone} for student ${studentName}`,
        );
      } catch (error) {
        this.logger.error(
          `Failed to send SMS to ${parentPhone}: ${error instanceof Error ? error.message : 'Unknown error'}`,
        );
      }
    } else {
      this.logger.warn(
        `No phone number available for parent of student ${studentName}. SMS not sent.`,
      );
    }

    // Send Email if email is available
    if (parentEmail) {
      try {
        await this.mailService.sendEmail({
          to: parentEmail,
          subject: emailSubject,
          html: emailHtml,
        });
        this.logger.log(
          `Email notification sent to ${parentEmail} for student ${studentName}`,
        );
      } catch (error) {
        this.logger.error(
          `Failed to send email to ${parentEmail}: ${error instanceof Error ? error.message : 'Unknown error'}`,
        );
      }
    } else {
      this.logger.warn(
        `No email address available for parent of student ${studentName}. Email not sent.`,
      );
    }
  }
}
