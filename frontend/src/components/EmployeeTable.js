import React from 'react';
import Button from './Button';

const EmployeeTable = ({ employees, onEdit, onDelete }) => {
  if (employees.length === 0) {
    return (
      <div className="bg-white shadow rounded-lg p-8 text-center">
        <p className="text-gray-600">No employees found.</p>
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
                Name
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Employee Code
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Department
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {employees.map((emp) => (
              <tr key={emp._id} className="hover:bg-gray-50">
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                  {emp.name}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {emp.employeeCode}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {emp.department}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm">
                  <div className="flex gap-2">
                    <Button
                      variant="secondary"
                      onClick={() => onEdit(emp)}
                      className="text-xs"
                    >
                      Edit
                    </Button>
                    <Button
                      variant="danger"
                      onClick={() => onDelete(emp._id)}
                      className="text-xs"
                    >
                      Delete
                    </Button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default EmployeeTable;


