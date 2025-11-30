const Shift = require('../models/Shift');
const Employee = require('../models/Employee');
const { validateShiftRules } = require('../services/shiftService');

const createShift = async (req, res) => {
  try {
    const { employeeId, date, startTime, endTime } = req.body;

    if (!employeeId || !date || !startTime || !endTime) {
      return res.status(400).json({ message: 'All fields required' });
    }

    const emp = await Employee.findById(employeeId);
    if (!emp) {
      return res.status(404).json({ message: 'Employee not found' });
    }

    // parse date - handle YYYY-MM-DD format
    let shiftDate;
    if (typeof date === 'string') {
      const parts = date.split('-');
      if (parts.length === 3) {
        shiftDate = new Date(parseInt(parts[0]), parseInt(parts[1]) - 1, parseInt(parts[2]));
        if (isNaN(shiftDate.getTime())) {
          return res.status(400).json({ message: 'Invalid date' });
        }
      } else {
        shiftDate = new Date(date);
        if (isNaN(shiftDate.getTime())) {
          return res.status(400).json({ message: 'Invalid date' });
        }
      }
    } else {
      shiftDate = new Date(date);
      if (isNaN(shiftDate.getTime())) {
        return res.status(400).json({ message: 'Invalid date' });
      }
    }

    // validate rules
    const validation = await validateShiftRules(employeeId, shiftDate, startTime, endTime);
    if (!validation.isValid) {
      return res.status(400).json({ 
        message: 'Validation failed',
        errors: validation.errors 
      });
    }

    const shift = new Shift({
      employeeId,
      date: shiftDate,
      startTime,
      endTime,
    });

    await shift.save();
    await shift.populate('employeeId', 'name employeeCode department');

    res.status(201).json(shift);
  } catch (err) {
    console.error('Create shift error:', err);
    if (err.name === 'ValidationError') {
      return res.status(400).json({ message: err.message });
    }
    res.status(500).json({ message: 'Failed to create shift' });
  }
};

const getShifts = async (req, res) => {
  try {
    const { 
      employeeId: employee, 
      date, 
      startDate,
      endDate,
      department, 
      sortBy, 
      sortOrder,
      month,
      year,
      page = 1,
      limit = 10
    } = req.query;
    const user = req.user;
    
    const pageNum = parseInt(page);
    const limitNum = parseInt(limit);
    const skip = (pageNum - 1) * limitNum;

    let query = {};

    // users only see their own shifts
    if (user.role === 'user' && user.employeeId) {
      query.employeeId = user.employeeId;
    } else if (employee) {
      query.employeeId = employee;
    }

    // helper to parse date strings
    const parseDate = (dateStr) => {
      if (typeof dateStr === 'string') {
        const parts = dateStr.split('-');
        if (parts.length === 3) {
          return new Date(parseInt(parts[0]), parseInt(parts[1]) - 1, parseInt(parts[2]));
        }
      }
      return new Date(dateStr);
    };

    // date range filter
    if (startDate && endDate) {
      const start = parseDate(startDate);
      start.setHours(0, 0, 0, 0);
      const end = parseDate(endDate);
      end.setHours(23, 59, 59, 999);
      
      const dayAfterEnd = new Date(end);
      dayAfterEnd.setDate(dayAfterEnd.getDate() + 1);
      dayAfterEnd.setHours(0, 0, 0, 0);
      
      query.date = {
        $gte: start,
        $lt: dayAfterEnd,
      };
    } else if (startDate) {
      const start = parseDate(startDate);
      start.setHours(0, 0, 0, 0);
      query.date = { $gte: start };
    } else if (endDate) {
      const end = parseDate(endDate);
      end.setHours(23, 59, 59, 999);
      query.date = { $lte: end };
    } else if (date) {
      let parsedDate;
      if (typeof date === 'string') {
        const parts = date.split('-');
        if (parts.length === 3) {
          parsedDate = new Date(parseInt(parts[0]), parseInt(parts[1]) - 1, parseInt(parts[2]));
        } else {
          parsedDate = new Date(date);
        }
      } else {
        parsedDate = new Date(date);
      }
      
      if (!isNaN(parsedDate.getTime())) {
        const dateStart = new Date(parsedDate);
        dateStart.setHours(0, 0, 0, 0);
        const dateEnd = new Date(parsedDate);
        dateEnd.setHours(23, 59, 59, 999);
        query.date = {
          $gte: dateStart,
          $lte: dateEnd,
        };
      }
    }

    // month/year filter
    if (!date && !startDate && !endDate && month) {
      const monthNum = parseInt(month) - 1;
      const yearNum = year ? parseInt(year) : new Date().getFullYear();
      const monthStart = new Date(yearNum, monthNum, 1);
      monthStart.setHours(0, 0, 0, 0);
      const monthEnd = new Date(yearNum, monthNum + 1, 0);
      monthEnd.setHours(23, 59, 59, 999);
      query.date = {
        $gte: monthStart,
        $lte: monthEnd,
      };
    }

    const totalShifts = await Shift.countDocuments(query);
    
    let shifts = await Shift.find(query)
      .populate('employeeId', 'name employeeCode department')
      .sort({ date: -1, startTime: 1 })
      .skip(skip)
      .limit(limitNum);

    // filter by department if needed
    if (department && shifts.length > 0) {
      shifts = shifts.filter(shift => 
        shift.employeeId && shift.employeeId.department === department
      );
    }

    // sorting
    if (sortBy) {
      const order = sortOrder === 'asc' ? 1 : -1;
      shifts.sort((a, b) => {
        switch (sortBy) {
          case 'date':
            return (new Date(a.date) - new Date(b.date)) * order;
          case 'employee':
            const nameA = a.employeeId?.name || '';
            const nameB = b.employeeId?.name || '';
            return nameA.localeCompare(nameB) * order;
          case 'department':
            const deptA = a.employeeId?.department || '';
            const deptB = b.employeeId?.department || '';
            return deptA.localeCompare(deptB) * order;
          case 'startTime':
            return a.startTime.localeCompare(b.startTime) * order;
          case 'duration':
            const [startHA, startMA] = a.startTime.split(':').map(Number);
            const [endHA, endMA] = a.endTime.split(':').map(Number);
            const [startHB, startMB] = b.startTime.split(':').map(Number);
            const [endHB, endMB] = b.endTime.split(':').map(Number);
            const durationA = (endHA * 60 + endMA) - (startHA * 60 + startMA);
            const durationB = (endHB * 60 + endMB) - (startHB * 60 + startMB);
            return (durationA - durationB) * order;
          default:
            return 0;
        }
      });
    }

    res.json({
      shifts,
      pagination: {
        currentPage: pageNum,
        totalPages: Math.ceil(totalShifts / limitNum),
        totalShifts,
        limit: limitNum,
        hasNextPage: pageNum < Math.ceil(totalShifts / limitNum),
        hasPrevPage: pageNum > 1,
      },
    });
  } catch (err) {
    console.error('Get shifts error:', err);
    res.status(500).json({ message: 'Failed to fetch shifts' });
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

    // users can only delete their own shifts
    if (user.role === 'user') {
      if (!user.employeeId || shift.employeeId._id.toString() !== user.employeeId.toString()) {
        return res.status(403).json({ message: 'Can only delete your own shifts' });
      }
    }

    await Shift.findByIdAndDelete(id);
    res.json({ message: 'Shift deleted' });
  } catch (err) {
    console.error('Delete shift error:', err);
    res.status(500).json({ message: 'Failed to delete shift' });
  }
};

