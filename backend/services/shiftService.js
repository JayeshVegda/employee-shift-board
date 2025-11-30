const Shift = require('../models/Shift');

// convert time string to minutes
const timeToMinutes = (timeStr) => {
  const [hours, minutes] = timeStr.split(':').map(Number);
  return hours * 60 + minutes;
};

// check if two time ranges overlap
const doTimesOverlap = (start1, end1, start2, end2) => {
  const start1Min = timeToMinutes(start1);
  const end1Min = timeToMinutes(end1);
  const start2Min = timeToMinutes(start2);
  const end2Min = timeToMinutes(end2);

  return start1Min < end2Min && start2Min < end1Min;
};

// calculate duration in hours
const calculateDuration = (startTime, endTime) => {
  const startMin = timeToMinutes(startTime);
  const endMin = timeToMinutes(endTime);
  return (endMin - startMin) / 60;
};

// validate shift rules
const validateShiftRules = async (employeeId, date, startTime, endTime, excludeShiftId = null) => {
  const errors = [];

  // minimum 4 hours
  const duration = calculateDuration(startTime, endTime);
  if (duration < 4) {
    errors.push('Shift must be at least 4 hours');
  }

  // check for overlaps
  const dateObj = new Date(date);
  const dateStart = new Date(dateObj);
  dateStart.setHours(0, 0, 0, 0);
  const dateEnd = new Date(dateObj);
  dateEnd.setHours(23, 59, 59, 999);

  const existingShifts = await Shift.find({
    employeeId,
    date: {
      $gte: dateStart,
      $lte: dateEnd,
    },
  });

  // exclude current shift if updating
  const shiftsToCheck = excludeShiftId
    ? existingShifts.filter(shift => shift._id.toString() !== excludeShiftId)
    : existingShifts;

  for (const existingShift of shiftsToCheck) {
    // check if same day
    const existingDate = new Date(existingShift.date);
    const newDate = new Date(date);
    
    if (
      existingDate.getFullYear() === newDate.getFullYear() &&
      existingDate.getMonth() === newDate.getMonth() &&
      existingDate.getDate() === newDate.getDate()
    ) {
      // same day, check overlap
      if (doTimesOverlap(startTime, endTime, existingShift.startTime, existingShift.endTime)) {
        errors.push('Shift overlaps with existing shift');
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
