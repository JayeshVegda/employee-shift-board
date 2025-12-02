import React, { useState, useEffect } from 'react';
import { createEmployee, updateEmployee } from '../services/authService';
import Input from './Input';
import Button from './Button';

const EmployeeForm = ({ employee, onSuccess, onCancel }) => {
  const [formData, setFormData] = useState({
    name: '',
    employeeCode: '',
    department: '',
  });
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [submitError, setSubmitError] = useState('');

  useEffect(() => {
    if (employee) {
      setFormData({
        name: employee.name || '',
        employeeCode: employee.employeeCode || '',
        department: employee.department || '',
      });
    }
  }, [employee]);

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

    if (!formData.name.trim()) {
      newErrors.name = 'Name is required';
    }
    if (!formData.employeeCode.trim()) {
      newErrors.employeeCode = 'Employee code is required';
    }
    if (!formData.department.trim()) {
      newErrors.department = 'Department is required';
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
      console.log('Submitting employee form:', { employee, formData });
      if (employee) {
        await updateEmployee(employee._id, formData);
      } else {
        await createEmployee(formData);
      }
      setFormData({
        name: '',
        employeeCode: '',
        department: '',
      });
      onSuccess();
    } catch (err) {
      console.error('Error saving employee:', err);
      const errorData = err.response?.data;
      if (err.response) {
        // Server responded with error
        setSubmitError(errorData?.message || 'Failed to save employee');
      } else if (err.request) {
        // Request made but no response (server not running or network issue)
        setSubmitError('Cannot connect to server. Please make sure the backend is running.');
      } else {
        // Something else happened
        setSubmitError(err.message || 'Failed to save employee');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit}>
        {submitError && (
          <div className="mb-4 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
            {submitError}
          </div>
        )}

        <Input
          label="Name"
          type="text"
          name="name"
          value={formData.name}
          onChange={handleChange}
          error={errors.name}
          placeholder="Enter employee name"
          required
        />

        <Input
          label="Employee Code"
          type="text"
          name="employeeCode"
          value={formData.employeeCode}
          onChange={handleChange}
          error={errors.employeeCode}
          placeholder="e.g., EMP001"
          required
        />

        <Input
          label="Department"
          type="text"
          name="department"
          value={formData.department}
          onChange={handleChange}
          error={errors.department}
          placeholder="e.g., Operations, IT, HR"
          required
        />

        <div className="flex gap-2 mt-4">
          <Button type="submit" disabled={loading}>
            {loading ? 'Saving...' : employee ? 'Update Employee' : 'Create Employee'}
          </Button>
          <Button type="button" variant="secondary" onClick={onCancel}>
            Cancel
          </Button>
        </div>
      </form>
  );
};

export default EmployeeForm;

