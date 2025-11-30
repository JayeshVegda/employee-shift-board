import React from 'react';
import { Navigate } from 'react-router-dom';

const ProtectedRoute = ({ children }) => {
  const token = localStorage.getItem('token');
  
  if (!token) {
    // Redirect to employee login by default
    return <Navigate to="/login/employee" replace />;
  }

  return children;
};

export default ProtectedRoute;

