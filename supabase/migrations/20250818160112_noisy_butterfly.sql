/*
  # Create religion prompts table

  1. New Tables
    - `religion_prompts`
      - `id` (uuid, primary key)
      - `religion` (text, unique) - The religion name (christianity, judaism, islam, hinduism)
      - `prompt_text` (text) - The system prompt for that religion
      - `created_at` (timestamp)
      - `updated_at` (timestamp)

  2. Security
    - Enable RLS on `religion_prompts` table
    - Add policy for authenticated users to read prompts
    - Only service role can modify prompts

  3. Initial Data
    - Insert the four religions with placeholder prompts
*/

CREATE TABLE IF NOT EXISTS religion_prompts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  religion text UNIQUE NOT NULL,
  prompt_text text NOT NULL,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE religion_prompts ENABLE ROW LEVEL SECURITY;

-- Allow authenticated users to read prompts
CREATE POLICY "Users can read religion prompts"
  ON religion_prompts
  FOR SELECT
  TO authenticated
  USING (true);

-- Only service role can modify prompts (for admin use)
CREATE POLICY "Service role can manage prompts"
  ON religion_prompts
  FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);

-- Insert the four religions with placeholder prompts
INSERT INTO religion_prompts (religion, prompt_text) VALUES
  ('christianity', 'You are a knowledgeable Christian theological assistant. Please provide responses based on Christian doctrine and biblical teachings.'),
  ('judaism', 'You are a knowledgeable Jewish theological assistant. Please provide responses based on Jewish law, tradition, and Torah teachings.'),
  ('islam', 'You are a knowledgeable Islamic theological assistant. Please provide responses based on Islamic teachings and the Quran.'),
  ('hinduism', 'You are a knowledgeable Hindu theological assistant. Please provide responses based on Hindu philosophy and sacred texts.')
ON CONFLICT (religion) DO NOTHING;

-- Add trigger to update the updated_at timestamp
CREATE OR REPLACE FUNCTION update_religion_prompts_timestamp()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_religion_prompts_timestamp
  BEFORE UPDATE ON religion_prompts
  FOR EACH ROW
  EXECUTE FUNCTION update_religion_prompts_timestamp();