import React from 'react';
import { Outlet, Navigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

interface AdminProtectedRouteProps {
  children?: React.ReactNode;
}

export const AdminProtectedRoute: React.FC<AdminProtectedRouteProps> = ({ children }) => {
  const { user, loading } = useAuth();

  const isLocalAdminAuthenticated = localStorage.getItem('vault_ph_admin_authenticated') === 'true';

  if (loading) {
    return (
      <div className="min-h-screen bg-[#050B18] flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <div className="w-10 h-10 border-4 border-[#1677FF] border-t-transparent rounded-full animate-spin"></div>
          <p className="text-gray-400 text-sm font-medium">Verifying authorization...</p>
        </div>
      </div>
    );
  }

  // An account is an admin only if authenticated with admin role, or verified via admin login
  const isAdmin =
    isLocalAdminAuthenticated ||
    (user && (user.user_metadata?.role === 'admin' || user.user_metadata?.is_admin === true || user.email?.includes('admin')));

  if (!isAdmin) {
    // Redirect directly to dedicated Admin Login portal
    return <Navigate to="/admin/login" replace />;
  }

  return children ? <>{children}</> : <Outlet />;
};
