# Enhanced Doctor Appointment System

## 🎯 Overview

This enhanced appointment system provides a seamless booking experience for both patients and doctors with intelligent conflict detection, flexible scheduling, and proper time management.

---

## ✨ Key Features

### 1. **Zero Appointment Conflicts**
- Smart overlap detection prevents double bookings
- Real-time availability checking
- Automatic validation before booking

### 2. **Controlled Appointment Duration**
- All appointments must be between **10-35 minutes**
- Doctors can set their preferred consultation duration
- Flexible duration per appointment type

### 3. **Available Slots System**
- Automatically generates available time slots
- Shows open slots based on doctor's schedule
- Filters out booked times and break periods

### 4. **Doctor Schedule Management**
- Set working hours (e.g., 09:00 - 17:00)
- Configure break times (e.g., lunch break)
- Day-specific break schedules
- Optional buffer time between appointments

### 5. **Enhanced Status Management**
- **Pending** - Awaiting doctor approval
- **Approved** - Confirmed by doctor
- **Rejected** - Declined by doctor
- **Completed** - Appointment finished
- **Cancelled** - Cancelled by patient/doctor

---

## 🔧 Technical Implementation

### Core Components

#### 1. **Appointment Utilities** (`utils/appointmentUtils.js`)
Helper functions for time management and conflict detection:

- `validateDuration()` - Ensures 10-35 minute range
- `doTimesOverlap()` - Checks for time conflicts
- `generateTimeSlots()` - Creates available slots
- `isSlotAvailable()` - Validates slot availability
- `calculateEndTime()` - Computes end time from start + duration
- `validateAppointmentDate()` - Prevents past bookings

#### 2. **Enhanced Models**

**Appointment Model:**
```javascript
{
  userId: String,
  doctorId: String,
  date: String,           // YYYY-MM-DD
  startTime: String,      // HH:mm (24-hour)
  endTime: String,        // HH:mm (24-hour)
  duration: Number,       // 10-35 minutes
  status: String,         // pending/approved/rejected/completed/cancelled
  reason: String,
  notes: String
}
```

**Doctor Model Additions:**
```javascript
{
  consultationDuration: Number,  // Default: 20 min (10-35 range)
  slotBuffer: Number,            // Buffer between appointments (0-15 min)
  breakTimes: [
    {
      startTime: String,
      endTime: String,
      days: [String]  // e.g., ["Monday", "Wednesday"]
    }
  ]
}
```

#### 3. **API Endpoints**

**For Patients:**
- `GET /api/v1/user/available-slots` - View all available slots
- `POST /api/v1/user/booking-availability` - Check specific slot
- `POST /api/v1/user/book-appointment` - Book appointment

**For Doctors:**
- `POST /api/v1/doctor/doctor-appointments` - View appointments (with filters)
- `POST /api/v1/doctor/today-appointments` - Today's schedule
- `POST /api/v1/doctor/update-appointment-status` - Approve/reject/complete
- `POST /api/v1/doctor/updateProfile` - Update schedule settings

---

## 📋 How It Works

### Patient Booking Flow

```
1. Patient selects doctor
   ↓
2. System shows available slots for chosen date
   ↓
3. Patient picks a slot (10-35 min duration)
   ↓
4. System validates:
   - No conflicts with existing appointments
   - Within doctor's working hours
   - Not during break time
   - Valid duration (10-35 min)
   ↓
5. Appointment created with "pending" status
   ↓
6. Doctor receives notification
   ↓
7. Doctor approves/rejects
   ↓
8. Patient receives status notification
```

### Conflict Prevention Logic

```javascript
// The system checks:
1. Is the date in the past? ❌ Reject
2. Is it within doctor's working hours? ✓
3. Does it overlap with existing appointments? ❌ Reject
4. Does it fall during a break time? ❌ Reject
5. Is the duration 10-35 minutes? ✓
6. All checks passed? ✅ Allow booking
```

---

## 🚀 Usage Examples

### Example 1: Get Available Slots

**Request:**
```bash
GET /api/v1/user/available-slots?doctorId=123&date=2024-12-20
Authorization: Bearer <token>
```

**Response:**
```json
{
  "success": true,
  "data": {
    "doctorName": "Dr. Sarah Johnson",
    "specialization": "Cardiologist",
    "consultationDuration": 20,
    "totalSlots": 12,
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
    ]
  }
}
```

### Example 2: Book Appointment

**Request:**
```bash
POST /api/v1/user/book-appointment
Authorization: Bearer <token>
Content-Type: application/json

{
  "doctorId": "123",
  "userId": "456",
  "date": "2024-12-20",
  "startTime": "10:00",
  "duration": 25,
  "userInfo": {
    "name": "John Smith",
    "email": "john@example.com",
    "phone": "1234567890"
  },
  "reason": "Regular checkup"
}
```

**Success Response:**
```json
{
  "success": true,
  "message": "Appointment booked successfully",
  "data": {
    "id": "apt_123",
    "patientName": "John Smith",
    "doctorName": "Dr. Sarah Johnson",
    "date": "2024-12-20",
    "startTime": "10:00",
    "endTime": "10:25",
    "duration": 25,
    "status": "pending"
  }
}
```

**Error Response (Conflict):**
```json
{
  "success": false,
  "message": "Time slot conflicts with existing appointment"
}
```

