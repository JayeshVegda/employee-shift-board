import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { getIssues, getUnreadIssueCount, deleteIssue } from '../services/authService';
import IssueForm from '../components/IssueForm';
import IssueTable from '../components/IssueTable';
import IssueEditModal from '../components/IssueEditModal';
import Pagination from '../components/Pagination';
import AdminLayout from '../components/AdminLayout';
import EmployeeLayout from '../components/EmployeeLayout';
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
      const interval = setInterval(() => {
        fetchUnreadCount();
        fetchIssues();
      }, 30000);
      return () => clearInterval(interval);
    }
  }, [isAdmin, filterStatus, filterPriority, showSolved, debouncedSearchQuery, currentPage]);

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearchQuery(searchQuery);
      setCurrentPage(1);
    }, 300);
    return () => clearTimeout(timer);
  }, [searchQuery]);

  const fetchIssues = async () => {
    if (!isAdmin && loading) return;
    setLoading(true);
    setError('');
    try {
      const data = await getIssues(null, filterPriority || null, currentPage, pageSize);
      if (data.issues && data.pagination) {
        setIssues(data.issues);
        setPagination(data.pagination);
      } else {
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
      localStorage.setItem('unreadIssues', data.count.toString());
    } catch (err) {
      console.error('Error fetching unread count:', err);
    }
  };

  const handleEdit = (issue) => {
    setEditingIssue(issue);
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this issue?')) {
      return;
    }
    try {
      await deleteIssue(id);
      fetchIssues();
      fetchUnreadCount();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to delete issue');
    }
  };

  const handleResolve = async (id) => {
    try {
      // This would typically update the issue status
      fetchIssues();
      fetchUnreadCount();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to resolve issue');
    }
  };

  const handleSuccess = () => {
    setShowForm(false);
    fetchIssues();
  };

  const handleEditSuccess = () => {
    setEditingIssue(null);
    fetchIssues();
    fetchUnreadCount();
  };

  const filteredIssues = issues.filter(issue => {
    if (showSolved) {
      if (issue.status !== 'resolved' && issue.status !== 'closed') return false;
    } else {
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

  const Layout = isAdmin ? AdminLayout : EmployeeLayout;

  return (
    <Layout 
      title={isAdmin ? "Issue Management" : "My Issues"} 
      subtitle={isAdmin ? "Track and resolve issues raised by employees" : "View and manage your reported issues"}
      currentPath="/issues"
    >
      {error && (
        <div className="mb-6 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
          {error}
        </div>
      )}

      {/* Tabs & Action Bar */}
      <div className="bg-white shadow rounded-lg p-6 mb-6">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
          <div className="flex items-center gap-2">
            {isAdmin && (
              <>
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
              </>
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

        {/* Search & Filters */}
        {isAdmin && !showSolved && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
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
                <option value="pending">Pending</option>
                <option value="open">Open</option>
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

      {/* Issues Table */}
      {loading ? (
        <div className="bg-white shadow rounded-lg p-8 text-center">
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
                <div className="mt-6">
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
        </>
      )}

      {editingIssue && (
        <IssueEditModal
          issue={editingIssue}
          onClose={() => setEditingIssue(null)}
          onSuccess={handleEditSuccess}
        />
      )}
    </AdminLayout>
  );
};

export default Issues;
