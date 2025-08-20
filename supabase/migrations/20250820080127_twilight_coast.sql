/*
  # Add user tracking to confessions

  1. Changes
    - Add user_id column to confessions table to track who submitted each confession
    - Add RLS policies to allow users to see their own confessions
    - Add constraint to limit users to 2 confessions maximum

  2. Security
    - Users can see all confessions (anonymous)
    - Users can see which confessions are theirs
    - Users can only submit confessions if they have less than 2
*/

-- Add user_id column to confessions table
ALTER TABLE confessions ADD COLUMN user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE;

-- Create index for better performance
CREATE INDEX idx_confessions_user_id ON confessions(user_id);

-- Update RLS policies to include user tracking
DROP POLICY IF EXISTS "Users can update confession vote counts" ON confessions;
DROP POLICY IF EXISTS "Authenticated users can insert confessions" ON confessions;
DROP POLICY IF EXISTS "Anyone can read confessions" ON confessions;

-- Allow reading all confessions (anonymous)
CREATE POLICY "Anyone can read confessions"
  ON confessions
  FOR SELECT
  TO authenticated
  USING (true);

-- Allow inserting confessions with user limit check
CREATE POLICY "Users can insert confessions with limit"
  ON confessions
  FOR INSERT
  TO authenticated
  WITH CHECK (
    auth.uid() = user_id AND
    (
      SELECT COUNT(*) 
      FROM confessions 
      WHERE user_id = auth.uid()
    ) < 2
  );

-- Allow updating vote counts
CREATE POLICY "Users can update confession vote counts"
  ON confessions
  FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);