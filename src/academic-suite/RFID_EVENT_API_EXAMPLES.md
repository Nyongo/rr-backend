# RFID Event API Examples

## Log RFID Event (with Student ID)

### URL
```
POST /academic-suite/trips/:tripId/rfid-log
```

### Sample Request Payload

#### Minimal Request (Required fields only)
```json
{
  "studentId": "student-uuid-here",
  "rfidTagId": "RFID-123456789",
  "eventType": "ENTERED_BUS"
}
```

#### Complete Request (All fields)
```json
{
  "studentId": "student-123e4567-e89b-12d3-a456-426614174000",
  "rfidTagId": "RFID-123456789",
  "eventType": "ENTERED_BUS",
  "deviceId": "RFID-READER-001",
  "deviceLocation": "Front Door",
  "gpsCoordinates": "-1.2921,36.8219",
  "notes": "Student entered bus at front entrance",
  "scannedAt": "2024-12-31T08:15:30.000Z"
}
```

#### Example: Student Entered Bus
```json
{
  "studentId": "student-abc123",
  "rfidTagId": "RFID-TAG-987654",
  "eventType": "ENTERED_BUS",
  "deviceId": "READER-FRONT-DOOR",
  "deviceLocation": "Bus Front Door",
  "gpsCoordinates": "-1.2921,36.8219",
  "notes": "Morning pickup - student boarded bus"
}
```

#### Example: Student Exited Bus
```json
{
  "studentId": "student-abc123",
  "rfidTagId": "RFID-TAG-987654",
  "eventType": "EXITED_BUS",
  "deviceId": "READER-BACK-DOOR",
  "deviceLocation": "Bus Back Door",
  "gpsCoordinates": "-1.3191,36.9277",
  "notes": "Arrived at school - student disembarked"
}
```

### Sample Success Response

```json
{
  "success": true,
  "data": {
    "id": "rfid-event-uuid-here",
    "tripId": "28b18231-d743-4d4a-96a9-cf8dbd43169d",
    "tripStudentId": "trip-student-uuid-here",
    "studentId": "student-abc123",
    "eventType": "ENTERED_BUS",
    "rfidTagId": "RFID-TAG-987654",
    "deviceId": "READER-FRONT-DOOR",
    "deviceLocation": "Bus Front Door",
    "gpsCoordinates": "-1.2921,36.8219",
    "scannedAt": "2024-12-31T08:15:30.000Z",
    "notes": "Morning pickup - student boarded bus",
    "createdAt": "2024-12-31T08:15:30.000Z",
    "student": {
      "id": "student-abc123",
      "name": "Alice Johnson",
      "admissionNumber": "STU001"
    },
    "tripStudent": {
      "id": "trip-student-uuid-here",
      "pickupStatus": "PICKED_UP",
      "dropoffStatus": "NOT_DROPPED_OFF",
      "actualPickupTime": "2024-12-31T08:15:30.000Z",
      "pickupLocation": "Bus Front Door",
      "pickupGps": "-1.2921,36.8219"
    }
  }
}
```

### Sample Error Response

```json
{
  "success": false,
  "error": "Trip not found"
}
```

```json
{
  "success": false,
  "error": "Student not found in trip"
}
```

---

## Log RFID Event by Tag Only

### URL
```
POST /academic-suite/trips/:tripId/rfid-log-by-tag
```

This endpoint automatically finds the student by RFID tag ID (no need to provide studentId).

### Sample Request Payload

```json
{
  "rfidTagId": "RFID-TAG-987654",
  "eventType": "ENTERED_BUS",
  "deviceId": "READER-FRONT-DOOR",
  "deviceLocation": "Bus Front Door",
  "gpsCoordinates": "-1.2921,36.8219",
  "notes": "Auto-detected student by RFID tag"
}
```

### Sample Success Response

Same format as the regular RFID log endpoint.

---

## Bulk Log RFID Events

### URL
```
POST /academic-suite/trips/:tripId/rfid-log-bulk
```

### Sample Request Payload

```json
{
  "events": [
    {
      "rfidTagId": "RFID-TAG-001",
      "eventType": "ENTERED_BUS",
      "scannedAt": "2024-12-31T08:15:30.000Z"
    },
    {
      "rfidTagId": "RFID-TAG-002",
      "eventType": "ENTERED_BUS",
      "scannedAt": "2024-12-31T08:16:00.000Z"
    },
    {
      "rfidTagId": "RFID-TAG-003",
      "eventType": "ENTERED_BUS",
      "scannedAt": "2024-12-31T08:16:30.000Z"
    }
  ],
  "deviceId": "READER-FRONT-DOOR",
  "deviceLocation": "Bus Front Door",
  "gpsCoordinates": "-1.2921,36.8219"
}
```

### Sample Success Response

