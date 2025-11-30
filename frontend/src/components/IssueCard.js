import React from 'react';
import { Link } from 'react-router-dom';
import Button from './Button';

const IssueCard = ({ issue, onUpdate, isAdmin = false }) => {
  const getStatusColor = (status) => {
    switch (status) {
      case 'open':
        return 'bg-blue-100 text-blue-800';
      case 'in-progress':
        return 'bg-yellow-100 text-yellow-800';
      case 'resolved':
        return 'bg-green-100 text-green-800';
      case 'closed':
        return 'bg-gray-100 text-gray-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'urgent':
        return 'bg-red-100 text-red-800';
      case 'high':
        return 'bg-orange-100 text-orange-800';
      case 'medium':
        return 'bg-yellow-100 text-yellow-800';
      case 'low':
        return 'bg-green-100 text-green-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  return (
    <div className={`bg-white border rounded-lg p-4 hover:shadow-md transition-shadow ${
      !issue.isRead && isAdmin ? 'border-blue-500 bg-blue-50' : ''
    }`}>
      <div className="flex justify-between items-start mb-2">
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-1">
            <h3 className="font-semibold text-gray-900">{issue.title}</h3>
            {!issue.isRead && isAdmin && (
              <span className="bg-blue-500 text-white text-xs px-2 py-0.5 rounded-full">
                New
              </span>
            )}
          </div>
          <p className="text-sm text-gray-600 line-clamp-2">{issue.description}</p>
        </div>
      </div>

      <div className="flex flex-wrap items-center gap-2 mb-3">
        <span className={`text-xs font-medium px-2 py-1 rounded ${getStatusColor(issue.status)}`}>
          {issue.status.toUpperCase()}
        </span>
        <span className={`text-xs font-medium px-2 py-1 rounded ${getPriorityColor(issue.priority)}`}>
          {issue.priority.toUpperCase()}
        </span>
        <span className="text-xs text-gray-500">
          By: {issue.createdBy?.email || 'Unknown'}
        </span>
        <span className="text-xs text-gray-500">
          {formatDate(issue.createdAt)}
        </span>
      </div>

      <div className="flex gap-2">
        <Link
          to={`/issues/${issue._id}`}
          className="text-sm text-blue-600 hover:text-blue-800"
        >
          View Details
        </Link>
        {isAdmin && issue.status !== 'closed' && (
          <>
            {issue.status === 'open' && (
              <Button
                variant="secondary"
                onClick={() => onUpdate(issue._id, { status: 'in-progress' })}
                className="text-xs"
              >
                Start Working
              </Button>
            )}
            {issue.status === 'in-progress' && (
              <Button
                onClick={() => onUpdate(issue._id, { status: 'resolved' })}
                className="text-xs"
              >
                Mark Resolved
              </Button>
            )}
            {issue.status === 'resolved' && (
              <Button
                variant="secondary"
                onClick={() => onUpdate(issue._id, { status: 'closed' })}
                className="text-xs"
              >
                Close Issue
              </Button>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default IssueCard;


