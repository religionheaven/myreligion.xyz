/*
  # Create confessions system

  1. New Tables
    - `confessions`
      - `id` (uuid, primary key)
      - `content` (text, the confession content)
      - `upvotes` (integer, default 0)
      - `downvotes` (integer, default 0)
      - `score` (integer, calculated as upvotes - downvotes)
      - `created_at` (timestamp)
      - `updated_at` (timestamp)
    - `confession_votes`
      - `id` (uuid, primary key)
      - `confession_id` (uuid, foreign key)
      - `user_id` (uuid, foreign key)
      - `vote_type` (text, 'upvote' or 'downvote')
      - `created_at` (timestamp)

  2. Security
    - Enable RLS on both tables
    - Users can read all confessions and votes
    - Users can insert their own votes
    - Users can update their own votes
    - Users can insert confessions anonymously
    - Prevent duplicate votes per user per confession

  3. Functions
    - Function to update confession scores when votes change
    - Trigger to automatically update scores
*/

-- Create confessions table
CREATE TABLE IF NOT EXISTS confessions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  content text NOT NULL,
  upvotes integer DEFAULT 0,
  downvotes integer DEFAULT 0,
  score integer DEFAULT 0,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create confession votes table
CREATE TABLE IF NOT EXISTS confession_votes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  confession_id uuid NOT NULL REFERENCES confessions(id) ON DELETE CASCADE,
  user_id uuid NOT NULL,
  vote_type text NOT NULL CHECK (vote_type IN ('upvote', 'downvote')),
  created_at timestamptz DEFAULT now(),
  UNIQUE(confession_id, user_id)
);

-- Enable RLS
ALTER TABLE confessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE confession_votes ENABLE ROW LEVEL SECURITY;

-- Confessions policies
CREATE POLICY "Anyone can read confessions"
  ON confessions
  FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Authenticated users can insert confessions"
  ON confessions
  FOR INSERT
  TO authenticated
  WITH CHECK (true);

-- Confession votes policies
CREATE POLICY "Anyone can read confession votes"
  ON confession_votes
  FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Users can insert their own votes"
  ON confession_votes
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own votes"
  ON confession_votes
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own votes"
  ON confession_votes
  FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

-- Function to update confession scores
CREATE OR REPLACE FUNCTION update_confession_score()
RETURNS TRIGGER AS $$
BEGIN
  -- Update the confession's vote counts and score
  UPDATE confessions 
  SET 
    upvotes = (
      SELECT COUNT(*) 
      FROM confession_votes 
      WHERE confession_id = COALESCE(NEW.confession_id, OLD.confession_id) 
      AND vote_type = 'upvote'
    ),
    downvotes = (
      SELECT COUNT(*) 
      FROM confession_votes 
      WHERE confession_id = COALESCE(NEW.confession_id, OLD.confession_id) 
      AND vote_type = 'downvote'
    ),
    updated_at = now()
  WHERE id = COALESCE(NEW.confession_id, OLD.confession_id);
  
  -- Update the score (upvotes - downvotes)
  UPDATE confessions 
  SET score = upvotes - downvotes
  WHERE id = COALESCE(NEW.confession_id, OLD.confession_id);
  
  RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql;

-- Triggers to update scores when votes change
CREATE TRIGGER trigger_update_confession_score_insert
  AFTER INSERT ON confession_votes
  FOR EACH ROW
  EXECUTE FUNCTION update_confession_score();

CREATE TRIGGER trigger_update_confession_score_update
  AFTER UPDATE ON confession_votes
  FOR EACH ROW
  EXECUTE FUNCTION update_confession_score();

CREATE TRIGGER trigger_update_confession_score_delete
  AFTER DELETE ON confession_votes
  FOR EACH ROW
  EXECUTE FUNCTION update_confession_score();

-- Function to update confession updated_at timestamp
CREATE OR REPLACE FUNCTION update_confession_timestamp()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to update confession timestamp
CREATE TRIGGER trigger_update_confession_timestamp
  BEFORE UPDATE ON confessions
  FOR EACH ROW
  EXECUTE FUNCTION update_confession_timestamp();

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_confessions_score ON confessions(score DESC);
CREATE INDEX IF NOT EXISTS idx_confessions_created_at ON confessions(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_confession_votes_confession_id ON confession_votes(confession_id);
CREATE INDEX IF NOT EXISTS idx_confession_votes_user_id ON confession_votes(user_id);