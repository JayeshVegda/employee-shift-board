import React, { useState } from 'react';
import { createShift } from '../services/authService';
import Input from './Input';
import Button from './Button';

const ShiftForm = ({ employees, onSuccess, onCancel }) => {
  const [formData, setFormData] = useState({
    employeeId: '',
    date: '',
    startTime: '',
    endTime: '',
  });
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [submitError, setSubmitError] = useState('');

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    // Clear error for this field
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: '' }));
    }
    setSubmitError('');
  };

  const validate = () => {
    const newErrors = {};

    if (!formData.employeeId) {
      newErrors.employeeId = 'Employee is required';
    }
    if (!formData.date) {
      newErrors.date = 'Date is required';
    }
    if (!formData.startTime) {
      newErrors.startTime = 'Start time is required';
    }
    if (!formData.endTime) {
      newErrors.endTime = 'End time is required';
    }

    if (formData.startTime && formData.endTime) {
      const [startH, startM] = formData.startTime.split(':').map(Number);
      const [endH, endM] = formData.endTime.split(':').map(Number);
      const startMinutes = startH * 60 + startM;
      const endMinutes = endH * 60 + endM;

      if (endMinutes <= startMinutes) {
        newErrors.endTime = 'End time must be after start time';
      }
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
      console.log('Creating shift with data:', formData);
      await createShift(formData);
      setFormData({
        employeeId: '',
        date: '',
        startTime: '',
        endTime: '',
      });
      onSuccess();
    } catch (err) {
      console.error('Error creating shift:', err);
      const errorData = err.response?.data;
      if (errorData?.errors && Array.isArray(errorData.errors)) {
        setSubmitError(errorData.errors.join(', '));
      } else {
        setSubmitError(errorData?.message || 'Failed to create shift. Please check all fields and try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-gray-50 p-6 rounded-lg border border-gray-200">
      <h3 className="text-lg font-semibold mb-4">Create New Shift</h3>
      <form onSubmit={handleSubmit}>
        {submitError && (
          <div className="mb-4 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
            {submitError}
          </div>
        )}

          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Employee <span className="text-red-500">*</span>
            </label>
            {employees.length === 0 ? (
              <div className="text-sm text-yellow-600 bg-yellow-50 border border-yellow-200 px-3 py-2 rounded">
                No employees available. Please create employees first.
              </div>
            ) : (
              <>
                <select
                  name="employeeId"
                  value={formData.employeeId}
                  onChange={handleChange}
                  className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                    errors.employeeId ? 'border-red-500' : 'border-gray-300'
                  }`}
                >
                  <option value="">Select an employee</option>
                  {employees.map((emp) => (
                    <option key={emp._id} value={emp._id}>
                      {emp.name} ({emp.employeeCode}) - {emp.department}
                    </option>
                  ))}
                </select>
                {errors.employeeId && (
                  <p className="mt-1 text-sm text-red-500">{errors.employeeId}</p>
                )}
              </>
            )}
          </div>

        <Input
          label="Date"
          type="date"
          name="date"
          value={formData.date}
          onChange={handleChange}
          error={errors.date}
          required
        />

        <div className="grid grid-cols-2 gap-4">
          <Input
            label="Start Time"
            type="time"
            name="startTime"
            value={formData.startTime}
            onChange={handleChange}
            error={errors.startTime}
            required
          />
          <Input
            label="End Time"
            type="time"
            name="endTime"
            value={formData.endTime}
            onChange={handleChange}
            error={errors.endTime}
            required
          />
        </div>

        <div className="flex gap-2 mt-4">
          <Button type="submit" disabled={loading || employees.length === 0}>
            {loading ? 'Creating...' : 'Create Shift'}
          </Button>
          <Button type="button" variant="secondary" onClick={onCancel}>
            Cancel
          </Button>
        </div>
      </form>
    </div>
  );
};

export default ShiftForm;

