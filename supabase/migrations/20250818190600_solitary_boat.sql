/*
  # Fix message analytics RLS policy

  1. Security Changes
    - Add INSERT policy for authenticated users on message_analytics table
    - Allow users to insert their own message analytics data
    - Ensure proper RLS enforcement for data integrity

  2. Policy Details
    - Users can insert message analytics where user_id matches their auth.uid()
    - Maintains data security while allowing proper functionality
*/

-- Add INSERT policy for message_analytics table
CREATE POLICY "Users can insert their own message analytics"
  ON message_analytics
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);