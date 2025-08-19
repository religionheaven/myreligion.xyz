/*
  # Fix site_visits RLS policies

  1. Security Changes
    - Allow all users (including anonymous) to insert site visits
    - Allow service role full access for backend operations
    - Allow admins to view all site visits for analytics
    - Prevent users from reading other users' visit data directly

  This enables proper site visit tracking for both authenticated and anonymous users
  while maintaining security for the admin analytics system.
*/

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Service role can manage site visits" ON site_visits;
DROP POLICY IF EXISTS "Admins can view all site visits" ON site_visits;

-- Allow all users (including anonymous) to insert site visits
CREATE POLICY "Allow all users to insert site visits"
  ON site_visits
  FOR INSERT
  TO public
  WITH CHECK (true);

-- Service role can manage all site visits
CREATE POLICY "Service role can manage site visits"
  ON site_visits
  FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);

-- Admins can view all site visits for analytics
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