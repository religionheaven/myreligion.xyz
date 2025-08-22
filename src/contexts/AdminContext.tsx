import React, { createContext, useContext, useEffect, useState } from "react";
import { useAuth } from "./AuthContext";
import { supabase } from "../lib/supabase";

interface AdminUser {
  id: string;
  user_id: string;
  role: "admin" | "super_admin";
  permissions: {
    manage_users?: boolean;
    view_analytics?: boolean;
    moderate_content?: boolean;
    system_settings?: boolean;
  };
  created_at: string;
  is_active: boolean;
}

interface AdminContextType {
  isAdmin: boolean;
  adminUser: AdminUser | null;
  loading: boolean;
  permissions: AdminUser["permissions"];
  hasPermission: (permission: keyof AdminUser["permissions"]) => boolean;
  refreshAdminStatus: () => Promise<void>;
}

const AdminContext = createContext<AdminContextType | undefined>(undefined);

export function AdminProvider({ children }: { children: React.ReactNode }) {
  const { user } = useAuth();
  const [isAdmin, setIsAdmin] = useState(false);
  const [adminUser, setAdminUser] = useState<AdminUser | null>(null);
  const [loading, setLoading] = useState(true);

  const checkAdminStatus = async () => {
    if (!user) {
      setIsAdmin(false);
      setAdminUser(null);
      setLoading(false);
      return;
    }

    setLoading(true);

    try {
      const { data, error } = await supabase
        .from("admin_users")
        .select("*")
        .eq("user_id", user.id)
        .eq("is_active", true)
        .maybeSingle();

      if (error && error.code !== "PGRST116") {
        console.error("Error checking admin status:", error);
        setIsAdmin(false);
        setAdminUser(null);
      } else if (data) {
        setIsAdmin(true);
        setAdminUser(data);
      } else {
        setIsAdmin(false);
        setAdminUser(null);
      }
    } catch (error) {
      console.error("Error in admin check:", error);
      setIsAdmin(false);
      setAdminUser(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    checkAdminStatus();

    // Cleanup function to reset admin state
    return () => {
      if (!user) {
        setIsAdmin(false);
        setAdminUser(null);
      }
    };
  }, [user]);

  const hasPermission = (permission: keyof AdminUser["permissions"]): boolean => {
    return adminUser?.permissions?.[permission] === true;
  };

  const refreshAdminStatus = async () => {
    await checkAdminStatus();
  };

  const value = {
    isAdmin,
    adminUser,
    loading,
    permissions: adminUser?.permissions || {},
    hasPermission,
    refreshAdminStatus,
  };

  return <AdminContext.Provider value={value}>{children}</AdminContext.Provider>;
}

export function useAdmin() {
  const context = useContext(AdminContext);
  if (context === undefined) {
    throw new Error("useAdmin must be used within an AdminProvider");
  }
  return context;
}
