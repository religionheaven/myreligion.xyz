/*
  # Create Live Chat System

  1. New Tables
    - `live_chat_messages`
      - `id` (uuid, primary key)
      - `user_id` (uuid, foreign key to auth.users)
      - `content` (text, message content)
      - `created_at` (timestamp)
      - `updated_at` (timestamp)

  2. Security
    - Enable RLS on `live_chat_messages` table
    - Add policies for authenticated users to read all messages
    - Add policies for authenticated users to insert their own messages
    - Add rate limiting and content moderation via triggers

  3. Triggers
    - Rate limiting trigger (3 second cooldown between messages)
    - Content moderation trigger (character limit, link filtering)
    - Message trimming trigger (keep only last 300 messages)
*/

-- Create live_chat_messages table
CREATE TABLE IF NOT EXISTS live_chat_messages (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  content text NOT NULL,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Enable RLS
ALTER TABLE live_chat_messages ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Anyone can read live chat messages"
  ON live_chat_messages
  FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Users can insert their own messages"
  ON live_chat_messages
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_live_chat_messages_created_at 
  ON live_chat_messages(created_at DESC);

CREATE INDEX IF NOT EXISTS idx_live_chat_messages_user_id 
  ON live_chat_messages(user_id);

-- Rate limiting function
CREATE OR REPLACE FUNCTION check_message_rate_limit()
RETURNS TRIGGER AS $$
DECLARE
  last_message_time timestamptz;
  cooldown_seconds integer := 3;
BEGIN
  -- Get the timestamp of the user's last message
  SELECT created_at INTO last_message_time
  FROM live_chat_messages
  WHERE user_id = NEW.user_id
  ORDER BY created_at DESC
  LIMIT 1;

  -- Check if cooldown period has passed
  IF last_message_time IS NOT NULL AND 
     EXTRACT(EPOCH FROM (now() - last_message_time)) < cooldown_seconds THEN
    RAISE EXCEPTION 'Rate limit exceeded. Please wait % seconds between messages.', cooldown_seconds;
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Content moderation function
CREATE OR REPLACE FUNCTION moderate_message_content()
RETURNS TRIGGER AS $$
BEGIN
  -- Character limit check
  IF LENGTH(NEW.content) > 200 THEN
    RAISE EXCEPTION 'Message too long. Maximum 200 characters allowed.';
  END IF;

  -- Basic link filtering
  IF NEW.content ~* '(https?://|www\.|\.com|\.org|\.net|\.edu|\.gov)' THEN
    RAISE EXCEPTION 'Links are not allowed in chat messages.';
  END IF;

  -- Basic spam detection (repeated characters)
  IF NEW.content ~* '(.)\1{10,}' THEN
    RAISE EXCEPTION 'Message contains excessive repeated characters.';
  END IF;

  -- Trim whitespace
  NEW.content := TRIM(NEW.content);
  
  -- Ensure content is not empty after trimming
  IF LENGTH(NEW.content) = 0 THEN
    RAISE EXCEPTION 'Message cannot be empty.';
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Message trimming function (keep only last 300 messages)
CREATE OR REPLACE FUNCTION trim_live_chat_messages()
RETURNS TRIGGER AS $$
DECLARE
  message_count integer;
  messages_to_delete integer;
BEGIN
  -- Count total messages
  SELECT COUNT(*) INTO message_count FROM live_chat_messages;

  -- If we have more than 300 messages, delete the oldest ones
  IF message_count > 300 THEN
    messages_to_delete := message_count - 300;
    
    DELETE FROM live_chat_messages
    WHERE id IN (
      SELECT id
      FROM live_chat_messages
      ORDER BY created_at ASC
      LIMIT messages_to_delete
    );
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create triggers
CREATE TRIGGER trigger_check_message_rate_limit
  BEFORE INSERT ON live_chat_messages
  FOR EACH ROW EXECUTE FUNCTION check_message_rate_limit();

CREATE TRIGGER trigger_moderate_message_content
  BEFORE INSERT ON live_chat_messages
  FOR EACH ROW EXECUTE FUNCTION moderate_message_content();

CREATE TRIGGER trigger_trim_live_chat_messages
  AFTER INSERT ON live_chat_messages
  FOR EACH ROW EXECUTE FUNCTION trim_live_chat_messages();

-- Update timestamp trigger
CREATE OR REPLACE FUNCTION update_live_chat_messages_timestamp()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_live_chat_messages_timestamp
  BEFORE UPDATE ON live_chat_messages
  FOR EACH ROW EXECUTE FUNCTION update_live_chat_messages_timestamp();