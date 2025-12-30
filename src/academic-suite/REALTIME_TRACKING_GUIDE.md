# Real-Time School Trip Tracking Guide

This guide explains how to use the real-time school trip tracking feature for monitoring school bus trips in real-time.

## Overview

The real-time tracking system allows you to:

- Update school trip location in real-time as the bus moves
- Subscribe to location updates via WebSocket for live tracking
- Retrieve location history for completed trips
- Track speed, heading, and GPS accuracy

## Architecture

The system uses:

- **WebSocket Gateway** (`/school-trip-tracking` namespace) for real-time updates
- **REST API** for location updates and history retrieval
- **Database** (SchoolTripLocation model) for storing location history

## Setup

### 1. Database Migration

Run the migration to create the `school_trip_locations` table:

```bash
npx prisma migrate deploy
# or
npx prisma migrate dev
```

### 2. Start the Server

The WebSocket gateway will automatically start with the NestJS server.

## API Endpoints

### Update School Trip Location

**POST** `/academic-suite/trips/:id/location`

Updates the current location of an active school trip and broadcasts it to all subscribed clients.

**Request Body:**

```json
{
  "latitude": -1.2921,
  "longitude": 36.8219,
  "speed": 60.5, // Optional: Speed in km/h
  "heading": 180, // Optional: Direction in degrees (0-360)
  "accuracy": 10.5 // Optional: GPS accuracy in meters
}
```

**Response:**

```json
{
  "success": true,
  "data": {
    "id": 1,
    "tripId": "uuid-here",
    "latitude": -1.2921,
    "longitude": 36.8219,
    "timestamp": "2024-12-30T12:00:00Z",
    "speed": 60.5,
    "heading": 180,
    "accuracy": 10.5
  }
}
```

**Note:** School trip must be in `IN_PROGRESS` status.

### Get Current Location

**GET** `/academic-suite/trips/:id/location`

Retrieves the most recent location for a school trip.

**Response:**

```json
{
  "success": true,
  "data": {
    "id": 1,
    "tripId": "uuid-here",
    "latitude": -1.2921,
    "longitude": 36.8219,
    "timestamp": "2024-12-30T12:00:00Z",
    "speed": 60.5,
    "heading": 180,
    "accuracy": 10.5
  }
}
```

### Get Location History

**GET** `/academic-suite/trips/:id/location/history?limit=100&startTime=2024-12-30T10:00:00Z&endTime=2024-12-30T12:00:00Z`

Retrieves location history for a school trip.

**Query Parameters:**

- `limit` (optional): Maximum number of locations to return (default: 100)
- `startTime` (optional): Start time for filtering (ISO 8601)
- `endTime` (optional): End time for filtering (ISO 8601)

**Response:**

```json
{
  "success": true,
  "data": [
    {
      "id": 1,
      "tripId": "uuid-here",
      "latitude": -1.2921,
      "longitude": 36.8219,
      "timestamp": "2024-12-30T10:00:00Z",
      "speed": 0,
      "heading": null,
      "accuracy": 15.0
    },
    {
      "id": 2,
      "tripId": "uuid-here",
      "latitude": -1.293,
      "longitude": 36.8225,
      "timestamp": "2024-12-30T10:05:00Z",
      "speed": 50.2,
      "heading": 90,
      "accuracy": 12.0
    }
  ]
}
```

## WebSocket Integration

### Connection

Connect to the WebSocket namespace:

```javascript
import { io } from 'socket.io-client';

const socket = io('http://localhost:3000/school-trip-tracking', {
  transports: ['websocket'],
});
```

### Subscribe to School Trip Updates

Subscribe to receive real-time location updates for a specific school trip:

```javascript
socket.emit('subscribe-trip', { tripId: 'uuid-here' });

socket.on('subscribed', (data) => {
  console.log(`Subscribed to school trip ${data.tripId}`);
});

socket.on('location-update', (data) => {
  console.log('Location update:', {
    tripId: data.tripId,
    latitude: data.latitude,
    longitude: data.longitude,
    timestamp: data.timestamp,
    speed: data.speed,
    heading: data.heading,
    accuracy: data.accuracy,
  });
  // Update your map UI with the new location
});
```

### Unsubscribe from School Trip Updates

Stop receiving updates for a school trip:

