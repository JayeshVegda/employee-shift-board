import React, { useState, useEffect } from 'react';
import { updateIssue, updateShift } from '../services/authService';
import Input from './Input';
import Button from './Button';
import { calculateDuration } from '../utils/issueHelpers';

const IssueEditModal = ({ issue, onClose, onSuccess }) => {
  const [formData, setFormData] = useState({
    startTime: '',
    endTime: '',
    adminResponse: '',
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (issue) {
      const shiftData = issue.shiftData || {};
      setFormData({
        startTime: shiftData.startTime || '',
        endTime: shiftData.endTime || '',
        adminResponse: issue.adminResponse || '',
      });
    }
  }, [issue]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const getDuration = () => {
    const duration = calculateDuration(formData.startTime, formData.endTime);
    return duration === 'N/A' ? '0.0' : duration.replace(' hrs', '');
  };

  const handleSave = async () => {
    setLoading(true);
    setError('');

    // Validate times only if shift data exists
    if (issue.shiftData && (!formData.startTime || !formData.endTime)) {
      setError('Please enter both start and end times');
      setLoading(false);
      return;
    }

    try {
      // Update the shift if shiftId exists
      if (issue.shiftId && issue.shiftData) {
        try {
          await updateShift(issue.shiftId, {
            startTime: formData.startTime,
            endTime: formData.endTime,
            date: issue.shiftData?.date,
          });
        } catch (shiftError) {
          console.error('Error updating shift:', shiftError);
          // Continue even if shift update fails - issue will still be updated
        }
      }

      // Calculate corrected duration if shift data exists
      let duration = 0;
      if (issue.shiftData && formData.startTime && formData.endTime) {
        const durationStr = getDuration();
        duration = parseFloat(durationStr === '0.0' ? '0' : durationStr);
      }

      // Update issue with corrected data and admin response
      const updateData = {
        adminResponse: formData.adminResponse,
        status: 'resolved',
      };

      // Only add corrected shift data if shift data exists
      if (issue.shiftData && formData.startTime && formData.endTime) {
        updateData.correctedShiftData = {
          date: issue.shiftData.date || new Date(),
          startTime: formData.startTime,
          endTime: formData.endTime,
          duration: duration,
        };
      }

      await updateIssue(issue._id, updateData);

      onSuccess();
    } catch (err) {
      console.error('Error saving issue:', err);
      setError(err.response?.data?.message || err.response?.data?.errors?.join(', ') || 'Failed to save changes');
    } finally {
      setLoading(false);
    }
  };

  if (!issue) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
        <h2 className="text-2xl font-bold text-gray-900 mb-4">Edit Issue & Resolve</h2>

        {error && (
          <div className="mb-4 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
            {error}
          </div>
        )}

        {issue.shiftData ? (
          <>
            <div className="mb-4 p-4 bg-gray-50 rounded-lg">
              <h3 className="font-semibold text-gray-900 mb-2">Original Shift Details</h3>
              <div className="grid grid-cols-2 gap-2 text-sm">
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
                  <span className="text-gray-600">Original Time:</span>
                  <span className="ml-2 font-medium">
                    {issue.shiftData.startTime} - {issue.shiftData.endTime}
                  </span>
                </div>
                <div>
                  <span className="text-gray-600">Issue:</span>
                  <span className="ml-2 font-medium text-red-600">{issue.title}</span>
                </div>
              </div>
            </div>

            <div className="mb-4">
              <h3 className="font-semibold text-gray-900 mb-3">Corrected Shift Timing</h3>
              <div className="grid grid-cols-2 gap-4">
                <Input
                  label="Start Time"
                  type="time"
                  name="startTime"
                  value={formData.startTime}
                  onChange={handleChange}
                  required
                />
                <Input
                  label="End Time"
                  type="time"
                  name="endTime"
                  value={formData.endTime}
                  onChange={handleChange}
                  required
                />
              </div>
              <div className="mt-2 text-sm text-gray-600">
                Corrected Duration: <span className="font-semibold">{getDuration()} hrs</span>
              </div>
            </div>
          </>
        ) : (
          <div className="mb-4 p-4 bg-gray-50 rounded-lg">
            <h3 className="font-semibold text-gray-900 mb-2">Issue Details</h3>
            <div className="text-sm">
              <div className="mb-2">
                <span className="text-gray-600">Title:</span>
                <span className="ml-2 font-medium">{issue.title}</span>
              </div>
              <div>
                <span className="text-gray-600">Description:</span>
                <p className="ml-2 mt-1 text-gray-700 whitespace-pre-wrap">{issue.description}</p>
              </div>
            </div>
          </div>
        )}

        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Admin Response Message
          </label>
          <textarea
            name="adminResponse"
            value={formData.adminResponse}
            onChange={handleChange}
            rows={4}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="e.g., Issue resolved. Shift timing has been corrected to 5 hours as requested."
          />
        </div>

        <div className="flex gap-2 justify-end">
          <Button variant="secondary" onClick={onClose} disabled={loading}>
            Cancel
          </Button>
          <Button onClick={handleSave} disabled={loading}>
            {loading ? 'Saving...' : 'Save & Mark Resolved'}
          </Button>
        </div>
      </div>
    </div>
  );
};

export default IssueEditModal;

