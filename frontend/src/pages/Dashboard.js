import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getShifts, getEmployees, deleteShift } from '../services/authService';
import ShiftForm from '../components/ShiftForm';
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
  const [filterDate, setFilterDate] = useState('');
  const [showForm, setShowForm] = useState(false);
  const navigate = useNavigate();

  const user = JSON.parse(localStorage.getItem('user') || '{}');
  const isAdmin = user.role === 'admin';

  useEffect(() => {
    fetchShifts();
    if (isAdmin) {
      fetchEmployees();
    }
  }, [isAdmin, filterEmployee, filterDate]);

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
      const data = await getShifts(filterEmployee || null, filterDate || null);
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

  const handleShiftCreated = () => {
    setShowForm(false);
    fetchShifts();
  };

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

      {/* Filters Bar */}
      <div className="bg-white shadow rounded-lg p-6 mb-6">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-4 gap-4">
          <h3 className="text-lg font-semibold text-gray-900">Filters</h3>
          {isAdmin && (
            <Button onClick={() => setShowForm(!showForm)}>
              {showForm ? 'Cancel' : 'Create New Shift'}
            </Button>
          )}
        </div>

        {showForm && isAdmin && (
          <div className="mb-6">
            <ShiftForm
              employees={employees}
              onSuccess={handleShiftCreated}
              onCancel={() => setShowForm(false)}
            />
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {isAdmin && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Filter by Employee
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
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Filter by Date
            </label>
            <input
              type="date"
              value={filterDate}
              onChange={(e) => setFilterDate(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>
      </div>

      {/* Shift Table */}
      {loading ? (
        <div className="bg-white shadow rounded-lg p-8 text-center">
          <p className="text-gray-600">Loading shifts...</p>
        </div>
      ) : (
        <ShiftTable shifts={shifts} onDelete={handleDelete} isAdmin={isAdmin} />
      )}
    </AdminLayout>
  );
};

export default Dashboard;
