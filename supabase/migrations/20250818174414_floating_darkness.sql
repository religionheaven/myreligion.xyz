/*
  # Fix user_sessions RLS policies

  1. Security Updates
    - Allow authenticated users to insert their own sessions
    - Allow service role to manage all sessions for admin analytics
    - Allow users to update their own session activity
*/

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Users can manage their own sessions" ON user_sessions;
DROP POLICY IF EXISTS "Service role can manage user sessions" ON user_sessions;
DROP POLICY IF EXISTS "Admins can view all user sessions" ON user_sessions;

-- Allow authenticated users to insert and update their own sessions
CREATE POLICY "Users can manage their own sessions"
  ON user_sessions
  FOR ALL
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Allow service role full access for admin analytics
CREATE POLICY "Service role can manage user sessions"
  ON user_sessions
  FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);

-- Allow admins to view all sessions (read-only for admin panel)
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