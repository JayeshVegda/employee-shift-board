import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { changePassword } from '../services/authService';
import Input from '../components/Input';
import Button from '../components/Button';

const Settings = () => {
  const [formData, setFormData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const user = JSON.parse(localStorage.getItem('user') || '{}');

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: '' }));
    }
    setError('');
    setSuccess('');
  };

  const validate = () => {
    const newErrors = {};

    if (!formData.currentPassword) {
      newErrors.currentPassword = 'Current password is required';
    }
    if (!formData.newPassword) {
      newErrors.newPassword = 'New password is required';
    } else if (formData.newPassword.length < 6) {
      newErrors.newPassword = 'Password must be at least 6 characters long';
    }
    if (!formData.confirmPassword) {
      newErrors.confirmPassword = 'Please confirm your new password';
    } else if (formData.newPassword !== formData.confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (!validate()) {
      return;
    }

    setLoading(true);
    try {
      await changePassword(formData.currentPassword, formData.newPassword);
      setSuccess('Password changed successfully!');
      setFormData({
        currentPassword: '',
        newPassword: '',
        confirmPassword: '',
      });
    } catch (err) {
      console.error('Error changing password:', err);
      const errorData = err.response?.data;
      setError(errorData?.message || 'Failed to change password. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    navigate('/login');
  };

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

      <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-white shadow rounded-lg p-6">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">Settings</h2>

          {error && (
            <div className="mb-4 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
              {error}
            </div>
          )}

          {success && (
            <div className="mb-4 bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded">
              {success}
            </div>
          )}

          <form onSubmit={handleSubmit}>
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Change Password</h3>

            <Input
              label="Current Password"
              type="password"
              name="currentPassword"
              value={formData.currentPassword}
              onChange={handleChange}
              error={errors.currentPassword}
              placeholder="Enter your current password"
              required
            />

            <Input
              label="New Password"
              type="password"
              name="newPassword"
              value={formData.newPassword}
              onChange={handleChange}
              error={errors.newPassword}
              placeholder="Enter your new password (min 6 characters)"
              required
            />

            <Input
              label="Confirm New Password"
              type="password"
              name="confirmPassword"
              value={formData.confirmPassword}
              onChange={handleChange}
              error={errors.confirmPassword}
              placeholder="Confirm your new password"
              required
            />

            <div className="flex gap-2 mt-4">
              <Button type="submit" disabled={loading}>
                {loading ? 'Changing Password...' : 'Change Password'}
              </Button>
              <Button type="button" variant="secondary" onClick={() => navigate('/dashboard')}>
                Cancel
              </Button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Settings;


