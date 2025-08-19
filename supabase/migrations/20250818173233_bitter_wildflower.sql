/*
  # Create Admin System

  1. New Tables
    - `admin_users`
      - `id` (uuid, primary key)
      - `user_id` (uuid, references auth.users)
      - `role` (text, admin level)
      - `permissions` (jsonb, specific permissions)
      - `created_at` (timestamp)
      - `is_active` (boolean)

  2. Security
    - Enable RLS on `admin_users` table
    - Add policies for admin access only
    - Create function to check admin status

  3. Admin Features
    - User management
    - System analytics
    - Content moderation
*/

-- Create admin_users table
CREATE TABLE IF NOT EXISTS admin_users (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
  role text NOT NULL DEFAULT 'admin',
  permissions jsonb DEFAULT '{"manage_users": true, "view_analytics": true, "moderate_content": true, "system_settings": true}'::jsonb,
  created_at timestamptz DEFAULT now(),
  is_active boolean DEFAULT true,
  UNIQUE(user_id)
);

-- Enable RLS
ALTER TABLE admin_users ENABLE ROW LEVEL SECURITY;

-- Admin policies
CREATE POLICY "Only admins can read admin_users"
  ON admin_users
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM admin_users au 
      WHERE au.user_id = auth.uid() AND au.is_active = true
    )
  );

CREATE POLICY "Only super admins can modify admin_users"
  ON admin_users
  FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM admin_users au 
      WHERE au.user_id = auth.uid() 
      AND au.is_active = true 
      AND au.role = 'super_admin'
    )
  );

-- Function to check if user is admin
CREATE OR REPLACE FUNCTION is_admin(user_uuid uuid DEFAULT auth.uid())
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM admin_users 
    WHERE user_id = user_uuid AND is_active = true
  );
END;
$$;

-- Function to get admin permissions
CREATE OR REPLACE FUNCTION get_admin_permissions(user_uuid uuid DEFAULT auth.uid())
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  perms jsonb;
BEGIN
  SELECT permissions INTO perms
  FROM admin_users 
  WHERE user_id = user_uuid AND is_active = true;
  
  RETURN COALESCE(perms, '{}'::jsonb);
END;
$$;

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_admin_users_user_id ON admin_users(user_id);
CREATE INDEX IF NOT EXISTS idx_admin_users_active ON admin_users(is_active) WHERE is_active = true;