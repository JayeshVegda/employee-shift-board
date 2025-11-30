const Shift = require('../models/Shift');
const Employee = require('../models/Employee');
const { validateShiftRules } = require('../services/shiftService');

const createShift = async (req, res) => {
  try {
    const { employeeId, date, startTime, endTime } = req.body;

    // Validate required fields
    if (!employeeId || !date || !startTime || !endTime) {
      return res.status(400).json({ message: 'All fields are required' });
    }

    // Check if employee exists
    const employee = await Employee.findById(employeeId);
    if (!employee) {
      return res.status(404).json({ message: 'Employee not found' });
    }

    // Validate business rules
    const validation = await validateShiftRules(employeeId, date, startTime, endTime);
    if (!validation.isValid) {
      return res.status(400).json({ 
        message: 'Validation failed',
        errors: validation.errors 
      });
    }

    const shift = new Shift({
      employeeId,
      date,
      startTime,
      endTime,
    });

    await shift.save();
    await shift.populate('employeeId', 'name employeeCode department');

    res.status(201).json(shift);
  } catch (error) {
    console.error('Create shift error:', error);
    if (error.name === 'ValidationError') {
      return res.status(400).json({ message: error.message });
    }
    res.status(500).json({ message: 'Server error creating shift' });
  }
};

const getShifts = async (req, res) => {
  try {
    const { employee, date } = req.query;
    const user = req.user;

    let query = {};

    // Normal users can only see their own shifts
    if (user.role === 'user' && user.employeeId) {
      query.employeeId = user.employeeId;
    } else if (employee) {
      // Admin can filter by employee
      query.employeeId = employee;
    }

    // Filter by date if provided
    if (date) {
      const dateStart = new Date(date);
      dateStart.setHours(0, 0, 0, 0);
      const dateEnd = new Date(date);
      dateEnd.setHours(23, 59, 59, 999);
      query.date = {
        $gte: dateStart,
        $lte: dateEnd,
      };
    }

    const shifts = await Shift.find(query)
      .populate('employeeId', 'name employeeCode department')
      .sort({ date: -1, startTime: 1 });

    res.json(shifts);
  } catch (error) {
    console.error('Get shifts error:', error);
    res.status(500).json({ message: 'Server error fetching shifts' });
  }
};

const deleteShift = async (req, res) => {
  try {
    const { id } = req.params;
    const user = req.user;

    const shift = await Shift.findById(id).populate('employeeId');

    if (!shift) {
      return res.status(404).json({ message: 'Shift not found' });
    }

    // Normal users can only delete their own shifts
    if (user.role === 'user') {
      if (!user.employeeId || shift.employeeId._id.toString() !== user.employeeId.toString()) {
        return res.status(403).json({ message: 'Access denied. You can only delete your own shifts.' });
      }
    }

    await Shift.findByIdAndDelete(id);
    res.json({ message: 'Shift deleted successfully' });
  } catch (error) {
    console.error('Delete shift error:', error);
    res.status(500).json({ message: 'Server error deleting shift' });
  }
};

const getWorkingHours = async (req, res) => {
  try {
    const { startDate, endDate, employee } = req.query;
    const user = req.user;
    let query = {};

    // Normal users can only see their own working hours
    if (user.role === 'user' && user.employeeId) {
      query.employeeId = user.employeeId;
    } else if (employee) {
      // Admin can filter by employee
      query.employeeId = employee;
    }

    // Filter by date range if provided
    if (startDate || endDate) {
      query.date = {};
      if (startDate) {
        const dateStart = new Date(startDate);
        dateStart.setHours(0, 0, 0, 0);
        query.date.$gte = dateStart;
      }
      if (endDate) {
        const dateEnd = new Date(endDate);
        dateEnd.setHours(23, 59, 59, 999);
        query.date.$lte = dateEnd;
      }
    }

    const shifts = await Shift.find(query)
      .populate('employeeId', 'name employeeCode department')
      .sort({ date: -1 });

    // Calculate working hours per employee
    const workingHoursMap = {};
    
    shifts.forEach(shift => {
      const employeeId = shift.employeeId._id.toString();
      const employeeName = shift.employeeId.name;
      const employeeCode = shift.employeeId.employeeCode;
      
      if (!workingHoursMap[employeeId]) {
        workingHoursMap[employeeId] = {
          employeeId: employeeId,
          name: employeeName,
          employeeCode: employeeCode,
          totalHours: 0,
          shiftCount: 0,
          shifts: []
        };
      }

      // Calculate duration
      const startMin = parseInt(shift.startTime.split(':')[0]) * 60 + parseInt(shift.startTime.split(':')[1]);
      const endMin = parseInt(shift.endTime.split(':')[0]) * 60 + parseInt(shift.endTime.split(':')[1]);
      const duration = (endMin - startMin) / 60;

      workingHoursMap[employeeId].totalHours += duration;
      workingHoursMap[employeeId].shiftCount += 1;
      workingHoursMap[employeeId].shifts.push({
        date: shift.date,
        startTime: shift.startTime,
        endTime: shift.endTime,
        duration: duration
      });
    });

    const workingHours = Object.values(workingHoursMap);
    res.json(workingHours);
  } catch (error) {
    console.error('Get working hours error:', error);
    res.status(500).json({ message: 'Server error fetching working hours' });
  }
};

const updateShift = async (req, res) => {
  try {
    const { id } = req.params;
    const { employeeId, date, startTime, endTime } = req.body;

    const shift = await Shift.findById(id);
    if (!shift) {
      return res.status(404).json({ message: 'Shift not found' });
    }

    // Validate required fields if provided
    if (date && startTime && endTime) {
      // Check if employee exists (if employeeId is being changed)
      if (employeeId && employeeId !== shift.employeeId.toString()) {
        const employee = await Employee.findById(employeeId);
        if (!employee) {
          return res.status(404).json({ message: 'Employee not found' });
        }
      }

      // Validate business rules
      const validation = await validateShiftRules(
        employeeId || shift.employeeId,
        date,
        startTime,
        endTime,
        id // Exclude current shift from overlap check
      );
      
      if (!validation.isValid) {
        return res.status(400).json({ 
          message: 'Validation failed',
          errors: validation.errors 
        });
      }
    }

    // Update fields
    if (employeeId) shift.employeeId = employeeId;
    if (date) shift.date = date;
    if (startTime) shift.startTime = startTime;
    if (endTime) shift.endTime = endTime;

    await shift.save();
    await shift.populate('employeeId', 'name employeeCode department');
    
    res.json(shift);
  } catch (error) {
    console.error('Update shift error:', error);
    if (error.name === 'ValidationError') {
      return res.status(400).json({ message: error.message });
    }
    res.status(500).json({ message: 'Server error updating shift' });
  }
};

module.exports = {
  createShift,
  getShifts,
  deleteShift,
  getWorkingHours,
  updateShift,
};

