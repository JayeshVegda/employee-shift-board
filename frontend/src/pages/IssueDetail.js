import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { getIssueById, updateIssue } from '../services/authService';
import Button from '../components/Button';
import { getStatusColor, getPriorityColor } from '../utils/issueHelpers';

const IssueDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [issue, setIssue] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [adminNotes, setAdminNotes] = useState('');
  const [saving, setSaving] = useState(false);

  const user = JSON.parse(localStorage.getItem('user') || '{}');
  const isAdmin = user.role === 'admin';

  useEffect(() => {
    fetchIssue();
  }, [id]);

  const fetchIssue = async () => {
    setLoading(true);
    setError('');
    try {
      const data = await getIssueById(id);
      setIssue(data);
      setAdminNotes(data.adminNotes || '');
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to fetch issue');
      console.error('Error fetching issue:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateStatus = async (status) => {
    setSaving(true);
    try {
      const updateData = { status };
      if (status === 'resolved' || status === 'closed') {
        updateData.adminNotes = adminNotes;
      }
      await updateIssue(id, updateData);
      fetchIssue();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to update issue');
    } finally {
      setSaving(false);
    }
  };

  const handleSaveNotes = async () => {
    setSaving(true);
    try {
      await updateIssue(id, { adminNotes });
      setError('');
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to save notes');
    } finally {
      setSaving(false);
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };


  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <p className="text-gray-600">Loading issue...</p>
      </div>
    );
  }

  if (error && !issue) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-600 mb-4">{error}</p>
          <Button onClick={() => navigate('/issues')}>Back to Issues</Button>
        </div>
      </div>
    );
  }

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
              <Link to="/issues" className="text-sm text-blue-600 hover:text-blue-800">
                Issues
              </Link>
            </div>
          </div>
        </div>
      </nav>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {error && (
          <div className="mb-4 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
            {error}
          </div>
        )}

        <div className="bg-white shadow rounded-lg p-6 mb-6">
          <div className="flex justify-between items-start mb-4">
            <div>
              <h2 className="text-2xl font-bold text-gray-900 mb-2">{issue.title}</h2>
              <div className="flex flex-wrap items-center gap-2">
                <span className={`text-sm font-medium px-3 py-1 rounded ${getStatusColor(issue.status)}`}>
                  {issue.status.toUpperCase()}
                </span>
                <span className={`text-sm font-medium px-3 py-1 rounded ${getPriorityColor(issue.priority)}`}>
                  {issue.priority.toUpperCase()}
                </span>
                {!issue.isRead && isAdmin && (
                  <span className="bg-blue-500 text-white text-xs px-2 py-1 rounded-full">
                    New
                  </span>
                )}
              </div>
            </div>
            {isAdmin && issue.status !== 'closed' && (
              <div className="flex gap-2">
                {issue.status === 'open' && (
                  <Button onClick={() => handleUpdateStatus('in-progress')} disabled={saving}>
                    Start Working
                  </Button>
                )}
                {issue.status === 'in-progress' && (
                  <Button onClick={() => handleUpdateStatus('resolved')} disabled={saving}>
                    Mark Resolved
                  </Button>
                )}
                {issue.status === 'resolved' && (
                  <Button variant="secondary" onClick={() => handleUpdateStatus('closed')} disabled={saving}>
                    Close Issue
                  </Button>
                )}
              </div>
            )}
          </div>

          {issue.shiftData && (
            <div className="border-t border-gray-200 pt-4 mt-4">
              <h3 className="font-semibold text-gray-900 mb-3">Related Shift Information</h3>
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <div className="grid grid-cols-2 gap-3 text-sm">
                  <div>
                    <span className="text-gray-600">Date:</span>
                    <span className="ml-2 font-medium">
                      {new Date(issue.shiftData.date).toLocaleDateString('en-US', {
                        year: 'numeric',
                        month: 'short',
                        day: 'numeric',
                      })}
                    </span>
                  </div>
                  <div>
                    <span className="text-gray-600">Employee:</span>
                    <span className="ml-2 font-medium">
                      {issue.shiftData.employeeName} ({issue.shiftData.employeeCode})
                    </span>
                  </div>
                  <div>
                    <span className="text-gray-600">Department:</span>
                    <span className="ml-2 font-medium">{issue.shiftData.department}</span>
                  </div>
                  <div>
                    <span className="text-gray-600">Time:</span>
                    <span className="ml-2 font-medium">
                      {issue.shiftData.startTime} - {issue.shiftData.endTime}
                    </span>
                  </div>
                </div>
                {issue.shiftId && (
                  <div className="mt-2 text-xs text-gray-500">
                    Shift ID: {issue.shiftId}
                  </div>
                )}
              </div>
            </div>
          )}

          {issue.correctedShiftData && (
            <div className="border-t border-gray-200 pt-4 mt-4">
              <h3 className="font-semibold text-gray-900 mb-3">Corrected Shift Information</h3>
              <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                <div className="grid grid-cols-2 gap-3 text-sm">
                  <div>
                    <span className="text-gray-600">Corrected Time:</span>
                    <span className="ml-2 font-medium">
                      {issue.correctedShiftData.startTime} - {issue.correctedShiftData.endTime}
                    </span>
                  </div>
                  <div>
                    <span className="text-gray-600">Corrected Duration:</span>
                    <span className="ml-2 font-medium text-green-600">
                      {issue.correctedShiftData.duration} hrs
                    </span>
                  </div>
                </div>
              </div>
            </div>
          )}

          <div className="border-t border-gray-200 pt-4 mt-4">
            <h3 className="font-semibold text-gray-900 mb-2">Description</h3>
            <p className="text-gray-700 whitespace-pre-wrap">{issue.description}</p>
          </div>

          {issue.adminResponse && (
            <div className="border-t border-gray-200 pt-4 mt-4">
              <h3 className="font-semibold text-gray-900 mb-2">Admin Response</h3>
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <p className="text-gray-700 whitespace-pre-wrap">{issue.adminResponse}</p>
              </div>
            </div>
          )}

          <div className="grid grid-cols-2 gap-4 mt-6 pt-4 border-t border-gray-200">
            <div>
              <p className="text-sm text-gray-500">Created By</p>
              <p className="font-medium">{issue.createdBy?.email || 'Unknown'}</p>
            </div>
            <div>
              <p className="text-sm text-gray-500">Created At</p>
              <p className="font-medium">{formatDate(issue.createdAt)}</p>
            </div>
            {issue.assignedTo && (
              <div>
                <p className="text-sm text-gray-500">Assigned To</p>
                <p className="font-medium">{issue.assignedTo.email}</p>
              </div>
            )}
            {issue.resolvedBy && (
              <div>
                <p className="text-sm text-gray-500">Resolved By</p>
                <p className="font-medium">{issue.resolvedBy.email}</p>
                <p className="text-xs text-gray-400">{formatDate(issue.resolvedAt)}</p>
              </div>
            )}
          </div>
        </div>

        {isAdmin && (
          <div className="bg-white shadow rounded-lg p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Admin Notes</h3>
            <textarea
              value={adminNotes}
              onChange={(e) => setAdminNotes(e.target.value)}
              rows={4}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Add notes about resolving this issue..."
            />
            <div className="mt-4 flex gap-2">
              <Button onClick={handleSaveNotes} disabled={saving}>
                {saving ? 'Saving...' : 'Save Notes'}
              </Button>
            </div>
          </div>
        )}

        <div className="mt-6">
          <Button variant="secondary" onClick={() => navigate('/issues')}>
            Back to Issues
          </Button>
        </div>
      </div>
    </div>
  );
};

export default IssueDetail;

