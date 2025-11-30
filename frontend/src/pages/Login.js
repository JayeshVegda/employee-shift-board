import React from 'react';
import { Link } from 'react-router-dom';
import Button from '../components/Button';

const Login = () => {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8 bg-white p-8 rounded-lg shadow-md">
        <div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
            Employee Shift Board
          </h2>
          <p className="mt-2 text-center text-sm text-gray-600">
            Choose your login type
          </p>
        </div>
        <div className="mt-8 space-y-4">
          <Link to="/login/employee" className="block">
            <Button className="w-full">
              Employee Login
            </Button>
          </Link>
          <Link to="/login/admin" className="block">
            <Button className="w-full">
              Admin Login
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
};

export default Login;

