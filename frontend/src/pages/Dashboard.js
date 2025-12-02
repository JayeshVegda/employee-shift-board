import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getShifts, getEmployees, deleteShift, updateShift } from '../services/authService';
import ShiftForm from '../components/ShiftForm';
import AdvancedShiftForm from '../components/AdvancedShiftForm';
import ShiftTable from '../components/ShiftTable';
import AdminLayout from '../components/AdminLayout';
import Button from '../components/Button';
import Input from '../components/Input';

const Dashboard = () => {
  const [shifts, setShifts] = useState([]);
  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [filterEmployee, setFilterEmployee] = useState('');
  const [filterDepartment, setFilterDepartment] = useState('');
  const [filterStartDate, setFilterStartDate] = useState('');
  const [filterEndDate, setFilterEndDate] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [showAdvancedForm, setShowAdvancedForm] = useState(false);
  const [editingShift, setEditingShift] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize] = useState(25);
  const navigate = useNavigate();

  const user = JSON.parse(localStorage.getItem('user') || '{}');
  const isAdmin = user.role === 'admin';

  useEffect(() => {
    fetchShifts();
    if (isAdmin) {
      fetchEmployees();
    }
  }, [isAdmin, filterEmployee, filterDepartment, filterStartDate, filterEndDate, currentPage]);

  const fetchEmployees = async () => {
    try {
      const data = await getEmployees();
      setEmployees(data);
    } catch (err) {
      console.error('Error fetching employees:', err);
    }
  };

  const fetchShifts = async () => {
    setLoading(true);
    setError('');
    try {
      const data = await getShifts(filterEmployee || null, filterStartDate || null);
      setShifts(data);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to fetch shifts');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this shift?')) {
      return;
    }

    try {
      await deleteShift(id);
      fetchShifts();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to delete shift');
    }
  };

  const handleEdit = (shift) => {
    setEditingShift(shift);
    setShowForm(true);
  };

  const handleShiftCreated = () => {
    setShowForm(false);
    setShowAdvancedForm(false);
    setEditingShift(null);
    fetchShifts();
  };

  const handleUpdateShift = async (id, shiftData) => {
    try {
      await updateShift(id, shiftData);
      setShowForm(false);
      setEditingShift(null);
      fetchShifts();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to update shift');
    }
  };

  // Filter shifts by department and date range
  const filteredShifts = shifts.filter(shift => {
    if (filterDepartment && shift.employeeId?.department !== filterDepartment) {
      return false;
    }
    if (filterEndDate) {
      const shiftDate = new Date(shift.date);
      const endDate = new Date(filterEndDate);
      if (shiftDate > endDate) return false;
    }
    return true;
  });

  // Pagination
  const totalPages = Math.ceil(filteredShifts.length / pageSize);
  const paginatedShifts = filteredShifts.slice(
    (currentPage - 1) * pageSize,
    currentPage * pageSize
  );

  // Get unique departments
  const departments = [...new Set(employees.map(emp => emp.department))].sort();

  return (
    <AdminLayout 
      title="Shifts" 
      subtitle="View, filter, and manage employee shifts"
      currentPath="/dashboard"
    >
      {error && (
        <div className="mb-6 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
          {error}
        </div>
      )}

      {/* Action Buttons */}
      {isAdmin && (
        <div className="mb-6 flex gap-3">
          <Button onClick={() => { setShowForm(true); setEditingShift(null); }}>
            Create Single Shift
          </Button>
          <Button onClick={() => { setShowAdvancedForm(true); }} variant="secondary">
            Advanced Options (Bulk/Recurring/Template)
          </Button>
        </div>
      )}

      {/* Filters Bar */}
      <div className="bg-white shadow rounded-lg p-6 mb-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Filters</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {isAdmin && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Filter by Employee
              </label>
              <select
                value={filterEmployee}
                onChange={(e) => { setFilterEmployee(e.target.value); setCurrentPage(1); }}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">All Employees</option>
                {employees.map((emp) => (
                  <option key={emp._id} value={emp._id}>
                    {emp.name} ({emp.employeeCode})
                  </option>
                ))}
              </select>
            </div>
          )}
          {isAdmin && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Filter by Department
              </label>
              <select
                value={filterDepartment}
                onChange={(e) => { setFilterDepartment(e.target.value); setCurrentPage(1); }}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">All Departments</option>
                {departments.map((dept) => (
                  <option key={dept} value={dept}>{dept}</option>
                ))}
              </select>
            </div>
          )}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Start Date
            </label>
            <input
              type="date"
              value={filterStartDate}
              onChange={(e) => { setFilterStartDate(e.target.value); setCurrentPage(1); }}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              End Date
            </label>
            <input
              type="date"
              value={filterEndDate}
              onChange={(e) => { setFilterEndDate(e.target.value); setCurrentPage(1); }}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>
        {(filterEmployee || filterDepartment || filterStartDate || filterEndDate) && (
          <div className="mt-4">
            <Button 
              variant="secondary" 
              onClick={() => {
                setFilterEmployee('');
                setFilterDepartment('');
                setFilterStartDate('');
                setFilterEndDate('');
                setCurrentPage(1);
              }}
            >
              Clear All Filters
            </Button>
          </div>
        )}
      </div>

      {/* Shift Forms Modals */}
      {showForm && isAdmin && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-black bg-opacity-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full p-6">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold">{editingShift ? 'Edit Shift' : 'Create New Shift'}</h3>
              <button onClick={() => { setShowForm(false); setEditingShift(null); }} className="text-gray-400 hover:text-gray-500">
                ✕
              </button>
            </div>
            <ShiftForm
              employees={employees}
              shift={editingShift}
              onSuccess={handleShiftCreated}
              onCancel={() => { setShowForm(false); setEditingShift(null); }}
              onUpdate={handleUpdateShift}
            />
          </div>
        </div>
      )}

      {showAdvancedForm && isAdmin && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-black bg-opacity-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full p-6 max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold">Advanced Shift Creation</h3>
              <button onClick={() => setShowAdvancedForm(false)} className="text-gray-400 hover:text-gray-500">
                ✕
              </button>
            </div>
            <AdvancedShiftForm
              employees={employees}
              onSuccess={handleShiftCreated}
              onCancel={() => setShowAdvancedForm(false)}
            />
          </div>
        </div>
      )}

      {/* Shift Table */}
      {loading ? (
        <div className="bg-white shadow rounded-lg p-8 text-center">
          <p className="text-gray-600">Loading shifts...</p>
        </div>
      ) : (
        <>
          <ShiftTable 
            shifts={paginatedShifts} 
            onDelete={handleDelete} 
            onEdit={handleEdit}
            isAdmin={isAdmin} 
          />
          {totalPages > 1 && (
            <div className="mt-6">
              <div className="bg-white px-4 py-3 flex items-center justify-between border-t border-gray-200 sm:px-6">
                <div className="flex-1 flex justify-between sm:hidden">
                  <button
                    onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                    disabled={currentPage === 1}
                    className="relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50"
                  >
                    Previous
                  </button>
                  <button
                    onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                    disabled={currentPage === totalPages}
                    className="ml-3 relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50"
                  >
                    Next
                  </button>
                </div>
                <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
                  <div>
                    <p className="text-sm text-gray-700">
                      Showing <span className="font-medium">{(currentPage - 1) * pageSize + 1}</span> to{' '}
                      <span className="font-medium">{Math.min(currentPage * pageSize, filteredShifts.length)}</span> of{' '}
                      <span className="font-medium">{filteredShifts.length}</span> results
                    </p>
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                      disabled={currentPage === 1}
                      className="relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50"
                    >
                      Previous
                    </button>
                    <span className="relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white">
                      Page {currentPage} of {totalPages}
                    </span>
                    <button
                      onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                      disabled={currentPage === totalPages}
                      className="relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50"
                    >
                      Next
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}
        </>
      )}
    </AdminLayout>
  );
};

export default Dashboard;
