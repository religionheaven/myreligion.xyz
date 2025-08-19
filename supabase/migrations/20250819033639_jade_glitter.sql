/*
  # Add IP address column to user_sessions table

  1. Schema Changes
    - Add `ip_address` column to `user_sessions` table
    - Column type: `inet` to properly store IP addresses (both IPv4 and IPv6)
    - Column is nullable to handle existing records

  2. Notes
    - This migration adds the missing ip_address column that is needed for admin analytics
    - Existing sessions will have null ip_address values
    - New sessions will populate this field automatically
*/

-- Add ip_address column to user_sessions table
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'user_sessions' AND column_name = 'ip_address'
  ) THEN
    ALTER TABLE user_sessions ADD COLUMN ip_address inet;
  END IF;
END $$;