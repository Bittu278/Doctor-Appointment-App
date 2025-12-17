const moment = require('moment');

/**
 * Validates if duration is within acceptable range (10-35 minutes)
 */
const validateDuration = (duration) => {
  return duration >= 10 && duration <= 35;
};

/**
 * Converts time string (HH:mm) to minutes since midnight
 */
const timeToMinutes = (timeStr) => {
  const [hours, minutes] = timeStr.split(':').map(Number);
  return hours * 60 + minutes;
};

/**
 * Converts minutes since midnight back to time string (HH:mm)
 */
const minutesToTime = (minutes) => {
  const hours = Math.floor(minutes / 60);
  const mins = minutes % 60;
  return `${String(hours).padStart(2, '0')}:${String(mins).padStart(2, '0')}`;
};

/**
 * Checks if two time ranges overlap
 */
const doTimesOverlap = (start1, end1, start2, end2) => {
  const s1 = timeToMinutes(start1);
  const e1 = timeToMinutes(end1);
  const s2 = timeToMinutes(start2);
  const e2 = timeToMinutes(end2);
  
  return s1 < e2 && s2 < e1;
};

/**
 * Generates available time slots for a doctor on a specific date
 */
const generateTimeSlots = (workingHours, existingAppointments, consultationDuration, breakTimes = [], slotBuffer = 0) => {
  if (!workingHours || workingHours.length < 2) {
    return [];
  }

  const [startTime, endTime] = workingHours;
  let currentMinutes = timeToMinutes(startTime);
  const endMinutes = timeToMinutes(endTime);
  const slots = [];

  while (currentMinutes + consultationDuration <= endMinutes) {
    const slotStart = minutesToTime(currentMinutes);
    const slotEnd = minutesToTime(currentMinutes + consultationDuration);
    
    // Check if slot overlaps with any existing appointment
    const hasConflict = existingAppointments.some(apt => 
      doTimesOverlap(slotStart, slotEnd, apt.startTime, apt.endTime)
    );

    // Check if slot overlaps with break times
    const inBreakTime = breakTimes.some(breakTime => 
      doTimesOverlap(slotStart, slotEnd, breakTime.startTime, breakTime.endTime)
    );

    if (!hasConflict && !inBreakTime) {
      slots.push({
        startTime: slotStart,
        endTime: slotEnd,
        duration: consultationDuration,
        available: true
      });
    }

    // Move to next slot (consultation duration + buffer)
    currentMinutes += consultationDuration + slotBuffer;
  }

  return slots;
};

/**
 * Checks if a specific time slot is available
 */
const isSlotAvailable = (requestedStartTime, requestedEndTime, existingAppointments, workingHours, breakTimes = []) => {
  if (!workingHours || workingHours.length < 2) {
    return { available: false, reason: 'Doctor working hours not configured' };
  }

  const [workStart, workEnd] = workingHours;
  const reqStart = timeToMinutes(requestedStartTime);
  const reqEnd = timeToMinutes(requestedEndTime);
  const wStart = timeToMinutes(workStart);
  const wEnd = timeToMinutes(workEnd);

  // Check if within working hours
  if (reqStart < wStart || reqEnd > wEnd) {
    return { available: false, reason: 'Outside doctor working hours' };
  }

  // Check duration
  const duration = reqEnd - reqStart;
  if (!validateDuration(duration)) {
    return { available: false, reason: 'Duration must be between 10-35 minutes' };
  }

  // Check for conflicts with existing appointments
  const hasConflict = existingAppointments.some(apt => {
    // Only check approved and pending appointments
    if (apt.status === 'cancelled' || apt.status === 'rejected') {
      return false;
    }
    return doTimesOverlap(requestedStartTime, requestedEndTime, apt.startTime, apt.endTime);
  });

  if (hasConflict) {
    return { available: false, reason: 'Time slot conflicts with existing appointment' };
  }

  // Check for conflicts with break times
  const inBreakTime = breakTimes.some(breakTime => 
    doTimesOverlap(requestedStartTime, requestedEndTime, breakTime.startTime, breakTime.endTime)
  );

  if (inBreakTime) {
    return { available: false, reason: 'Time slot falls during doctor break time' };
  }

  return { available: true, reason: 'Slot is available' };
};

/**
 * Calculates end time based on start time and duration
 */
const calculateEndTime = (startTime, duration) => {
  const startMinutes = timeToMinutes(startTime);
  const endMinutes = startMinutes + duration;
  return minutesToTime(endMinutes);
};

/**
 * Gets day of week from date string
 */
const getDayOfWeek = (dateStr) => {
  // dateStr format: YYYY-MM-DD
  return moment(dateStr).format('dddd');
};

/**
 * Filters break times for a specific day
 */
const getBreakTimesForDay = (breakTimes, dateStr) => {
  const dayOfWeek = getDayOfWeek(dateStr);
  return breakTimes.filter(bt => 
    !bt.days || bt.days.length === 0 || bt.days.includes(dayOfWeek)
  );
};

/**
 * Formats appointment data for response
 */
const formatAppointmentResponse = (appointment) => {
  return {
    id: appointment._id,
    patientName: appointment.userInfo?.name || 'N/A',
    doctorName: appointment.doctorInfo ? 
      `${appointment.doctorInfo.firstName} ${appointment.doctorInfo.lastName}` : 'N/A',
    date: appointment.date,
    startTime: appointment.startTime,
    endTime: appointment.endTime,
    duration: appointment.duration,
    status: appointment.status,
    reason: appointment.reason,
    notes: appointment.notes,
    createdAt: appointment.createdAt,
  };
};

/**
 * Validates appointment date (not in the past)
 */
const validateAppointmentDate = (dateStr) => {
  const appointmentDate = moment(dateStr, 'YYYY-MM-DD');
  const today = moment().startOf('day');
  
  if (!appointmentDate.isValid()) {
    return { valid: false, reason: 'Invalid date format. Use YYYY-MM-DD' };
  }
  
  if (appointmentDate.isBefore(today)) {
    return { valid: false, reason: 'Cannot book appointment in the past' };
  }
  
  return { valid: true };
};

module.exports = {
  validateDuration,
  timeToMinutes,
  minutesToTime,
  doTimesOverlap,
  generateTimeSlots,
  isSlotAvailable,
  calculateEndTime,
  getDayOfWeek,
  getBreakTimesForDay,
  formatAppointmentResponse,
  validateAppointmentDate
};
