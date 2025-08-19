/*
  # Create religion clicks tracking table

  1. New Tables
    - `religion_clicks`
      - `id` (uuid, primary key)
      - `religion` (text, unique)
      - `click_count` (integer, default 0)
      - `created_at` (timestamp)
      - `updated_at` (timestamp)

  2. Security
    - Enable RLS on `religion_clicks` table
    - Add policy for authenticated users to read click counts
    - Add policy for authenticated users to increment clicks

  3. Initial Data
    - Insert initial records for Christianity, Judaism, Islam, Hinduism
*/

CREATE TABLE IF NOT EXISTS religion_clicks (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  religion text UNIQUE NOT NULL,
  click_count integer DEFAULT 0,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE religion_clicks ENABLE ROW LEVEL SECURITY;

-- Policy for reading click counts
CREATE POLICY "Anyone can read religion click counts"
  ON religion_clicks
  FOR SELECT
  TO authenticated
  USING (true);

-- Policy for incrementing clicks
CREATE POLICY "Authenticated users can increment clicks"
  ON religion_clicks
  FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

-- Function to update timestamp
CREATE OR REPLACE FUNCTION update_religion_clicks_timestamp()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to update timestamp
CREATE TRIGGER trigger_update_religion_clicks_timestamp
  BEFORE UPDATE ON religion_clicks
  FOR EACH ROW
  EXECUTE FUNCTION update_religion_clicks_timestamp();

-- Insert initial data for the four religions
INSERT INTO religion_clicks (religion, click_count) VALUES
  ('Christianity', 0),
  ('Judaism', 0),
  ('Islam', 0),
  ('Hinduism', 0)
ON CONFLICT (religion) DO NOTHING;