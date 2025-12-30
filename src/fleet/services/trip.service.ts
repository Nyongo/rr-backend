import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { CreateTripDto } from '../dtos/create-trip.dto';
import { EndTripDto } from '../dtos/end-trip.dto';
import { UpdateTripLocationDto } from '../dtos/update-trip-location.dto';

@Injectable()
export class TripService {
  private readonly logger = new Logger(TripService.name);
  private trackingGateway: any; // Will be injected via setter to avoid circular dependency

  constructor(private readonly prisma: PrismaService) {}

  /**
   * Set the tracking gateway (called from module to avoid circular dependency)
   */
  setTrackingGateway(gateway: any) {
    this.trackingGateway = gateway;
  }

  async create(data: CreateTripDto) {
    this.logger.log(
      `Creating new trip for driver ${data.driverId} and vehicle ${data.vehicleId}`,
    );

    return this.prisma.trip.create({
      data: {
        driverId: data.driverId,
        vehicleId: data.vehicleId,
        customerName: data.customerName,
        customerPhone: data.customerPhone,
        startGps: data.startGps,
        endGps: data.endGps,
        startTime: new Date(data.startTime),
        endTime: data.endTime ? new Date(data.endTime) : null,
        distance: data.distance,
        pricePerKm: data.pricePerKm,
        totalPrice: data.totalPrice,
        purpose: data.purpose,
        status: data.status || 'SCHEDULED',
        paymentMethod: data.paymentMethod,
        fuelConsumption: data.fuelConsumption,
        fuelCost: data.fuelCost,
        notes: data.notes,
      },
      include: {
        driver: true,
        vehicle: true,
      },
    });
  }

  async findAll() {
    this.logger.log('Fetching all trips');

    return this.prisma.trip.findMany({
      include: {
        driver: true,
        vehicle: true,
      },
      orderBy: {
        createdAt: 'desc',
      },
    });
  }

  async findOne(id: number) {
    this.logger.log(`Fetching trip with ID: ${id}`);

    const trip = await this.prisma.trip.findUnique({
      where: { id },
      include: {
        driver: true,
        vehicle: true,
      },
    });

    if (!trip) {
      throw new NotFoundException(`Trip with ID ${id} not found`);
    }

    return trip;
  }

  async findByDriver(driverId: number) {
    this.logger.log(`Fetching trips for driver ID: ${driverId}`);

    return this.prisma.trip.findMany({
      where: { driverId },
      include: {
        driver: true,
        vehicle: true,
      },
      orderBy: {
        createdAt: 'desc',
      },
    });
  }

  async findByVehicle(vehicleId: number) {
    this.logger.log(`Fetching trips for vehicle ID: ${vehicleId}`);

    return this.prisma.trip.findMany({
      where: { vehicleId },
      include: {
        driver: true,
        vehicle: true,
      },
      orderBy: {
        createdAt: 'desc',
      },
    });
  }

  async startTrip(id: number) {
    this.logger.log(`Starting trip with ID: ${id}`);

    const trip = await this.findOne(id);

    if (trip.status !== 'SCHEDULED') {
      throw new Error(`Cannot start trip. Current status: ${trip.status}`);
    }

    return this.prisma.trip.update({
      where: { id },
      data: {
        status: 'IN_PROGRESS',
        startTime: new Date(),
      },
      include: {
        driver: true,
        vehicle: true,
      },
    });
  }

  async endTrip(id: number, data: EndTripDto) {
    this.logger.log(`Ending trip with ID: ${id}`);

    const trip = await this.findOne(id);

    if (trip.status !== 'IN_PROGRESS') {
      throw new Error(`Cannot end trip. Current status: ${trip.status}`);
    }

    return this.prisma.trip.update({
      where: { id },
      data: {
        status: 'COMPLETED',
        endTime: new Date(data.endTime),
        endGps: data.endGps,
        customerName: data.customerName,
        customerPhone: data.customerPhone,
        distance: data.distance,
        totalPrice: data.totalPrice,
        paymentStatus: data.paymentStatus,
        paymentMethod: data.paymentMethod,
        fuelConsumption: data.fuelConsumption,
        fuelCost: data.fuelCost,
        rating: data.rating,
        feedback: data.feedback,
        notes: data.notes,
      },
      include: {
        driver: true,
        vehicle: true,
      },
    });
  }

  async update(id: number, data: any) {
    this.logger.log(`Updating trip with ID: ${id}`);

    await this.findOne(id); // Verify trip exists

    return this.prisma.trip.update({
      where: { id },
      data,
      include: {
        driver: true,
        vehicle: true,
      },
    });
  }

  async delete(id: number) {
    this.logger.log(`Deleting trip with ID: ${id}`);

    await this.findOne(id); // Verify trip exists

    return this.prisma.trip.delete({
      where: { id },
    });
  }

  async getTripStats() {
    this.logger.log('Fetching trip statistics');

    const [totalTrips, completedTrips, inProgressTrips, scheduledTrips] =
      await Promise.all([
        this.prisma.trip.count(),
        this.prisma.trip.count({ where: { status: 'COMPLETED' } }),
        this.prisma.trip.count({ where: { status: 'IN_PROGRESS' } }),
        this.prisma.trip.count({ where: { status: 'SCHEDULED' } }),
      ]);

    return {
      totalTrips,
      completedTrips,
      inProgressTrips,
      scheduledTrips,
      completionRate: totalTrips > 0 ? (completedTrips / totalTrips) * 100 : 0,
    };
  }

  /**
   * Update trip location and broadcast to connected clients
   */
  async updateTripLocation(data: UpdateTripLocationDto) {
    this.logger.log(`Updating location for trip ${data.tripId}`);

    // Verify trip exists and is in progress
    const trip = await this.findOne(data.tripId);
    if (trip.status !== 'IN_PROGRESS') {
      throw new Error(`Cannot update location. Trip status is: ${trip.status}`);
    }

    // Save location to database
    const location = await this.prisma.tripLocation.create({
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
      this.trackingGateway.broadcastLocationUpdate({
        tripId: data.tripId,
        latitude: data.latitude,
        longitude: data.longitude,
        timestamp: location.timestamp,
        speed: data.speed,
        heading: data.heading,
        accuracy: data.accuracy,
      });
    }

    return location;
  }

  /**
   * Get location history for a trip
   */
  async getTripLocationHistory(
    tripId: number,
    limit: number = 100,
    startTime?: Date,
    endTime?: Date,
  ) {
    this.logger.log(`Fetching location history for trip ${tripId}`);

    // Verify trip exists
    await this.findOne(tripId);

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

    const locations = await this.prisma.tripLocation.findMany({
      where,
      orderBy: { timestamp: 'asc' },
      take: limit,
    });

    return locations;
  }

  /**
   * Get current location of a trip (most recent)
   */
  async getCurrentTripLocation(tripId: number) {
    this.logger.log(`Fetching current location for trip ${tripId}`);

    // Verify trip exists
    await this.findOne(tripId);

    const location = await this.prisma.tripLocation.findFirst({
      where: { tripId },
      orderBy: { timestamp: 'desc' },
    });

    return location;
  }
}