### Example 3: Doctor Updates Schedule

**Request:**
```bash
POST /api/v1/doctor/updateProfile
Authorization: Bearer <token>
Content-Type: application/json

{
  "userId": "789",
  "consultationDuration": 25,
  "slotBuffer": 5,
  "timings": ["09:00", "17:00"],
  "breakTimes": [
    {
      "startTime": "13:00",
      "endTime": "14:00",
      "days": ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"]
    }
  ]
}
```

**Response:**
```json
{
  "success": true,
  "message": "Profile updated successfully",
  "data": {
    "consultationDuration": 25,
    "slotBuffer": 5,
    "timings": ["09:00", "17:00"],
    "breakTimes": [...]
  }
}
```

---

## 🎨 Frontend Integration Guide

### Step 1: Fetch Available Slots

```javascript
const fetchAvailableSlots = async (doctorId, date) => {
  const response = await fetch(
    `/api/v1/user/available-slots?doctorId=${doctorId}&date=${date}`,
    {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    }
  );
  const data = await response.json();
  return data.data.slots;
};
```

### Step 2: Display Slots to User

```javascript
const slots = await fetchAvailableSlots('doctor123', '2024-12-20');

// Render slots in UI
slots.forEach(slot => {
  console.log(`${slot.startTime} - ${slot.endTime} (${slot.duration} min)`);
});
```

### Step 3: Book Selected Slot

```javascript
const bookAppointment = async (appointmentData) => {
  const response = await fetch('/api/v1/user/book-appointment', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    },
    body: JSON.stringify(appointmentData)
  });
  
  const result = await response.json();
  
  if (result.success) {
    alert('Appointment booked successfully!');
  } else {
    alert(`Booking failed: ${result.message}`);
  }
};
```

---

## 🧪 Testing Scenarios

### Test Case 1: No Conflicts
```
Doctor working hours: 09:00 - 17:00
Existing appointments: 10:00-10:20, 11:00-11:30
New booking request: 10:30-10:55 (25 min)
Expected: ✅ Success
```

### Test Case 2: Overlap Detected
```
Existing: 10:00-10:30
New request: 10:15-10:45
Expected: ❌ "Time slot conflicts with existing appointment"
```

### Test Case 3: Outside Working Hours
```
Working hours: 09:00 - 17:00
New request: 17:30-18:00
Expected: ❌ "Outside doctor working hours"
```

### Test Case 4: During Break Time
```
Break time: 13:00-14:00
New request: 13:15-13:45
Expected: ❌ "Time slot falls during doctor break time"
```

### Test Case 5: Invalid Duration
```
New request: duration = 40 minutes
Expected: ❌ "Duration must be between 10 and 35 minutes"
```

---

## 🔐 Security Features

- JWT authentication required for all endpoints
- User authorization checks
- Input validation and sanitization
- Status enum validation
- Date/time format validation

---

## 📊 Benefits

### For Patients:
✅ See real-time available slots  
✅ No booking conflicts  
✅ Clear appointment duration  
✅ Instant booking confirmation  
✅ Status notifications  

### For Doctors:
✅ No double bookings  
✅ Flexible schedule management  
✅ Set break times  
✅ Control consultation duration  
✅ Buffer time between patients  
✅ Easy approval workflow  

---

## 🛠️ Configuration Examples

### Conservative Schedule (15-min appointments, 5-min buffer)
```javascript
{
  consultationDuration: 15,
  slotBuffer: 5,
  timings: ["09:00", "17:00"]
}
// Result: 24 slots per day
```

### Standard Schedule (20-min appointments, no buffer)
```javascript
{
  consultationDuration: 20,
  slotBuffer: 0,
  timings: ["09:00", "17:00"]
}
// Result: 24 slots per day
```

### Extended Consultations (30-min appointments, 10-min buffer)
```javascript
{
  consultationDuration: 30,
  slotBuffer: 10,
  timings: ["09:00", "17:00"]
}
// Result: 12 slots per day
```

---

## 📝 Migration Notes

If migrating from the old system:

1. **Existing appointments** need to be updated:
   - Add `startTime` and `endTime` fields
   - Add `duration` field
   - Remove old `time` array field

2. **Doctor profiles** need:
   - Add `consultationDuration` (default: 20)
   - Add `slotBuffer` (default: 0)
   - Add `breakTimes` array (default: [])

---

## 🐛 Troubleshooting

**Problem:** "Slot shows available but booking fails"
- **Solution:** Another user may have booked it simultaneously. The system validates at booking time to prevent conflicts.

**Problem:** "No slots showing for doctor"
- **Solution:** Check if doctor has set working hours (`timings` field) and status is "approved".

**Problem:** "Cannot book appointment"
- **Solution:** Verify duration is 10-35 minutes and date is not in the past.

---

## 📚 Additional Resources

- See [API_DOCUMENTATION.md](./API_DOCUMENTATION.md) for complete API reference
- Check [README.md](./README.md) for general setup instructions
- Review `utils/appointmentUtils.js` for utility functions

---

## 🤝 Contributing

When adding new features:
1. Maintain the 10-35 minute duration constraint
2. Always check for conflicts before saving
3. Use the utility functions in `appointmentUtils.js`
4. Update API documentation
5. Add appropriate error messages

---

**Last Updated:** December 2024
