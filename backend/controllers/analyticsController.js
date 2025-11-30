const Shift = require('../models/Shift');
const Employee = require('../models/Employee');
const Issue = require('../models/Issue');

const getDashboardAnalytics = async (req, res) => {
  try {
    // Get total counts
    const totalEmployees = await Employee.countDocuments();
    const totalShifts = await Shift.countDocuments();
    const totalIssues = await Issue.countDocuments();
    const pendingIssues = await Issue.countDocuments({ status: 'pending' });

    // Get shifts for current month
    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59);

    const monthlyShifts = await Shift.find({
      date: {
        $gte: startOfMonth,
        $lte: endOfMonth,
      },
    }).populate('employeeId', 'name employeeCode department');

    // Calculate total working hours for the month
    let totalWorkingHours = 0;
    monthlyShifts.forEach(shift => {
      const startMin = parseInt(shift.startTime.split(':')[0]) * 60 + parseInt(shift.startTime.split(':')[1]);
      const endMin = parseInt(shift.endTime.split(':')[0]) * 60 + parseInt(shift.endTime.split(':')[1]);
      const duration = (endMin - startMin) / 60;
      totalWorkingHours += duration;
    });

    // Get issues by priority
    const issuesByPriority = await Issue.aggregate([
      {
        $group: {
          _id: '$priority',
          count: { $sum: 1 },
        },
      },
    ]);

    // Get recent issues
    const recentIssues = await Issue.find()
      .populate('createdBy', 'email role')
      .sort({ createdAt: -1 })
      .limit(5);

    res.json({
      summary: {
        totalEmployees,
        totalShifts,
        totalIssues,
        pendingIssues,
        monthlyWorkingHours: Math.round(totalWorkingHours * 10) / 10,
        monthlyShiftCount: monthlyShifts.length,
      },
      issuesByPriority: issuesByPriority.reduce((acc, item) => {
        acc[item._id] = item.count;
        return acc;
      }, {}),
      recentIssues,
    });
  } catch (error) {
    console.error('Get dashboard analytics error:', error);
    res.status(500).json({ message: 'Server error fetching analytics' });
  }
};

module.exports = {
  getDashboardAnalytics,
};