```json
{
  "success": true,
  "data": [
    {
      "rfidTagId": "RFID-TAG-001",
      "success": true,
      "event": {
        "id": "event-uuid-1",
        "studentId": "student-001",
        "eventType": "ENTERED_BUS",
        "scannedAt": "2024-12-31T08:15:30.000Z"
      }
    },
    {
      "rfidTagId": "RFID-TAG-002",
      "success": true,
      "event": {
        "id": "event-uuid-2",
        "studentId": "student-002",
        "eventType": "ENTERED_BUS",
        "scannedAt": "2024-12-31T08:16:00.000Z"
      }
    },
    {
      "rfidTagId": "RFID-TAG-003",
      "success": false,
      "error": "Student with RFID tag RFID-TAG-003 not found in trip"
    }
  ]
}
```

---

## cURL Examples

### Log RFID Event
```bash
curl -X POST http://localhost:3000/academic-suite/trips/28b18231-d743-4d4a-96a9-cf8dbd43169d/rfid-log \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -d '{
    "studentId": "student-abc123",
    "rfidTagId": "RFID-TAG-987654",
    "eventType": "ENTERED_BUS",
    "deviceId": "READER-FRONT-DOOR",
    "deviceLocation": "Bus Front Door",
    "gpsCoordinates": "-1.2921,36.8219",
    "notes": "Student entered bus"
  }'
```

### Log by Tag Only
```bash
curl -X POST http://localhost:3000/academic-suite/trips/28b18231-d743-4d4a-96a9-cf8dbd43169d/rfid-log-by-tag \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -d '{
    "rfidTagId": "RFID-TAG-987654",
    "eventType": "ENTERED_BUS",
    "deviceLocation": "Bus Front Door"
  }'
```

### Bulk Log Events
```bash
curl -X POST http://localhost:3000/academic-suite/trips/28b18231-d743-4d4a-96a9-cf8dbd43169d/rfid-log-bulk \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -d '{
    "events": [
      {
        "rfidTagId": "RFID-TAG-001",
        "eventType": "ENTERED_BUS"
      },
      {
        "rfidTagId": "RFID-TAG-002",
        "eventType": "ENTERED_BUS"
      }
    ],
    "deviceId": "READER-FRONT-DOOR",
    "deviceLocation": "Bus Front Door"
  }'
```

---

## JavaScript/Fetch Examples

### Log RFID Event
```javascript
const logRfidEvent = async (tripId, eventData) => {
  const response = await fetch(
    `http://localhost:3000/academic-suite/trips/${tripId}/rfid-log`,
    {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer YOUR_JWT_TOKEN'
      },
      body: JSON.stringify({
        studentId: 'student-abc123',
        rfidTagId: 'RFID-TAG-987654',
        eventType: 'ENTERED_BUS',
        deviceId: 'READER-FRONT-DOOR',
        deviceLocation: 'Bus Front Door',
        gpsCoordinates: '-1.2921,36.8219',
        notes: 'Student entered bus'
      })
    }
  );

  const result = await response.json();
  console.log(result);
};

// Usage
logRfidEvent('28b18231-d743-4d4a-96a9-cf8dbd43169d', {});
```

---

## Event Types

- **`ENTERED_BUS`**: Student entered/boarded the bus
  - Automatically updates `pickupStatus` to `PICKED_UP`
  - Records `actualPickupTime` if not already set
  - Saves GPS coordinates and location if provided

- **`EXITED_BUS`**: Student exited/disembarked from the bus
  - Automatically updates `dropoffStatus` to `DROPPED_OFF`
  - Records `actualDropoffTime` if not already set
  - Saves GPS coordinates and location if provided

---

## Auto-Updates

When logging RFID events, the system automatically:

1. **For `ENTERED_BUS` events:**
   - Sets `pickupStatus` to `PICKED_UP`
   - Records `actualPickupTime` (if not already set)
   - Saves `pickupGps` and `pickupLocation` (if provided)

2. **For `EXITED_BUS` events:**
   - Sets `dropoffStatus` to `DROPPED_OFF`
   - Records `actualDropoffTime` (if not already set)
   - Saves `dropoffGps` and `dropoffLocation` (if provided)

---

## Field Descriptions

### Required Fields
- **studentId** (string): UUID of the student (only for `/rfid-log` endpoint)
- **rfidTagId** (string): The RFID tag identifier
- **eventType** (enum): `ENTERED_BUS` or `EXITED_BUS`

### Optional Fields
- **deviceId** (string): Identifier of the RFID reader device
- **deviceLocation** (string, max 100 chars): Physical location of the reader (e.g., "Front Door", "Back Door")
- **gpsCoordinates** (string): GPS coordinates when scan occurred (format: "latitude,longitude")
- **notes** (string, max 500 chars): Additional notes about the event
- **scannedAt** (ISO 8601 date string): When the scan occurred (defaults to current time if not provided)

---

## Notes

1. The `/rfid-log` endpoint requires `studentId` to be provided
2. The `/rfid-log-by-tag` endpoint automatically finds the student by `rfidTagId`
3. Bulk logging processes multiple events at once and returns results for each
4. RFID events automatically update student pickup/dropoff statuses
5. All timestamps are in ISO 8601 format
6. GPS coordinates should be in format: `"latitude,longitude"` (e.g., `"-1.2921,36.8219"`)

