# School Trip API Examples

## Create School Trip

### URL
```
POST /academic-suite/trips
```

### Sample Request Payload

#### Minimal Request (Required fields only)
```json
{
  "routeId": "route-uuid-here",
  "tripDate": "2024-12-31T00:00:00.000Z"
}
```

#### Complete Request (All fields)
```json
{
  "routeId": "550e8400-e29b-41d4-a716-446655440000",
  "busId": "bus-uuid-here",
  "driverId": "driver-uuid-here",
  "minderId": "minder-uuid-here",
  "tripDate": "2024-12-31T00:00:00.000Z",
  "scheduledStartTime": "2024-12-31T07:00:00.000Z",
  "status": "IN_PROGRESS",
  "notes": "Morning pickup trip for all students",
  "startLocation": "360 Apartments Phase 1, Nairobi",
  "endLocation": "JKIA Terminal 1",
  "startGps": "-1.2921,36.8219",
  "endGps": "-1.3191,36.9277",
  "isActive": true,
  "students": [
    {
      "studentId": "student-uuid-1"
    },
    {
      "studentId": "student-uuid-2"
    },
    {
      "studentId": "student-uuid-3"
    }
  ]
}
```

#### Example with Realistic Data
```json
{
  "routeId": "28b18231-d743-4d4a-96a9-cf8dbd43169d",
  "busId": "bus-123e4567-e89b-12d3-a456-426614174000",
  "driverId": "driver-123e4567-e89b-12d3-a456-426614174001",
  "minderId": "minder-123e4567-e89b-12d3-a456-426614174002",
  "tripDate": "2024-12-31T00:00:00.000Z",
  "scheduledStartTime": "2024-12-31T07:00:00.000Z",
  "status": "IN_PROGRESS",
  "notes": "Morning pickup route from 360 Apartments to JKIA",
  "startLocation": "360 Apartments Phase 1, Ngong Road, Nairobi",
  "endLocation": "Jomo Kenyatta International Airport (JKIA)",
  "startGps": "-1.2921,36.8219",
  "endGps": "-1.3191,36.9277",
  "isActive": true,
  "students": [
    {
      "studentId": "student-abc123"
    },
    {
      "studentId": "student-def456"
    }
  ]
}
```

### Sample Success Response

```json
{
  "success": true,
  "data": {
    "id": "28b18231-d743-4d4a-96a9-cf8dbd43169d",
    "routeId": "550e8400-e29b-41d4-a716-446655440000",
    "busId": "bus-uuid-here",
    "driverId": "driver-uuid-here",
    "minderId": "minder-uuid-here",
    "tripDate": "2024-12-31T00:00:00.000Z",
    "scheduledStartTime": "2024-12-31T07:00:00.000Z",
    "scheduledEndTime": null,
    "actualStartTime": null,
    "actualEndTime": null,
    "status": "IN_PROGRESS",
    "notes": "Morning pickup trip for all students",
    "startLocation": "360 Apartments Phase 1, Nairobi",
    "endLocation": "JKIA Terminal 1",
    "startGps": "-1.2921,36.8219",
    "endGps": "-1.3191,36.9277",
    "isActive": true,
    "createdAt": "2024-12-30T23:50:00.000Z",
    "updatedAt": "2024-12-30T23:50:00.000Z",
    "route": {
      "id": "550e8400-e29b-41d4-a716-446655440000",
      "name": "Route 1 - Morning Pickup",
      "tripType": "MORNING_PICKUP"
    },
    "bus": {
      "id": "bus-uuid-here",
      "registrationNumber": "KCA 123X",
      "make": "Toyota",
      "model": "Hiace"
    },
    "driver": {
      "id": "driver-uuid-here",
      "name": "John Doe",
      "phoneNumber": "+254712345678",
      "pin": "1234"
    },
    "minder": {
      "id": "minder-uuid-here",
      "name": "Jane Smith",
      "phoneNumber": "+254798765432",
      "pin": "5678"
    },
    "tripStudents": [
      {
        "id": "trip-student-uuid-1",
        "tripId": "28b18231-d743-4d4a-96a9-cf8dbd43169d",
        "studentId": "student-uuid-1",
        "pickupStatus": "NOT_PICKED_UP",
        "dropoffStatus": "NOT_DROPPED_OFF",
        "scheduledPickupTime": null,
        "actualPickupTime": null,
        "scheduledDropoffTime": null,
        "actualDropoffTime": null,
        "pickupLocation": "360 Apartments Phase 1",
        "dropoffLocation": "JKIA Terminal 1",
        "pickupGps": "-1.2921,36.8219",
        "dropoffGps": "-1.3191,36.9277",
        "notes": null,
        "isActive": true,
        "createdAt": "2024-12-30T23:50:00.000Z",
        "updatedAt": "2024-12-30T23:50:00.000Z",
        "student": {
          "id": "student-uuid-1",
          "name": "Alice Johnson",
          "studentId": "STU001",
          "grade": "Grade 5"
        }
      },
      {
        "id": "trip-student-uuid-2",
        "tripId": "28b18231-d743-4d4a-96a9-cf8dbd43169d",
        "studentId": "student-uuid-2",
        "pickupStatus": "NOT_PICKED_UP",
        "dropoffStatus": "NOT_DROPPED_OFF",
        "scheduledPickupTime": null,
        "actualPickupTime": null,
        "scheduledDropoffTime": null,
        "actualDropoffTime": null,
        "pickupLocation": "360 Apartments Phase 1",
        "dropoffLocation": "JKIA Terminal 1",
        "pickupGps": "-1.2921,36.8219",
        "dropoffGps": "-1.3191,36.9277",
        "notes": null,
        "isActive": true,
        "createdAt": "2024-12-30T23:50:00.000Z",
        "updatedAt": "2024-12-30T23:50:00.000Z",
        "student": {
          "id": "student-uuid-2",
          "name": "Bob Williams",
          "studentId": "STU002",
          "grade": "Grade 6"
        }
      }
    ]
  }
}
```

