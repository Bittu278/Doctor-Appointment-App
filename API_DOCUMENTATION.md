# Doctor Appointment System - API Documentation

## Enhanced Features

### ✅ Key Improvements

1. **No Appointment Clashes** - Smart conflict detection prevents overlapping bookings
2. **Duration Control** - All appointments must be 10-35 minutes
3. **Available Slots** - Real-time slot availability checking
4. **Doctor Schedule Management** - Flexible working hours and break times
5. **Buffer Time Support** - Optional buffer between appointments

---

## API Endpoints

### User Endpoints

#### 1. Get Available Slots
**GET** `/api/v1/user/available-slots`

Get all available time slots for a doctor on a specific date.

**Query Parameters:**
```json
{
  "doctorId": "string (required)",
  "date": "string (required, format: YYYY-MM-DD)"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Available slots fetched successfully",
  "data": {
    "doctorName": "Dr. John Doe",
    "specialization": "Cardiologist",
    "date": "2024-12-20",
    "consultationDuration": 20,
    "totalSlots": 15,
    "slots": [
      {
        "startTime": "09:00",
        "endTime": "09:20",
        "duration": 20,
        "available": true
      },
      {
        "startTime": "09:20",
        "endTime": "09:40",
        "duration": 20,
        "available": true
      }
    ],
    "workingHours": ["09:00", "17:00"],
    "breakTimes": [
      {
        "startTime": "13:00",
        "endTime": "14:00"
      }
    ]
  }
}
```

#### 2. Book Appointment
**POST** `/api/v1/user/book-appointment`

Book a new appointment with automatic conflict detection.

**Request Body:**
```json
{
  "doctorId": "string (required)",
  "userId": "string (required)",
  "date": "string (required, format: YYYY-MM-DD)",
  "startTime": "string (required, format: HH:mm)",
  "duration": "number (required, min: 10, max: 35)",
  "userInfo": {
    "name": "string",
    "email": "string",
    "phone": "string"
  },
  "reason": "string (optional)"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Appointment booked successfully",
  "data": {
    "id": "appointment_id",
    "patientName": "John Smith",
    "doctorName": "Dr. Jane Doe",
    "date": "2024-12-20",
    "startTime": "10:00",
    "endTime": "10:25",
    "duration": 25,
    "status": "pending",
    "reason": "Regular checkup"
  }
}
```

**Error Responses:**
```json
{
  "success": false,
  "message": "Duration must be between 10 and 35 minutes"
}

{
  "success": false,
  "message": "Time slot conflicts with existing appointment"
}

{
  "success": false,
  "message": "Outside doctor working hours"
}

{
  "success": false,
  "message": "Time slot falls during doctor break time"
}
```

#### 3. Check Booking Availability
**POST** `/api/v1/user/booking-availability`

Check if a specific time slot is available.

**Request Body:**
```json
{
  "doctorId": "string (required)",
  "date": "string (required, format: YYYY-MM-DD)",
  "startTime": "string (required, format: HH:mm)",
  "duration": "number (required, min: 10, max: 35)"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Slot is available",
  "available": true,
  "slot": {
    "startTime": "10:00",
    "endTime": "10:25",
    "duration": 25
  }
}
```

---

### Doctor Endpoints

#### 1. Get Doctor Appointments
**POST** `/api/v1/doctor/doctor-appointments`

Get all appointments for a doctor with optional filtering.

**Request Body:**
```json
{
  "doctorId": "string (required)",
  "status": "string (optional: pending, approved, rejected, completed, cancelled)",
  "date": "string (optional, format: YYYY-MM-DD)"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Doctor Appointments fetched successfully",
  "count": 5,
  "data": [
    {
      "id": "appointment_id",
      "patientName": "John Smith",
      "doctorName": "Dr. Jane Doe",
      "date": "2024-12-20",
      "startTime": "10:00",
      "endTime": "10:25",
      "duration": 25,
      "status": "approved",
      "reason": "Regular checkup",
      "notes": "",
      "createdAt": "2024-12-15T10:30:00Z"
    }
  ]
}
```

#### 2. Get Today's Appointments
**POST** `/api/v1/doctor/today-appointments`

Get all appointments for today.

**Request Body:**
```json
{
  "doctorId": "string (required)"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Today's appointments fetched successfully",
  "count": 3,
  "date": "2024-12-20",
  "data": [
    {
      "id": "appointment_id",
      "patientName": "John Smith",
      "date": "2024-12-20",
      "startTime": "10:00",
      "endTime": "10:25",
      "duration": 25,
      "status": "approved"
    }
  ]
}
```

