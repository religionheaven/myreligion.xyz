import React, { createContext, useContext, useEffect, useState } from "react";
import { User, Session } from "@supabase/supabase-js";
import { supabase } from "../lib/supabase";
import { SessionTracking } from "../services/sessionTracking";
import { BanCheck } from "../services/banCheck";

interface AuthContextType {
  user: User | null;
  session: Session | null;
  loading: boolean;
  signUp: (username: string, password: string) => Promise<{ error: any }>;
  signIn: (username: string, password: string) => Promise<{ error: any }>;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Get initial session
    supabase.auth.getSession().then(({ data: { session } }) => {
      // If no valid session, clear any stale tokens
      if (!session) {
        supabase.auth.signOut();
      }
      setSession(session);
      setUser(session?.user ?? null);
      setLoading(false);
    });

    // Listen for auth changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((event, session) => {
      setSession(session);
      setUser(session?.user ?? null);
      setLoading(false);

      // Initialize session tracking
      if (session?.user) {
        SessionTracking.initialize(session.user.id);

        // Check if user is banned
        BanCheck.checkAndEnforceBan(session.user.id, false); // Use user ID, not username
      } else {
        SessionTracking.initialize();
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  const signUp = async (username: string, password: string) => {
    // Create a fake email from username for Supabase auth
    const email = `${username}@religion.app`;

    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          username,
          display_name: username,
        },
      },
    });

    return { error };
  };

  const signIn = async (username: string, password: string) => {
    // Convert username to email format
    const email = `${username}@religion.app`;

    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    return { error };
  };

  const signOut = async () => {
    try {
      // Use local scope to only clear local session storage
      await supabase.auth.signOut({ scope: "local" });
    } catch (error) {
      console.error("Error during sign out:", error);
    } finally {
      // Force clear Supabase auth tokens from storage
      localStorage.removeItem("sb-nzijprktpelrarzobcwm-auth-token");
      sessionStorage.removeItem("sb-nzijprktpelrarzobcwm-auth-token");

      // Clear local state
      setUser(null);
      setSession(null);

      // Clear any cached data
      localStorage.removeItem("religion_chat_cache");
      localStorage.removeItem("live_chat_messages");

      // Clear session tracking
      SessionTracking.initialize();

      // Ensure loading is false after state cleanup
      setLoading(false);

      // Force page reload to ensure clean state
      window.location.reload();
    }
  };

  const value = {
    user,
    session,
    loading,
    signUp,
    signIn,
    signOut,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
