import React from 'react';
import { Outlet } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { ShieldAlert } from 'lucide-react';

interface AdminProtectedRouteProps {
  children?: React.ReactNode;
}

export const AdminProtectedRoute: React.FC<AdminProtectedRouteProps> = ({ children }) => {
  const { user, loading } = useAuth();

  // In development, we can check for an admin flag in localStorage or user email/role
  const devAdminBypass = localStorage.getItem('vault_ph_admin_authenticated') === 'true';

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

  // Check if admin: user metadata has role === 'admin' OR devAdminBypass is enabled
  const isAdmin = devAdminBypass || (user && (user.user_metadata?.role === 'admin' || user.email?.includes('admin')));

  if (!isAdmin) {
    return (
      <div className="min-h-screen bg-[#050B18] text-white flex items-center justify-center px-4">
        <div className="max-w-md w-full bg-[#08152A] border border-red-500/30 rounded-2xl p-8 text-center shadow-2xl">
          <div className="w-16 h-16 bg-red-500/10 text-red-400 rounded-full flex items-center justify-center mx-auto mb-4 border border-red-500/20">
            <ShieldAlert className="w-8 h-8" />
          </div>
          <h2 className="text-2xl font-bold mb-2">Admin Access Required</h2>
          <p className="text-gray-400 text-sm mb-6">
            You must be logged in with an administrator account to view the VAULT PH management console.
          </p>
          <div className="space-y-3">
            <button
              onClick={() => {
                // Allow quick demo sign-in for testing the admin dashboard
                localStorage.setItem('vault_ph_admin_authenticated', 'true');
                window.location.reload();
              }}
              className="w-full py-3 px-4 bg-[#1677FF] hover:bg-[#1260d1] text-white font-semibold rounded-xl transition shadow-lg shadow-[#1677FF]/20"
            >
              Demo Admin Bypass (Development Only)
            </button>
            <a
              href="/"
              className="block w-full py-2.5 text-gray-400 hover:text-white text-sm transition"
            >
              Return to Storefront
            </a>
          </div>
        </div>
      </div>
    );
  }

  return children ? <>{children}</> : <Outlet />;
};
