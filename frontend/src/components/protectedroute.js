import React from 'react';
import { Navigate } from 'react-router-dom';

const ProtectedRoute = ({ children }) => {
  const token = localStorage.getItem('authToken');
  const user = localStorage.getItem('user');

  // If no token or user data, redirect to login
  if (!token || !user) {
    return <Navigate to="/" replace />;
  }

  return children;
};

export default ProtectedRoute;