import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function ProtectedRoute({ children, allowedRoles }) {
  const { isLoggedIn, role, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    return (
      <div style={{ padding: '4rem 1rem', textAlign: 'center', color: 'var(--text-muted)' }}>
        Verifying user authorization...
      </div>
    );
  }

  if (!isLoggedIn) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  if (allowedRoles && !allowedRoles.includes(role)) {
    // If logged in but role not allowed, redirect to their role's dashboard
    if (role === 'admin') return <Navigate to="/admin-dashboard" replace />;
    if (role === 'ngo') return <Navigate to="/ngo-dashboard" replace />;
    return <Navigate to="/volunteer-dashboard" replace />;
  }

  return children;
}
