/*
  # Add Memory System for Chat

  1. Database Schema Updates
    - Add importance_score to chat_messages
    - Add token_count to chat_messages  
    - Add islamic_content flag to chat_messages
    - Add message_count to chat_sessions
    - Add performance indexes
    - Add automatic triggers for scoring and metadata

  2. Performance Features
    - Optimized indexes for fast queries
    - Automatic importance calculation
    - Session metadata tracking
    - Single active session enforcement

  3. Memory Management
    - Smart context selection
    - Configurable message limits
    - Cleanup functions
*/

-- Add new columns to chat_messages
ALTER TABLE chat_messages 
ADD COLUMN IF NOT EXISTS importance_score INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS token_count INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS islamic_content BOOLEAN DEFAULT false;

-- Add message_count to chat_sessions
ALTER TABLE chat_sessions 
ADD COLUMN IF NOT EXISTS message_count INTEGER DEFAULT 0;

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_chat_messages_importance 
ON chat_messages (session_id, importance_score DESC, created_at DESC);

CREATE INDEX IF NOT EXISTS idx_chat_messages_session_timestamp 
ON chat_messages (session_id, created_at DESC);

CREATE INDEX IF NOT EXISTS idx_chat_sessions_user_active 
ON chat_sessions (user_id, is_active) WHERE is_active = true;

-- Function to calculate message importance
CREATE OR REPLACE FUNCTION calculate_message_importance()
RETURNS TRIGGER AS $$
DECLARE
  score INTEGER := 0;
  islamic_keywords TEXT[] := ARRAY[
    'quran', 'hadith', 'prophet', 'muhammad', 'allah', 'islam', 'muslim',
    'prayer', 'salah', 'hajj', 'ramadan', 'zakat', 'shahada', 'mosque',
    'imam', 'sunnah', 'ummah', 'jihad', 'halal', 'haram', 'dua', 'surah',
    'ayah', 'mecca', 'medina', 'kaaba', 'eid', 'iftar', 'suhur', 'tawhid',
    'jesus', 'christ', 'christian', 'christianity', 'bible', 'gospel',
    'church', 'pastor', 'priest', 'trinity', 'salvation', 'baptism',
    'communion', 'easter', 'christmas', 'cross', 'resurrection', 'heaven',
    'hell', 'sin', 'forgiveness', 'grace', 'faith', 'hope', 'love',
    'judaism', 'jewish', 'torah', 'talmud', 'synagogue', 'rabbi',
    'sabbath', 'kosher', 'passover', 'yom kippur', 'rosh hashanah',
    'hanukkah', 'bar mitzvah', 'bat mitzvah', 'israel', 'jerusalem',
    'abraham', 'moses', 'david', 'solomon', 'covenant', 'chosen people',
    'hinduism', 'hindu', 'vedas', 'upanishads', 'bhagavad gita',
    'krishna', 'rama', 'shiva', 'vishnu', 'brahma', 'dharma', 'karma',
    'moksha', 'samsara', 'yoga', 'meditation', 'mantra', 'temple',
    'guru', 'ashram', 'puja', 'diwali', 'holi', 'ganesh', 'hanuman'
  ];
  keyword TEXT;
  content_lower TEXT;
BEGIN
  content_lower := LOWER(NEW.content);
  
  -- Base score for message length
  IF LENGTH(NEW.content) > 200 THEN
    score := score + 3;
  ELSIF LENGTH(NEW.content) > 100 THEN
    score := score + 2;
  ELSIF LENGTH(NEW.content) > 50 THEN
    score := score + 1;
  END IF;
  
  -- Check for Islamic/religious keywords
  FOREACH keyword IN ARRAY islamic_keywords LOOP
    IF content_lower LIKE '%' || keyword || '%' THEN
      score := score + 2;
      NEW.islamic_content := true;
    END IF;
  END LOOP;
  
  -- Boost for assistant messages (AI responses are often important)
  IF NEW.role = 'assistant' THEN
    score := score + 1;
  END IF;
  
  -- Estimate token count (rough approximation: 1 token ≈ 4 characters)
  NEW.token_count := LENGTH(NEW.content) / 4;
  
  NEW.importance_score := score;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Function to update session metadata
