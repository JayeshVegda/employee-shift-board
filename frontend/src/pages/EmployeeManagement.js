import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { getEmployees, deleteEmployee } from '../services/authService';
import EmployeeForm from '../components/EmployeeForm';
import EmployeeTable from '../components/EmployeeTable';
import Button from '../components/Button';

const EmployeeManagement = () => {
  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [editingEmployee, setEditingEmployee] = useState(null);
  const navigate = useNavigate();

  const user = JSON.parse(localStorage.getItem('user') || '{}');

  useEffect(() => {
    fetchEmployees();
  }, []);

  const fetchEmployees = async () => {
    setLoading(true);
    setError('');
    try {
      const data = await getEmployees();
      setEmployees(data);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to fetch employees');
      console.error('Error fetching employees:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = () => {
    setEditingEmployee(null);
    setShowForm(true);
  };

  const handleEdit = (employee) => {
    setEditingEmployee(employee);
    setShowForm(true);
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this employee? This action cannot be undone.')) {
      return;
    }

    try {
      await deleteEmployee(id);
      fetchEmployees();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to delete employee');
    }
  };

  const handleSuccess = () => {
    setShowForm(false);
    setEditingEmployee(null);
    fetchEmployees();
  };

  const handleCancel = () => {
    setShowForm(false);
    setEditingEmployee(null);
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    navigate('/login');
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <nav className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16 items-center">
            <h1 className="text-xl font-bold text-gray-900">Employee Shift Board</h1>
            <div className="flex items-center gap-4">
              <Link to="/dashboard" className="text-sm text-blue-600 hover:text-blue-800">
                Dashboard
              </Link>
              <Link to="/settings" className="text-sm text-blue-600 hover:text-blue-800">
                Settings
              </Link>
              <span className="text-sm text-gray-600">
                {user.email} ({user.role})
              </span>
              <Button onClick={handleLogout} variant="secondary">
                Logout
              </Button>
            </div>
          </div>
        </div>
      </nav>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {error && (
          <div className="mb-4 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
            {error}
          </div>
        )}

        <div className="bg-white shadow rounded-lg p-6 mb-6">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-4 gap-4">
            <h2 className="text-2xl font-bold text-gray-900">Employee Management</h2>
            <Button onClick={handleCreate}>
              {showForm ? 'Cancel' : 'Add New Employee'}
            </Button>
          </div>

          {showForm && (
            <div className="mb-6">
              <EmployeeForm
                employee={editingEmployee}
                onSuccess={handleSuccess}
                onCancel={handleCancel}
              />
            </div>
          )}
        </div>

        {loading ? (
          <div className="text-center py-8">
            <p className="text-gray-600">Loading employees...</p>
          </div>
        ) : (
          <EmployeeTable
            employees={employees}
            onEdit={handleEdit}
            onDelete={handleDelete}
          />
        )}
      </div>
    </div>
  );
};

export default EmployeeManagement;

