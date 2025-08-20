/*
  # Fix Religion Clicks RLS Policy

  1. Security Updates
    - Add INSERT policy for authenticated users on religion_clicks table
    - Allow users to insert new religion click records
    - Maintain existing SELECT and UPDATE policies

  This migration fixes the RLS policy violation that prevents users from 
  incrementing click counts for new religions.
*/

-- Add INSERT policy for religion_clicks table
CREATE POLICY "Authenticated users can insert religion clicks"
  ON religion_clicks
  FOR INSERT
  TO authenticated
  WITH CHECK (true);