const Issue = require('../models/Issue');
const Shift = require('../models/Shift');

const createIssue = async (req, res) => {
  try {
    const { title, description, priority, shiftId, shiftData } = req.body;
    const userId = req.user._id;

    if (!title || !description) {
      return res.status(400).json({ message: 'Title and description are required' });
    }

    const issue = await Issue.create({
      title,
      description,
      priority: priority || 'medium',
      shiftId: shiftId || null,
      shiftData: shiftData || null,
      createdBy: userId,
    });

    await issue.populate('createdBy', 'email role');
    if (issue.shiftId) {
      await issue.populate('shiftId');
    }

    res.status(201).json(issue);
  } catch (error) {
    console.error('Create issue error:', error);
    if (error.name === 'ValidationError') {
      return res.status(400).json({ message: error.message });
    }
    res.status(500).json({ message: 'Server error creating issue' });
  }
};

const getIssues = async (req, res) => {
  try {
    const { status, priority, search, page = 1, limit = 25, showSolved = false } = req.query;
    const user = req.user;

    let query = {};

    // Normal users can only see their own issues
    if (user.role === 'user') {
      query.createdBy = user._id;
    }

    // Filter by status
    if (status) {
      query.status = status;
    } else if (!showSolved || showSolved === 'false') {
      query.status = 'pending';
    }

    // Filter by priority
    if (priority) {
      query.priority = priority;
    }

    // Search in title and description
    if (search) {
      query.$or = [
        { title: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } },
      ];
    }

    const pageNum = parseInt(page);
    const limitNum = parseInt(limit);
    const skip = (pageNum - 1) * limitNum;

    const issues = await Issue.find(query)
      .populate('createdBy', 'email role')
      .populate('shiftId')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limitNum);

    const totalCount = await Issue.countDocuments(query);

    res.json({
      issues,
      pagination: {
        totalCount,
        totalPages: Math.ceil(totalCount / limitNum),
        currentPage: pageNum,
        hasNextPage: pageNum * limitNum < totalCount,
        hasPrevPage: pageNum > 1,
      },
    });
  } catch (error) {
    console.error('Get issues error:', error);
    res.status(500).json({ message: 'Server error fetching issues' });
  }
};

const getIssueById = async (req, res) => {
  try {
    const { id } = req.params;
    const user = req.user;

    const issue = await Issue.findById(id)
      .populate('createdBy', 'email role')
      .populate('shiftId');

    if (!issue) {
      return res.status(404).json({ message: 'Issue not found' });
    }

    // Normal users can only see their own issues
    if (user.role === 'user' && issue.createdBy._id.toString() !== user._id.toString()) {
      return res.status(403).json({ message: 'Access denied' });
    }

    res.json(issue);
  } catch (error) {
    console.error('Get issue by ID error:', error);
    res.status(500).json({ message: 'Server error fetching issue' });
  }
};

const updateIssue = async (req, res) => {
  try {
    const { id } = req.params;
    const { adminResponse, status, correctedShiftData } = req.body;

    const issue = await Issue.findById(id);
    if (!issue) {
      return res.status(404).json({ message: 'Issue not found' });
    }

    // Update fields
    if (adminResponse !== undefined) issue.adminResponse = adminResponse;
    if (status) issue.status = status;
    if (correctedShiftData) issue.correctedShiftData = correctedShiftData;

    // If updating shift, update the actual shift record
    if (issue.shiftId && correctedShiftData && correctedShiftData.startTime && correctedShiftData.endTime) {
      const shift = await Shift.findById(issue.shiftId);
      if (shift) {
        shift.startTime = correctedShiftData.startTime;
        shift.endTime = correctedShiftData.endTime;
        await shift.save();
      }
    }

    await issue.save();
    await issue.populate('createdBy', 'email role');
    if (issue.shiftId) {
      await issue.populate('shiftId');
    }

    res.json(issue);
  } catch (error) {
    console.error('Update issue error:', error);
    res.status(500).json({ message: 'Server error updating issue' });
  }
};

const markAsRead = async (req, res) => {
  try {
    const { id } = req.params;

    const issue = await Issue.findById(id);
    if (!issue) {
      return res.status(404).json({ message: 'Issue not found' });
    }

    issue.isRead = true;
    await issue.save();

    res.json({ message: 'Issue marked as read', issue });
  } catch (error) {
    console.error('Mark as read error:', error);
    res.status(500).json({ message: 'Server error marking issue as read' });
  }
};

const getUnreadCount = async (req, res) => {
  try {
    const count = await Issue.countDocuments({ status: 'pending', isRead: false });
    res.json({ count });
  } catch (error) {
    console.error('Get unread count error:', error);
    res.status(500).json({ message: 'Server error fetching unread count' });
  }
};

const deleteIssue = async (req, res) => {
  try {
    const { id } = req.params;

    const issue = await Issue.findById(id);
    if (!issue) {
      return res.status(404).json({ message: 'Issue not found' });
    }

    await Issue.findByIdAndDelete(id);
    res.json({ message: 'Issue deleted successfully' });
  } catch (error) {
    console.error('Delete issue error:', error);
    res.status(500).json({ message: 'Server error deleting issue' });
  }
};

module.exports = {
  createIssue,
  getIssues,
  getIssueById,
  updateIssue,
  markAsRead,
  getUnreadCount,
  deleteIssue,
};
