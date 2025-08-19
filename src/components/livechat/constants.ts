// Rate limiting constants
export const RATE_LIMIT_WINDOW = 35000; // 35 seconds in milliseconds
export const RATE_LIMIT_MAX_MESSAGES = 10; // Maximum messages allowed in the window
export const RATE_LIMIT_PENALTY = 5 * 60 * 1000; // 5 minutes in milliseconds

// Spam detection constants
export const SPAM_COOLDOWN_DURATION = 30000; // 30 seconds in milliseconds
export const MAX_MESSAGE_LENGTH = 500;
export const MIN_MESSAGE_INTERVAL = 1000; // 1 second minimum between messages

// Spam patterns
export const SPAM_PATTERNS = [
  /(.)\1{4,}/i, // Repeated characters (5 or more)
  /^[A-Z\s!]{10,}$/i, // All caps messages
  /(https?:\/\/[^\s]+)/gi, // URLs
  /(.{1,10})\1{3,}/i, // Repeated phrases
];

// Profanity and inappropriate content patterns
export const INAPPROPRIATE_PATTERNS = [
  /\b(spam|scam|hack|cheat)\b/i,
  /\b(buy|sell|money|cash|bitcoin|crypto)\b/i,
  /\b(click|link|visit|website)\b/i,
];

export interface LiveUser {
  id: string;
  username: string;
  email: string;
  is_active: boolean;
  last_activity: string;
  location_data: {
    country?: string;
    city?: string;
    region?: string;
    ip?: string;
  };
  session_duration: number;
  current_page?: string;
}

export interface SiteVisit {
  id: string;
  visitor_id: string;
  user_id?: string;
  username?: string;
  page_path: string;
  referrer?: string;
  location_data: {
    country?: string;
    city?: string;
    region?: string;
  };
  session_duration: number;
  created_at: string;
}

export interface MessageAnalytics {
  id: string;
  user_id: string;
  username: string;
  religion: string;
  message_length: number;
  response_time_ms?: number;
  sentiment_score: number;
  contains_sensitive: boolean;
  location_data: {
    country?: string;
    city?: string;
  };
  created_at: string;
}

export interface UserRequest {
  id: string;
  user_id: string;
  username: string;
  request_type: string;
  request_text: string;
  created_at: string;
}

export interface AdminStats {
  totalUsers: number;
  activeUsers: number;
  totalVisits: number;
  totalMessages: number;
  totalRequests: number;
  topCountries: Array<{ country: string; count: number }>;
  topReligions: Array<{ religion: string; count: number }>;
  recentActivity: number;
}