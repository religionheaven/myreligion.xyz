import React, { createContext, useContext, useEffect, useState } from "react";
import { useAuth } from "./AuthContext";
import { supabase, UserProgress } from "../lib/supabase";

interface UserProgressContextType {
  progress: UserProgress | null;
  loading: boolean;
  updateProgress: (updates: Partial<UserProgress["progress_data"]>) => Promise<void>;
  addAchievement: (achievement: string) => Promise<void>;
  incrementExperience: (amount: number) => Promise<void>;
  updateStreak: () => Promise<void>;
}

const UserProgressContext = createContext<UserProgressContextType | undefined>(undefined);

export function UserProgressProvider({ children }: { children: React.ReactNode }) {
  const { user } = useAuth();
  const [progress, setProgress] = useState<UserProgress | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      loadUserProgress();
    } else {
      // Clear progress state when user signs out
      setProgress(null);
      setLoading(false);
    }
  }, [user]);

  const loadUserProgress = async () => {
    if (!user) {
      setProgress(null);
      setLoading(false);
      return;
    }

    setLoading(true);

    // Try to get existing progress
    const { data: existingData, error } = await supabase
      .from("user_progress")
      .select("*")
      .eq("user_id", user.id)
      .maybeSingle();

    // If no progress exists, create initial progress
    if (!existingData) {
      const initialProgress = {
        user_id: user.id,
        progress_data: {
          level: 1,
          experience: 0,
          streak: 0,
          achievements: [],
          lessons_completed: 0,
          last_activity: new Date().toISOString(),
        },
      };

      const { data: newData, error: createError } = await supabase
        .from("user_progress")
        .insert(initialProgress)
        .select()
        .single();

      if (createError) {
        console.error("Error creating user progress:", createError);
      } else {
        setProgress(newData);
      }
    } else {
      setProgress(existingData);
    }

    setLoading(false);
  };

  const updateProgress = async (updates: Partial<UserProgress["progress_data"]>) => {
    if (!user || !progress) return;

    const updatedData = {
      ...progress.progress_data,
      ...updates,
      last_activity: new Date().toISOString(),
    };

    const { data, error } = await supabase
      .from("user_progress")
      .update({ progress_data: updatedData })
      .eq("user_id", user.id)
      .select()
      .single();

    if (error) {
      console.error("Error updating progress:", error);
    } else {
      setProgress(data);
    }
  };

  const addAchievement = async (achievement: string) => {
    if (!progress) return;

    const currentAchievements = progress.progress_data.achievements || [];
    if (!currentAchievements.includes(achievement)) {
      await updateProgress({
        achievements: [...currentAchievements, achievement],
      });
    }
  };

  const incrementExperience = async (amount: number) => {
    if (!progress) return;

    const currentExp = progress.progress_data.experience || 0;
    const currentLevel = progress.progress_data.level || 1;
    const newExp = currentExp + amount;

    // Simple level calculation (every 100 XP = 1 level)
    const newLevel = Math.floor(newExp / 100) + 1;

    await updateProgress({
      experience: newExp,
      level: Math.max(currentLevel, newLevel),
    });
  };

  const updateStreak = async () => {
    if (!progress) return;

    const lastActivity = progress.progress_data.last_activity;
    const currentStreak = progress.progress_data.streak || 0;

    if (lastActivity) {
      const lastDate = new Date(lastActivity);
      const today = new Date();
      const diffTime = Math.abs(today.getTime() - lastDate.getTime());
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

      let newStreak = currentStreak;
      if (diffDays === 1) {
        // Consecutive day
        newStreak = currentStreak + 1;
      } else if (diffDays > 1) {
        // Streak broken
        newStreak = 1;
      }
      // If same day, keep current streak

      await updateProgress({ streak: newStreak });
    }
  };

  const value = {
    progress,
    loading,
    updateProgress,
    addAchievement,
    incrementExperience,
    updateStreak,
  };

  return <UserProgressContext.Provider value={value}>{children}</UserProgressContext.Provider>;
}

export function useUserProgress() {
  const context = useContext(UserProgressContext);
  if (context === undefined) {
    throw new Error("useUserProgress must be used within a UserProgressProvider");
  }
  return context;
}
