import { ChatMessage } from "../../lib/supabase";

export interface ContextMessage {
  id: string;
  role: "user" | "assistant";
  content: string;
  timestamp: Date;
  importance_score: number;
  islamic_content: boolean;
}

export interface MemoryConfig {
  maxMessages: number;
  recentMessages: number;
  importantMessages: number;
  maxTokens: number;
}

export class MemoryManager {
  private static readonly DEFAULT_CONFIG: MemoryConfig = {
    maxMessages: 8,
    recentMessages: 4,
    importantMessages: 2,
    maxTokens: 2000,
  };

  /**
   * Get optimal context for AI conversation
   * Uses smart selection to balance recent context with important historical messages
   */
  static getOptimalContext(
    messages: ChatMessage[],
    config: MemoryConfig = MemoryManager.DEFAULT_CONFIG
  ): ContextMessage[] {
    if (messages.length === 0) return [];

    // Convert to context messages
    const contextMessages: ContextMessage[] = messages.map((msg) => ({
      id: msg.id,
      role: msg.role,
      content: msg.content,
      timestamp: new Date(msg.created_at),
      importance_score: msg.importance_score || 0,
      islamic_content: msg.islamic_content || false,
    }));

    // For short conversations, use all messages
    if (contextMessages.length <= config.maxMessages) {
      return contextMessages;
    }

    // For long conversations, use smart selection
    return MemoryManager.selectSmartContext(contextMessages, config);
  }

  /**
   * Smart context selection for long conversations
   */
  private static selectSmartContext(
    messages: ContextMessage[],
    config: MemoryConfig
  ): ContextMessage[] {
    // Get recent messages (always include for conversation flow)
    const recentMessages = messages.slice(-config.recentMessages);

    // Get earlier messages (excluding recent ones)
    const earlierMessages = messages.slice(0, -config.recentMessages);

    // Select important earlier messages
    const importantEarlier = earlierMessages
      .filter((msg) => MemoryManager.isImportantMessage(msg))
      .sort((a, b) => {
        // Sort by importance score first, then by recency
        if (b.importance_score !== a.importance_score) {
          return b.importance_score - a.importance_score;
        }
        return b.timestamp.getTime() - a.timestamp.getTime();
      })
      .slice(0, config.importantMessages);

    // Combine and sort chronologically
    const selectedMessages = [...importantEarlier, ...recentMessages].sort(
      (a, b) => a.timestamp.getTime() - b.timestamp.getTime()
    );

    // Ensure we don't exceed token limits
    return MemoryManager.enforceTokenLimits(selectedMessages, config.maxTokens);
  }

  /**
   * Check if a message is considered important
   */
  private static isImportantMessage(message: ContextMessage): boolean {
    return (
      message.importance_score >= 3 || // High importance score
      message.islamic_content || // Contains religious content
      message.content.length > 100 || // Long message
      message.role === "assistant" // AI responses are often important
    );
  }

  /**
   * Enforce token limits by removing least important messages
   */
  private static enforceTokenLimits(
    messages: ContextMessage[],
    maxTokens: number
  ): ContextMessage[] {
    let totalTokens = messages.reduce((sum, msg) => sum + msg.content.length / 4, 0);

    if (totalTokens <= maxTokens) {
      return messages;
    }

    // Sort by importance (keep most important)
    const sortedByImportance = [...messages].sort((a, b) => {
      // Always keep the most recent message
      const aIsRecent = messages.indexOf(a) >= messages.length - 2;
      const bIsRecent = messages.indexOf(b) >= messages.length - 2;

      if (aIsRecent && !bIsRecent) return -1;
      if (!aIsRecent && bIsRecent) return 1;

      return b.importance_score - a.importance_score;
    });

    // Keep adding messages until we hit token limit
    const result: ContextMessage[] = [];
    totalTokens = 0;

    for (const message of sortedByImportance) {
      const messageTokens = message.content.length / 4;
      if (totalTokens + messageTokens <= maxTokens) {
        result.push(message);
        totalTokens += messageTokens;
      }
    }

    // Sort result chronologically
    return result.sort((a, b) => a.timestamp.getTime() - b.timestamp.getTime());
  }

  /**
   * Build message history for AI API
   */
  static buildMessageHistory(
    messages: ChatMessage[],
    systemPrompt: string,
    config?: MemoryConfig
  ): Array<{ role: string; content: string }> {
    const history = [{ role: "system", content: systemPrompt }];

    const contextMessages = MemoryManager.getOptimalContext(messages, config);

    contextMessages.forEach((msg) => {
      history.push({
        role: msg.role,
        content: msg.content,
      });
    });

    return history;
  }

  /**
   * Get memory statistics for debugging
   */
  static getMemoryStats(messages: ChatMessage[]): {
    totalMessages: number;
    importantMessages: number;
    islamicMessages: number;
    averageImportance: number;
    totalTokens: number;
  } {
    const contextMessages = messages.map((msg) => ({
      importance_score: msg.importance_score || 0,
      islamic_content: msg.islamic_content || false,
      content: msg.content,
    }));

    return {
      totalMessages: messages.length,
      importantMessages: contextMessages.filter((msg) => msg.importance_score >= 3).length,
      islamicMessages: contextMessages.filter((msg) => msg.islamic_content).length,
      averageImportance:
        contextMessages.reduce((sum, msg) => sum + msg.importance_score, 0) / messages.length,
      totalTokens: contextMessages.reduce((sum, msg) => sum + msg.content.length / 4, 0),
    };
  }
}
