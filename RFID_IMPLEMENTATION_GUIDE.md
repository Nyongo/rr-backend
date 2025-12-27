# RFID Implementation Guide

## Portable 860-960Mhz USB Type-C UHF RFID OTG Android Reader

### Architecture Overview

```
┌─────────────────┐         ┌──────────────┐         ┌─────────────┐
│  RFID Reader    │────────▶│ Android App  │────────▶│  NestJS API │
│  (USB OTG)      │         │  (Driver)    │         │  (Backend)  │
└─────────────────┘         └──────────────┘         └─────────────┘
                                      │                        │
                                      │                        ▼
                                      │                 ┌─────────────┐
                                      └────────────────▶│  Database   │
                                                        │  (Postgres) │
                                                        └─────────────┘
```

### Recommended Approach

**1. Mobile-First Architecture**

- **Android App** acts as intermediary between RFID reader and backend
- App connects to RFID reader via USB OTG
- App reads tags and sends events to NestJS API
- Supports offline mode with local queue

**2. Why This Approach?**

- ✅ USB OTG requires Android app for hardware access
- ✅ Better user experience (visual feedback, error handling)
- ✅ Offline capability (queue events when network unavailable)
- ✅ GPS integration (capture location with each scan)
- ✅ Real-time validation (verify student/trip before logging)

---

## Implementation Steps

### Phase 1: Backend Enhancements

#### 1.1 Add RFID Tag Lookup Endpoint

Since RFID readers scan tags, we need to find students by `rfidTagId`:

**New Endpoint:** `GET /academic-suite/students/by-rfid/:rfidTagId`

#### 1.2 Enhance RFID Logging Endpoint

Current endpoint requires `studentId`. We should add an alternative that accepts `rfidTagId` and auto-resolves the student.

**New Endpoint:** `POST /academic-suite/trips/:id/rfid-log-by-tag`

#### 1.3 Add Bulk RFID Logging

For scanning multiple students quickly:

**New Endpoint:** `POST /academic-suite/trips/:id/rfid-log-bulk`

#### 1.4 Add Device Management

Track RFID reader devices:

**New Endpoint:** `POST /academic-suite/rfid-devices` (register device)
**New Endpoint:** `GET /academic-suite/rfid-devices` (list devices)

#### 1.5 Add Real-time Trip Status

Get active trips for a driver/minder:

**New Endpoint:** `GET /academic-suite/trips/active?driverId=xxx&minderId=xxx`

---

### Phase 2: Android App Development

#### 2.1 Core Components

**A. USB OTG Communication**

```kotlin
// Use Android USB Host API
class RfidReaderManager {
    fun connectToReader(device: UsbDevice): Boolean
    fun startScanning(callback: (tagId: String) -> Unit)
    fun stopScanning()
    fun disconnect()
}
```

**B. RFID Event Queue (Offline Support)**

```kotlin
// Room Database for local storage
@Entity
data class PendingRfidEvent(
    val tripId: String,
    val rfidTagId: String,
    val eventType: String,
    val scannedAt: Long,
    val gpsCoordinates: String?,
    val deviceId: String,
    val synced: Boolean = false
)
```

**C. API Service**

```kotlin
interface TripApiService {
    @POST("academic-suite/trips/{tripId}/rfid-log-by-tag")
    suspend fun logRfidEvent(
        @Path("tripId") tripId: String,
        @Body event: RfidEventRequest
    ): ApiResponse<RfidEvent>

    @GET("academic-suite/students/by-rfid/{rfidTagId}")
    suspend fun getStudentByRfid(
        @Path("rfidTagId") rfidTagId: String
    ): ApiResponse<Student>

    @GET("academic-suite/trips/active")
    suspend fun getActiveTrips(
        @Query("driverId") driverId: String?,
        @Query("minderId") minderId: String?
    ): ApiResponse<List<Trip>>
}
```

**D. Location Service**

```kotlin
class LocationService {
    fun getCurrentLocation(): Location?
    fun startLocationUpdates(callback: (Location) -> Unit)
    fun stopLocationUpdates()
}
```

#### 2.2 App Flow

```
1. User Login (Driver/Minder)
   ↓
2. Select Active Trip
   ↓
3. Connect RFID Reader (USB OTG)
   ↓
4. Start Scanning
   ↓
5. For each tag scanned:
   a. Get GPS location
   b. Lookup student by RFID tag
   c. Determine event type (ENTERED_BUS/EXITED_BUS)
   d. Log event to backend
   e. Show confirmation/error
   ↓
6. If offline: Queue event locally
   ↓
7. When online: Sync queued events
```

#### 2.3 Key Features

- **Real-time Validation**: Verify student is assigned to trip before logging
- **Visual Feedback**: Show student name, photo, status after scan
- **Error Handling**: Handle invalid tags, network errors, duplicate scans
- **Offline Mode**: Queue events when network unavailable
- **GPS Tracking**: Auto-capture location with each scan
- **Sound/Vibration**: Audio/visual feedback on successful scan

---

### Phase 3: Security Considerations

#### 3.1 Authentication

- Use JWT tokens for API authentication
- Store tokens securely (Android Keystore)
- Refresh tokens before expiry

#### 3.2 Authorization

- Verify driver/minder has permission for trip
- Validate RFID tag belongs to student
- Check student is assigned to trip

#### 3.3 Data Validation

- Validate RFID tag format
- Prevent duplicate scans (within time window)
- Verify trip is active before logging

---

### Phase 4: Error Handling

#### 4.1 Common Scenarios

**Invalid RFID Tag**

- Tag not found in system
- Show error: "Tag not registered"
- Option to manually enter student

**Student Not on Trip**

