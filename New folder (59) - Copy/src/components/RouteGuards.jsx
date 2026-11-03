import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const ROLE_HOME = {
  admin: '/dashboard',
  chairman: '/dashboard',
  salesman: '/shop',
  godown_manager: '/godown',
};

export function ProtectedRoute({ children, allowedRoles, reqPerm }) {
  const { user, profile, loading } = useAuth();
  if (loading) return (
    <div className="loading-center" style={{minHeight:'100vh'}}>
      <div className="spinner" style={{width:40,height:40}} />
    </div>
  );
  if (!user || !profile) return <Navigate to="/login" replace />;
  if (!profile.isActive) return <Navigate to="/login" replace />;
  
  let hasAccess = false;
  if (reqPerm && profile.permissions && profile.permissions[reqPerm]) {
    hasAccess = true;
  } else if (allowedRoles && allowedRoles.includes(profile.role)) {
    hasAccess = true;
  } else if (!reqPerm && !allowedRoles) {
    hasAccess = true;
  }

  if (!hasAccess) {
    return <Navigate to={ROLE_HOME[profile.role] || '/login'} replace />;
  }
  
  return children;
}

export function PublicRoute({ children }) {
  const { user, profile, loading } = useAuth();
  if (loading) return (
    <div className="loading-center" style={{minHeight:'100vh'}}>
      <div className="spinner" style={{width:40,height:40}} />
    </div>
  );
  if (user && profile) return <Navigate to={ROLE_HOME[profile.role] || '/dashboard'} replace />;
  return children;
}