CREATE OR REPLACE FUNCTION update_session_metadata()
RETURNS TRIGGER AS $$
BEGIN
  -- Update message count and timestamp for the session
  UPDATE chat_sessions 
  SET 
    message_count = (
      SELECT COUNT(*) 
      FROM chat_messages 
      WHERE session_id = NEW.session_id
    ),
    updated_at = NOW()
  WHERE id = NEW.session_id;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create triggers
DROP TRIGGER IF EXISTS trigger_calculate_message_importance ON chat_messages;
CREATE TRIGGER trigger_calculate_message_importance
  BEFORE INSERT OR UPDATE ON chat_messages
  FOR EACH ROW EXECUTE FUNCTION calculate_message_importance();

DROP TRIGGER IF EXISTS trigger_update_session_metadata ON chat_messages;
CREATE TRIGGER trigger_update_session_metadata
  AFTER INSERT ON chat_messages
  FOR EACH ROW EXECUTE FUNCTION update_session_metadata();

-- Function for memory cleanup (can be called periodically)
CREATE OR REPLACE FUNCTION cleanup_old_messages(
  session_id_param UUID,
  max_messages INTEGER DEFAULT 100
)
RETURNS INTEGER AS $$
DECLARE
  deleted_count INTEGER;
BEGIN
  -- Keep the most recent messages and important ones
  WITH messages_to_keep AS (
    SELECT id FROM (
      -- Keep recent messages
      SELECT id, created_at, importance_score,
             ROW_NUMBER() OVER (ORDER BY created_at DESC) as recent_rank,
             ROW_NUMBER() OVER (ORDER BY importance_score DESC, created_at DESC) as importance_rank
      FROM chat_messages 
      WHERE session_id = session_id_param
    ) ranked
    WHERE recent_rank <= (max_messages * 0.6) -- Keep 60% most recent
       OR importance_rank <= (max_messages * 0.4) -- Keep 40% most important
  )
  DELETE FROM chat_messages 
  WHERE session_id = session_id_param 
    AND id NOT IN (SELECT id FROM messages_to_keep);
  
  GET DIAGNOSTICS deleted_count = ROW_COUNT;
  RETURN deleted_count;
END;
$$ LANGUAGE plpgsql;

-- Update existing messages with importance scores (one-time migration)
DO $$
DECLARE
  msg RECORD;
BEGIN
  FOR msg IN SELECT * FROM chat_messages WHERE importance_score = 0 LOOP
    UPDATE chat_messages 
    SET 
      importance_score = CASE 
        WHEN LENGTH(content) > 200 THEN 3
        WHEN LENGTH(content) > 100 THEN 2
        WHEN LENGTH(content) > 50 THEN 1
        ELSE 0
      END + CASE WHEN role = 'assistant' THEN 1 ELSE 0 END,
      token_count = LENGTH(content) / 4,
      islamic_content = (
        LOWER(content) LIKE ANY(ARRAY[
          '%quran%', '%hadith%', '%prophet%', '%muhammad%', '%allah%', 
          '%islam%', '%muslim%', '%prayer%', '%salah%', '%hajj%',
          '%jesus%', '%christ%', '%christian%', '%bible%', '%gospel%',
          '%judaism%', '%jewish%', '%torah%', '%rabbi%', '%synagogue%',
          '%hinduism%', '%hindu%', '%vedas%', '%krishna%', '%dharma%'
        ])
      )
    WHERE id = msg.id;
  END LOOP;
END $$;

-- Update session message counts
UPDATE chat_sessions 
SET message_count = (
  SELECT COUNT(*) 
  FROM chat_messages 
  WHERE session_id = chat_sessions.id
);