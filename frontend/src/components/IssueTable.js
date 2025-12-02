import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import Button from './Button';
import { getStatusColor, getPriorityColor, formatIssueDate, calculateDuration, truncateText } from '../utils/issueHelpers';

const IssueTable = ({ issues, onEdit, onDelete, onResolve }) => {
  const [expandedNote, setExpandedNote] = useState(null);

  if (issues.length === 0) {
    return (
      <div className="bg-white shadow rounded-lg p-8 text-center">
        <p className="text-gray-600">No issues found.</p>
      </div>
    );
  }

  return (
    <div className="bg-white shadow rounded-lg overflow-hidden">
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Status
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Priority
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Date
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Employee
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Employee Code
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Department
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Start Time
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                End Time
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Duration
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Issue Note
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {issues.map((issue) => {
              const shiftData = issue.shiftData;
              // Show issue even if shiftData is missing (for issues not related to shifts)
              if (!shiftData) {
                return (
                  <tr 
                    key={issue._id} 
                    className={`hover:bg-gray-50 cursor-pointer ${!issue.isRead ? 'bg-blue-50' : ''}`}
                    onClick={() => window.location.href = `/issues/${issue._id}`}
                  >
                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                      <span className={`text-xs font-medium px-2 py-1 rounded ${getStatusColor(issue.status)}`}>
                        {issue.status.toUpperCase()}
                      </span>
                      {!issue.isRead && (
                        <span className="ml-2 bg-blue-500 text-white text-xs px-1.5 py-0.5 rounded-full">
                          New
                        </span>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                      <span className={`text-xs font-medium px-2 py-1 rounded ${getPriorityColor(issue.priority)}`}>
                        {issue.priority.toUpperCase()}
                      </span>
                    </td>
                    <td colSpan="7" className="px-6 py-4 text-sm text-gray-500">
                      <Link 
                        to={`/issues/${issue._id}`}
                        className="text-blue-600 hover:text-blue-800 font-medium"
                      >
                        {issue.title}
                      </Link>
                      <span className="ml-2">- {issue.description?.substring(0, 50)}...</span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm" onClick={(e) => e.stopPropagation()}>
                      <div className="flex gap-2">
                        <Link to={`/issues/${issue._id}`} onClick={(e) => e.stopPropagation()}>
                          <Button variant="secondary" className="text-xs">
                            View
                          </Button>
                        </Link>
                        <Button
                          variant="secondary"
                          onClick={(e) => {
                            e.stopPropagation();
                            onEdit(issue);
                          }}
                          className="text-xs"
                        >
                          Edit
                        </Button>
                        {issue.status !== 'closed' && (
                          <Button
                            onClick={(e) => {
                              e.stopPropagation();
                              onResolve(issue);
                            }}
                            className="text-xs"
                          >
                            Resolve
                          </Button>
                        )}
                        <Button
                          variant="danger"
                          onClick={(e) => {
                            e.stopPropagation();
                            onDelete(issue._id);
                          }}
                          className="text-xs"
                        >
                          Delete
                        </Button>
                      </div>
                    </td>
                  </tr>
                );
              }

              const isExpanded = expandedNote === issue._id;
              const noteText = issue.description || 'No description';

              return (
                <tr 
                  key={issue._id} 
                  className={`hover:bg-gray-50 cursor-pointer ${!issue.isRead ? 'bg-blue-50' : ''}`}
                  onClick={() => window.location.href = `/issues/${issue._id}`}
                >
                  <td className="px-6 py-4 whitespace-nowrap text-sm">
                    <span className={`text-xs font-medium px-2 py-1 rounded ${getStatusColor(issue.status)}`}>
                      {issue.status.toUpperCase()}
                    </span>
                    {!issue.isRead && (
                      <span className="ml-2 bg-blue-500 text-white text-xs px-1.5 py-0.5 rounded-full">
                        New
                      </span>
                    )}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm">
                    <span className={`text-xs font-medium px-2 py-1 rounded ${getPriorityColor(issue.priority)}`}>
                      {issue.priority.toUpperCase()}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {formatIssueDate(shiftData.date)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                    {shiftData.employeeName || 'N/A'}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {shiftData.employeeCode || 'N/A'}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {shiftData.department || 'N/A'}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {shiftData.startTime || 'N/A'}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {shiftData.endTime || 'N/A'}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {calculateDuration(shiftData.startTime, shiftData.endTime)}
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-700 max-w-xs">
                    <div>
                      {isExpanded ? (
                        <div>
                          <p className="whitespace-pre-wrap">{noteText}</p>
                          <button
                            onClick={() => setExpandedNote(null)}
                            className="text-blue-600 hover:text-blue-800 text-xs mt-1"
                          >
                            Show less
                          </button>
                        </div>
                      ) : (
                        <div>
                          <p>{truncateText(noteText)}</p>
                          {noteText.length > 50 && (
                            <button
                              onClick={() => setExpandedNote(issue._id)}
                              className="text-blue-600 hover:text-blue-800 text-xs mt-1"
                            >
                              Click to view full note
                            </button>
                          )}
                        </div>
                      )}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm" onClick={(e) => e.stopPropagation()}>
                    <div className="flex gap-2">
                      <Link to={`/issues/${issue._id}`} onClick={(e) => e.stopPropagation()}>
                        <Button variant="secondary" className="text-xs">
                          View
                        </Button>
                      </Link>
                      <Button
                        variant="secondary"
                        onClick={(e) => {
                          e.stopPropagation();
                          onEdit(issue);
                        }}
                        className="text-xs"
                      >
                        Edit
                      </Button>
                      {issue.status !== 'closed' && (
                        <Button
                          onClick={(e) => {
                            e.stopPropagation();
                            onResolve(issue);
                          }}
                          className="text-xs"
                        >
                          Resolve
                        </Button>
                      )}
                      <Button
                        variant="danger"
                        onClick={(e) => {
                          e.stopPropagation();
                          onDelete(issue._id);
                        }}
                        className="text-xs"
                      >
                        Delete
                      </Button>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default IssueTable;

