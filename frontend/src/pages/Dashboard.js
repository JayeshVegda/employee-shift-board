import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { getShifts, getEmployees, deleteShift, getUnreadIssueCount, createIssue, getDashboardAnalytics } from '../services/authService';
import ShiftForm from '../components/ShiftForm';
import AdvancedShiftForm from '../components/AdvancedShiftForm';
import ShiftTable from '../components/ShiftTable';
import EditShiftModal from '../components/EditShiftModal';
import WorkingHoursSummary from '../components/WorkingHoursSummary';
import IssueForm from '../components/IssueForm';
import Pagination from '../components/Pagination';
import Button from '../components/Button';
import Input from '../components/Input';

const Dashboard = () => {
  const [shifts, setShifts] = useState([]);
  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [filterEmployee, setFilterEmployee] = useState('');
  const [filterDate, setFilterDate] = useState('');
  const [filterDepartment, setFilterDepartment] = useState('');
  const [filterMonth, setFilterMonth] = useState('');
  const [filterYear, setFilterYear] = useState('');
  const [sortBy, setSortBy] = useState('');
  const [sortOrder, setSortOrder] = useState('desc');
  const [currentPage, setCurrentPage] = useState(1);
  const [pagination, setPagination] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [showAdvancedForm, setShowAdvancedForm] = useState(false);
  const [showIssueForm, setShowIssueForm] = useState(false);
  const [editingShift, setEditingShift] = useState(null);
  const [selectedShift, setSelectedShift] = useState(null);
  const [activeTab, setActiveTab] = useState('shifts');
  const [unreadIssueCount, setUnreadIssueCount] = useState(0);
  const [analytics, setAnalytics] = useState(null);
  const navigate = useNavigate();

  const user = JSON.parse(localStorage.getItem('user') || '{}');
  const isAdmin = user.role === 'admin';

  const fetchEmployees = async () => {
    try {
      const data = await getEmployees();
      setEmployees(data);
    } catch (err) {
      console.error('Error fetching employees:', err);
    }
  };

  useEffect(() => {
    if (isAdmin) {
      fetchEmployees();
    }
  }, [isAdmin]);

  const fetchShifts = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const empFilter = filterEmployee?.trim() || null;
      const dateFilter = filterDate?.trim() || null;
      const deptFilter = filterDepartment?.trim() || null;
      const monthFilter = filterMonth?.trim() || null;
      const yearFilter = filterMonth && filterYear?.trim() ? filterYear : (filterMonth ? new Date().getFullYear().toString() : null);
      
      const data = await getShifts(
        empFilter, 
        dateFilter, 
        deptFilter, 
        sortBy || null, 
        sortOrder || null,
        monthFilter,
        yearFilter,
        currentPage,
        10
      );
      setShifts(data.shifts || data);
      setPagination(data.pagination || null);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to fetch shifts');
      console.error('Error fetching shifts:', err);
    } finally {
      setLoading(false);
    }
  }, [filterEmployee, filterDate, filterDepartment, filterMonth, filterYear, sortBy, sortOrder, currentPage]);

  const fetchAnalytics = async () => {
    try {
      const data = await getDashboardAnalytics(null, null);
      setAnalytics(data);
    } catch (err) {
      console.error('Error fetching analytics:', err);
    }
  };

  const fetchUnreadCount = async () => {
    try {
      const data = await getUnreadIssueCount();
      setUnreadIssueCount(data.count);
    } catch (err) {
      console.error('Error fetching unread count:', err);
    }
  };

  useEffect(() => {
    setCurrentPage(1);
  }, [filterEmployee, filterDate, filterDepartment, filterMonth, filterYear, sortBy, sortOrder]);

  useEffect(() => {
    fetchShifts();
  }, [fetchShifts]);

  useEffect(() => {
    if (isAdmin) {
      fetchUnreadCount();
      if (activeTab === 'analytics') {
        fetchAnalytics();
      }
      const interval = setInterval(fetchUnreadCount, 30000);
      return () => clearInterval(interval);
    }
  }, [isAdmin, activeTab]);

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

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    navigate('/login');
  };

  const handleShiftCreated = () => {
    setShowForm(false);
    setShowAdvancedForm(false);
    fetchShifts();
    if (isAdmin && activeTab === 'analytics') {
      fetchAnalytics();
    }
  };

  const handleEditShift = (shift) => {
    setEditingShift(shift);
  };

  const handleShiftUpdated = () => {
    setEditingShift(null);
    fetchShifts();
    if (isAdmin && activeTab === 'analytics') {
      fetchAnalytics();
    }
  };

  const handleReportIssue = (shift) => {
    setSelectedShift(shift);
    setShowIssueForm(true);
  };

  const handleIssueCreated = () => {
    setShowIssueForm(false);
    setSelectedShift(null);
    if (isAdmin) {
      fetchUnreadCount();
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <nav className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16 items-center">
            <h1 className="text-xl font-bold text-gray-900">Employee Shift Board</h1>
            <div className="flex items-center gap-4">
              {isAdmin && (
                <>
                  <Link to="/admin-dashboard" className="text-sm text-blue-600 hover:text-blue-800">
                    Analytics Dashboard
                  </Link>
                  <Link to="/employees" className="text-sm text-blue-600 hover:text-blue-800">
                    Manage Employees
                  </Link>
                </>
              )}
              <Link to="/issues" className="relative text-sm text-blue-600 hover:text-blue-800">
                Issues
                {isAdmin && unreadIssueCount > 0 && (
                  <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                    {unreadIssueCount}
                  </span>
                )}
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

        <div className="bg-white shadow rounded-lg mb-6">
          <div className="border-b border-gray-200">
            <nav className="flex -mb-px">
              <button
                onClick={() => setActiveTab('shifts')}
                className={`px-6 py-3 text-sm font-medium ${
                  activeTab === 'shifts'
                    ? 'border-b-2 border-blue-500 text-blue-600'
                    : 'text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                Shifts
              </button>
              {isAdmin ? (
                <button
                  onClick={() => setActiveTab('analytics')}
                  className={`px-6 py-3 text-sm font-medium ${
                    activeTab === 'analytics'
                      ? 'border-b-2 border-blue-500 text-blue-600'
                      : 'text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  Analytics
                </button>
              ) : (
                <button
                  onClick={() => setActiveTab('summary')}
                  className={`px-6 py-3 text-sm font-medium ${
                    activeTab === 'summary'
                      ? 'border-b-2 border-blue-500 text-blue-600'
                      : 'text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  Working Hours Summary
                </button>
              )}
            </nav>
          </div>
        </div>

        {activeTab === 'shifts' && (
          <>
            <div className="bg-white shadow-sm rounded-t-lg border-b border-gray-200 px-6 py-4">
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                  <h2 className="text-2xl font-bold text-gray-900">Shift Management</h2>
                  <p className="text-sm text-gray-500 mt-1">View and manage employee shifts</p>
                </div>
                {isAdmin && (
                  <div className="flex gap-2">
                    <Button 
                      onClick={() => { setShowForm(!showForm); setShowAdvancedForm(false); }}
                      className={showForm ? 'bg-gray-600 hover:bg-gray-700' : ''}
                    >
                      {showForm ? '✕ Cancel' : '+ Single Shift'}
                    </Button>
                    <Button 
                      variant="secondary" 
                      onClick={() => { setShowAdvancedForm(!showAdvancedForm); setShowForm(false); }}
                      className={showAdvancedForm ? 'bg-gray-600 text-white hover:bg-gray-700' : ''}
                    >
                      {showAdvancedForm ? '✕ Cancel' : '⚡ Bulk/Recurring'}
                    </Button>
                  </div>
                )}
              </div>
            </div>

            {(showForm || showAdvancedForm) && (
              <div className="bg-white border-x border-gray-200 px-6 py-4">
                {showForm && isAdmin && (
                  <ShiftForm
                    employees={employees}
                    onSuccess={handleShiftCreated}
                    onCancel={() => setShowForm(false)}
                  />
                )}
                {showAdvancedForm && isAdmin && (
                  <AdvancedShiftForm
                    employees={employees}
                    onSuccess={handleShiftCreated}
                    onCancel={() => setShowAdvancedForm(false)}
                  />
                )}
              </div>
            )}

            <div className="bg-white shadow-sm border-x border-gray-200 px-6 py-4">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
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
                    Filter by Department
                  </label>
                  <select
                    value={filterDepartment}
                    onChange={(e) => setFilterDepartment(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="">All Departments</option>
                    {[...new Set(employees.map(emp => emp.department))].map((dept) => (
                      <option key={dept} value={dept}>
                        {dept}
                      </option>
                    ))}
                  </select>
                </div>
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
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Sort By
                  </label>
                  <select
                    value={sortBy}
                    onChange={(e) => setSortBy(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="">Default</option>
                    <option value="date">Date</option>
                    <option value="employee">Employee Name</option>
                    <option value="department">Department</option>
                    <option value="startTime">Start Time</option>
                    <option value="duration">Duration</option>
                  </select>
                </div>
              </div>
              {(filterEmployee || filterDate || filterDepartment || sortBy) && (
                <div className="mt-4">
                  <Button
                    variant="secondary"
                    onClick={() => {
                      setFilterEmployee('');
                      setFilterDate('');
                      setFilterDepartment('');
                      setFilterMonth('');
                      setFilterYear('');
                      setSortBy('');
                      setSortOrder('desc');
                      setCurrentPage(1);
                    }}
                  >
                    Clear All Filters
                  </Button>
                </div>
              )}
            </div>

            <div className="bg-white shadow-sm rounded-b-lg border-x border-b border-gray-200">
              {showIssueForm && selectedShift && (
                <div className="px-6 py-4 border-b border-gray-200">
                  <IssueForm
                    shift={selectedShift}
                    onSuccess={handleIssueCreated}
                    onCancel={() => {
                      setShowIssueForm(false);
                      setSelectedShift(null);
                    }}
                  />
                </div>
              )}

              {loading ? (
                <div className="text-center py-12">
                  <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                  <p className="text-gray-600 mt-2">Loading shifts...</p>
                </div>
              ) : (
                <>
                  <ShiftTable 
                    shifts={shifts} 
                    onDelete={handleDelete} 
                    isAdmin={isAdmin}
                    onReportIssue={handleReportIssue}
                    onEdit={handleEditShift}
                  />
                  {pagination && pagination.totalPages > 1 && (
                    <div className="border-t border-gray-200">
                      <Pagination
                        currentPage={pagination.currentPage}
                        totalPages={pagination.totalPages}
                        onPageChange={setCurrentPage}
                      />
                    </div>
                  )}
                </>
              )}
            </div>
          </>
        )}

        {activeTab === 'summary' && !isAdmin && (
          <WorkingHoursSummary employeeId={user.employeeId ? user.employeeId : null} />
        )}

        {activeTab === 'analytics' && isAdmin && (
          <div className="bg-white shadow rounded-lg p-6">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Analytics Dashboard</h2>
            {analytics ? (
              <div>
                <div className="grid grid-cols-1 md:grid-cols-5 gap-4 mb-6">
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <h3 className="text-sm font-medium text-gray-500">Total Employees</h3>
                    <p className="text-2xl font-bold text-gray-900 mt-1">{analytics.summary.totalEmployees}</p>
                  </div>
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <h3 className="text-sm font-medium text-gray-500">Total Shifts</h3>
                    <p className="text-2xl font-bold text-gray-900 mt-1">{analytics.summary.totalShifts}</p>
                  </div>
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <h3 className="text-sm font-medium text-gray-500">Total Hours</h3>
                    <p className="text-2xl font-bold text-gray-900 mt-1">{analytics.summary.totalHours}</p>
                  </div>
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <h3 className="text-sm font-medium text-gray-500">Avg/Shift</h3>
                    <p className="text-2xl font-bold text-gray-900 mt-1">{analytics.summary.avgHoursPerShift}</p>
                  </div>
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <h3 className="text-sm font-medium text-gray-500">Avg/Employee</h3>
                    <p className="text-2xl font-bold text-gray-900 mt-1">{analytics.summary.avgHoursPerEmployee}</p>
                  </div>
                </div>
                <p className="text-sm text-gray-600">For detailed analytics, visit the <Link to="/admin-dashboard" className="text-blue-600 hover:underline">Analytics Dashboard</Link></p>
              </div>
            ) : (
              <p className="text-gray-600">Loading analytics...</p>
            )}
          </div>
        )}
      </div>

      {editingShift && (
        <EditShiftModal
          shift={editingShift}
          employees={employees}
          onClose={() => setEditingShift(null)}
          onSuccess={handleShiftUpdated}
        />
      )}
    </div>
  );
};

export default Dashboard;

