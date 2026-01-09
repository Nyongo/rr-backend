# Student Location Tracking Guide

This guide explains how the student location tracking feature works for parents.

## Overview

When a student is picked up (via RFID `ENTERED_BUS` event), the system:

1. Generates a unique tracking token for that trip
2. Sends SMS and/or Email notification to the parent with a tracking link
3. Parents can use this link to track their child's location in real-time from pickup until dropoff

## Features

### Automatic Tracking

- Location tracking starts automatically when a student is picked up
- Tracking continues until the student is dropped off
- Location data is stored as part of the trip's location history

### Parent Notifications

- **SMS**: Sent to parent's phone number with tracking link
- **Email**: Sent to parent's email address with tracking link
- Both notifications are sent when the student is first picked up

### Tracking Link Format

```
{APP_URL}/academic-suite/track/{trackingToken}
```

Example:

```
https://yourdomain.com/academic-suite/track/abc123def456...
```

## API Endpoints

### Public Tracking Endpoint (No Authentication Required)

#### Get Student Tracking Information

```
GET /academic-suite/track/:trackingToken
```

**Response:**

```json
{
  "success": true,
  "data": {
    "student": {
      "id": "student-uuid",
      "name": "John Doe",
      "admissionNumber": "STU001"
    },
    "trip": {
      "id": "trip-uuid",
      "tripDate": "2024-12-31T00:00:00.000Z",
      "status": "IN_PROGRESS",
      "route": {
        "id": "route-uuid",
        "name": "Route 1 - Morning Pickup",
        "tripType": "MORNING_PICKUP"
      },
      "bus": {
        "id": "bus-uuid",
        "registrationNumber": "KCA 123X",
        "make": "Toyota",
        "model": "Hiace"
      },
      "driver": {
        "id": "driver-uuid",
        "name": "John Driver",
        "phoneNumber": "+254712345678"
      }
    },
    "pickupStatus": "PICKED_UP",
    "dropoffStatus": "NOT_DROPPED_OFF",
    "actualPickupTime": "2024-12-31T07:15:00.000Z",
    "actualDropoffTime": null,
    "pickupLocation": "360 Apartments Phase 1",
    "dropoffLocation": null,
    "currentLocation": {
      "id": 1,
      "tripId": "trip-uuid",
      "latitude": -1.2921,
      "longitude": 36.8219,
      "timestamp": "2024-12-31T07:30:00.000Z",
      "speed": 45.5,
      "heading": 180.0,
      "accuracy": 10.0
    },
    "locationHistory": [
      {
        "id": 1,
        "latitude": -1.2921,
        "longitude": 36.8219,
        "timestamp": "2024-12-31T07:15:00.000Z",
        "speed": 0.0,
        "heading": null,
        "accuracy": 15.0
      },
      {
        "id": 2,
        "latitude": -1.293,
        "longitude": 36.823,
        "timestamp": "2024-12-31T07:20:00.000Z",
        "speed": 35.0,
        "heading": 175.0,
        "accuracy": 12.0
      }
    ]
  }
}
```

#### Get Real-time Location Updates

```
GET /academic-suite/track/:trackingToken/location
```

This endpoint returns the current location and all location history for the student on this trip, useful for polling updates and displaying the complete route.

**Response:**

```json
{
  "success": true,
  "data": {
    "currentLocation": {
      "id": 5,
      "latitude": -1.2940,
      "longitude": 36.8250,
      "timestamp": "2024-12-31T07:35:00.000Z",
      "speed": 42.0,
      "heading": 180.0,
      "accuracy": 10.0
    },
    "locationHistory": [...],
    "pickupStatus": "PICKED_UP",
    "dropoffStatus": "NOT_DROPPED_OFF"
  }
}
```

## Configuration

### Environment Variables

#### SMS Service (Africa's Talking)

```bash
# Required for SMS notifications
AFRICASTALKING_API_KEY=your_api_key_here
AFRICASTALKING_USERNAME=your_username_here

# Optional: Custom sender ID (defaults to "RRSchool")
SMS_SENDER_ID=RRSchool

# Optional: Disable SMS service (defaults to enabled)
SMS_ENABLED=true
```

#### Email Service

```bash
# Required for email notifications (already configured)
GMAIL_USER=your_email@gmail.com
GMAIL_APP_PASSWORD=your_app_password
```

#### Application URL

```bash
# Required for generating tracking links
APP_URL=https://yourdomain.com
# Or for local development:
# APP_URL=http://localhost:3000
```