### Sample Error Response

#### Missing Required Field
```json
{
  "success": false,
  "error": "routeId should not be empty"
}
```

#### Route Not Found
```json
{
  "success": false,
  "error": "Route not found"
}
```

#### Validation Error
```json
{
  "success": false,
  "error": "tripDate must be a valid ISO 8601 date string"
}
```

### cURL Example

```bash
curl -X POST http://localhost:3000/academic-suite/trips \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -d '{
    "routeId": "550e8400-e29b-41d4-a716-446655440000",
    "busId": "bus-uuid-here",
    "driverId": "driver-uuid-here",
    "minderId": "minder-uuid-here",
    "tripDate": "2024-12-31T00:00:00.000Z",
    "scheduledStartTime": "2024-12-31T07:00:00.000Z",
    "status": "IN_PROGRESS",
    "notes": "Morning pickup trip",
    "startLocation": "360 Apartments Phase 1, Nairobi",
    "endLocation": "JKIA Terminal 1",
    "startGps": "-1.2921,36.8219",
    "endGps": "-1.3191,36.9277",
    "students": [
      {
        "studentId": "student-uuid-1"
      }
    ]
  }'
```

### JavaScript/Fetch Example

```javascript
const createTrip = async () => {
  const response = await fetch('http://localhost:3000/academic-suite/trips', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': 'Bearer YOUR_JWT_TOKEN'
    },
    body: JSON.stringify({
      routeId: '550e8400-e29b-41d4-a716-446655440000',
      busId: 'bus-uuid-here',
      driverId: 'driver-uuid-here',
      minderId: 'minder-uuid-here',
      tripDate: '2024-12-31T00:00:00.000Z',
      scheduledStartTime: '2024-12-31T07:00:00.000Z',
      status: 'IN_PROGRESS',
      notes: 'Morning pickup trip',
      startLocation: '360 Apartments Phase 1, Nairobi',
      endLocation: 'JKIA Terminal 1',
      startGps: '-1.2921,36.8219',
      endGps: '-1.3191,36.9277',
      students: [
        { studentId: 'student-uuid-1' }
      ]
    })
  });

  const result = await response.json();
  console.log(result);
};
```

## Field Descriptions

### Required Fields
- **routeId** (string): UUID of the route for this trip
- **tripDate** (ISO 8601 date string): Date of the trip

### Optional Fields
- **busId** (string): UUID of the bus assigned to this trip
- **driverId** (string): UUID of the driver assigned to this trip
- **minderId** (string): UUID of the minder assigned to this trip
- **scheduledStartTime** (ISO 8601 date string): Scheduled start time (auto-generated based on route tripType if not provided)
- **status** (enum): Trip status - `SCHEDULED`, `IN_PROGRESS`, `COMPLETED`, `CANCELLED`, `DELAYED` (defaults to `IN_PROGRESS`)
- **notes** (string, max 1000 chars): Additional notes about the trip
- **startLocation** (string, max 200 chars): Human-readable start location
- **endLocation** (string, max 200 chars): Human-readable end location
- **startGps** (string): GPS coordinates for start location (format: "latitude,longitude")
- **endGps** (string): GPS coordinates for end location (format: "latitude,longitude")
- **isActive** (boolean): Whether the trip is active (defaults to `true`)
- **students** (array): Array of student objects to include in the trip
  - **studentId** (string, required): UUID of the student

### Auto-Generated Fields
- **scheduledStartTime**: If not provided, automatically generated based on:
  - `MORNING_PICKUP`: 7:00 AM
  - `EVENING_DROPOFF`: 3:00 PM
  - `FIELD_TRIP` / `EXTRA_CURRICULUM`: 8:00 AM
  - `EMERGENCY`: Current time
- **pickupLocation**, **dropoffLocation**, **pickupGps**, **dropoffGps**: Automatically populated from student's parent's primary address if not provided

## Notes

1. If `scheduledStartTime` is not provided, it will be auto-generated based on the route's `tripType`
2. Student pickup/dropoff locations are automatically populated from the student's parent's primary address
3. The trip ID is auto-generated as a UUID
4. All timestamps are in ISO 8601 format
5. GPS coordinates should be in format: `"latitude,longitude"` (e.g., `"-1.2921,36.8219"`)

