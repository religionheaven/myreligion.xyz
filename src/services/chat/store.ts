import { supabase, ChatSession, ChatMessage } from "../../lib/supabase";

// Re-export types for easier importing
export type { ChatSession, ChatMessage };

export class ChatStore {
  // Get or create active session for user
  static async getActiveSession(userId: string): Promise<ChatSession | null> {
    const { data, error } = await supabase
      .from("chat_sessions")
      .select("*")
      .eq("user_id", userId)
      .eq("is_active", true)
      .maybeSingle();

    if (error) {
      console.error("Error fetching active session:", error);
      return null;
    }

    return data;
  }

  // Create new chat session
  static async createSession(userId: string, title?: string): Promise<ChatSession | null> {
    const { data, error } = await supabase
      .from("chat_sessions")
      .insert({
        user_id: userId,
        title: title || "New Chat",
        is_active: true,
      })
      .select()
      .single();

    if (error) {
      console.error("Error creating session:", error);
      return null;
    }

    return data;
  }

  // Get messages for a session
  static async getSessionMessages(sessionId: string): Promise<ChatMessage[]> {
    const { data, error } = await supabase
      .from("chat_messages")
      .select("*, importance_score, token_count, islamic_content")
      .eq("session_id", sessionId)
      .order("created_at", { ascending: true });

    if (error) {
      console.error("Error fetching messages:", error);
      return [];
    }

    return data || [];
  }

  // Add message to session
  static async addMessage(
    sessionId: string,
    role: "user" | "assistant",
    content: string
  ): Promise<ChatMessage | null> {
    const { data, error } = await supabase
      .from("chat_messages")
      .insert({
        session_id: sessionId,
        role,
        content,
      })
      .select()
      .single();

    if (error) {
      console.error("Error adding message:", error);
      return null;
    }

    return data;
  }

  // Update session title
  static async updateSessionTitle(sessionId: string, title: string): Promise<boolean> {
    const { error } = await supabase.from("chat_sessions").update({ title }).eq("id", sessionId);

    if (error) {
      console.error("Error updating session title:", error);
      return false;
    }

    return true;
  }

  // Get all sessions for user
  static async getUserSessions(userId: string): Promise<ChatSession[]> {
    const { data, error } = await supabase
      .from("chat_sessions")
      .select("*, message_count")
      .eq("user_id", userId)
      .order("updated_at", { ascending: false });

    if (error) {
      console.error("Error fetching user sessions:", error);
      return [];
    }

    return data || [];
  }

  // Delete session and all its messages
  static async deleteSession(sessionId: string): Promise<boolean> {
    const { error } = await supabase.from("chat_sessions").delete().eq("id", sessionId);

    if (error) {
      console.error("Error deleting session:", error);
      return false;
    }

    return true;
  }

  // Get session with memory statistics
  static async getSessionWithStats(sessionId: string): Promise<{
    session: ChatSession | null;
    stats: {
      totalMessages: number;
      importantMessages: number;
      islamicMessages: number;
      averageImportance: number;
    };
  }> {
    const [sessionResult, statsResult] = await Promise.all([
      supabase.from("chat_sessions").select("*, message_count").eq("id", sessionId).single(),
      supabase
        .from("chat_messages")
        .select("importance_score, islamic_content")
        .eq("session_id", sessionId),
    ]);

    const session = sessionResult.error ? null : sessionResult.data;
    const messages = statsResult.error ? [] : statsResult.data;

    const stats = {
      totalMessages: messages.length,
      importantMessages: messages.filter((msg) => (msg.importance_score || 0) >= 3).length,
      islamicMessages: messages.filter((msg) => msg.islamic_content).length,
      averageImportance:
        messages.length > 0
          ? messages.reduce((sum, msg) => sum + (msg.importance_score || 0), 0) / messages.length
          : 0,
    };

    return { session, stats };
  }

  // Cleanup old messages for a session
  static async cleanupSession(sessionId: string, maxMessages: number = 100): Promise<number> {
    const { data, error } = await supabase.rpc("cleanup_old_messages", {
      session_id_param: sessionId,
      max_messages: maxMessages,
    });

    if (error) {
      console.error("Error cleaning up session:", error);
      return 0;
    }

    return data || 0;
  }
}
