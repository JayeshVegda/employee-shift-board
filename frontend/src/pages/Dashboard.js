import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getShifts, getEmployees, deleteShift, updateShift } from '../services/authService';
import ShiftForm from '../components/ShiftForm';
import AdvancedShiftForm from '../components/AdvancedShiftForm';
import ShiftTable from '../components/ShiftTable';
import AdminLayout from '../components/AdminLayout';
import EmployeeLayout from '../components/EmployeeLayout';
import Button from '../components/Button';
import Input from '../components/Input';
import Pagination from '../components/Pagination';

const Dashboard = () => {
  const [shifts, setShifts] = useState([]);
  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [filterEmployee, setFilterEmployee] = useState('');
  const [filterDepartment, setFilterDepartment] = useState('');
  const [filterStartDate, setFilterStartDate] = useState('');
  const [filterEndDate, setFilterEndDate] = useState('');
  const [filterStartTime, setFilterStartTime] = useState('');
  const [filterEndTime, setFilterEndTime] = useState('');
  const [sortBy, setSortBy] = useState('date'); // 'date', 'employee', 'department', 'startTime'
  const [sortOrder, setSortOrder] = useState('desc'); // 'asc', 'desc'
  const [showForm, setShowForm] = useState(false);
  const [showAdvancedForm, setShowAdvancedForm] = useState(false);
  const [editingShift, setEditingShift] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(25);
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

  // Enhanced filtering
  const filteredShifts = shifts.filter(shift => {
    // Filter by employee
    if (filterEmployee && shift.employeeId?._id !== filterEmployee) {
      return false;
    }
    
    // Filter by department
    if (filterDepartment && shift.employeeId?.department !== filterDepartment) {
      return false;
    }
    
    // Filter by date range
    if (filterStartDate) {
      const shiftDate = new Date(shift.date);
      const startDate = new Date(filterStartDate);
      startDate.setHours(0, 0, 0, 0);
      shiftDate.setHours(0, 0, 0, 0);
      if (shiftDate < startDate) return false;
    }
    
    if (filterEndDate) {
      const shiftDate = new Date(shift.date);
      const endDate = new Date(filterEndDate);
      endDate.setHours(23, 59, 59, 999);
      shiftDate.setHours(23, 59, 59, 999);
      if (shiftDate > endDate) return false;
    }
    
    // Filter by time range
    if (filterStartTime) {
      const shiftStartMinutes = shift.startTime.split(':').map(Number).reduce((h, m) => h * 60 + m);
      const filterStartMinutes = filterStartTime.split(':').map(Number).reduce((h, m) => h * 60 + m);
      if (shiftStartMinutes < filterStartMinutes) return false;
    }
    
    if (filterEndTime) {
      const shiftEndMinutes = shift.endTime.split(':').map(Number).reduce((h, m) => h * 60 + m);
      const filterEndMinutes = filterEndTime.split(':').map(Number).reduce((h, m) => h * 60 + m);
      if (shiftEndMinutes > filterEndMinutes) return false;
    }
    
    return true;
  });

  // Sorting
  const sortedShifts = [...filteredShifts].sort((a, b) => {
    let aValue, bValue;
    
    switch (sortBy) {
      case 'date':
        aValue = new Date(a.date);
        bValue = new Date(b.date);
        break;
      case 'employee':
        aValue = a.employeeId?.name || '';
        bValue = b.employeeId?.name || '';
        break;
      case 'department':
        aValue = a.employeeId?.department || '';
        bValue = b.employeeId?.department || '';
        break;
      case 'startTime':
        aValue = a.startTime;
        bValue = b.startTime;
        break;
      default:
        return 0;
    }
    
    if (sortOrder === 'asc') {
      return aValue > bValue ? 1 : aValue < bValue ? -1 : 0;
    } else {
      return aValue < bValue ? 1 : aValue > bValue ? -1 : 0;
    }
  });

  // Pagination
  const totalPages = Math.ceil(sortedShifts.length / pageSize);
  const paginatedShifts = sortedShifts.slice(
    (currentPage - 1) * pageSize,
    currentPage * pageSize
  );

  // Reset to page 1 when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [filterEmployee, filterDepartment, filterStartDate, filterEndDate, filterStartTime, filterEndTime]);

  // Get unique departments
  const departments = [...new Set(employees.map(emp => emp.department))].sort();

  const Layout = isAdmin ? AdminLayout : EmployeeLayout;

  return (
    <Layout 
      title={isAdmin ? "Shift Board" : "My Shifts"} 
      subtitle={isAdmin ? "View, filter, and manage employee shifts" : "View and manage your shifts"}
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

      {/* Enhanced Filters Bar */}
      <div className="bg-white shadow rounded-lg p-6 mb-6">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-semibold text-gray-900">Filters & Sorting</h3>
          <div className="text-sm text-gray-500">
            Showing {paginatedShifts.length} of {sortedShifts.length} shifts
          </div>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 mb-4">
          {isAdmin && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Employee
              </label>
              <select
                value={filterEmployee}
                onChange={(e) => setFilterEmployee(e.target.value)}
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
                Department
              </label>
              <select
                value={filterDepartment}
                onChange={(e) => setFilterDepartment(e.target.value)}
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
              onChange={(e) => setFilterStartDate(e.target.value)}
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
              onChange={(e) => setFilterEndDate(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Start Time (from)
            </label>
            <input
              type="time"
              value={filterStartTime}
              onChange={(e) => setFilterStartTime(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              End Time (to)
            </label>
            <input
              type="time"
              value={filterEndTime}
              onChange={(e) => setFilterEndTime(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Sort By
            </label>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="date">Date</option>
              <option value="employee">Employee</option>
              <option value="department">Department</option>
              <option value="startTime">Start Time</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Order
            </label>
            <select
              value={sortOrder}
              onChange={(e) => setSortOrder(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="desc">Descending</option>
              <option value="asc">Ascending</option>
            </select>
          </div>
        </div>
        
        <div className="flex items-center justify-between pt-4 border-t border-gray-200">
          <div className="flex items-center gap-2">
            <label className="text-sm font-medium text-gray-700">Page Size:</label>
            <select
              value={pageSize}
              onChange={(e) => { setPageSize(Number(e.target.value)); setCurrentPage(1); }}
              className="px-3 py-1 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value={10}>10</option>
              <option value={25}>25</option>
              <option value={50}>50</option>
              <option value={100}>100</option>
            </select>
          </div>
          {(filterEmployee || filterDepartment || filterStartDate || filterEndDate || filterStartTime || filterEndTime) && (
            <Button 
              variant="secondary" 
              onClick={() => {
                setFilterEmployee('');
                setFilterDepartment('');
                setFilterStartDate('');
                setFilterEndDate('');
                setFilterStartTime('');
                setFilterEndTime('');
                setCurrentPage(1);
              }}
            >
              Clear All Filters
            </Button>
          )}
        </div>
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
              <Pagination
                currentPage={currentPage}
                totalPages={totalPages}
                onPageChange={setCurrentPage}
              />
            </div>
          )}
        </>
      )}
    </Layout>
  );
};

export default Dashboard;