## How It Works

### 1. Student Pickup Detection

When an RFID event with type `ENTERED_BUS` is logged:

- The system checks if this is the first pickup (no `actualPickupTime` yet)
- If first pickup:
  - Generates a unique tracking token (64-character hex string)
  - Updates the student's pickup status to `PICKED_UP`
  - Records the pickup time and location
  - Sends SMS and Email notifications with the tracking link

### 2. Location Tracking

As the trip progresses:

- Bus location updates are recorded in `SchoolTripLocation` table
- These locations are automatically associated with students who:
  - Have been picked up (`pickupStatus = PICKED_UP`)
  - Have not been dropped off yet (`dropoffStatus != DROPPED_OFF`)
- Location history is filtered by time between `actualPickupTime` and `actualDropoffTime`

### 3. Parent Access

Parents receive a tracking link in their SMS/Email:

- Link is public (no authentication required)
- Uses secure token (64-character random hex string)
- Valid for the duration of the trip
- Can be accessed from any device with internet connection

### 4. Student Dropoff

When an RFID event with type `EXITED_BUS` is logged:

- Dropoff status is updated to `DROPPED_OFF`
- Dropoff time and location are recorded
- Location tracking effectively stops (no new locations are associated)

## Security Considerations

1. **Tracking Tokens**:

   - Generated using cryptographically secure random bytes
   - 64-character hex strings (256 bits of entropy)
   - Unique per trip-student combination

2. **Public Endpoints**:

   - No authentication required for tracking endpoints
   - Access is controlled only by knowledge of the tracking token
   - Tokens are long enough to prevent brute force attacks

3. **Data Privacy**:
   - Only location data between pickup and dropoff is returned
   - No sensitive student information beyond name and admission number
   - Parent contact information is not exposed

## Integration with Frontend

### Example: Displaying Tracking Page

```javascript
// Fetch tracking data
const trackingToken = 'abc123...'; // From URL parameter
const response = await fetch(`/academic-suite/track/${trackingToken}`);
const data = await response.json();

if (data.success) {
  const { student, currentLocation, locationHistory, trip } = data.data;

  // Display student info
  console.log(`Tracking: ${student.name}`);

  // Display current location on map
  if (currentLocation) {
    map.setCenter([currentLocation.longitude, currentLocation.latitude]);
    map.addMarker({
      lat: currentLocation.latitude,
      lng: currentLocation.longitude,
      title: `Current Location - ${new Date(currentLocation.timestamp).toLocaleTimeString()}`,
    });
  }

  // Display route history
  locationHistory.forEach((location, index) => {
    map.addPolylinePoint({
      lat: location.latitude,
      lng: location.longitude,
    });
  });
}
```

### Polling for Updates

```javascript
// Poll for location updates every 10 seconds
setInterval(async () => {
  const response = await fetch(
    `/academic-suite/track/${trackingToken}/location`,
  );
  const data = await response.json();

  if (data.success && data.data.currentLocation) {
    updateMapMarker(data.data.currentLocation);
  }
}, 10000); // 10 seconds
```

## Troubleshooting

### SMS Not Sending

1. Check `AFRICASTALKING_API_KEY` and `AFRICASTALKING_USERNAME` are set
2. Verify `SMS_ENABLED` is not set to `false`
3. Check server logs for SMS API errors
4. Verify phone numbers are in correct format (e.g., +254712345678)

### Email Not Sending

1. Check `GMAIL_USER` and `GMAIL_APP_PASSWORD` are set correctly
2. Verify email addresses are valid
3. Check server logs for email errors

### Tracking Link Not Working

1. Verify `APP_URL` environment variable is set correctly
2. Check that the tracking token exists in database
3. Verify the student was actually picked up (has `actualPickupTime`)

### No Location Data

1. Ensure trip location updates are being sent (via `/academic-suite/trips/:id/location` endpoint)
2. Verify the student was picked up (`pickupStatus = PICKED_UP`)
3. Check that location timestamps are between pickup and dropoff times

## Migration

After deployment, run the database migration:

```bash
npx prisma migrate deploy
# Or for development:
npx prisma migrate dev
```

This will add the `trackingToken` field to the `school_trip_students` table.

## Future Enhancements

Potential improvements:

- WebSocket support for real-time location updates
- Push notifications for location updates
- Estimated time of arrival (ETA) calculations
- Geofencing alerts (entered/left specific areas)
- Historical trip replay
