# Route API Documentation

This document outlines the API endpoints for adding and updating routes in the academic suite.

## Base URL

```
/academic-suite/routes
```

---

## 1. Create Route (Add Route)

### Endpoint

```
POST /academic-suite/routes
```

### Description

Creates a new route for a school. The route name must be unique within the school.

### Request Headers

```
Content-Type: application/json
```

### Request Body

#### Required Fields

```json
{
  "name": "Westlands - Sunshine Elementary",
  "schoolId": "school-uuid-here",
  "tripType": "MORNING_PICKUP"
}
```

#### All Fields (Complete Example)

```json
{
  "name": "Westlands - Sunshine Elementary",
  "schoolId": "school-uuid-here",
  "tripType": "MORNING_PICKUP",
  "description": "Morning pickup route from Westlands area",
  "status": "Active",
  "busId": "bus-uuid-here",
  "driverId": "driver-uuid-here",
  "minderId": "minder-uuid-here",
  "students": [
    "student-uuid-1",
    "student-uuid-2",
    "student-uuid-3"
  ],
  "studentsWithRiderType": [
    {
      "studentId": "student-uuid-1",
      "riderType": "DAILY"
    },
    {
      "studentId": "student-uuid-2",
      "riderType": "OCCASIONAL"
    }
  ],
  "isActive": true
}
```

### Field Descriptions

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `name` | string | Yes | Route name (max 100 characters). Must be unique within the school |
| `schoolId` | string (UUID) | Yes | ID of the school this route belongs to |
| `tripType` | enum | Yes | Type of trip: `MORNING_PICKUP`, `EVENING_DROPOFF`, `FIELD_TRIP`, `EXTRA_CURRICULUM`, `EMERGENCY` |
| `description` | string | No | Route description (max 500 characters) |
| `status` | string | No | Route status (max 20 characters). Defaults to "Active" |
| `busId` | string (UUID) | No | ID of the bus assigned to this route |
| `driverId` | string (UUID) | No | ID of the driver assigned to this route |
| `minderId` | string (UUID) | No | ID of the minder assigned to this route |
| `students` | array of strings | No | Array of student IDs to add to the route (simple array) |
| `studentsWithRiderType` | array of objects | No | Array of student objects with rider type. Each object has: `studentId` (required) and `riderType` (optional: `DAILY` or `OCCASIONAL`) |
| `isActive` | boolean | No | Whether the route is active. Defaults to `true` |

### Trip Types

- `MORNING_PICKUP` - Morning pickup route
- `EVENING_DROPOFF` - Evening dropoff route
- `FIELD_TRIP` - Field trip route
- `EXTRA_CURRICULUM` - Extra curriculum activity route
- `EMERGENCY` - Emergency route

### Rider Types

- `DAILY` - Student rides daily
- `OCCASIONAL` - Student rides occasionally

### Success Response

**Status Code:** `200 OK`

```json
{
  "success": true,
  "data": {
    "id": "route-uuid-here",
    "name": "Westlands - Sunshine Elementary",
    "schoolId": "school-uuid-here",
    "tripType": "MORNING_PICKUP",
    "description": "Morning pickup route from Westlands area",
    "status": "Active",
    "isActive": true,
    "busId": "bus-uuid-here",
    "driverId": "driver-uuid-here",
    "minderId": "minder-uuid-here",
    "createdAt": "2024-12-31T10:00:00.000Z",
    "updatedAt": "2024-12-31T10:00:00.000Z",
    "school": {
      "id": "school-uuid-here",
      "name": "Sunshine Elementary",
      "schoolId": "SCH001"
    },
    "bus": {
      "id": "bus-uuid-here",
      "registrationNumber": "KBU 253J",
      "make": "Toyota",
      "model": "Hiace"
    },
    "driver": {
      "id": "driver-uuid-here",
      "name": "John Kamau",
      "phoneNumber": "+254712345678"
    },
    "minder": {
      "id": "minder-uuid-here",
      "name": "Jane Wanjiku",
      "phoneNumber": "+254798765432"
    },
    "routeStudents": [
      {
        "id": "route-student-uuid-1",
        "studentId": "student-uuid-1",
        "riderType": "DAILY",
        "isActive": true,
        "student": {
          "id": "student-uuid-1",
          "name": "Alice Johnson",
          "admissionNumber": "STU001"
        }
      }
    ]
  }
}
```

