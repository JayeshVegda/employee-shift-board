import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { getDashboardAnalytics, getUnreadIssueCount, getEmployees } from '../services/authService';
import AdminLayout from '../components/AdminLayout';
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';
import Button from '../components/Button';
import Input from '../components/Input';

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8', '#82ca9d'];

const AdminDashboard = () => {
  const [analytics, setAnalytics] = useState(null);
  const [employees, setEmployees] = useState([]);
  const [unreadIssues, setUnreadIssues] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [filterDepartment, setFilterDepartment] = useState('');
  const [filterEmployee, setFilterEmployee] = useState('');
  const [sortConfig, setSortConfig] = useState({ key: null, direction: 'asc' });
  const [searchQuery, setSearchQuery] = useState('');
  const navigate = useNavigate();

  const user = JSON.parse(localStorage.getItem('user') || '{}');
  const isAdmin = user.role === 'admin';

  useEffect(() => {
    if (!isAdmin) {
      navigate('/dashboard');
      return;
    }
    fetchAnalytics();
    fetchUnreadIssues();
    fetchEmployees();
    
    // Poll for unread issues every 30 seconds
    const interval = setInterval(() => {
      fetchUnreadIssues();
    }, 30000);
    
    return () => clearInterval(interval);
  }, [isAdmin, startDate, endDate, filterDepartment, filterEmployee]);

  const fetchAnalytics = async () => {
    setLoading(true);
    setError('');
    try {
      const data = await getDashboardAnalytics(startDate || null, endDate || null);
      setAnalytics(data);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to fetch analytics');
      console.error('Error fetching analytics:', err);
    } finally {
      setLoading(false);
    }
  };

  const fetchUnreadIssues = async () => {
    try {
      const data = await getUnreadIssueCount();
      const count = data.count || 0;
      setUnreadIssues(count);
      localStorage.setItem('unreadIssues', count.toString());
    } catch (err) {
      console.error('Error fetching unread issues:', err);
    }
  };

  const fetchEmployees = async () => {
    try {
      const data = await getEmployees();
      setEmployees(data);
    } catch (err) {
      console.error('Error fetching employees:', err);
    }
  };

  const handleSort = (key) => {
    let direction = 'asc';
    if (sortConfig.key === key && sortConfig.direction === 'asc') {
      direction = 'desc';
    }
    setSortConfig({ key, direction });
  };

  // All useMemo hooks must be called before any conditional returns
  const sortedEmployeePerformance = useMemo(() => {
    if (!analytics?.employeePerformance) return [];
    
    let sorted = [...analytics.employeePerformance];
    
    // Apply filters
    if (filterDepartment) {
      sorted = sorted.filter(emp => emp.department === filterDepartment);
    }
    if (filterEmployee) {
      sorted = sorted.filter(emp => emp.employeeId === filterEmployee);
    }
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      sorted = sorted.filter(emp => 
        emp.name.toLowerCase().includes(query) ||
        emp.employeeCode.toLowerCase().includes(query) ||
        emp.department.toLowerCase().includes(query)
      );
    }
    
    // Apply sorting
    if (sortConfig.key) {
      sorted.sort((a, b) => {
        let aVal = a[sortConfig.key];
        let bVal = b[sortConfig.key];
        
        if (typeof aVal === 'string') {
          aVal = aVal.toLowerCase();
          bVal = bVal.toLowerCase();
        }
        
        if (aVal < bVal) return sortConfig.direction === 'asc' ? -1 : 1;
        if (aVal > bVal) return sortConfig.direction === 'asc' ? 1 : -1;
        return 0;
      });
    }
    
    return sorted;
  }, [analytics?.employeePerformance, filterDepartment, filterEmployee, searchQuery, sortConfig]);

  const departments = useMemo(() => {
    if (!analytics?.departmentPerformance) return [];
    return analytics.departmentPerformance.map(dept => dept.department);
  }, [analytics?.departmentPerformance]);

  // Calculate employee performance KPIs
  const employeeKPIs = useMemo(() => {
    if (!analytics?.employeePerformance || analytics.employeePerformance.length === 0) {
      return { highestHours: null, lowestHours: null, bestAvgHours: null };
    }
    
    const sortedByHours = [...analytics.employeePerformance].sort((a, b) => b.totalHours - a.totalHours);
    const sortedByAvgHours = [...analytics.employeePerformance].sort((a, b) => 
      parseFloat(b.avgHoursPerShift) - parseFloat(a.avgHoursPerShift)
    );
    
    return {
      highestHours: sortedByHours[0],
      lowestHours: sortedByHours[sortedByHours.length - 1],
      bestAvgHours: sortedByAvgHours[0],
    };
  }, [analytics?.employeePerformance]);


  const clearFilters = () => {
    setStartDate('');
    setEndDate('');
    setFilterDepartment('');
    setFilterEmployee('');
    setSearchQuery('');
  };

  if (!isAdmin) {
    return null;
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <p className="text-gray-600">Loading dashboard...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-600 mb-4">{error}</p>
          <Button onClick={fetchAnalytics}>Retry</Button>
        </div>
      </div>
    );
  }

  if (!analytics) {
    return null;
  }

  const SortIcon = ({ columnKey }) => {
    if (sortConfig.key !== columnKey) {
      return <span className="text-gray-400">↕️</span>;
    }
    return sortConfig.direction === 'asc' ? <span>↑</span> : <span>↓</span>;
  };

  return (
    <AdminLayout 
      title="Employee Shift Board" 
      subtitle="Comprehensive analytics and insights for your workforce"
      currentPath="/admin-dashboard"
    >
          {/* 2. Header KPIs */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4 mb-6">
            <div className="bg-white shadow rounded-lg p-6 border-l-4 border-blue-500">
              <h3 className="text-sm font-medium text-gray-500">Total Employees</h3>
              <p className="text-3xl font-bold text-gray-900 mt-2">{analytics.summary.totalEmployees}</p>
            </div>
            <div className="bg-white shadow rounded-lg p-6 border-l-4 border-orange-500">
              <h3 className="text-sm font-medium text-gray-500">Open Issues</h3>
              <p className="text-3xl font-bold text-gray-900 mt-2">{unreadIssues}</p>
            </div>
            <div className="bg-white shadow rounded-lg p-6 border-l-4 border-green-500">
              <h3 className="text-sm font-medium text-gray-500">Total Shifts</h3>
              <p className="text-3xl font-bold text-gray-900 mt-2">{analytics.summary.totalShifts}</p>
            </div>
            <div className="bg-white shadow rounded-lg p-6 border-l-4 border-purple-500">
              <h3 className="text-sm font-medium text-gray-500">Total Hours</h3>
              <p className="text-3xl font-bold text-gray-900 mt-2">{analytics.summary.totalHours}</p>
            </div>
            <div className="bg-white shadow rounded-lg p-6 border-l-4 border-indigo-500">
              <h3 className="text-sm font-medium text-gray-500">Avg Hours/Employee</h3>
              <p className="text-3xl font-bold text-gray-900 mt-2">{analytics.summary.avgHoursPerEmployee}</p>
            </div>
          </div>

          {/* 3. Filters Section */}
          <div className="bg-white shadow rounded-lg p-6 mb-6">
            <h2 className="text-lg font-semibold mb-4">Filters</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Start Date</label>
                <Input
                  type="date"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">End Date</label>
                <Input
                  type="date"
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Department</label>
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
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Employee</label>
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
              <div className="flex items-end">
                <Button onClick={clearFilters} variant="secondary" className="w-full">
                  Clear All Filters
                </Button>
              </div>
            </div>
          </div>

          {/* 4. Analytics Section */}
          <div className="mb-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Insights & Trends</h2>
            
            {/* Row 1: Time-Based Analysis */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
              <div className="bg-white shadow rounded-lg p-6">
                <h3 className="text-lg font-semibold mb-4">Daily Hours Trend</h3>
                <ResponsiveContainer width="100%" height={300}>
                  <LineChart data={analytics.trends.daily}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="date" tick={{ fontSize: 12 }} />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Line type="monotone" dataKey="hours" stroke="#0088FE" strokeWidth={2} />
                  </LineChart>
                </ResponsiveContainer>
              </div>

              <div className="bg-white shadow rounded-lg p-6">
                <h3 className="text-lg font-semibold mb-4">Weekly Hours Trend</h3>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={analytics.trends.weekly}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="date" tick={{ fontSize: 12 }} />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Bar dataKey="hours" fill="#00C49F" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Row 2: Department & Issues */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div className="bg-white shadow rounded-lg p-6">
                <h3 className="text-lg font-semibold mb-4">Department Performance</h3>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={analytics.departmentPerformance}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="department" tick={{ fontSize: 12 }} />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Bar dataKey="totalHours" fill="#FFBB28" />
                  </BarChart>
                </ResponsiveContainer>
              </div>

              <div className="bg-white shadow rounded-lg p-6">
                <h3 className="text-lg font-semibold mb-4">Issues Distribution</h3>
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={[
                        { name: 'Open', value: analytics.issues.open },
                        { name: 'Resolved', value: analytics.issues.resolved },
                        { name: 'Closed', value: analytics.issues.closed },
                      ]}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="value"
                    >
                      {[
                        { name: 'Open', value: analytics.issues.open },
                        { name: 'Resolved', value: analytics.issues.resolved },
                        { name: 'Closed', value: analytics.issues.closed },
                      ].map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>

          {/* 5. Employee Performance Section */}
          <div className="mb-6">
            <div className="bg-white shadow rounded-lg p-6 mb-4">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-semibold text-gray-900">Employee Performance</h2>
                <div className="w-64">
                  <Input
                    type="text"
                    placeholder="Search employees..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                  />
                </div>
              </div>

              {/* Performance Summary KPIs */}
              {employeeKPIs.highestHours && (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                    <p className="text-sm text-gray-600">Highest Hours</p>
                    <p className="text-lg font-semibold text-gray-900">
                      {employeeKPIs.highestHours.name} ({employeeKPIs.highestHours.totalHours.toFixed(2)} hrs)
                    </p>
                  </div>
                  <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                    <p className="text-sm text-gray-600">Best Avg Hours/Shift</p>
                    <p className="text-lg font-semibold text-gray-900">
                      {employeeKPIs.bestAvgHours.name} ({employeeKPIs.bestAvgHours.avgHoursPerShift} hrs)
                    </p>
                  </div>
                  <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                    <p className="text-sm text-gray-600">Lowest Hours</p>
                    <p className="text-lg font-semibold text-gray-900">
                      {employeeKPIs.lowestHours.name} ({employeeKPIs.lowestHours.totalHours.toFixed(2)} hrs)
                    </p>
                  </div>
                </div>
              )}

              {/* Employee Performance Table */}
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50 sticky top-0">
                    <tr>
                      <th 
                        className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                        onClick={() => handleSort('name')}
                      >
                        <div className="flex items-center gap-2">
                          Employee <SortIcon columnKey="name" />
                        </div>
                      </th>
                      <th 
                        className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                        onClick={() => handleSort('department')}
                      >
                        <div className="flex items-center gap-2">
                          Department <SortIcon columnKey="department" />
                        </div>
                      </th>
                      <th 
                        className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                        onClick={() => handleSort('totalShifts')}
                      >
                        <div className="flex items-center gap-2">
                          Total Shifts <SortIcon columnKey="totalShifts" />
                        </div>
                      </th>
                      <th 
                        className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                        onClick={() => handleSort('totalHours')}
                      >
                        <div className="flex items-center gap-2">
                          Total Hours <SortIcon columnKey="totalHours" />
                        </div>
                      </th>
                      <th 
                        className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                        onClick={() => handleSort('daysWorked')}
                      >
                        <div className="flex items-center gap-2">
                          Days Worked <SortIcon columnKey="daysWorked" />
                        </div>
                      </th>
                      <th 
                        className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                        onClick={() => handleSort('avgHoursPerShift')}
                      >
                        <div className="flex items-center gap-2">
                          Avg Hours/Shift <SortIcon columnKey="avgHoursPerShift" />
                        </div>
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {sortedEmployeePerformance.length === 0 ? (
                      <tr>
                        <td colSpan="6" className="px-6 py-4 text-center text-gray-500">
                          No employees found
                        </td>
                      </tr>
                    ) : (
                      sortedEmployeePerformance.map((emp) => (
                        <tr key={emp.employeeId} className="hover:bg-gray-50">
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                            {emp.name} ({emp.employeeCode})
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            {emp.department}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            {emp.totalShifts}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            {emp.totalHours.toFixed(2)}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            {emp.daysWorked}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            {emp.avgHoursPerShift}
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>

          {/* 6. Department Performance Table */}
          <div className="bg-white shadow rounded-lg p-6 mb-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Department Performance</h2>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Department
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      No. of Employees
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Total Shifts
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Total Hours
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Avg Hours/Employee
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {analytics.departmentPerformance.map((dept, index) => (
                    <tr key={index} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                        {dept.department}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {dept.employeeCount}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {dept.totalShifts}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {parseFloat(dept.totalHours).toFixed(2)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {dept.avgHoursPerEmployee}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* 7. Issues Overview (Optional Block) */}
          <div className="bg-white shadow rounded-lg p-6">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-semibold text-gray-900">Issues Overview</h2>
              <Link to="/issues">
                <Button variant="secondary">View All Issues</Button>
              </Link>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                <p className="text-sm text-gray-600">Open Issues</p>
                <p className="text-2xl font-bold text-gray-900">{analytics.issues.open}</p>
              </div>
              <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                <p className="text-sm text-gray-600">Resolved Issues</p>
                <p className="text-2xl font-bold text-gray-900">{analytics.issues.resolved}</p>
              </div>
              <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
                <p className="text-sm text-gray-600">Closed Issues</p>
                <p className="text-2xl font-bold text-gray-900">{analytics.issues.closed}</p>
              </div>
            </div>
          </div>
        </div>
    </AdminLayout>
  );
};

export default AdminDashboard;
