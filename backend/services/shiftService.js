const Shift = require('../models/Shift');

/**
 * Convert time string (HH:mm) to minutes since midnight
 */
const timeToMinutes = (timeStr) => {
  const [hours, minutes] = timeStr.split(':').map(Number);
  return hours * 60 + minutes;
};

/**
 * Check if two time ranges overlap
 */
const doTimesOverlap = (start1, end1, start2, end2) => {
  const start1Min = timeToMinutes(start1);
  const end1Min = timeToMinutes(end1);
  const start2Min = timeToMinutes(start2);
  const end2Min = timeToMinutes(end2);

  return start1Min < end2Min && start2Min < end1Min;
};

/**
 * Calculate duration in hours
 */
const calculateDuration = (startTime, endTime) => {
  const startMin = timeToMinutes(startTime);
  const endMin = timeToMinutes(endTime);
  return (endMin - startMin) / 60;
};

/**
 * Validate shift business rules
 */
const validateShiftRules = async (employeeId, date, startTime, endTime, excludeShiftId = null, isAdmin = false) => {
  const errors = [];

  // Rule 0: Admin cannot create shifts for past dates (only future dates allowed)
  if (isAdmin) {
    const shiftDate = new Date(date);
    shiftDate.setHours(0, 0, 0, 0);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    if (shiftDate < today) {
      errors.push('Cannot create shifts for past dates. Only future dates are allowed.');
    }
  }

  // Rule 1: Minimum shift duration = 4 hours
  const duration = calculateDuration(startTime, endTime);
  if (duration < 4) {
    errors.push('Shift duration must be at least 4 hours');
  }

  // Rule 2: No overlapping shifts
  // Normalize date to start of day for comparison
  const dateStart = new Date(date);
  dateStart.setHours(0, 0, 0, 0);
  const dateEnd = new Date(date);
  dateEnd.setHours(23, 59, 59, 999);

  const existingShifts = await Shift.find({
    employeeId,
    date: {
      $gte: dateStart,
      $lte: dateEnd,
    },
  });

  // Filter out the current shift if updating
  const shiftsToCheck = excludeShiftId
    ? existingShifts.filter(shift => shift._id.toString() !== excludeShiftId)
    : existingShifts;

  for (const existingShift of shiftsToCheck) {
    // Check if dates are the same day
    const existingDate = new Date(existingShift.date);
    const newDate = new Date(date);
    
    if (
      existingDate.getFullYear() === newDate.getFullYear() &&
      existingDate.getMonth() === newDate.getMonth() &&
      existingDate.getDate() === newDate.getDate()
    ) {
      // Same day, check for overlap
      if (doTimesOverlap(startTime, endTime, existingShift.startTime, existingShift.endTime)) {
        errors.push('Shift overlaps with an existing shift on the same date');
        break;
      }
    }
  }

  return {
    isValid: errors.length === 0,
    errors,
  };
};

module.exports = {
  validateShiftRules,
  calculateDuration,
  doTimesOverlap,
};

