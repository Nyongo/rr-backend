import {
  WebSocketGateway,
  WebSocketServer,
  SubscribeMessage,
  OnGatewayConnection,
  OnGatewayDisconnect,
  MessageBody,
  ConnectedSocket,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { Logger } from '@nestjs/common';

interface TripTrackingPayload {
  tripId: number;
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
  namespace: '/trip-tracking',
})
export class TripTrackingGateway
  implements OnGatewayConnection, OnGatewayDisconnect
{
  @WebSocketServer()
  server: Server;

  private readonly logger = new Logger(TripTrackingGateway.name);
  private readonly connectedClients = new Map<string, Set<string>>(); // tripId -> Set of socketIds

  constructor() {}

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
    @MessageBody() data: { tripId: number },
  ) {
    try {
      const tripId = data.tripId;
      const roomName = `trip-${tripId}`;
      client.join(roomName);

      // Track connected clients
      const tripIdStr = String(tripId);
      if (!this.connectedClients.has(tripIdStr)) {
        this.connectedClients.set(tripIdStr, new Set());
      }
      this.connectedClients.get(tripIdStr)?.add(client.id);

      this.logger.log(`Client ${client.id} subscribed to trip ${tripId}`);
      client.emit('subscribed', {
        tripId: data.tripId,
        message: `Subscribed to trip ${data.tripId}`,
      });
    } catch (error) {
      this.logger.error(`Error subscribing to trip: ${error}`);
      client.emit('error', { message: 'Failed to subscribe to trip' });
    }
  }

  @SubscribeMessage('unsubscribe-trip')
  handleUnsubscribeTrip(
    @ConnectedSocket() client: Socket,
    @MessageBody() data: { tripId: number },
  ) {
    try {
      const tripId = data.tripId;
      const tripIdStr = String(tripId);
      const roomName = `trip-${tripId}`;
      client.leave(roomName);

      // Remove from tracking
      const socketIds = this.connectedClients.get(tripIdStr);
      if (socketIds) {
        socketIds.delete(client.id);
        if (socketIds.size === 0) {
          this.connectedClients.delete(tripIdStr);
        }
      }

      this.logger.log(`Client ${client.id} unsubscribed from trip ${tripId}`);
      client.emit('unsubscribed', {
        tripId: data.tripId,
        message: `Unsubscribed from trip ${data.tripId}`,
      });
    } catch (error) {
      this.logger.error(`Error unsubscribing from trip: ${error}`);
      client.emit('error', { message: 'Failed to unsubscribe from trip' });
    }
  }

  /**
   * Broadcast location update to all clients subscribed to a trip
   */
  broadcastLocationUpdate(payload: TripTrackingPayload) {
    const roomName = `trip-${payload.tripId}`;
    this.server.to(roomName).emit('location-update', {
      tripId: payload.tripId,
      latitude: payload.latitude,
      longitude: payload.longitude,
      timestamp: payload.timestamp,
      speed: payload.speed,
      heading: payload.heading,
      accuracy: payload.accuracy,
    });
    const room = this.server.sockets.adapter.rooms.get(roomName);
    this.logger.debug(
      `Broadcasted location update for trip ${payload.tripId} to ${room?.size || 0} clients`,
    );
  }

  /**
   * Get number of clients subscribed to a trip
   */
  getSubscriberCount(tripId: number): number {
    const room = this.server.sockets.adapter.rooms.get(`trip-${tripId}`);
    return room?.size || 0;
  }
}

