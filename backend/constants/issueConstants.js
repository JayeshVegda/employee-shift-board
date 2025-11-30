// Issue Management System Constants

// Status values (using numbers for faster comparison and sorting)
const ISSUE_STATUS = {
  OPEN: 0,
  IN_PROGRESS: 1,
  RESOLVED: 2,
  CLOSED: 3,
};

// Status labels for display
const ISSUE_STATUS_LABELS = {
  [ISSUE_STATUS.OPEN]: 'open',
  [ISSUE_STATUS.IN_PROGRESS]: 'in-progress',
  [ISSUE_STATUS.RESOLVED]: 'resolved',
  [ISSUE_STATUS.CLOSED]: 'closed',
};

// Priority values (using numbers for faster comparison and sorting)
const ISSUE_PRIORITY = {
  LOW: 0,
  MEDIUM: 1,
  HIGH: 2,
  URGENT: 3,
};

// Priority labels for display
const ISSUE_PRIORITY_LABELS = {
  [ISSUE_PRIORITY.LOW]: 'low',
  [ISSUE_PRIORITY.MEDIUM]: 'medium',
  [ISSUE_PRIORITY.HIGH]: 'high',
  [ISSUE_PRIORITY.URGENT]: 'urgent',
};

// Status color mapping for UI
const STATUS_COLORS = {
  [ISSUE_STATUS.OPEN]: 'bg-blue-100 text-blue-800',
  [ISSUE_STATUS.IN_PROGRESS]: 'bg-yellow-100 text-yellow-800',
  [ISSUE_STATUS.RESOLVED]: 'bg-green-100 text-green-800',
  [ISSUE_STATUS.CLOSED]: 'bg-gray-100 text-gray-800',
};

// Priority color mapping for UI
const PRIORITY_COLORS = {
  [ISSUE_PRIORITY.LOW]: 'bg-green-100 text-green-800',
  [ISSUE_PRIORITY.MEDIUM]: 'bg-yellow-100 text-yellow-800',
  [ISSUE_PRIORITY.HIGH]: 'bg-orange-100 text-orange-800',
  [ISSUE_PRIORITY.URGENT]: 'bg-red-100 text-red-800',
};

// Active statuses (for unread count and filtering)
const ACTIVE_STATUSES = [ISSUE_STATUS.OPEN, ISSUE_STATUS.IN_PROGRESS];

// Solved statuses (for filtering)
const SOLVED_STATUSES = [ISSUE_STATUS.RESOLVED, ISSUE_STATUS.CLOSED];

// Default values
const DEFAULT_STATUS = ISSUE_STATUS.OPEN;
const DEFAULT_PRIORITY = ISSUE_PRIORITY.MEDIUM;

// Validation limits (can be overridden by environment variables)
const VALIDATION_LIMITS = {
  TITLE_MAX_LENGTH: parseInt(process.env.ISSUE_TITLE_MAX_LENGTH) || 200,
  DESCRIPTION_MAX_LENGTH: parseInt(process.env.ISSUE_DESCRIPTION_MAX_LENGTH) || 2000,
  ADMIN_NOTES_MAX_LENGTH: parseInt(process.env.ISSUE_ADMIN_NOTES_MAX_LENGTH) || 1000,
  ADMIN_RESPONSE_MAX_LENGTH: parseInt(process.env.ISSUE_ADMIN_RESPONSE_MAX_LENGTH) || 1000,
};

// Pagination defaults (can be overridden by environment variables)
const PAGINATION = {
  DEFAULT_PAGE: 1,
  DEFAULT_PAGE_SIZE: parseInt(process.env.ISSUE_PAGE_SIZE) || 25,
  MAX_PAGE_SIZE: parseInt(process.env.ISSUE_MAX_PAGE_SIZE) || 100,
};

// Polling intervals (in milliseconds, can be overridden by environment variables)
const POLLING_INTERVALS = {
  ISSUES_LIST: parseInt(process.env.ISSUE_POLLING_INTERVAL) || 30000, // 30 seconds default
  UNREAD_COUNT: parseInt(process.env.ISSUE_POLLING_INTERVAL) || 30000, // 30 seconds default
};

module.exports = {
  ISSUE_STATUS,
  ISSUE_STATUS_LABELS,
  ISSUE_PRIORITY,
  ISSUE_PRIORITY_LABELS,
  STATUS_COLORS,
  PRIORITY_COLORS,
  ACTIVE_STATUSES,
  SOLVED_STATUSES,
  DEFAULT_STATUS,
  DEFAULT_PRIORITY,
  VALIDATION_LIMITS,
  PAGINATION,
  POLLING_INTERVALS,
};

