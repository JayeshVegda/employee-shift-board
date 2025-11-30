import React, { useState, useEffect } from 'react';
import { updateShift } from '../services/authService';
import Input from './Input';
import Button from './Button';

const EditShiftModal = ({ shift, employees, onClose, onSuccess }) => {
  const [formData, setFormData] = useState({
    employeeId: '',
    date: '',
    startTime: '',
    endTime: '',
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (shift) {
      const shiftDate = new Date(shift.date);
      const dateString = shiftDate.toISOString().split('T')[0];
      
      setFormData({
        employeeId: shift.employeeId?._id || shift.employeeId || '',
        date: dateString,
        startTime: shift.startTime || '',
        endTime: shift.endTime || '',
      });
    }
  }, [shift]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    // Validate
    if (!formData.employeeId || !formData.date || !formData.startTime || !formData.endTime) {
      setError('All fields are required');
      return;
    }

    const [startH, startM] = formData.startTime.split(':').map(Number);
    const [endH, endM] = formData.endTime.split(':').map(Number);
    const startMinutes = startH * 60 + startM;
    const endMinutes = endH * 60 + endM;

    if (endMinutes <= startMinutes) {
      setError('End time must be after start time');
      return;
    }

    setLoading(true);
    try {
      await updateShift(shift._id, {
        employeeId: formData.employeeId,
        date: formData.date,
        startTime: formData.startTime,
        endTime: formData.endTime,
      });
      onSuccess();
    } catch (err) {
      console.error('Error updating shift:', err);
      const errorData = err.response?.data;
      if (errorData?.errors && Array.isArray(errorData.errors)) {
        setError(errorData.errors.join(', '));
      } else {
        setError(errorData?.message || 'Failed to update shift');
      }
    } finally {
      setLoading(false);
    }
  };

  if (!shift) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
        <h2 className="text-2xl font-bold text-gray-900 mb-4">Edit Shift</h2>

        {error && (
          <div className="mb-4 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Employee <span className="text-red-500">*</span>
            </label>
            <select
              name="employeeId"
              value={formData.employeeId}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            >
              <option value="">Select an employee</option>
              {employees.map((emp) => (
                <option key={emp._id} value={emp._id}>
                  {emp.name} ({emp.employeeCode}) - {emp.department}
                </option>
              ))}
            </select>
          </div>

          <Input
            label="Date"
            type="date"
            name="date"
            value={formData.date}
            onChange={handleChange}
            required
          />

          <div className="grid grid-cols-2 gap-4 mb-4">
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

          <div className="flex gap-2 justify-end">
            <Button type="button" variant="secondary" onClick={onClose} disabled={loading}>
              Cancel
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? 'Updating...' : 'Update Shift'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EditShiftModal;


