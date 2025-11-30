const Issue = require('../models/Issue');
const User = require('../models/User');
const { PAGINATION, VALIDATION_LIMITS } = require('../constants/issueConstants');

// sanitize input
const sanitizeInput = (str, maxLength) => {
  if (!str) return '';
  return str
    .trim()
    .replace(/<[^>]*>/g, '') // remove HTML tags
    .substring(0, maxLength);
};

const createIssue = async (req, res) => {
  try {
    let { title, description, priority, shiftId, shiftData } = req.body;
    const userId = req.user.id;

    if (!title || !description) {
      return res.status(400).json({ message: 'Title and description required' });
    }

    // sanitize inputs
    title = sanitizeInput(title, VALIDATION_LIMITS.TITLE_MAX_LENGTH);
    description = sanitizeInput(description, VALIDATION_LIMITS.DESCRIPTION_MAX_LENGTH);

    if (!title.trim() || !description.trim()) {
      return res.status(400).json({ message: 'Title and description cannot be empty' });
    }

    // validate priority
    const validPriorities = ['low', 'medium', 'high', 'urgent'];
    if (priority && !validPriorities.includes(priority)) {
      priority = 'medium';
    }

    const issue = new Issue({
      title,
      description,
      priority: priority || 'medium',
      createdBy: userId,
      isRead: false,
      shiftId: shiftId || null,
      shiftData: shiftData || null,
    });

    await issue.save();
    await issue.populate('createdBy', 'email');

    res.status(201).json(issue);
  } catch (err) {
    console.error('Create issue error:', err);
    res.status(500).json({ message: 'Failed to create issue' });
  }
};

const getIssues = async (req, res) => {
  try {
    const user = req.user;
    let query = {};

    // users only see their own issues
    if (user.role === 'user') {
      query.createdBy = user.id;
    }

    const { status, priority } = req.query;
    if (status) {
      query.status = status;
    }
    if (priority) {
      query.priority = priority;
    }

    // pagination
    const page = parseInt(req.query.page) || PAGINATION.DEFAULT_PAGE;
    const pageSize = Math.min(
      parseInt(req.query.pageSize) || PAGINATION.DEFAULT_PAGE_SIZE,
      PAGINATION.MAX_PAGE_SIZE
    );
    const skip = (page - 1) * pageSize;

    const totalCount = await Issue.countDocuments(query);

    const issues = await Issue.find(query)
      .populate('createdBy', 'email')
      .populate('assignedTo', 'email')
      .populate('resolvedBy', 'email')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(pageSize);

    const totalPages = Math.ceil(totalCount / pageSize);

    res.json({
      issues,
      pagination: {
        page,
        pageSize,
        totalCount,
        totalPages,
        hasNextPage: page < totalPages,
        hasPrevPage: page > 1,
      },
    });
  } catch (err) {
    console.error('Get issues error:', err);
    res.status(500).json({ message: 'Failed to fetch issues' });
  }
};

const getIssueById = async (req, res) => {
  try {
    const { id } = req.params;
    const user = req.user;

    const issue = await Issue.findById(id)
      .populate('createdBy', 'email')
      .populate('assignedTo', 'email')
      .populate('resolvedBy', 'email');

    if (!issue) {
      return res.status(404).json({ message: 'Issue not found' });
    }

    // users can only view their own issues
    if (user.role === 'user' && issue.createdBy._id.toString() !== user.id) {
      return res.status(403).json({ message: 'Access denied' });
    }

    // mark as read if admin viewing
    if (user.role === 'admin' && !issue.isRead) {
      issue.isRead = true;
      await issue.save();
    }

    res.json(issue);
  } catch (err) {
    console.error('Get issue error:', err);
    res.status(500).json({ message: 'Failed to fetch issue' });
  }
};

const updateIssue = async (req, res) => {
  try {
    const { id } = req.params;
    const { status, priority, adminNotes, assignedTo, adminResponse, correctedShiftData } = req.body;
    const user = req.user;

    // admin only
    if (user.role !== 'admin') {
      return res.status(403).json({ message: 'Admin only' });
    }

    const issue = await Issue.findById(id);
    if (!issue) {
      return res.status(404).json({ message: 'Issue not found' });
    }

    if (status) {
      issue.status = status;
      // set resolved info if closing
      if ((status === 'resolved' || status === 'closed') && !issue.resolvedBy) {
        issue.resolvedBy = user.id;
        issue.resolvedAt = new Date();
      }
    }
    if (priority) {
      issue.priority = priority;
    }
    if (adminNotes !== undefined) {
      issue.adminNotes = sanitizeInput(adminNotes, VALIDATION_LIMITS.ADMIN_NOTES_MAX_LENGTH);
    }
    if (adminResponse !== undefined) {
      issue.adminResponse = sanitizeInput(adminResponse, VALIDATION_LIMITS.ADMIN_RESPONSE_MAX_LENGTH);
    }
    if (correctedShiftData) {
      issue.correctedShiftData = correctedShiftData;
    }
    if (assignedTo) {
      issue.assignedTo = assignedTo;
    }

    await issue.save();
    await issue.populate('createdBy', 'email');
    await issue.populate('assignedTo', 'email');
    await issue.populate('resolvedBy', 'email');

    res.json(issue);
  } catch (err) {
    console.error('Update issue error:', err);
    res.status(500).json({ message: 'Failed to update issue' });
  }
};

const getUnreadCount = async (req, res) => {
  try {
    const user = req.user;

    // admin only
    if (user.role !== 'admin') {
      return res.status(403).json({ message: 'Access denied' });
    }

    // count unread active issues
    const count = await Issue.countDocuments({ 
      isRead: false, 
      status: { $in: ['open', 'in-progress'] } 
    });
    res.json({ count });
  } catch (err) {
    console.error('Get unread count error:', err);
    res.status(500).json({ message: 'Failed to fetch unread count' });
  }
};

const markAsRead = async (req, res) => {
  try {
    const { id } = req.params;
    const user = req.user;

    // admin only
    if (user.role !== 'admin') {
      return res.status(403).json({ message: 'Access denied' });
    }

    const issue = await Issue.findById(id);
    if (!issue) {
      return res.status(404).json({ message: 'Issue not found' });
    }

    issue.isRead = true;
    await issue.save();

    res.json({ message: 'Issue marked as read' });
  } catch (err) {
    console.error('Mark as read error:', err);
    res.status(500).json({ message: 'Failed to mark as read' });
  }
};

const deleteIssue = async (req, res) => {
  try {
    const { id } = req.params;
    const user = req.user;

    // admin only
    if (user.role !== 'admin') {
      return res.status(403).json({ message: 'Admin only' });
    }

    await Issue.findByIdAndDelete(id);
    res.json({ message: 'Issue deleted' });
  } catch (err) {
    console.error('Delete issue error:', err);
    res.status(500).json({ message: 'Failed to delete issue' });
  }
};

module.exports = {
  createIssue,
  getIssues,
  getIssueById,
  updateIssue,
  getUnreadCount,
  markAsRead,
  deleteIssue,
};
