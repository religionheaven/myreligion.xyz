/*
  # Admin Analytics System

  1. New Tables
    - `user_sessions` - Track active user sessions with location data
    - `site_visits` - Track all site visits and page views
    - `message_analytics` - Enhanced message tracking for admin monitoring
    - `admin_logs` - Track admin actions for audit trail

  2. Security
    - Enable RLS on all new tables
    - Admin-only access policies
    - Service role can manage all data

  3. Functions
    - Auto-cleanup old session data
    - Location tracking helpers
    - Real-time session management
*/

-- User Sessions Table (for live user tracking)
CREATE TABLE IF NOT EXISTS user_sessions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
  session_token text UNIQUE NOT NULL,
  ip_address inet,
  user_agent text,
  location_data jsonb DEFAULT '{}',
  is_active boolean DEFAULT true,
  last_activity timestamptz DEFAULT now(),
  created_at timestamptz DEFAULT now()
);

ALTER TABLE user_sessions ENABLE ROW LEVEL SECURITY;

-- Site Visits Table (for visitor analytics)
CREATE TABLE IF NOT EXISTS site_visits (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  visitor_id text, -- Anonymous visitor ID
  user_id uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  page_path text NOT NULL,
  referrer text,
  ip_address inet,
  user_agent text,
  location_data jsonb DEFAULT '{}',
  session_duration integer DEFAULT 0,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE site_visits ENABLE ROW LEVEL SECURITY;

-- Enhanced Message Analytics
CREATE TABLE IF NOT EXISTS message_analytics (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  message_id uuid REFERENCES chat_messages(id) ON DELETE CASCADE,
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
  session_id uuid REFERENCES chat_sessions(id) ON DELETE CASCADE,
  religion text NOT NULL,
  message_length integer NOT NULL,
  response_time_ms integer,
  sentiment_score real DEFAULT 0,
  contains_sensitive boolean DEFAULT false,
  ip_address inet,
  location_data jsonb DEFAULT '{}',
  created_at timestamptz DEFAULT now()
);

ALTER TABLE message_analytics ENABLE ROW LEVEL SECURITY;

-- Admin Logs Table
CREATE TABLE IF NOT EXISTS admin_logs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  admin_user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
  action text NOT NULL,
  target_type text, -- 'user', 'message', 'session', etc.
  target_id uuid,
  details jsonb DEFAULT '{}',
  ip_address inet,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE admin_logs ENABLE ROW LEVEL SECURITY;

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_user_sessions_active ON user_sessions(is_active, last_activity) WHERE is_active = true;
CREATE INDEX IF NOT EXISTS idx_user_sessions_user_id ON user_sessions(user_id);
CREATE INDEX IF NOT EXISTS idx_site_visits_created_at ON site_visits(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_site_visits_user_id ON site_visits(user_id);
CREATE INDEX IF NOT EXISTS idx_message_analytics_created_at ON message_analytics(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_message_analytics_religion ON message_analytics(religion);
CREATE INDEX IF NOT EXISTS idx_admin_logs_created_at ON admin_logs(created_at DESC);

-- RLS Policies (Admin only access)
CREATE POLICY "Admins can view all user sessions"
  ON user_sessions
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM admin_users 
      WHERE user_id = auth.uid() AND is_active = true
    )
  );

CREATE POLICY "Service role can manage user sessions"
  ON user_sessions
  FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Admins can view all site visits"
  ON site_visits
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM admin_users 
      WHERE user_id = auth.uid() AND is_active = true
    )
  );

CREATE POLICY "Service role can manage site visits"
  ON site_visits
  FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Admins can view message analytics"
  ON message_analytics
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM admin_users 
      WHERE user_id = auth.uid() AND is_active = true
    )
  );

CREATE POLICY "Service role can manage message analytics"
  ON message_analytics
  FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Admins can view admin logs"
  ON admin_logs
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM admin_users 
      WHERE user_id = auth.uid() AND is_active = true
    )
  );

CREATE POLICY "Admins can insert admin logs"
  ON admin_logs
  FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM admin_users 
      WHERE user_id = auth.uid() AND is_active = true
    )
  );

-- Function to cleanup old sessions
CREATE OR REPLACE FUNCTION cleanup_old_sessions()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  -- Mark sessions as inactive if no activity for 30 minutes
  UPDATE user_sessions 
  SET is_active = false 
  WHERE is_active = true 
    AND last_activity < now() - interval '30 minutes';
    
  -- Delete old site visits (keep 90 days)
  DELETE FROM site_visits 
  WHERE created_at < now() - interval '90 days';
  
  -- Delete old message analytics (keep 90 days)
  DELETE FROM message_analytics 
  WHERE created_at < now() - interval '90 days';
END;
$$;

-- Function to update session activity
CREATE OR REPLACE FUNCTION update_session_activity(session_token_param text)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  UPDATE user_sessions 
  SET last_activity = now() 
  WHERE session_token = session_token_param AND is_active = true;
END;
$$;