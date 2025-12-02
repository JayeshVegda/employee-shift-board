import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import Button from './Button';

const AdminLayout = ({ children, title, subtitle, currentPath }) => {
  const navigate = useNavigate();
  const user = JSON.parse(localStorage.getItem('user') || '{}');
  const unreadIssues = parseInt(localStorage.getItem('unreadIssues') || '0');

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    localStorage.removeItem('unreadIssues');
    navigate('/login');
  };

  const isActive = (path) => {
    return currentPath === path ? 'font-semibold text-blue-600 border-b-2 border-blue-600 pb-1' : 'text-gray-600 hover:text-gray-800';
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      {/* Global Header - Same on all pages */}
      <nav className="bg-white shadow-sm border-b sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16 items-center">
            <Link to="/dashboard" className="text-xl font-bold text-gray-900 hover:text-blue-600">
              Employee Shift Board
            </Link>
            <div className="flex items-center gap-6">
              <Link to="/employees" className={`text-sm ${isActive('/employees')}`}>
                Employees
              </Link>
              <Link to="/issues" className={`text-sm relative ${isActive('/issues')}`}>
                Issues
                {unreadIssues > 0 && (
                  <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                    {unreadIssues}
                  </span>
                )}
              </Link>
              <Link to="/settings" className={`text-sm ${isActive('/settings')}`}>
                Settings
              </Link>
              <div className="ml-4 pl-4 border-l border-gray-300">
                <span className="text-sm text-gray-600">{user.email}</span>
                <Button onClick={handleLogout} variant="secondary" className="ml-2">
                  Logout
                </Button>
              </div>
            </div>
          </div>
        </div>
      </nav>

      {/* Page Content */}
      <div className="flex-1">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Page Title & Subtitle */}
          {title && (
            <div className="mb-8">
              <h2 className="text-3xl font-bold text-gray-900 mb-2">{title}</h2>
              {subtitle && (
                <p className="text-base text-gray-600">{subtitle}</p>
              )}
            </div>
          )}
          {children}
        </div>
      </div>

      {/* Footer - Same on all pages */}
      <footer className="bg-white border-t mt-auto">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex justify-between items-center text-sm text-gray-500">
            <p>© 2025 Employee Shift Board. All rights reserved.</p>
            <p>Version 1.0.0</p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default AdminLayout;