const getWorkingHours = async (req, res) => {
  try {
    const user = req.user;
    const { startDate, endDate } = req.query;

    let query = {};

    if (user.role === 'user' && user.employeeId) {
      query.employeeId = user.employeeId;
    } else if (req.query.employeeId) {
      query.employeeId = req.query.employeeId;
    }

    // date range filter
    if (startDate && endDate) {
      const start = new Date(startDate);
      start.setHours(0, 0, 0, 0);
      const end = new Date(endDate);
      end.setHours(23, 59, 59, 999);
      query.date = {
        $gte: start,
        $lte: end,
      };
    } else if (startDate) {
      const start = new Date(startDate);
      start.setHours(0, 0, 0, 0);
      query.date = { $gte: start };
    } else if (endDate) {
      const end = new Date(endDate);
      end.setHours(23, 59, 59, 999);
      query.date = { $lte: end };
    }

    const shifts = await Shift.find(query)
      .populate('employeeId', 'name employeeCode department')
      .sort({ date: 1, startTime: 1 });

    // calculate hours
    let totalHours = 0;
    const shiftDetails = shifts.map(shift => {
      const [startH, startM] = shift.startTime.split(':').map(Number);
      const [endH, endM] = shift.endTime.split(':').map(Number);
      const startMinutes = startH * 60 + startM;
      const endMinutes = endH * 60 + endM;
      const duration = (endMinutes - startMinutes) / 60;
      totalHours += duration;

      return {
        ...shift.toObject(),
        duration,
      };
    });

    res.json({
      shifts: shiftDetails,
      totalShifts: shifts.length,
      totalHours: parseFloat(totalHours.toFixed(2)),
      averageHoursPerShift: shifts.length > 0 ? parseFloat((totalHours / shifts.length).toFixed(2)) : 0,
    });
  } catch (err) {
    console.error('Get working hours error:', err);
    res.status(500).json({ message: 'Failed to fetch working hours' });
  }
};

const updateShift = async (req, res) => {
  try {
    const { id } = req.params;
    const { employeeId, startTime, endTime, date } = req.body;
    const user = req.user;

    // admin only
    if (user.role !== 'admin') {
      return res.status(403).json({ message: 'Admin only' });
    }

    const shift = await Shift.findById(id);
    if (!shift) {
      return res.status(404).json({ message: 'Shift not found' });
    }

    if (employeeId) {
      const emp = await Employee.findById(employeeId);
      if (!emp) {
        return res.status(404).json({ message: 'Employee not found' });
      }
      shift.employeeId = employeeId;
    }

    if (startTime) shift.startTime = startTime;
    if (endTime) shift.endTime = endTime;
    
    let parsedDate = null;
    if (date) {
      if (typeof date === 'string') {
        const parts = date.split('-');
        if (parts.length === 3) {
          parsedDate = new Date(parseInt(parts[0]), parseInt(parts[1]) - 1, parseInt(parts[2]));
        } else {
          parsedDate = new Date(date);
        }
      } else {
        parsedDate = new Date(date);
      }
      shift.date = parsedDate;
    }

    // validate if times changed
    if (startTime || endTime) {
      const finalStartTime = startTime || shift.startTime;
      const finalEndTime = endTime || shift.endTime;
      const finalDate = parsedDate || shift.date;

      const validation = await validateShiftRules(
        shift.employeeId,
        finalDate,
        finalStartTime,
        finalEndTime,
        shift._id.toString()
      );

      if (!validation.isValid) {
        return res.status(400).json({
          message: 'Validation failed',
          errors: validation.errors,
        });
      }
    }

    await shift.save();
    await shift.populate('employeeId', 'name employeeCode department');

    res.json(shift);
  } catch (err) {
    console.error('Update shift error:', err);
    res.status(500).json({ message: 'Failed to update shift' });
  }
};

module.exports = {
  createShift,
  getShifts,
  deleteShift,
  getWorkingHours,
  updateShift,
};