- Tag valid but student not assigned
- Show error: "Student not assigned to this trip"
- Option to add student to trip

**Network Error**

- Queue event locally
- Show indicator: "Offline - Event queued"
- Auto-sync when connection restored

**Duplicate Scan**

- Same tag scanned within 30 seconds
- Show warning: "Already scanned"
- Option to override

---

### Phase 5: Performance Optimizations

#### 5.1 Backend

- Add indexes on `rfidTagId` in Student table
- Cache active trips (Redis)
- Batch RFID events if needed

#### 5.2 Mobile App

- Debounce rapid scans (prevent duplicate submissions)
- Cache student lookup results
- Compress GPS coordinates
- Batch sync queued events

---

## API Endpoints to Add

### 1. Get Student by RFID Tag

```http
GET /academic-suite/students/by-rfid/:rfidTagId
Authorization: Bearer <token>

Response:
{
  "success": true,
  "data": {
    "id": "student-123",
    "name": "John Doe",
    "admissionNumber": "STU001",
    "rfidTagId": "RFID-ABC123",
    "photo": "url",
    "school": { "id": "...", "name": "..." },
    "parent": { "id": "...", "name": "..." }
  }
}
```

### 2. Log RFID Event by Tag (Auto-resolve student)

```http
POST /academic-suite/trips/:tripId/rfid-log-by-tag
Authorization: Bearer <token>
Content-Type: application/json

Body:
{
  "rfidTagId": "RFID-ABC123",
  "eventType": "ENTERED_BUS",
  "deviceId": "DEVICE-001",
  "deviceLocation": "Front Door",
  "gpsCoordinates": "-1.2921,36.8219",
  "scannedAt": "2024-12-25T10:30:00Z"
}

Response:
{
  "success": true,
  "data": {
    "id": "event-123",
    "student": { "id": "...", "name": "..." },
    "eventType": "ENTERED_BUS",
    "scannedAt": "2024-12-25T10:30:00Z",
    "tripStudent": {
      "pickupStatus": "PICKED_UP",
      "actualPickupTime": "2024-12-25T10:30:00Z"
    }
  }
}
```

### 3. Get Active Trips

```http
GET /academic-suite/trips/active?driverId=xxx&minderId=xxx
Authorization: Bearer <token>

Response:
{
  "success": true,
  "data": [
    {
      "id": "trip-123",
      "route": { "id": "...", "name": "Route A" },
      "tripDate": "2024-12-25",
      "status": "IN_PROGRESS",
      "bus": { "id": "...", "registrationNumber": "..." },
      "driver": { "id": "...", "name": "..." },
      "minder": { "id": "...", "name": "..." }
    }
  ]
}
```

### 4. Bulk RFID Logging

```http
POST /academic-suite/trips/:tripId/rfid-log-bulk
Authorization: Bearer <token>
Content-Type: application/json

Body:
{
  "events": [
    {
      "rfidTagId": "RFID-ABC123",
      "eventType": "ENTERED_BUS",
      "scannedAt": "2024-12-25T10:30:00Z"
    },
    {
      "rfidTagId": "RFID-XYZ789",
      "eventType": "ENTERED_BUS",
      "scannedAt": "2024-12-25T10:31:00Z"
    }
  ],
  "deviceId": "DEVICE-001",
  "deviceLocation": "Front Door",
  "gpsCoordinates": "-1.2921,36.8219"
}
```

---

## Hardware Integration Notes

### USB OTG Setup

1. **Permissions** (AndroidManifest.xml):

```xml
<uses-feature android:name="android.hardware.usb.host" />
<uses-permission android:name="android.permission.USB_PERMISSION" />
```

2. **Device Detection**:

```kotlin
val usbManager = getSystemService(Context.USB_SERVICE) as UsbManager
val deviceList = usbManager.deviceList
```

3. **Vendor/Product ID**:

- Check device documentation for USB vendor/product IDs
- Filter devices by these IDs
- Request permission before connecting

### RFID Reader SDK

- Most UHF RFID readers come with Android SDK
- Check manufacturer documentation
- Common SDKs: Impinj, Alien, Zebra
- May need NDK (native library) integration

---

## Testing Strategy

### 1. Unit Tests

- RFID tag parsing
- Event queue management
- API service mocking

### 2. Integration Tests

- USB OTG connection
- GPS location capture
- API communication

### 3. End-to-End Tests

- Complete scan flow
- Offline mode
- Error scenarios

---

## Deployment Considerations

### Backend

- Ensure API endpoints are production-ready
- Add rate limiting for RFID endpoints
- Monitor API performance
- Set up alerts for errors

### Mobile App

- Test on multiple Android devices
- Test with different RFID reader models
- Handle USB OTG permission edge cases
- Optimize battery usage (GPS, USB)

---

## Next Steps

1. ✅ **Backend**: Add RFID tag lookup endpoint
2. ✅ **Backend**: Add RFID log-by-tag endpoint
3. ✅ **Backend**: Add active trips endpoint
4. ⏳ **Mobile**: Set up Android project
5. ⏳ **Mobile**: Integrate USB OTG library
6. ⏳ **Mobile**: Implement RFID scanning
7. ⏳ **Mobile**: Add offline queue
8. ⏳ **Mobile**: Integrate GPS
9. ⏳ **Testing**: End-to-end testing
10. ⏳ **Deployment**: Production rollout

---

## Additional Recommendations

1. **WebSocket Support**: For real-time trip updates (optional)
2. **Analytics**: Track scan success rates, common errors
3. **Reporting**: Dashboard showing RFID scan statistics
4. **Notifications**: Alert parents when student enters/exits bus
5. **Audit Trail**: Log all RFID operations for compliance
