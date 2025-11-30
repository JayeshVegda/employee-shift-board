import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { getIssues, getUnreadIssueCount, deleteIssue } from '../services/authService';
import IssueForm from '../components/IssueForm';
import IssueTable from '../components/IssueTable';
import IssueEditModal from '../components/IssueEditModal';
import Pagination from '../components/Pagination';
import Button from '../components/Button';
import { getStatusColor, getPriorityColor } from '../utils/issueHelpers';

const Issues = () => {
  const [issues, setIssues] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [filterStatus, setFilterStatus] = useState('');
  const [filterPriority, setFilterPriority] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [debouncedSearchQuery, setDebouncedSearchQuery] = useState('');
  const [editingIssue, setEditingIssue] = useState(null);
  const [showSolved, setShowSolved] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize] = useState(25);
  const [pagination, setPagination] = useState({
    totalCount: 0,
    totalPages: 1,
    hasNextPage: false,
    hasPrevPage: false,
  });
  const navigate = useNavigate();

  const user = JSON.parse(localStorage.getItem('user') || '{}');
  const isAdmin = user.role === 'admin';

  useEffect(() => {
    fetchIssues();
    if (isAdmin) {
      fetchUnreadCount();
      // Poll for new issues every 30 seconds (reduced from 10s for better performance)
      const interval = setInterval(() => {
        fetchUnreadCount();
        fetchIssues();
      }, 30000); // 30 seconds
      return () => clearInterval(interval);
    }
  }, [isAdmin, filterStatus, filterPriority, showSolved, debouncedSearchQuery, currentPage]);

  // Debounce search query (300ms delay)
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearchQuery(searchQuery);
      setCurrentPage(1); // Reset to first page when search changes
    }, 300);

    return () => clearTimeout(timer);
  }, [searchQuery]);

  const fetchIssues = async () => {
    if (!isAdmin && loading) return; // Prevent multiple simultaneous calls
    setLoading(true);
    setError('');
    try {
      // Fetch paginated issues
      const data = await getIssues(
        null, 
        filterPriority || null, 
        currentPage, 
        pageSize
      );
      
      // Handle paginated response
      if (data.issues && data.pagination) {
        setIssues(data.issues);
        setPagination(data.pagination);
      } else {
        // Fallback for old API format (backward compatibility)
        setIssues(Array.isArray(data) ? data : []);
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to fetch issues');
      console.error('Error fetching issues:', err);
    } finally {
      setLoading(false);
    }
  };

  const fetchUnreadCount = async () => {
    try {
      const data = await getUnreadIssueCount();
      setUnreadCount(data.count);
    } catch (err) {
      console.error('Error fetching unread count:', err);
    }
  };

  const handleEdit = (issue) => {
    setEditingIssue(issue);
  };

  const handleResolve = (issue) => {
    setEditingIssue(issue);
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this issue?')) {
      return;
    }

    try {
      await deleteIssue(id);
      fetchIssues();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to delete issue');
    }
  };

  const handleEditSuccess = () => {
    setEditingIssue(null);
    fetchIssues();
  };

  const handleSuccess = () => {
    setShowForm(false);
    fetchIssues();
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    navigate('/login');
  };

  // Frontend filtering (for search and status toggle)
  const filteredIssues = issues.filter(issue => {
    if (showSolved) {
      // Show only resolved/closed issues
      if (issue.status !== 'resolved' && issue.status !== 'closed') return false;
    } else {
      // Show only open/in-progress issues
      if (issue.status === 'resolved' || issue.status === 'closed') return false;
    }
    if (filterStatus && issue.status !== filterStatus) return false;
    if (filterPriority && issue.priority !== filterPriority) return false;
    if (debouncedSearchQuery) {
      const query = debouncedSearchQuery.toLowerCase();
      const matchesTitle = issue.title?.toLowerCase().includes(query);
      const matchesDescription = issue.description?.toLowerCase().includes(query);
      const matchesEmployee = issue.shiftData?.employeeName?.toLowerCase().includes(query);
      const matchesEmployeeCode = issue.shiftData?.employeeCode?.toLowerCase().includes(query);
      if (!matchesTitle && !matchesDescription && !matchesEmployee && !matchesEmployeeCode) {
        return false;
      }
    }
    return true;
  });

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
              {isAdmin && (
                <Link to="/employees" className="text-sm text-blue-600 hover:text-blue-800">
                  Employees
                </Link>
              )}
              <Link to="/settings" className="text-sm text-blue-600 hover:text-blue-800">
                Settings
              </Link>
              {isAdmin && (
                <Link to="/issues" className="relative text-sm text-blue-600 hover:text-blue-800">
                  Issues
                  {unreadCount > 0 && (
                    <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                      {unreadCount}
                    </span>
                  )}
                </Link>
              )}
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
            <div className="flex items-center gap-4">
              <h2 className="text-2xl font-bold text-gray-900">
                {isAdmin ? 'Issue Management' : 'My Issues'}
              </h2>
              {isAdmin && (
                <div className="flex gap-2">
                  <Button
                    variant={!showSolved ? 'primary' : 'secondary'}
                    onClick={() => setShowSolved(false)}
                    className="text-sm"
                  >
                    Active Issues {unreadCount > 0 && `(${unreadCount})`}
                  </Button>
                  <Button
                    variant={showSolved ? 'primary' : 'secondary'}
                    onClick={() => setShowSolved(true)}
                    className="text-sm"
                  >
                    Solved Issues
                  </Button>
                </div>
              )}
            </div>
            {!isAdmin && (
              <Button onClick={() => setShowForm(!showForm)}>
                {showForm ? 'Cancel' : 'Report New Issue'}
              </Button>
            )}
          </div>

          {showForm && !isAdmin && (
            <div className="mb-6">
              <IssueForm onSuccess={handleSuccess} onCancel={() => setShowForm(false)} />
            </div>
          )}

          {isAdmin && !showSolved && (
            <div className="mb-4 grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Search Issues
                </label>
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search by title, description, employee..."
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Filter by Status
                </label>
                <select
                  value={filterStatus}
                  onChange={(e) => setFilterStatus(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">All Statuses</option>
                  <option value="open">Open</option>
                  <option value="in-progress">In Progress</option>
                  <option value="resolved">Resolved</option>
                  <option value="closed">Closed</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Filter by Priority
                </label>
                <select
                  value={filterPriority}
                  onChange={(e) => setFilterPriority(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">All Priorities</option>
                  <option value="low">Low</option>
                  <option value="medium">Medium</option>
                  <option value="high">High</option>
                  <option value="urgent">Urgent</option>
                </select>
              </div>
            </div>
          )}
        </div>

        {loading ? (
          <div className="text-center py-8">
            <p className="text-gray-600">Loading issues...</p>
          </div>
        ) : filteredIssues.length === 0 ? (
          <div className="bg-white shadow rounded-lg p-8 text-center">
            <p className="text-gray-600">
              {showSolved ? 'No solved issues found.' : 'No active issues found.'}
              {(debouncedSearchQuery || filterStatus || filterPriority) && (
                <span className="block mt-2 text-sm text-gray-500">
                  Try adjusting your filters or search query.
                </span>
              )}
            </p>
          </div>
        ) : (
          <>
            <div className="mb-4 text-sm text-gray-600">
              Showing {((currentPage - 1) * pageSize) + 1} to {Math.min(currentPage * pageSize, pagination.totalCount)} of {pagination.totalCount} issue{pagination.totalCount !== 1 ? 's' : ''}
              {(debouncedSearchQuery || filterStatus || filterPriority) && ' (filtered)'}
            </div>
            {isAdmin ? (
              <>
                <IssueTable
                  issues={filteredIssues}
                  onEdit={handleEdit}
                  onDelete={handleDelete}
                  onResolve={handleResolve}
                />
                {pagination.totalPages > 1 && (
                  <div className="mt-4">
                    <Pagination
                      currentPage={currentPage}
                      totalPages={pagination.totalPages}
                      onPageChange={(page) => {
                        setCurrentPage(page);
                        window.scrollTo({ top: 0, behavior: 'smooth' });
                      }}
                    />
                  </div>
                )}
              </>
            ) : (
              <div className="space-y-4">
                {filteredIssues.map((issue) => (
                  <Link 
                    key={issue._id} 
                    to={`/issues/${issue._id}`}
                    className="block bg-white border rounded-lg p-4 hover:shadow-md transition-shadow"
                  >
                    <div className="flex justify-between items-start">
                      <div className="flex-1">
                        <h3 className="font-semibold text-gray-900">{issue.title}</h3>
                        <p className="text-sm text-gray-600 mt-1 line-clamp-2">{issue.description}</p>
                        <div className="flex items-center gap-2 mt-2">
                          <span className={`text-xs font-medium px-2 py-1 rounded ${getStatusColor(issue.status)}`}>
                            {issue.status.toUpperCase()}
                          </span>
                          <span className={`text-xs font-medium px-2 py-1 rounded ${getPriorityColor(issue.priority)}`}>
                            {issue.priority.toUpperCase()}
                          </span>
                        </div>
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            )}
            {!isAdmin && pagination.totalPages > 1 && (
              <div className="mt-4">
                <Pagination
                  currentPage={currentPage}
                  totalPages={pagination.totalPages}
                  onPageChange={(page) => {
                    setCurrentPage(page);
                    window.scrollTo({ top: 0, behavior: 'smooth' });
                  }}
                />
              </div>
            )}
          </>
        )}

        {editingIssue && (
          <IssueEditModal
            issue={editingIssue}
            onClose={() => setEditingIssue(null)}
            onSuccess={handleEditSuccess}
          />
        )}
      </div>
    </div>
  );
};

export default Issues;

