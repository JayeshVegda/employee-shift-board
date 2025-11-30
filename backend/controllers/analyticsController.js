const Shift = require('../models/Shift');
const Employee = require('../models/Employee');
const Issue = require('../models/Issue');

// Helper function to calculate duration in hours
const calculateDuration = (startTime, endTime) => {
  const startMin = parseInt(startTime.split(':')[0]) * 60 + parseInt(startTime.split(':')[1]);
  const endMin = parseInt(endTime.split(':')[0]) * 60 + parseInt(endTime.split(':')[1]);
  return (endMin - startMin) / 60;
};

// Helper function to format date as YYYY-MM-DD
const formatDate = (date) => {
  return date.toISOString().split('T')[0];
};

const getDashboardAnalytics = async (req, res) => {
  try {
    const { startDate, endDate } = req.query;
    
    // Set date range - default to last 30 days if not provided
    let dateFilter = {};
    if (startDate || endDate) {
      dateFilter.date = {};
      if (startDate) {
        const start = new Date(startDate);
        start.setHours(0, 0, 0, 0);
        dateFilter.date.$gte = start;
      }
      if (endDate) {
        const end = new Date(endDate);
        end.setHours(23, 59, 59, 999);
        dateFilter.date.$lte = end;
      }
    } else {
      // Default to last 30 days
      const end = new Date();
      const start = new Date();
      start.setDate(start.getDate() - 30);
      dateFilter.date = {
        $gte: start,
        $lte: end,
      };
    }

    // Get all shifts within date range
    const allShifts = await Shift.find(dateFilter)
      .populate('employeeId', 'name employeeCode department')
      .sort({ date: 1 });

    // Calculate totals
    let totalHours = 0;
    allShifts.forEach(shift => {
      totalHours += calculateDuration(shift.startTime, shift.endTime);
    });

    const totalEmployees = await Employee.countDocuments();
    const totalShifts = allShifts.length;
    const avgHoursPerShift = totalShifts > 0 ? (totalHours / totalShifts).toFixed(2) : 0;
    const avgHoursPerEmployee = totalEmployees > 0 ? (totalHours / totalEmployees).toFixed(2) : 0;

    // Daily trends (last 30 days or date range)
    const dailyTrends = {};
    allShifts.forEach(shift => {
      const dateKey = formatDate(new Date(shift.date));
      if (!dailyTrends[dateKey]) {
        dailyTrends[dateKey] = 0;
      }
      dailyTrends[dateKey] += calculateDuration(shift.startTime, shift.endTime);
    });

    const daily = Object.keys(dailyTrends)
      .sort()
      .map(date => ({
        date,
        hours: Math.round(dailyTrends[date] * 10) / 10,
      }));

    // Weekly trends (group by week)
    const weeklyTrends = {};
    allShifts.forEach(shift => {
      const date = new Date(shift.date);
      const weekStart = new Date(date);
      weekStart.setDate(date.getDate() - date.getDay()); // Start of week (Sunday)
      const weekKey = formatDate(weekStart);
      
      if (!weeklyTrends[weekKey]) {
        weeklyTrends[weekKey] = 0;
      }
      weeklyTrends[weekKey] += calculateDuration(shift.startTime, shift.endTime);
    });

    const weekly = Object.keys(weeklyTrends)
      .sort()
      .map(date => ({
        date,
        hours: Math.round(weeklyTrends[date] * 10) / 10,
      }));

    // Department performance
    const deptStats = {};
    allShifts.forEach(shift => {
      const dept = shift.employeeId?.department || 'Unknown';
      if (!deptStats[dept]) {
        deptStats[dept] = {
          department: dept,
          totalHours: 0,
          totalShifts: 0,
          employees: new Set(),
        };
      }
      deptStats[dept].totalHours += calculateDuration(shift.startTime, shift.endTime);
      deptStats[dept].totalShifts += 1;
      deptStats[dept].employees.add(shift.employeeId?._id?.toString());
    });

    const departmentPerformance = Object.values(deptStats).map(dept => ({
      department: dept.department,
      totalHours: Math.round(dept.totalHours * 10) / 10,
      totalShifts: dept.totalShifts,
      employeeCount: dept.employees.size,
      avgHoursPerEmployee: dept.employees.size > 0 
        ? (dept.totalHours / dept.employees.size).toFixed(2) 
        : 0,
    }));

    // Employee performance
    const empStats = {};
    allShifts.forEach(shift => {
      const empId = shift.employeeId?._id?.toString();
      if (!empId) return;

      if (!empStats[empId]) {
        empStats[empId] = {
          employeeId: empId,
          name: shift.employeeId?.name || 'Unknown',
          employeeCode: shift.employeeId?.employeeCode || 'N/A',
          department: shift.employeeId?.department || 'Unknown',
          totalHours: 0,
          totalShifts: 0,
          daysWorked: new Set(),
        };
      }
      empStats[empId].totalHours += calculateDuration(shift.startTime, shift.endTime);
      empStats[empId].totalShifts += 1;
      empStats[empId].daysWorked.add(formatDate(new Date(shift.date)));
    });

    const employeePerformance = Object.values(empStats).map(emp => ({
      employeeId: emp.employeeId,
      name: emp.name,
      employeeCode: emp.employeeCode,
      department: emp.department,
      totalHours: Math.round(emp.totalHours * 10) / 10,
      totalShifts: emp.totalShifts,
      daysWorked: emp.daysWorked.size,
      avgHoursPerShift: emp.totalShifts > 0 
        ? (emp.totalHours / emp.totalShifts).toFixed(2) 
        : 0,
    }));

    // Issues statistics - count pending/open as open
    const openIssues = await Issue.countDocuments({ 
      $or: [{ status: 'pending' }, { status: 'open' }] 
    });
    const resolvedIssues = await Issue.countDocuments({ status: 'resolved' });
    const closedIssues = await Issue.countDocuments({ status: 'closed' });

    res.json({
      summary: {
        totalEmployees,
        totalShifts,
        totalHours: Math.round(totalHours * 10) / 10,
        avgHoursPerShift: parseFloat(avgHoursPerShift),
        avgHoursPerEmployee: parseFloat(avgHoursPerEmployee),
      },
      trends: {
        daily,
        weekly,
      },
      departmentPerformance,
      issues: {
        open: openIssues,
        resolved: resolvedIssues,
        closed: closedIssues,
      },
      employeePerformance,
    });
  } catch (error) {
    console.error('Get dashboard analytics error:', error);
    res.status(500).json({ message: 'Server error fetching analytics' });
  }
};

module.exports = {
  getDashboardAnalytics,
};
