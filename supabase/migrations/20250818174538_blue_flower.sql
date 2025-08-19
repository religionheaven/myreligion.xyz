/*
  # Add User Banning System

  1. New Tables
    - `banned_users` - Track banned user accounts
    - `banned_ips` - Track banned IP addresses
    - `ban_logs` - Audit trail for ban actions

  2. Security
    - Enable RLS on all tables
    - Admin-only access for ban management
    - Public read access for ban checking

  3. Features
    - User account banning
    - IP address banning
    - Ban reason tracking
    - Automatic IP extraction from user sessions
    - Ban audit logging
*/

-- Create banned_users table
CREATE TABLE IF NOT EXISTS banned_users (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
  banned_by uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  reason text NOT NULL,
  banned_at timestamptz DEFAULT now(),
  expires_at timestamptz,
  is_permanent boolean DEFAULT true,
  is_active boolean DEFAULT true
);

-- Create banned_ips table
CREATE TABLE IF NOT EXISTS banned_ips (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  ip_address inet NOT NULL UNIQUE,
  banned_by uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  reason text NOT NULL,
  banned_at timestamptz DEFAULT now(),
  expires_at timestamptz,
  is_permanent boolean DEFAULT true,
  is_active boolean DEFAULT true,
  associated_user_id uuid REFERENCES auth.users(id) ON DELETE SET NULL
);

-- Create ban_logs table for audit trail
CREATE TABLE IF NOT EXISTS ban_logs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  admin_user_id uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  action text NOT NULL, -- 'ban_user', 'unban_user', 'ban_ip', 'unban_ip'
  target_user_id uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  target_ip inet,
  reason text NOT NULL,
  details jsonb DEFAULT '{}',
  created_at timestamptz DEFAULT now()
);

-- Add indexes for performance
CREATE INDEX IF NOT EXISTS idx_banned_users_user_id ON banned_users(user_id);
CREATE INDEX IF NOT EXISTS idx_banned_users_active ON banned_users(is_active) WHERE is_active = true;
CREATE INDEX IF NOT EXISTS idx_banned_ips_ip ON banned_ips(ip_address);
CREATE INDEX IF NOT EXISTS idx_banned_ips_active ON banned_ips(is_active) WHERE is_active = true;
CREATE INDEX IF NOT EXISTS idx_ban_logs_admin ON ban_logs(admin_user_id);
CREATE INDEX IF NOT EXISTS idx_ban_logs_created_at ON ban_logs(created_at DESC);

-- Enable RLS
ALTER TABLE banned_users ENABLE ROW LEVEL SECURITY;
ALTER TABLE banned_ips ENABLE ROW LEVEL SECURITY;
ALTER TABLE ban_logs ENABLE ROW LEVEL SECURITY;

-- RLS Policies for banned_users
CREATE POLICY "Admins can manage banned users"
  ON banned_users
  FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM admin_users 
      WHERE user_id = auth.uid() AND is_active = true
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM admin_users 
      WHERE user_id = auth.uid() AND is_active = true
    )
  );

CREATE POLICY "Public can check if user is banned"
  ON banned_users
  FOR SELECT
  TO public
  USING (is_active = true);

CREATE POLICY "Service role can manage banned users"
  ON banned_users
  FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);

-- RLS Policies for banned_ips
CREATE POLICY "Admins can manage banned IPs"
  ON banned_ips
  FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM admin_users 
      WHERE user_id = auth.uid() AND is_active = true
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM admin_users 
      WHERE user_id = auth.uid() AND is_active = true
    )
  );

CREATE POLICY "Public can check if IP is banned"
  ON banned_ips
  FOR SELECT
  TO public
  USING (is_active = true);

CREATE POLICY "Service role can manage banned IPs"
  ON banned_ips
  FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);

-- RLS Policies for ban_logs
CREATE POLICY "Admins can view ban logs"
  ON ban_logs
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM admin_users 
      WHERE user_id = auth.uid() AND is_active = true
    )
  );

CREATE POLICY "Admins can insert ban logs"
  ON ban_logs
  FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM admin_users 
      WHERE user_id = auth.uid() AND is_active = true
    )
  );

CREATE POLICY "Service role can manage ban logs"
  ON ban_logs
  FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);

-- Function to automatically ban IP when user is banned
CREATE OR REPLACE FUNCTION auto_ban_user_ip()
RETURNS TRIGGER AS $$
BEGIN
  -- Get the user's IP addresses from user_sessions
  INSERT INTO banned_ips (ip_address, banned_by, reason, associated_user_id, is_permanent)
  SELECT DISTINCT 
    us.ip_address,
    NEW.banned_by,
    'Auto-banned: Associated with banned user account',
    NEW.user_id,
    NEW.is_permanent
  FROM user_sessions us
  WHERE us.user_id = NEW.user_id 
    AND us.ip_address IS NOT NULL
    AND NOT EXISTS (
      SELECT 1 FROM banned_ips bi 
      WHERE bi.ip_address = us.ip_address AND bi.is_active = true
    );
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to auto-ban IP when user is banned
CREATE TRIGGER trigger_auto_ban_user_ip
  AFTER INSERT ON banned_users
  FOR EACH ROW
  EXECUTE FUNCTION auto_ban_user_ip();

-- Function to check if user or IP is banned
CREATE OR REPLACE FUNCTION is_banned(check_user_id uuid DEFAULT NULL, check_ip inet DEFAULT NULL)
RETURNS boolean AS $$
BEGIN
  -- Check if user is banned
  IF check_user_id IS NOT NULL THEN
    IF EXISTS (
      SELECT 1 FROM banned_users 
      WHERE user_id = check_user_id 
        AND is_active = true 
        AND (expires_at IS NULL OR expires_at > now())
    ) THEN
      RETURN true;
    END IF;
  END IF;
  
  -- Check if IP is banned
  IF check_ip IS NOT NULL THEN
    IF EXISTS (
      SELECT 1 FROM banned_ips 
      WHERE ip_address = check_ip 
        AND is_active = true 
        AND (expires_at IS NULL OR expires_at > now())
    ) THEN
      RETURN true;
    END IF;
  END IF;
  
  RETURN false;
END;
$$ LANGUAGE plpgsql;