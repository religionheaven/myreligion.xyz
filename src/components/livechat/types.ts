// ============================================================================
// TYPES AND INTERFACES
// ============================================================================

export interface ChatMessage {
  id: string;
  user_id: string;
  username: string;
  profile_photo_url?: string | null;
  content: string;
  created_at: string;
}

export interface LiveChatProps {
  isVisible: boolean;
}
