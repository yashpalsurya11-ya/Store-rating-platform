import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const ProtectedRoute = ({ children, allowedRoles }) => {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div style={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        minHeight: '100vh',
        backgroundColor: 'var(--bg-primary)',
        color: 'var(--text-muted)'
      }}>
        Loading authorization state...
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  if (allowedRoles && !allowedRoles.includes(user.role)) {
    // Redirect authorized users to their correct roles' index page
    if (user.role === 'Admin') return <Navigate to="/admin" replace />;
    if (user.role === 'StoreOwner') return <Navigate to="/store" replace />;
    return <Navigate to="/user" replace />;
  }

  return children;
};

export default ProtectedRoute;