### Error Responses

#### Duplicate Route Name

**Status Code:** `200 OK`

```json
{
  "success": false,
  "error": "Route with this name already exists for this school"
}
```

#### Validation Error

**Status Code:** `200 OK`

```json
{
  "success": false,
  "error": "name should not be empty"
}
```

#### Missing Required Field

```json
{
  "success": false,
  "error": "schoolId should not be empty"
}
```

### cURL Example

```bash
curl -X POST http://localhost:3000/academic-suite/routes \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Westlands - Sunshine Elementary",
    "schoolId": "school-uuid-here",
    "tripType": "MORNING_PICKUP",
    "description": "Morning pickup route",
    "busId": "bus-uuid-here",
    "driverId": "driver-uuid-here",
    "minderId": "minder-uuid-here",
    "isActive": true
  }'
```

### JavaScript/Fetch Example

```javascript
const createRoute = async () => {
  const response = await fetch('http://localhost:3000/academic-suite/routes', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      name: 'Westlands - Sunshine Elementary',
      schoolId: 'school-uuid-here',
      tripType: 'MORNING_PICKUP',
      description: 'Morning pickup route from Westlands area',
      status: 'Active',
      busId: 'bus-uuid-here',
      driverId: 'driver-uuid-here',
      minderId: 'minder-uuid-here',
      isActive: true,
    }),
  });

  const result = await response.json();
  console.log(result);
};
```

---

## 2. Update Route

### Endpoint

```
PUT /academic-suite/routes/:id
```

### Description

Updates an existing route. Only provided fields will be updated. The route name must be unique within the school if being changed.

### URL Parameters

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `id` | string (UUID) | Yes | Route ID |

### Request Headers

```
Content-Type: application/json
```

### Request Body

All fields are optional. Only include fields you want to update.

```json
{
  "name": "Updated Route Name",
  "description": "Updated description",
  "status": "Active",
  "tripType": "EVENING_DROPOFF",
  "busId": "new-bus-uuid-here",
  "driverId": "new-driver-uuid-here",
  "minderId": "new-minder-uuid-here",
  "students": [
    "student-uuid-4",
    "student-uuid-5"
  ],
  "studentsWithRiderType": [
    {
      "studentId": "student-uuid-6",
      "riderType": "DAILY"
    }
  ],
  "studentsToRemove": [
    "student-uuid-1",
    "student-uuid-2"
  ],
  "isActive": false
}
```

### Field Descriptions

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `name` | string | No | Route name (max 100 characters). Must be unique within the school if changed |
| `schoolId` | string (UUID) | No | ID of the school (rarely needed to change) |
| `tripType` | enum | No | Type of trip: `MORNING_PICKUP`, `EVENING_DROPOFF`, `FIELD_TRIP`, `EXTRA_CURRICULUM`, `EMERGENCY` |
| `description` | string | No | Route description (max 500 characters) |
| `status` | string | No | Route status (max 20 characters) |
| `busId` | string (UUID) or null | No | ID of the bus assigned. Set to `null` to remove bus assignment |
| `driverId` | string (UUID) or null | No | ID of the driver assigned. Set to `null` to remove driver assignment |
| `minderId` | string (UUID) or null | No | ID of the minder assigned. Set to `null` to remove minder assignment |
| `students` | array of strings | No | Array of student IDs to add to the route |
| `studentsWithRiderType` | array of objects | No | Array of student objects with rider type to add |
| `studentsToRemove` | array of strings | No | Array of student IDs to remove from the route |
| `isActive` | boolean | No | Whether the route is active |

### Success Response

**Status Code:** `200 OK`

