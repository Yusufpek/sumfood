import React from 'react';
import { Navigate } from 'react-router-dom';

/**
 * A wrapper component that protects routes based on authentication and role
 * @param {Object} props
 * @param {string} props.requiredRole - The role required to access this route
 * @param {string} props.redirectPath - Where to redirect if authentication fails
 * @param {React.ReactNode} props.children - The protected route content
 */
const ProtectedRoute = ({ children, requiredRole, redirectPath = '/login' }) => {
  const token = localStorage.getItem('token');
  const userType = localStorage.getItem('userType');
  const isAuthenticated = !!token;
  const hasRequiredRole = userType === requiredRole;
  
  if (!isAuthenticated || (requiredRole && !hasRequiredRole)) {
    return <Navigate to={redirectPath} replace />;
  }
  
  return children;
};

export default ProtectedRoute;