#### 3. Update Appointment Status
**POST** `/api/v1/doctor/update-appointment-status`

Update the status of an appointment.

**Request Body:**
```json
{
  "appointmentId": "string (required)",
  "status": "string (required: pending, approved, rejected, completed, cancelled)",
  "notes": "string (optional)"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Appointment approved successfully",
  "data": {
    "id": "appointment_id",
    "patientName": "John Smith",
    "status": "approved",
    "notes": "Patient confirmed"
  }
}
```

#### 4. Update Doctor Profile
**POST** `/api/v1/doctor/updateProfile`

Update doctor profile including consultation duration and break times.

**Request Body:**
```json
{
  "userId": "string (required)",
  "consultationDuration": "number (optional, min: 10, max: 35)",
  "slotBuffer": "number (optional, min: 0, max: 15)",
  "breakTimes": [
    {
      "startTime": "13:00",
      "endTime": "14:00",
      "days": ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"]
    }
  ],
  "timings": ["09:00", "17:00"],
  "feesPerConsultation": 500
}
```

**Response:**
```json
{
  "success": true,
  "message": "Profile updated successfully",
  "data": {
    "firstName": "Jane",
    "lastName": "Doe",
    "consultationDuration": 20,
    "slotBuffer": 5,
    "timings": ["09:00", "17:00"],
    "breakTimes": [...]
  }
}
```

---

## Data Models

### Appointment Model
```javascript
{
  userId: String (required),
  doctorId: String (required),
  doctorInfo: Object (required),
  userInfo: Object (required),
  date: String (required, format: YYYY-MM-DD),
  startTime: String (required, format: HH:mm),
  endTime: String (required, format: HH:mm),
  duration: Number (required, min: 10, max: 35),
  status: String (required, enum: [pending, approved, rejected, completed, cancelled]),
  reason: String (optional),
  notes: String (optional),
  timestamps: true
}
```

### Doctor Model Enhancements
```javascript
{
  // ... existing fields ...
  consultationDuration: Number (default: 20, min: 10, max: 35),
  slotBuffer: Number (default: 0, min: 0, max: 15),
  breakTimes: [
    {
      startTime: String,
      endTime: String,
      days: [String] // e.g., ["Monday", "Wednesday"]
    }
  ]
}
```

---

## Time Format Guidelines

- **Date Format:** `YYYY-MM-DD` (e.g., "2024-12-20")
- **Time Format:** `HH:mm` in 24-hour format (e.g., "14:30")
- **Duration:** Number in minutes (10-35)

---

## Conflict Prevention Rules

1. **No Overlapping Appointments:** The system checks all existing appointments
2. **Working Hours Validation:** Appointments must be within doctor's working hours
3. **Break Time Validation:** Appointments cannot overlap with break times
4. **Duration Validation:** All appointments must be 10-35 minutes
5. **Past Date Prevention:** Cannot book appointments in the past
6. **Buffer Time Support:** Optional buffer time between appointments

---

## Example Workflow

### For Patients:

1. **View Available Slots**
   ```
   GET /api/v1/user/available-slots?doctorId=xxx&date=2024-12-20
   ```

2. **Check Specific Slot**
   ```
   POST /api/v1/user/booking-availability
   Body: { doctorId, date, startTime, duration }
   ```

3. **Book Appointment**
   ```
   POST /api/v1/user/book-appointment
   Body: { doctorId, userId, date, startTime, duration, userInfo, reason }
   ```

### For Doctors:

1. **View Today's Schedule**
   ```
   POST /api/v1/doctor/today-appointments
   Body: { doctorId }
   ```

2. **Approve/Reject Appointment**
   ```
   POST /api/v1/doctor/update-appointment-status
   Body: { appointmentId, status: "approved", notes }
   ```

3. **Update Availability Settings**
   ```
   POST /api/v1/doctor/updateProfile
   Body: { userId, consultationDuration: 25, slotBuffer: 5, breakTimes: [...] }
   ```

---

## Error Codes

- `400` - Bad Request (validation errors)
- `404` - Not Found (doctor/appointment not found)
- `409` - Conflict (time slot not available)
- `500` - Internal Server Error

---

## Notes

- All times are in 24-hour format
- Appointment status automatically notifies patients
- Doctors can set custom consultation durations (10-35 min)
- Buffer time between appointments is optional (0-15 min)
- Break times can be set for specific days of the week
