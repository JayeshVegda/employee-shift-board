import React, { useState, useEffect } from 'react';
import { createIssue } from '../services/authService';
import Input from './Input';
import Button from './Button';

const IssueForm = ({ shift, onSuccess, onCancel }) => {
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    priority: 'medium',
  });
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [submitError, setSubmitError] = useState('');

  useEffect(() => {
    if (shift) {
      // Pre-fill form with shift details
      const employee = shift.employeeId;
      const date = new Date(shift.date).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
      });
      const [startH, startM] = shift.startTime.split(':').map(Number);
      const [endH, endM] = shift.endTime.split(':').map(Number);
      const startMinutes = startH * 60 + startM;
      const endMinutes = endH * 60 + endM;
      const duration = ((endMinutes - startMinutes) / 60).toFixed(1);

      const title = `Shift Issue - ${employee?.name || 'Employee'} (${employee?.employeeCode || 'N/A'}) - ${date}`;
      const description = `Shift Details:\n` +
        `Date: ${date}\n` +
        `Employee: ${employee?.name || 'N/A'} (${employee?.employeeCode || 'N/A'})\n` +
        `Department: ${employee?.department || 'N/A'}\n` +
        `Start Time: ${shift.startTime}\n` +
        `End Time: ${shift.endTime}\n` +
        `Duration: ${duration} hrs\n` +
        `Shift ID: ${shift._id}\n\n` +
        `Issue Description:\n`;

      setFormData({
        title,
        description,
        priority: 'medium',
      });
    }
  }, [shift]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: '' }));
    }
    setSubmitError('');
  };

  const validate = () => {
    const newErrors = {};

    if (!formData.title.trim()) {
      newErrors.title = 'Title is required';
    }
    if (!formData.description.trim()) {
      newErrors.description = 'Description is required';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitError('');

    if (!validate()) {
      return;
    }

    setLoading(true);
    try {
      // Include shift ID in the issue data for admin reference
      const issueData = {
        ...formData,
        shiftId: shift?._id || null,
        shiftData: shift ? {
          date: shift.date,
          employeeName: shift.employeeId?.name,
          employeeCode: shift.employeeId?.employeeCode,
          department: shift.employeeId?.department,
          startTime: shift.startTime,
          endTime: shift.endTime,
        } : null,
      };
      await createIssue(issueData);
      setFormData({
        title: '',
        description: '',
        priority: 'medium',
      });
      onSuccess();
    } catch (err) {
      console.error('Error creating issue:', err);
      const errorData = err.response?.data;
      setSubmitError(errorData?.message || 'Failed to create issue. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-gray-50 p-6 rounded-lg border border-gray-200">
      <h3 className="text-lg font-semibold mb-4">Report an Issue</h3>
      <form onSubmit={handleSubmit}>
        {submitError && (
          <div className="mb-4 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
            {submitError}
          </div>
        )}

        <Input
          label="Issue Title"
          type="text"
          name="title"
          value={formData.title}
          onChange={handleChange}
          error={errors.title}
          placeholder="e.g., Shift hours mismatch - showing 4hrs instead of 5hrs"
          required
        />

        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Description <span className="text-red-500">*</span>
          </label>
          <textarea
            name="description"
            value={formData.description}
            onChange={handleChange}
            rows={4}
            className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
              errors.description ? 'border-red-500' : 'border-gray-300'
            }`}
            placeholder="Describe the issue in detail..."
            required
          />
          {errors.description && (
            <p className="mt-1 text-sm text-red-500">{errors.description}</p>
          )}
        </div>

        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Priority
          </label>
          <select
            name="priority"
            value={formData.priority}
            onChange={handleChange}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="low">Low</option>
            <option value="medium">Medium</option>
            <option value="high">High</option>
            <option value="urgent">Urgent</option>
          </select>
        </div>

        <div className="flex gap-2 mt-4">
          <Button type="submit" disabled={loading}>
            {loading ? 'Submitting...' : 'Submit Issue'}
          </Button>
          {onCancel && (
            <Button type="button" variant="secondary" onClick={onCancel}>
              Cancel
            </Button>
          )}
        </div>
      </form>
    </div>
  );
};

export default IssueForm;

