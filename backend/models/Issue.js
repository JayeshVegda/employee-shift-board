const mongoose = require('mongoose');

const issueSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, 'Issue title is required'],
    trim: true,
    maxlength: [200, 'Title cannot exceed 200 characters'],
  },
  description: {
    type: String,
    required: [true, 'Issue description is required'],
    trim: true,
    maxlength: [2000, 'Description cannot exceed 2000 characters'],
  },
  status: {
    type: String,
    enum: ['open', 'in-progress', 'resolved', 'closed'],
    default: 'open',
    index: true,
  },
  priority: {
    type: String,
    enum: ['low', 'medium', 'high', 'urgent'],
    default: 'medium',
    index: true,
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true,
  },
  assignedTo: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    default: null,
  },
  resolvedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    default: null,
  },
  resolvedAt: {
    type: Date,
    default: null,
  },
  adminNotes: {
    type: String,
    default: '',
    trim: true,
    maxlength: [1000, 'Admin notes cannot exceed 1000 characters'],
  },
  isRead: {
    type: Boolean,
    default: false,
    index: true,
  },
  shiftId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Shift',
    default: null,
  },
  shiftData: {
    date: Date,
    employeeName: String,
    employeeCode: String,
    department: String,
    startTime: String,
    endTime: String,
  },
  adminResponse: {
    type: String,
    default: '',
    trim: true,
    maxlength: [1000, 'Admin response cannot exceed 1000 characters'],
  },
  correctedShiftData: {
    date: Date,
    startTime: String,
    endTime: String,
    duration: Number,
  },
}, {
  timestamps: true,
});

// indexes for common queries
issueSchema.index({ status: 1, isRead: 1 });
issueSchema.index({ createdBy: 1, status: 1 });
issueSchema.index({ createdAt: -1 });
issueSchema.index({ status: 1, createdAt: -1 });
issueSchema.index({ priority: 1, createdAt: -1 });

// text search index
issueSchema.index({ 
  title: 'text', 
  description: 'text',
  'shiftData.employeeName': 'text',
  'shiftData.employeeCode': 'text'
});

module.exports = mongoose.model('Issue', issueSchema);

