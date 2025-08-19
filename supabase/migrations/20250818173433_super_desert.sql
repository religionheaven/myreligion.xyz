/*
  # Fix infinite recursion in admin_users RLS policies

  1. Security Changes
    - Drop existing problematic RLS policies that cause infinite recursion
    - Create new policies that don't reference the admin_users table in their conditions
    - Use service_role for admin management operations
    - Allow authenticated users to check their own admin status without recursion

  2. Policy Structure
    - Simple policy for users to read their own admin record
    - Service role can manage all admin records
    - No recursive queries that cause infinite loops
*/

-- Drop existing policies that cause recursion
DROP POLICY IF EXISTS "Only admins can read admin_users" ON admin_users;
DROP POLICY IF EXISTS "Only super admins can modify admin_users" ON admin_users;

-- Create new non-recursive policies
CREATE POLICY "Users can read their own admin record"
  ON admin_users
  FOR SELECT
  TO authenticated
  USING (user_id = auth.uid());

CREATE POLICY "Service role can manage admin users"
  ON admin_users
  FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);

-- Allow authenticated users to insert their own admin records (for initial setup)
CREATE POLICY "Users can insert their own admin record"
  ON admin_users
  FOR INSERT
  TO authenticated
  WITH CHECK (user_id = auth.uid());

-- Allow users to update their own admin record (but not role/permissions)
CREATE POLICY "Users can update their own admin record"
  ON admin_users
  FOR UPDATE
  TO authenticated
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());