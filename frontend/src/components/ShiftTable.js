import React from 'react';
import Button from './Button';

const ShiftTable = ({ shifts, onDelete, isAdmin, onReportIssue, onEdit }) => {
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  if (shifts.length === 0) {
    return (
      <div className="px-6 py-12 text-center">
        <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
        </svg>
        <h3 className="mt-2 text-sm font-medium text-gray-900">No shifts found</h3>
        <p className="mt-1 text-sm text-gray-500">Try adjusting your filters or create a new shift.</p>
      </div>
    );
  }

  return (
    <div className="overflow-x-auto">
      <table className="min-w-full divide-y divide-gray-200">
        <thead className="bg-gray-50">
          <tr>
            <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
              Date
            </th>
            <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
              Employee
            </th>
            <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
              Code
            </th>
            <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
              Department
            </th>
            <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
              Start Time
            </th>
            <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
              End Time
            </th>
            <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
              Duration
            </th>
            <th className="px-6 py-4 text-center text-xs font-semibold text-gray-700 uppercase tracking-wider">
              Actions
            </th>
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-gray-200">
            {shifts.map((shift) => {
              const employee = shift.employeeId;
              const [startH, startM] = shift.startTime.split(':').map(Number);
              const [endH, endM] = shift.endTime.split(':').map(Number);
              const startMinutes = startH * 60 + startM;
              const endMinutes = endH * 60 + endM;
              const durationHours = ((endMinutes - startMinutes) / 60).toFixed(1);

              return (
                <tr key={shift._id} className="hover:bg-blue-50 transition-colors duration-150">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900">{formatDate(shift.date)}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900">{employee?.name || 'N/A'}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                      {employee?.employeeCode || 'N/A'}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                      {employee?.department || 'N/A'}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900 font-mono">{shift.startTime}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900 font-mono">{shift.endTime}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-green-100 text-green-800">
                      {durationHours} hrs
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-center">
                    <div className="flex items-center justify-center gap-1.5">
                      {!isAdmin && (
                        <button
                          onClick={() => onReportIssue(shift)}
                          className="inline-flex items-center px-2.5 py-1.5 border border-gray-300 shadow-sm text-xs font-medium rounded text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                          title="Report Issue"
                        >
                          ⚠️
                        </button>
                      )}
                      {isAdmin && (
                        <>
                          <button
                            onClick={() => onEdit(shift)}
                            className="inline-flex items-center px-2.5 py-1.5 border border-blue-300 shadow-sm text-xs font-medium rounded text-blue-700 bg-blue-50 hover:bg-blue-100 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                            title="Edit Shift"
                          >
                            ✏️
                          </button>
                          <button
                            onClick={() => onDelete(shift._id)}
                            className="inline-flex items-center px-2.5 py-1.5 border border-red-300 shadow-sm text-xs font-medium rounded text-red-700 bg-red-50 hover:bg-red-100 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
                            title="Delete Shift"
                          >
                            🗑️
                          </button>
                        </>
                      )}
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
  );
};

export default ShiftTable;
