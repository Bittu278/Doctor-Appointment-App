# 🚀 Quick Start Guide - Enhanced Appointment System

## What's New?

Your appointment system now has:
- ✅ **Zero conflicts** - No more double bookings
- ✅ **10-35 minute appointments** - Controlled duration
- ✅ **Real-time availability** - See open slots instantly
- ✅ **Smart scheduling** - Break times and buffers

---

## For Patients

### 1. View Available Slots

```bash
GET /api/v1/user/available-slots?doctorId=DOCTOR_ID&date=2024-12-20
Authorization: Bearer YOUR_TOKEN
```

**You'll see:**
```json
{
  "slots": [
    { "startTime": "09:00", "endTime": "09:20", "available": true },
    { "startTime": "09:20", "endTime": "09:40", "available": true },
    { "startTime": "10:00", "endTime": "10:20", "available": true }
  ]
}
```

### 2. Book Your Appointment

```bash
POST /api/v1/user/book-appointment
Authorization: Bearer YOUR_TOKEN
Content-Type: application/json

{
  "doctorId": "DOCTOR_ID",
  "userId": "YOUR_USER_ID",
  "date": "2024-12-20",
  "startTime": "10:00",
  "duration": 20,
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
    "startTime": "10:00",
    "endTime": "10:20",
    "status": "pending"
  }
}
```

### 3. Check Specific Slot

```bash
POST /api/v1/user/booking-availability
Authorization: Bearer YOUR_TOKEN

{
  "doctorId": "DOCTOR_ID",
  "date": "2024-12-20",
  "startTime": "10:00",
  "duration": 20
}
```

---

## For Doctors

### 1. Set Your Schedule

```bash
POST /api/v1/doctor/updateProfile
Authorization: Bearer YOUR_TOKEN

{
  "userId": "YOUR_USER_ID",
  "consultationDuration": 20,
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

**What this means:**
- Each consultation: **20 minutes**
- Buffer between patients: **5 minutes**
- Working hours: **9 AM to 5 PM**
- Lunch break: **1 PM to 2 PM** (weekdays)

### 2. View Today's Appointments

```bash
POST /api/v1/doctor/today-appointments
Authorization: Bearer YOUR_TOKEN

{
  "doctorId": "YOUR_DOCTOR_ID"
}
```

### 3. Approve/Reject Appointments

```bash
POST /api/v1/doctor/update-appointment-status
Authorization: Bearer YOUR_TOKEN

{
  "appointmentId": "APPOINTMENT_ID",
  "status": "approved",
  "notes": "Please arrive 10 minutes early"
}
```

**Status options:**
- `approved` - Confirm the appointment
- `rejected` - Decline the appointment
- `completed` - Mark as done
- `cancelled` - Cancel the appointment

---

## Testing Locally

### 1. Run the Tests

```bash
cd /home/user/webapp
node tests/appointmentUtils.test.js
```

You should see all tests passing! ✅

### 2. Start the Server

```bash
npm start
```

### 3. Test the API

Using curl or Postman, try:

```bash
# Get available slots
curl -X GET "http://localhost:8080/api/v1/user/available-slots?doctorId=DOCTOR_ID&date=2024-12-20" \
  -H "Authorization: Bearer YOUR_TOKEN"
```

---

## Common Scenarios

### Scenario 1: Patient Books 25-Minute Appointment

```javascript
{
  "startTime": "10:00",
  "duration": 25  // ✅ Valid (10-35 range)
}
```

### Scenario 2: Patient Tries to Book During Lunch

```javascript
{
  "startTime": "13:15",  // ❌ During lunch break
  "duration": 20
}
// Error: "Time slot falls during doctor break time"
```

### Scenario 3: Overlapping Appointment

```javascript
// Existing: 10:00-10:20
// New request: 10:10-10:30  // ❌ Overlaps
// Error: "Time slot conflicts with existing appointment"
```

### Scenario 4: Invalid Duration

```javascript
{
  "duration": 40  // ❌ Too long
}
// Error: "Duration must be between 10 and 35 minutes"
```

---

## Configuration Examples

### Busy Practice (15-min appointments)

```json
{
  "consultationDuration": 15,
  "slotBuffer": 0,
  "timings": ["08:00", "18:00"]
}
```
Result: **40 slots per day**

### Standard Practice (20-min appointments)

```json
{
  "consultationDuration": 20,
  "slotBuffer": 5,
  "timings": ["09:00", "17:00"]
}
```
Result: **19 slots per day** (with buffer)

### Specialized Practice (30-min appointments)

```json
{
  "consultationDuration": 30,
  "slotBuffer": 10,
  "timings": ["09:00", "16:00"]
}
```
Result: **10 slots per day** (longer consultations)

---

## Frontend Integration

### React Example - Fetch Slots

```jsx
import { useState, useEffect } from 'react';

function AvailableSlots({ doctorId, date }) {
  const [slots, setSlots] = useState([]);
  
  useEffect(() => {
    fetch(`/api/v1/user/available-slots?doctorId=${doctorId}&date=${date}`, {
      headers: { 'Authorization': `Bearer ${token}` }
    })
      .then(res => res.json())
      .then(data => setSlots(data.data.slots));
  }, [doctorId, date]);
  
  return (
    <div>
      {slots.map(slot => (
        <button key={slot.startTime} onClick={() => bookSlot(slot)}>
          {slot.startTime} - {slot.endTime}
        </button>
      ))}
    </div>
  );
}
```

### React Example - Book Appointment

```jsx
async function bookAppointment(slotData) {
  const response = await fetch('/api/v1/user/book-appointment', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    },
    body: JSON.stringify({
      doctorId: slotData.doctorId,
      userId: currentUser.id,
      date: selectedDate,
      startTime: slotData.startTime,
      duration: slotData.duration,
      userInfo: {
        name: currentUser.name,
        email: currentUser.email,
        phone: currentUser.phone
      },
      reason: appointmentReason
    })
  });
  
  const result = await response.json();
  
  if (result.success) {
    alert('Appointment booked!');
  } else {
    alert(`Error: ${result.message}`);
  }
}
```

---

## Troubleshooting

### "No slots available"
- Check doctor's working hours are set
- Verify doctor status is "approved"
- Check if date is in the future

### "Booking failed"
- Ensure duration is 10-35 minutes
- Check the slot hasn't been taken
- Verify you're within working hours

### "Outside working hours"
- Check doctor's `timings` field
- Ensure selected time is within range

---

## Key Benefits

### Prevents These Problems:
- ❌ Double bookings
- ❌ Scheduling conflicts
- ❌ Appointments outside working hours
- ❌ Too short or too long appointments
- ❌ Booking during breaks

### Provides These Features:
- ✅ Real-time availability
- ✅ Automatic conflict detection
- ✅ Flexible scheduling
- ✅ Buffer time support
- ✅ Break time management

---

## Next Steps

1. **Update your frontend** to use the new endpoints
2. **Configure doctor schedules** with break times
3. **Test the booking flow** end-to-end
4. **Monitor for conflicts** (there should be none!)

---

## Support

For detailed API documentation, see:
- [API_DOCUMENTATION.md](./API_DOCUMENTATION.md) - Complete API reference
- [APPOINTMENT_SYSTEM.md](./APPOINTMENT_SYSTEM.md) - System overview

---

**Happy Scheduling! 🎉**
