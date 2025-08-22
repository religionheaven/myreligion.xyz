import React from "react";
import { useAdmin } from "../../contexts/AdminContext";

interface AdminGuardProps {
  children: React.ReactNode;
  fallback?: React.ReactNode;
  permission?: string;
}

export function AdminGuard({ children, fallback, permission }: AdminGuardProps) {
  const { isAdmin, loading, hasPermission } = useAdmin();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900 mx-auto mb-4"></div>
          <p className="text-gray-600">Checking admin access...</p>
        </div>
      </div>
    );
  }

  if (!isAdmin) {
    return <>{fallback}</>;
  }

  if (permission && !hasPermission(permission as any)) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white">
        <div className="text-center">
          <p className="text-gray-600">Insufficient permissions</p>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}
