import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { getEmployees, deleteEmployee, getShifts } from '../services/authService';
import EmployeeForm from '../components/EmployeeForm';
import EmployeeTable from '../components/EmployeeTable';
import AdminLayout from '../components/AdminLayout';
import Modal from '../components/Modal';
import Button from '../components/Button';
import Input from '../components/Input';

const EmployeeManagement = () => {
  const [employees, setEmployees] = useState([]);
  const [shifts, setShifts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [editingEmployee, setEditingEmployee] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterDepartment, setFilterDepartment] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize] = useState(25);
  const navigate = useNavigate();

  useEffect(() => {
    fetchEmployees();
    fetchAllShifts();
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

  const fetchAllShifts = async () => {
    try {
      const data = await getShifts();
      setShifts(data || []);
    } catch (err) {
      console.error('Error fetching shifts:', err);
    }
  };

  // Calculate average hours for each employee
  const employeesWithStats = useMemo(() => {
    return employees.map(emp => {
      const employeeShifts = shifts.filter(shift => 
        shift.employeeId?._id === emp._id || shift.employeeId === emp._id
      );
      
      let totalHours = 0;
      let shiftCount = 0;
      
      employeeShifts.forEach(shift => {
        const [startH, startM] = (shift.startTime || '').split(':').map(Number);
        const [endH, endM] = (shift.endTime || '').split(':').map(Number);
        if (!isNaN(startH) && !isNaN(endH)) {
          const startMinutes = startH * 60 + startM;
          const endMinutes = endH * 60 + endM;
          const duration = (endMinutes - startMinutes) / 60;
          totalHours += duration;
          shiftCount++;
        }
      });
      
      const avgHours = shiftCount > 0 ? (totalHours / shiftCount).toFixed(2) : '0.00';
      
      return {
        ...emp,
        avgHours: parseFloat(avgHours),
        totalShifts: shiftCount,
        totalHours: totalHours.toFixed(2),
      };
    });
  }, [employees, shifts]);

  // Filter employees
  const filteredEmployees = useMemo(() => {
    let filtered = [...employeesWithStats];
    
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(emp => 
        emp.name.toLowerCase().includes(query) ||
        emp.employeeCode.toLowerCase().includes(query) ||
        emp.department.toLowerCase().includes(query)
      );
    }
    
    if (filterDepartment) {
      filtered = filtered.filter(emp => emp.department === filterDepartment);
    }
    
    return filtered;
  }, [employeesWithStats, searchQuery, filterDepartment]);

  // Pagination
  const totalPages = Math.ceil(filteredEmployees.length / pageSize);
  const paginatedEmployees = filteredEmployees.slice(
    (currentPage - 1) * pageSize,
    currentPage * pageSize
  );

  // Get unique departments
  const departments = useMemo(() => {
    return [...new Set(employees.map(emp => emp.department))].sort();
  }, [employees]);

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
      fetchAllShifts();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to delete employee');
    }
  };

  const handleSuccess = () => {
    setShowForm(false);
    setEditingEmployee(null);
    fetchEmployees();
    fetchAllShifts();
  };

  const handleCancel = () => {
    setShowForm(false);
    setEditingEmployee(null);
  };

  return (
    <AdminLayout 
      title="" 
      subtitle=""
      currentPath="/employees"
    >
      {error && (
        <div className="mb-6 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
          {error}
        </div>
      )}

      {/* Page Title & Action Bar */}
      <div className="mb-6">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-2">
          <div>
            <h2 className="text-3xl font-bold text-gray-900">Employee Management</h2>
            <p className="text-base text-gray-600 mt-1">Add, update, or remove employees.</p>
          </div>
          <Button onClick={handleCreate}>
            Add New Employee
          </Button>
        </div>
      </div>

      {/* Search & Filter Bar */}
      <div className="bg-white shadow rounded-lg p-6 mb-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Search Employees
            </label>
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => { setSearchQuery(e.target.value); setCurrentPage(1); }}
              placeholder="Search by name, code, or department..."
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
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
        </div>
        {(searchQuery || filterDepartment) && (
          <div className="mt-4">
            <Button 
              variant="secondary" 
              onClick={() => {
                setSearchQuery('');
                setFilterDepartment('');
                setCurrentPage(1);
              }}
            >
              Clear Filters
            </Button>
          </div>
        )}
      </div>

      {/* Employee Table Section */}
      <div className="bg-white shadow rounded-lg overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900">
            Employees ({filteredEmployees.length})
          </h3>
        </div>
        
        {loading ? (
          <div className="p-8 text-center">
            <p className="text-gray-600">Loading employees...</p>
          </div>
        ) : (
          <>
            <EmployeeTable
              employees={paginatedEmployees}
              onEdit={handleEdit}
              onDelete={handleDelete}
            />
            
            {/* Pagination */}
            {totalPages > 1 && (
              <div className="px-4 py-3 flex items-center justify-between border-t border-gray-200 sm:px-6">
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
                      <span className="font-medium">{Math.min(currentPage * pageSize, filteredEmployees.length)}</span> of{' '}
                      <span className="font-medium">{filteredEmployees.length}</span> employees
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
            )}
          </>
        )}
      </div>

      {/* Employee Form Modal */}
      <Modal
        isOpen={showForm}
        onClose={handleCancel}
        title={editingEmployee ? 'Edit Employee' : 'Add New Employee'}
        size="md"
      >
        <EmployeeForm
          employee={editingEmployee}
          onSuccess={handleSuccess}
          onCancel={handleCancel}
        />
      </Modal>
    </AdminLayout>
  );
};

export default EmployeeManagement;
