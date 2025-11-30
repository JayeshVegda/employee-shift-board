const Shift = require('../models/Shift');
const Employee = require('../models/Employee');
const Issue = require('../models/Issue');

// dashboard analytics for admin
const getDashboardAnalytics = async (req, res) => {
  try {
    const user = req.user;

    if (user.role !== 'admin') {
      return res.status(403).json({ message: 'Access denied' });
    }

    const { startDate, endDate } = req.query;
    let dateFilter = {};

    if (startDate && endDate) {
      const start = new Date(startDate);
      start.setHours(0, 0, 0, 0);
      const end = new Date(endDate);
      end.setHours(23, 59, 59, 999);
      dateFilter.date = { $gte: start, $lte: end };
    } else {
      // default to last 30 days
      const end = new Date();
      const start = new Date();
      start.setDate(start.getDate() - 30);
      start.setHours(0, 0, 0, 0);
      end.setHours(23, 59, 59, 999);
      dateFilter.date = { $gte: start, $lte: end };
    }

    const shifts = await Shift.find(dateFilter)
      .populate('employeeId', 'name employeeCode department');

    const totalEmployees = await Employee.countDocuments();
    const totalShifts = shifts.length;

    // calculate total hours
    let totalHours = 0;
    shifts.forEach(shift => {
      const [startH, startM] = shift.startTime.split(':').map(Number);
      const [endH, endM] = shift.endTime.split(':').map(Number);
      const startMinutes = startH * 60 + startM;
      const endMinutes = endH * 60 + endM;
      totalHours += (endMinutes - startMinutes) / 60;
    });

    const avgHoursPerShift = totalShifts > 0 ? (totalHours / totalShifts).toFixed(2) : 0;
    const avgHoursPerEmployee = totalEmployees > 0 ? (totalHours / totalEmployees).toFixed(2) : 0;

    // employee stats
    const employeeStats = {};
    shifts.forEach(shift => {
      const empId = shift.employeeId._id.toString();
      if (!employeeStats[empId]) {
        employeeStats[empId] = {
          employeeId: empId,
          name: shift.employeeId.name,
          employeeCode: shift.employeeId.employeeCode,
          department: shift.employeeId.department,
          totalShifts: 0,
          totalHours: 0,
          daysWorked: new Set(),
        };
      }
      employeeStats[empId].totalShifts++;
      const [startH, startM] = shift.startTime.split(':').map(Number);
      const [endH, endM] = shift.endTime.split(':').map(Number);
      const startMinutes = startH * 60 + startM;
      const endMinutes = endH * 60 + endM;
      const hours = (endMinutes - startMinutes) / 60;
      employeeStats[empId].totalHours += hours;
      employeeStats[empId].daysWorked.add(shift.date.toISOString().split('T')[0]);
    });

    const employeePerformance = Object.values(employeeStats).map(stat => ({
      ...stat,
      daysWorked: stat.daysWorked.size,
      avgHoursPerShift: stat.totalShifts > 0 ? (stat.totalHours / stat.totalShifts).toFixed(2) : 0,
    })).sort((a, b) => b.totalHours - a.totalHours);

    // department stats
    const departmentStats = {};
    shifts.forEach(shift => {
      const dept = shift.employeeId.department || 'Unknown';
      if (!departmentStats[dept]) {
        departmentStats[dept] = {
          department: dept,
          totalShifts: 0,
          totalHours: 0,
          employeeCount: new Set(),
        };
      }
      departmentStats[dept].totalShifts++;
      const [startH, startM] = shift.startTime.split(':').map(Number);
      const [endH, endM] = shift.endTime.split(':').map(Number);
      const startMinutes = startH * 60 + startM;
      const endMinutes = endH * 60 + endM;
      const hours = (endMinutes - startMinutes) / 60;
      departmentStats[dept].totalHours += hours;
      departmentStats[dept].employeeCount.add(shift.employeeId._id.toString());
    });

    const departmentPerformance = Object.values(departmentStats).map(stat => ({
      ...stat,
      employeeCount: stat.employeeCount.size,
      avgHoursPerEmployee: stat.employeeCount.size > 0 ? (stat.totalHours / stat.employeeCount.size).toFixed(2) : 0,
    }));

    // daily hours trend
    const dailyHours = {};
    shifts.forEach(shift => {
      const dateKey = shift.date.toISOString().split('T')[0];
      if (!dailyHours[dateKey]) {
        dailyHours[dateKey] = 0;
      }
      const [startH, startM] = shift.startTime.split(':').map(Number);
      const [endH, endM] = shift.endTime.split(':').map(Number);
      const startMinutes = startH * 60 + startM;
      const endMinutes = endH * 60 + endM;
      dailyHours[dateKey] += (endMinutes - startMinutes) / 60;
    });

    // weekly hours trend
    const weeklyHours = {};
    shifts.forEach(shift => {
      const date = new Date(shift.date);
      const weekStart = new Date(date);
      weekStart.setDate(date.getDate() - date.getDay());
      const weekKey = weekStart.toISOString().split('T')[0];
      if (!weeklyHours[weekKey]) {
        weeklyHours[weekKey] = 0;
      }
      const [startH, startM] = shift.startTime.split(':').map(Number);
      const [endH, endM] = shift.endTime.split(':').map(Number);
      const startMinutes = startH * 60 + startM;
      const endMinutes = endH * 60 + endM;
      weeklyHours[weekKey] += (endMinutes - startMinutes) / 60;
    });

    // monthly hours trend
    const monthlyHours = {};
    shifts.forEach(shift => {
      const date = new Date(shift.date);
      const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
      if (!monthlyHours[monthKey]) {
        monthlyHours[monthKey] = 0;
      }
      const [startH, startM] = shift.startTime.split(':').map(Number);
      const [endH, endM] = shift.endTime.split(':').map(Number);
      const startMinutes = startH * 60 + startM;
      const endMinutes = endH * 60 + endM;
      monthlyHours[monthKey] += (endMinutes - startMinutes) / 60;
    });

    // issue stats
    const openIssues = await Issue.countDocuments({ status: { $in: ['open', 'in-progress'] } });
    const resolvedIssues = await Issue.countDocuments({ status: 'resolved' });
    const closedIssues = await Issue.countDocuments({ status: 'closed' });

    res.json({
      summary: {
        totalEmployees,
        totalShifts,
        totalHours: totalHours.toFixed(2),
        avgHoursPerShift,
        avgHoursPerEmployee,
      },
      employeePerformance,
      departmentPerformance,
      trends: {
        daily: Object.entries(dailyHours).map(([date, hours]) => ({ date, hours: hours.toFixed(2) })).sort((a, b) => a.date.localeCompare(b.date)),
        weekly: Object.entries(weeklyHours).map(([date, hours]) => ({ date, hours: hours.toFixed(2) })).sort((a, b) => a.date.localeCompare(b.date)),
        monthly: Object.entries(monthlyHours).map(([date, hours]) => ({ date, hours: hours.toFixed(2) })).sort((a, b) => a.date.localeCompare(b.date)),
      },
      issues: {
        open: openIssues,
        resolved: resolvedIssues,
        closed: closedIssues,
        total: openIssues + resolvedIssues + closedIssues,
      },
    });
  } catch (err) {
    console.error('Get dashboard analytics error:', err);
    res.status(500).json({ message: 'Failed to fetch analytics' });
  }
};

module.exports = {
  getDashboardAnalytics,
};
