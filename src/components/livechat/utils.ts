import { ChatMessage } from "./types";

// ============================================================================
// UTILITY FUNCTIONS
// ============================================================================

export const formatTime = (timestamp: string) => {
  const date = new Date(timestamp);
  return date.toLocaleTimeString([], {
    hour: "2-digit",
    minute: "2-digit",
    hour12: true,
  });
};

export const getCachedMessages = (): ChatMessage[] => {
  try {
    const cached = localStorage.getItem("live_chat_messages");
    if (cached) {
      const parsed = JSON.parse(cached);
      if (parsed.timestamp && Date.now() - parsed.timestamp < 3600000) {
        return parsed.messages || [];
      }
    }
  } catch (error) {
    console.error("Error reading cache:", error);
  }
  return [];
};

export const cacheMessages = (messages: ChatMessage[]) => {
  try {
    localStorage.setItem(
      "live_chat_messages",
      JSON.stringify({
        messages,
        timestamp: Date.now(),
      })
    );
  } catch (error) {
    console.error("Error caching messages:", error);
  }
};