```json
{
  "success": true,
  "data": {
    "id": "route-uuid-here",
    "name": "Updated Route Name",
    "schoolId": "school-uuid-here",
    "tripType": "EVENING_DROPOFF",
    "description": "Updated description",
    "status": "Active",
    "isActive": false,
    "busId": "new-bus-uuid-here",
    "driverId": "new-driver-uuid-here",
    "minderId": "new-minder-uuid-here",
    "createdAt": "2024-12-31T10:00:00.000Z",
    "updatedAt": "2024-12-31T11:00:00.000Z",
    "school": {
      "id": "school-uuid-here",
      "name": "Sunshine Elementary"
    },
    "bus": {
      "id": "new-bus-uuid-here",
      "registrationNumber": "KCK 187B",
      "make": "Mercedes",
      "model": "Sprinter"
    },
    "driver": {
      "id": "new-driver-uuid-here",
      "name": "Peter Kipchoge",
      "phoneNumber": "+254723456789"
    },
    "minder": {
      "id": "new-minder-uuid-here",
      "name": "Mary Atieno",
      "phoneNumber": "+254789012345"
    },
    "routeStudents": [
      {
        "id": "route-student-uuid-6",
        "studentId": "student-uuid-6",
        "riderType": "DAILY",
        "isActive": true,
        "student": {
          "id": "student-uuid-6",
          "name": "Bob Smith",
          "admissionNumber": "STU006"
        }
      }
    ]
  }
}
```

### Error Responses

#### Route Not Found

**Status Code:** `200 OK`

```json
{
  "success": false,
  "error": "Route not found"
}
```

#### Duplicate Route Name

**Status Code:** `200 OK`

```json
{
  "success": false,
  "error": "Route with this name already exists for this school"
}
```

#### Validation Error

```json
{
  "success": false,
  "error": "name must be shorter than or equal to 100 characters"
}
```

### cURL Examples

#### Update Route Name and Status

```bash
curl -X PUT http://localhost:3000/academic-suite/routes/route-uuid-here \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Updated Route Name",
    "status": "Inactive",
    "isActive": false
  }'
```

#### Remove Bus Assignment

```bash
curl -X PUT http://localhost:3000/academic-suite/routes/route-uuid-here \
  -H "Content-Type: application/json" \
  -d '{
    "busId": null
  }'
```

#### Add Students to Route

```bash
curl -X PUT http://localhost:3000/academic-suite/routes/route-uuid-here \
  -H "Content-Type: application/json" \
  -d '{
    "students": [
      "student-uuid-4",
      "student-uuid-5"
    ]
  }'
```

#### Remove Students from Route

```bash
curl -X PUT http://localhost:3000/academic-suite/routes/route-uuid-here \
  -H "Content-Type: application/json" \
  -d '{
    "studentsToRemove": [
      "student-uuid-1",
      "student-uuid-2"
    ]
  }'
```

### JavaScript/Fetch Example

```javascript
const updateRoute = async (routeId) => {
  const response = await fetch(
    `http://localhost:3000/academic-suite/routes/${routeId}`,
    {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        name: 'Updated Route Name',
        description: 'Updated description',
        status: 'Active',
        busId: 'new-bus-uuid-here',
        driverId: 'new-driver-uuid-here',
        studentsToRemove: ['student-uuid-1'],
        isActive: true,
      }),
    },
  );

  const result = await response.json();
  console.log(result);
};
```

---

## Notes

### Route Name Uniqueness

- Route names must be unique within the same school
- When creating a route, if a route with the same name exists for that school, the request will fail
- When updating a route, if you change the name and a route with the new name already exists for that school, the request will fail

### Student Management

There are multiple ways to manage students on a route:

1. **Simple array (`students`)**: Just provide student IDs. All will be added as `DAILY` riders by default.

2. **With rider type (`studentsWithRiderType`)**: Provide student IDs with their rider type (DAILY or OCCASIONAL).

3. **Remove students (`studentsToRemove`)**: Provide an array of student IDs to remove from the route.

### Bus, Driver, and Minder Assignment

- To assign: Provide the UUID
- To remove assignment: Set to `null` (in update only)
- All are optional and can be set/removed independently

### Validation

- All string fields have maximum length restrictions
- Enum fields (`tripType`, `riderType`) must match predefined values
- UUIDs must be valid UUID format
- Route must exist before updating

### Response Format

All endpoints return:
- `success`: boolean indicating if the request was successful
- `data`: The route object with all related data (school, bus, driver, minder, students)
- `error`: Error message if `success` is `false`
