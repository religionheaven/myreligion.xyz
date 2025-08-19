import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables');
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Database types
export interface ChatSession {
  id: string;
  user_id: string;
  title?: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
  message_count?: number;
}

export interface ChatMessage {
  id: string;
  session_id: string;
  role: 'user' | 'assistant';
  content: string;
  created_at: string;
  importance_score?: number;
  token_count?: number;
  islamic_content?: boolean;
}

export interface UserProgress {
  id: string;
  user_id: string;
  progress_data: {
    level?: number;
    experience?: number;
    streak?: number;
    achievements?: string[];
    lessons_completed?: number;
    last_activity?: string;
    [key: string]: any;
  };
  created_at: string;
  updated_at: string;
}

export interface ReligionClick {
  id: string;
  religion: string;
  click_count: number;
  created_at: string;
  updated_at: string;
}
