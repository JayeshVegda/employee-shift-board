import React, { useState, useEffect } from 'react';
import { createShift, createBulkShifts, createRecurringShifts } from '../services/authService';
import Input from './Input';
import Button from './Button';

const AdvancedShiftForm = ({ employees, onSuccess, onCancel }) => {
  const [mode, setMode] = useState('bulk'); // 'bulk', 'recurring', 'template'
  const [formData, setFormData] = useState({
    // Bulk mode
    employeeIds: [],
    startDate: '',
    endDate: '',
    startTime: '',
    endTime: '',
    excludeWeekends: true,
    
    // Recurring mode
    employeeId: '',
    startDateRecurring: '',
    endDateRecurring: '',
    startTimeRecurring: '',
    endTimeRecurring: '',
    frequency: 'daily', // daily, weekly
    daysOfWeek: [], // For weekly
    
    // Template
    templateName: '',
    startTimeTemplate: '',
    endTimeTemplate: '',
    department: '',
  });
  
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [submitError, setSubmitError] = useState('');
  const [templates, setTemplates] = useState([]);

  useEffect(() => {
    // Load templates from localStorage
    const savedTemplates = localStorage.getItem('shiftTemplates');
    if (savedTemplates) {
      setTemplates(JSON.parse(savedTemplates));
    }
  }, []);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    if (type === 'checkbox') {
      if (name === 'daysOfWeek') {
        const updated = formData.daysOfWeek.includes(value)
          ? formData.daysOfWeek.filter(d => d !== value)
          : [...formData.daysOfWeek, value];
        setFormData(prev => ({ ...prev, daysOfWeek: updated }));
      } else {
        setFormData(prev => ({ ...prev, [name]: checked }));
      }
    } else if (type === 'select-multiple') {
      const selected = Array.from(e.target.selectedOptions, option => option.value);
      setFormData(prev => ({ ...prev, [name]: selected }));
    } else {
      setFormData(prev => ({ ...prev, [name]: value }));
    }
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
    setSubmitError('');
  };

  const validateBulk = () => {
    const newErrors = {};
    if (formData.employeeIds.length === 0) {
      newErrors.employeeIds = 'Select at least one employee';
    }
    if (!formData.startDate) {
      newErrors.startDate = 'Start date is required';
    }
    if (!formData.endDate) {
      newErrors.endDate = 'End date is required';
    }
    if (!formData.startTime) {
      newErrors.startTime = 'Start time is required';
    }
    if (!formData.endTime) {
      newErrors.endTime = 'End time is required';
    }
    if (formData.startDate && formData.endDate && new Date(formData.startDate) > new Date(formData.endDate)) {
      newErrors.endDate = 'End date must be after start date';
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const validateRecurring = () => {
    const newErrors = {};
    if (!formData.employeeId) {
      newErrors.employeeId = 'Employee is required';
    }
    if (!formData.startDateRecurring) {
      newErrors.startDateRecurring = 'Start date is required';
    }
    if (!formData.endDateRecurring) {
      newErrors.endDateRecurring = 'End date is required';
    }
    if (!formData.startTimeRecurring) {
      newErrors.startTimeRecurring = 'Start time is required';
    }
    if (!formData.endTimeRecurring) {
      newErrors.endTimeRecurring = 'End time is required';
    }
    if (formData.frequency === 'weekly' && formData.daysOfWeek.length === 0) {
      newErrors.daysOfWeek = 'Select at least one day';
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleBulkSubmit = async (e) => {
    e.preventDefault();
    setSubmitError('');

    if (!validateBulk()) {
      return;
    }

    setLoading(true);
    try {
      const start = new Date(formData.startDate);
      const end = new Date(formData.endDate);
      const shifts = [];

      for (let d = new Date(start); d <= end; d.setDate(d.getDate() + 1)) {
        const dayOfWeek = d.getDay();
        
        // Skip weekends if option is checked
        if (formData.excludeWeekends && (dayOfWeek === 0 || dayOfWeek === 6)) {
          continue;
        }

        // Create shift for each selected employee
        for (const empId of formData.employeeIds) {
          shifts.push({
            employeeId: empId,
            date: new Date(d),
            startTime: formData.startTime,
            endTime: formData.endTime,
          });
        }
      }

      // Create shifts in batches
      const batchSize = 10;
      for (let i = 0; i < shifts.length; i += batchSize) {
        const batch = shifts.slice(i, i + batchSize);
        await Promise.all(batch.map(shift => createShift(shift)));
      }

      onSuccess();
    } catch (err) {
      console.error('Error creating bulk shifts:', err);
      setSubmitError(err.response?.data?.message || 'Failed to create shifts');
    } finally {
      setLoading(false);
    }
  };

  const handleRecurringSubmit = async (e) => {
    e.preventDefault();
    setSubmitError('');

    if (!validateRecurring()) {
      return;
    }

    setLoading(true);
    try {
      const start = new Date(formData.startDateRecurring);
      const end = new Date(formData.endDateRecurring);
      const shifts = [];

      for (let d = new Date(start); d <= end; d.setDate(d.getDate() + 1)) {
        const dayOfWeek = d.getDay();
        const dayName = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'][dayOfWeek];

        if (formData.frequency === 'daily') {
          // Create shift every day (skip weekends)
          if (dayOfWeek !== 0 && dayOfWeek !== 6) {
            shifts.push({
              employeeId: formData.employeeId,
              date: new Date(d),
              startTime: formData.startTimeRecurring,
              endTime: formData.endTimeRecurring,
            });
          }
        } else if (formData.frequency === 'weekly') {
          // Create shift only on selected days
          if (formData.daysOfWeek.includes(dayName)) {
            shifts.push({
              employeeId: formData.employeeId,
              date: new Date(d),
              startTime: formData.startTimeRecurring,
              endTime: formData.endTimeRecurring,
            });
          }
        }
      }

      // Create shifts in batches
      const batchSize = 10;
      for (let i = 0; i < shifts.length; i += batchSize) {
        const batch = shifts.slice(i, i + batchSize);
        await Promise.all(batch.map(shift => createShift(shift)));
      }

      onSuccess();
    } catch (err) {
      console.error('Error creating recurring shifts:', err);
      setSubmitError(err.response?.data?.message || 'Failed to create shifts');
    } finally {
      setLoading(false);
    }
  };

  const handleSaveTemplate = () => {
    if (!formData.templateName || !formData.startTimeTemplate || !formData.endTimeTemplate) {
      setSubmitError('Template name and times are required');
      return;
    }

    const newTemplate = {
      id: Date.now(),
      name: formData.templateName,
      startTime: formData.startTimeTemplate,
      endTime: formData.endTimeTemplate,
      department: formData.department,
    };

    const updated = [...templates, newTemplate];
    setTemplates(updated);
    localStorage.setItem('shiftTemplates', JSON.stringify(updated));
    setFormData(prev => ({ ...prev, templateName: '', startTimeTemplate: '', endTimeTemplate: '', department: '' }));
    alert('Template saved!');
  };

  const handleUseTemplate = (template) => {
    setFormData(prev => ({
      ...prev,
      startTime: template.startTime,
      endTime: template.endTime,
      startTimeRecurring: template.startTime,
      endTimeRecurring: template.endTime,
    }));
    setMode('bulk');
  };

  return (
    <div className="bg-gray-50 p-6 rounded-lg border border-gray-200">
      <h3 className="text-lg font-semibold mb-4">Advanced Shift Creation</h3>

      {/* Mode selector */}
      <div className="flex gap-2 mb-4 border-b border-gray-200 pb-4">
        <button
          type="button"
          onClick={() => setMode('bulk')}
          className={`px-4 py-2 text-sm font-medium rounded ${
            mode === 'bulk' ? 'bg-blue-500 text-white' : 'bg-white text-gray-700 hover:bg-gray-100'
          }`}
        >
          Bulk Create
        </button>
        <button
          type="button"
          onClick={() => setMode('recurring')}
          className={`px-4 py-2 text-sm font-medium rounded ${
            mode === 'recurring' ? 'bg-blue-500 text-white' : 'bg-white text-gray-700 hover:bg-gray-100'
          }`}
        >
          Recurring
        </button>
        <button
          type="button"
          onClick={() => setMode('template')}
          className={`px-4 py-2 text-sm font-medium rounded ${
            mode === 'template' ? 'bg-blue-500 text-white' : 'bg-white text-gray-700 hover:bg-gray-100'
          }`}
        >
          Templates
        </button>
      </div>

      {submitError && (
        <div className="mb-4 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
          {submitError}
        </div>
      )}

      {/* Bulk Create Mode */}
      {mode === 'bulk' && (
        <form onSubmit={handleBulkSubmit}>
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Select Employees <span className="text-red-500">*</span>
            </label>
            <select
              multiple
              name="employeeIds"
              value={formData.employeeIds}
              onChange={handleChange}
              size="5"
              className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                errors.employeeIds ? 'border-red-500' : 'border-gray-300'
              }`}
            >
              {employees.map((emp) => (
                <option key={emp._id} value={emp._id}>
                  {emp.name} ({emp.employeeCode}) - {emp.department}
                </option>
              ))}
            </select>
            <p className="mt-1 text-xs text-gray-500">Hold Ctrl/Cmd to select multiple</p>
            {errors.employeeIds && (
              <p className="mt-1 text-sm text-red-500">{errors.employeeIds}</p>
            )}
          </div>

          <div className="grid grid-cols-2 gap-4 mb-4">
            <Input
              label="Start Date"
              type="date"
              name="startDate"
              value={formData.startDate}
              onChange={handleChange}
              error={errors.startDate}
              required
            />
            <Input
              label="End Date"
              type="date"
              name="endDate"
              value={formData.endDate}
              onChange={handleChange}
              error={errors.endDate}
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-4 mb-4">
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

          <div className="mb-4">
            <label className="flex items-center">
              <input
                type="checkbox"
                name="excludeWeekends"
                checked={formData.excludeWeekends}
                onChange={handleChange}
                className="mr-2"
              />
              <span className="text-sm text-gray-700">Exclude weekends</span>
            </label>
          </div>

          <div className="flex gap-2">
            <Button type="submit" disabled={loading}>
              {loading ? 'Creating...' : 'Create Bulk Shifts'}
            </Button>
            <Button type="button" variant="secondary" onClick={onCancel}>
              Cancel
            </Button>
          </div>
        </form>
      )}

      {/* Recurring Mode */}
      {mode === 'recurring' && (
        <form onSubmit={handleRecurringSubmit}>
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Employee <span className="text-red-500">*</span>
            </label>
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
          </div>

          <div className="grid grid-cols-2 gap-4 mb-4">
            <Input
              label="Start Date"
              type="date"
              name="startDateRecurring"
              value={formData.startDateRecurring}
              onChange={handleChange}
              error={errors.startDateRecurring}
              required
            />
            <Input
              label="End Date"
              type="date"
              name="endDateRecurring"
              value={formData.endDateRecurring}
              onChange={handleChange}
              error={errors.endDateRecurring}
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-4 mb-4">
            <Input
              label="Start Time"
              type="time"
              name="startTimeRecurring"
              value={formData.startTimeRecurring}
              onChange={handleChange}
              error={errors.startTimeRecurring}
              required
            />
            <Input
              label="End Time"
              type="time"
              name="endTimeRecurring"
              value={formData.endTimeRecurring}
              onChange={handleChange}
              error={errors.endTimeRecurring}
              required
            />
          </div>

          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Frequency <span className="text-red-500">*</span>
            </label>
            <select
              name="frequency"
              value={formData.frequency}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="daily">Daily (weekdays only)</option>
              <option value="weekly">Weekly (selected days)</option>
            </select>
          </div>

          {formData.frequency === 'weekly' && (
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Days of Week <span className="text-red-500">*</span>
              </label>
              <div className="flex flex-wrap gap-2">
                {['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'].map(day => (
                  <label key={day} className="flex items-center">
                    <input
                      type="checkbox"
                      name="daysOfWeek"
                      value={day}
                      checked={formData.daysOfWeek.includes(day)}
                      onChange={handleChange}
                      className="mr-1"
                    />
                    <span className="text-sm">{day.substring(0, 3)}</span>
                  </label>
                ))}
              </div>
              {errors.daysOfWeek && (
                <p className="mt-1 text-sm text-red-500">{errors.daysOfWeek}</p>
              )}
            </div>
          )}

          <div className="flex gap-2">
            <Button type="submit" disabled={loading}>
              {loading ? 'Creating...' : 'Create Recurring Shifts'}
            </Button>
            <Button type="button" variant="secondary" onClick={onCancel}>
              Cancel
            </Button>
          </div>
        </form>
      )}

      {/* Template Mode */}
      {mode === 'template' && (
        <div>
          <div className="mb-6">
            <h4 className="font-semibold mb-3">Save New Template</h4>
            <div className="grid grid-cols-2 gap-4 mb-4">
              <Input
                label="Template Name"
                type="text"
                name="templateName"
                value={formData.templateName}
                onChange={handleChange}
                placeholder="e.g., Standard Office Hours"
              />
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Department</label>
                <select
                  name="department"
                  value={formData.department}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                >
                  <option value="">All Departments</option>
                  {[...new Set(employees.map(e => e.department))].map(dept => (
                    <option key={dept} value={dept}>{dept}</option>
                  ))}
                </select>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4 mb-4">
              <Input
                label="Start Time"
                type="time"
                name="startTimeTemplate"
                value={formData.startTimeTemplate}
                onChange={handleChange}
              />
              <Input
                label="End Time"
                type="time"
                name="endTimeTemplate"
                value={formData.endTimeTemplate}
                onChange={handleChange}
              />
            </div>
            <Button onClick={handleSaveTemplate}>Save Template</Button>
          </div>

          {templates.length > 0 && (
            <div>
              <h4 className="font-semibold mb-3">Saved Templates</h4>
              <div className="space-y-2">
                {templates.map(template => (
                  <div key={template.id} className="flex items-center justify-between bg-white p-3 rounded border">
                    <div>
                      <p className="font-medium">{template.name}</p>
                      <p className="text-sm text-gray-600">
                        {template.startTime} - {template.endTime}
                        {template.department && ` • ${template.department}`}
                      </p>
                    </div>
                    <Button onClick={() => handleUseTemplate(template)} variant="secondary" className="text-sm">
                      Use
                    </Button>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default AdvancedShiftForm;


