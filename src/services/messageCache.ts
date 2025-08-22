interface CachedMessage {
  id: string;
  role: "user" | "assistant";
  content: string;
  timestamp: Date;
  sessionId: string;
}

interface CachedSession {
  id: string;
  messages: CachedMessage[];
  lastUpdated: Date;
  religion: string;
}

export class MessageCache {
  private static readonly CACHE_KEY = "religion_chat_cache";
  private static readonly MAX_SESSIONS = 10;
  private static readonly CACHE_DURATION = 24 * 60 * 60 * 1000; // 24 hours

  // Get cached messages for a session
  static getCachedMessages(sessionId: string): CachedMessage[] {
    try {
      const cache = this.getCache();
      const session = cache.find((s) => s.id === sessionId);

      if (session && this.isValidCache(session.lastUpdated)) {
        return session.messages;
      }

      return [];
    } catch (error) {
      console.error("Error reading message cache:", error);
      return [];
    }
  }

  // Cache messages for a session
  static cacheMessages(sessionId: string, messages: CachedMessage[], religion: string): void {
    try {
      const cache = this.getCache();
      const existingIndex = cache.findIndex((s) => s.id === sessionId);

      const sessionData: CachedSession = {
        id: sessionId,
        messages,
        lastUpdated: new Date(),
        religion,
      };

      if (existingIndex >= 0) {
        cache[existingIndex] = sessionData;
      } else {
        cache.unshift(sessionData);
      }

      // Keep only the most recent sessions
      const trimmedCache = cache.slice(0, this.MAX_SESSIONS);
      localStorage.setItem(this.CACHE_KEY, JSON.stringify(trimmedCache));
    } catch (error) {
      console.error("Error caching messages:", error);
    }
  }

  // Add a single message to cache
  static addMessageToCache(sessionId: string, message: CachedMessage, religion: string): void {
    const cached = this.getCachedMessages(sessionId);
    cached.push(message);
    this.cacheMessages(sessionId, cached, religion);
  }

  // Get all cached sessions
  static getCachedSessions(): CachedSession[] {
    return this.getCache().filter((session) => this.isValidCache(session.lastUpdated));
  }

  // Clear cache
  static clearCache(): void {
    localStorage.removeItem(this.CACHE_KEY);
  }

  // Clear expired cache entries
  static cleanupCache(): void {
    const cache = this.getCache();
    const validCache = cache.filter((session) => this.isValidCache(session.lastUpdated));
    localStorage.setItem(this.CACHE_KEY, JSON.stringify(validCache));
  }

  private static getCache(): CachedSession[] {
    try {
      const cached = localStorage.getItem(this.CACHE_KEY);
      if (!cached) return [];

      const parsed = JSON.parse(cached);
      return Array.isArray(parsed) ? parsed : [];
    } catch (error) {
      console.error("Error parsing cache:", error);
      return [];
    }
  }

  private static isValidCache(lastUpdated: Date | string): boolean {
    const date = typeof lastUpdated === "string" ? new Date(lastUpdated) : lastUpdated;
    return Date.now() - date.getTime() < this.CACHE_DURATION;
  }
}
