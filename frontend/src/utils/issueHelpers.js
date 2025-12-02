// Issue Management Helper Functions

// Status color mapping
export const getStatusColor = (status) => {
  const statusColors = {
    'open': 'bg-blue-100 text-blue-800',
    'in-progress': 'bg-yellow-100 text-yellow-800',
    'resolved': 'bg-green-100 text-green-800',
    'closed': 'bg-gray-100 text-gray-800',
  };
  return statusColors[status] || 'bg-gray-100 text-gray-800';
};

// Priority color mapping
export const getPriorityColor = (priority) => {
  const priorityColors = {
    'urgent': 'bg-red-100 text-red-800',
    'high': 'bg-orange-100 text-orange-800',
    'medium': 'bg-yellow-100 text-yellow-800',
    'low': 'bg-green-100 text-green-800',
  };
  return priorityColors[priority] || 'bg-gray-100 text-gray-800';
};

// Format date helper
export const formatIssueDate = (dateString) => {
  if (!dateString) return 'N/A';
  const date = new Date(dateString);
  return date.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
};

// Calculate duration from time strings
export const calculateDuration = (startTime, endTime) => {
  if (!startTime || !endTime) return 'N/A';
  try {
    const [startH, startM] = startTime.split(':').map(Number);
    const [endH, endM] = endTime.split(':').map(Number);
    const startMinutes = startH * 60 + startM;
    const endMinutes = endH * 60 + endM;
    return ((endMinutes - startMinutes) / 60).toFixed(1) + ' hrs';
  } catch {
    return 'N/A';
  }
};

// Truncate text helper
export const truncateText = (text, maxLength = 50) => {
  if (!text) return 'No description';
  if (text.length <= maxLength) return text;
  return text.substring(0, maxLength) + '...';
};