```javascript
socket.emit('unsubscribe-trip', { tripId: 'uuid-here' });

socket.on('unsubscribed', (data) => {
  console.log(`Unsubscribed from school trip ${data.tripId}`);
});
```

### Error Handling

```javascript
socket.on('error', (error) => {
  console.error('WebSocket error:', error.message);
});

socket.on('connect_error', (error) => {
  console.error('Connection error:', error);
});
```

## Complete Example

### Frontend Implementation (JavaScript/TypeScript)

```javascript
import { io } from 'socket.io-client';

class SchoolTripTracker {
  constructor(serverUrl, tripId) {
    this.tripId = tripId;
    this.socket = io(`${serverUrl}/school-trip-tracking`, {
      transports: ['websocket'],
    });
    this.setupEventListeners();
  }

  setupEventListeners() {
    this.socket.on('connect', () => {
      console.log('Connected to tracking server');
      this.subscribe();
    });

    this.socket.on('location-update', (data) => {
      this.handleLocationUpdate(data);
    });

    this.socket.on('error', (error) => {
      console.error('Error:', error);
    });
  }

  subscribe() {
    this.socket.emit('subscribe-trip', { tripId: this.tripId });
  }

  unsubscribe() {
    this.socket.emit('unsubscribe-trip', { tripId: this.tripId });
  }

  handleLocationUpdate(data) {
    // Update map marker
    // Update UI with speed, heading, etc.
    console.log('New location:', data);
  }

  disconnect() {
    this.unsubscribe();
    this.socket.disconnect();
  }
}

// Usage
const tracker = new SchoolTripTracker('http://localhost:3000', 'trip-uuid');
```

### Backend Implementation (Updating Location)

```javascript
// Example: Update location from mobile app
async function updateSchoolTripLocation(tripId, locationData) {
  const response = await fetch(
    `http://localhost:3000/academic-suite/trips/${tripId}/location`,
    {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        // Add authorization header if required
      },
      body: JSON.stringify({
        latitude: locationData.latitude,
        longitude: locationData.longitude,
        speed: locationData.speed,
        heading: locationData.heading,
        accuracy: locationData.accuracy,
      }),
    },
  );
  return response.json();
}

// Call this periodically (e.g., every 5 seconds) while trip is in progress
setInterval(() => {
  navigator.geolocation.getCurrentPosition((position) => {
    updateSchoolTripLocation('trip-uuid', {
      latitude: position.coords.latitude,
      longitude: position.coords.longitude,
      speed: position.coords.speed
        ? position.coords.speed * 3.6
        : null, // Convert m/s to km/h
      heading: position.coords.heading,
      accuracy: position.coords.accuracy,
    });
  });
}, 5000);
```

## Workflow

1. **Start School Trip**: Change trip status to `IN_PROGRESS` using the trip update endpoint
2. **Subscribe**: Clients connect to WebSocket and subscribe to the school trip
3. **Update Location**: Mobile app or tracking device periodically sends location updates via `POST /academic-suite/trips/:id/location`
4. **Broadcast**: Server broadcasts location updates to all subscribed clients
5. **Track**: Clients receive real-time updates and update their UI
6. **End Trip**: When trip is completed, location tracking stops

## Best Practices

1. **Update Frequency**: Update location every 5-10 seconds for active trips
2. **Battery Optimization**: Reduce update frequency when bus is stationary
3. **Error Handling**: Always handle network errors and reconnection
4. **Security**: Implement authentication for WebSocket connections in production
5. **CORS**: Configure CORS properly for production environments
6. **Rate Limiting**: Consider implementing rate limiting for location updates

## Security Considerations

- Add JWT authentication to WebSocket connections
- Validate trip ownership before allowing subscriptions
- Implement rate limiting on location update endpoints
- Sanitize location data before broadcasting
- Use HTTPS/WSS in production

## Troubleshooting

### WebSocket Not Connecting

- Check server is running
- Verify WebSocket namespace is correct (`/school-trip-tracking`)
- Check CORS configuration
- Verify network/firewall settings

### Not Receiving Updates

- Verify subscription was successful (check `subscribed` event)
- Ensure school trip status is `IN_PROGRESS`
- Check that location updates are being sent
- Verify WebSocket connection is still active

### Location Not Saving

- Ensure school trip exists and status is `IN_PROGRESS`
- Check location data format (latitude: -90 to 90, longitude: -180 to 180)
- Verify database connection
- Check server logs for errors

