import {
  WebSocketGateway,
  WebSocketServer,
  SubscribeMessage,
  OnGatewayConnection,
  OnGatewayDisconnect,
  OnGatewayInit,
  MessageBody,
  ConnectedSocket,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { Logger } from '@nestjs/common';

interface SchoolTripTrackingPayload {
  tripId: string;
  latitude: number;
  longitude: number;
  timestamp: Date;
  speed?: number;
  heading?: number;
  accuracy?: number;
}

@WebSocketGateway({
  cors: {
    origin: '*', // In production, specify allowed origins
    credentials: true,
  },
  namespace: '/school-trip-tracking',
})
export class SchoolTripTrackingGateway
  implements OnGatewayInit, OnGatewayConnection, OnGatewayDisconnect
{
  @WebSocketServer()
  server: Server;

  private readonly logger = new Logger(SchoolTripTrackingGateway.name);
  private readonly connectedClients = new Map<string, Set<string>>(); // tripId -> Set of socketIds

  constructor() {}

  afterInit(server: Server) {
    this.logger.log('School Trip Tracking Gateway initialized');
    this.server = server;
  }

  handleConnection(client: Socket) {
    this.logger.log(`Client connected: ${client.id}`);
  }

  handleDisconnect(client: Socket) {
    this.logger.log(`Client disconnected: ${client.id}`);
    // Remove client from all trip rooms
    this.connectedClients.forEach((socketIds, tripId) => {
      if (socketIds.has(client.id)) {
        socketIds.delete(client.id);
        if (socketIds.size === 0) {
          this.connectedClients.delete(tripId);
        }
      }
    });
  }

  @SubscribeMessage('subscribe-trip')
  handleSubscribeTrip(
    @ConnectedSocket() client: Socket,
    @MessageBody() data: { tripId: string },
  ) {
    try {
      const tripId = data.tripId;
      const roomName = `school-trip-${tripId}`;
      client.join(roomName);

      // Track connected clients
      if (!this.connectedClients.has(tripId)) {
        this.connectedClients.set(tripId, new Set());
      }
      this.connectedClients.get(tripId)?.add(client.id);

      this.logger.log(
        `Client ${client.id} subscribed to school trip ${tripId}`,
      );
      client.emit('subscribed', {
        tripId: tripId,
        message: `Subscribed to school trip ${tripId}`,
      });
    } catch (error) {
      this.logger.error(`Error subscribing to school trip: ${error}`);
      client.emit('error', { message: 'Failed to subscribe to school trip' });
    }
  }

  @SubscribeMessage('unsubscribe-trip')
  handleUnsubscribeTrip(
    @ConnectedSocket() client: Socket,
    @MessageBody() data: { tripId: string },
  ) {
    try {
      const tripId = data.tripId;
      const roomName = `school-trip-${tripId}`;
      client.leave(roomName);

      // Remove from tracking
      const socketIds = this.connectedClients.get(tripId);
      if (socketIds) {
        socketIds.delete(client.id);
        if (socketIds.size === 0) {
          this.connectedClients.delete(tripId);
        }
      }

      this.logger.log(
        `Client ${client.id} unsubscribed from school trip ${tripId}`,
      );
      client.emit('unsubscribed', {
        tripId: tripId,
        message: `Unsubscribed from school trip ${tripId}`,
      });
    } catch (error) {
      this.logger.error(`Error unsubscribing from school trip: ${error}`);
      client.emit('error', {
        message: 'Failed to unsubscribe from school trip',
      });
    }
  }

  /**
   * Broadcast location update to all clients subscribed to a school trip
   */
  broadcastLocationUpdate(payload: SchoolTripTrackingPayload) {
    if (!this.server || !this.server.sockets) {
      this.logger.warn('WebSocket server not initialized');
      return;
    }

    const roomName = `school-trip-${payload.tripId}`;
    this.server.to(roomName).emit('location-update', {
      tripId: payload.tripId,
      latitude: payload.latitude,
      longitude: payload.longitude,
      timestamp: payload.timestamp,
      speed: payload.speed,
      heading: payload.heading,
      accuracy: payload.accuracy,
    });

    try {
      const room = this.server.sockets?.adapter?.rooms?.get(roomName);
      this.logger.debug(
        `Broadcasted location update for school trip ${payload.tripId} to ${room?.size || 0} clients`,
      );
    } catch (error) {
      this.logger.warn(
        `Could not get subscriber count for trip ${payload.tripId}`,
      );
    }
  }

  /**
   * Get number of clients subscribed to a school trip
   */
  getSubscriberCount(tripId: string): number {
    try {
      if (
        !this.server ||
        !this.server.sockets ||
        !this.server.sockets.adapter ||
        !this.server.sockets.adapter.rooms
      ) {
        this.logger.warn('WebSocket server adapter not initialized');
        return 0;
      }

      const room = this.server.sockets.adapter.rooms.get(
        `school-trip-${tripId}`,
      );
      return room?.size || 0;
    } catch (error) {
      this.logger.warn(
        `Error getting subscriber count for trip ${tripId}: ${error}`,
      );
      return 0;
    }
  }
}
