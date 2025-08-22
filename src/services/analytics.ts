interface AnalyticsEvent {
  event: string;
  religion?: string;
  timestamp: number;
  sessionId?: string;
}

interface AnalyticsData {
  totalSessions: number;
  totalMessages: number;
  religionStats: Record<
    string,
    {
      sessions: number;
      messages: number;
      lastUsed: number;
    }
  >;
  dailyUsage: Record<string, number>;
  averageSessionLength: number;
}

export class Analytics {
  private static readonly ANALYTICS_KEY = "religion_analytics";
  private static readonly MAX_EVENTS = 1000;

  // Track an event
  static trackEvent(event: string, religion?: string, sessionId?: string): void {
    try {
      const analyticsEvent: AnalyticsEvent = {
        event,
        religion,
        timestamp: Date.now(),
        sessionId,
      };

      const events = this.getEvents();
      events.push(analyticsEvent);

      // Keep only recent events
      const trimmedEvents = events.slice(-this.MAX_EVENTS);
      localStorage.setItem(this.ANALYTICS_KEY, JSON.stringify(trimmedEvents));
    } catch (error) {
      console.error("Error tracking analytics:", error);
    }
  }

  // Get analytics summary
  static getAnalytics(): AnalyticsData {
    try {
      const events = this.getEvents();
      const now = Date.now();
      const thirtyDaysAgo = now - 30 * 24 * 60 * 60 * 1000;

      // Filter to last 30 days
      const recentEvents = events.filter((e) => e.timestamp > thirtyDaysAgo);

      const religionStats: Record<
        string,
        { sessions: number; messages: number; lastUsed: number }
      > = {};
      const dailyUsage: Record<string, number> = {};
      const sessionIds = new Set<string>();

      recentEvents.forEach((event) => {
        // Daily usage
        const date = new Date(event.timestamp).toDateString();
        dailyUsage[date] = (dailyUsage[date] || 0) + 1;

        // Religion stats
        if (event.religion) {
          if (!religionStats[event.religion]) {
            religionStats[event.religion] = { sessions: 0, messages: 0, lastUsed: 0 };
          }

          const stats = religionStats[event.religion];
          stats.lastUsed = Math.max(stats.lastUsed, event.timestamp);

          if (event.event === "session_started" && event.sessionId) {
            sessionIds.add(event.sessionId);
            stats.sessions++;
          }

          if (event.event === "message_sent") {
            stats.messages++;
          }
        }
      });

      // Calculate average session length (approximate)
      const sessionEvents = recentEvents.filter((e) => e.sessionId);
      const sessionGroups: Record<string, AnalyticsEvent[]> = {};

      sessionEvents.forEach((event) => {
        if (!sessionGroups[event.sessionId!]) {
          sessionGroups[event.sessionId!] = [];
        }
        sessionGroups[event.sessionId!].push(event);
      });

      let totalSessionDuration = 0;
      let completedSessions = 0;

      Object.values(sessionGroups).forEach((sessionEvents) => {
        if (sessionEvents.length > 1) {
          const sorted = sessionEvents.sort((a, b) => a.timestamp - b.timestamp);
          const duration = sorted[sorted.length - 1].timestamp - sorted[0].timestamp;
          totalSessionDuration += duration;
          completedSessions++;
        }
      });

      const averageSessionLength =
        completedSessions > 0
          ? Math.round(totalSessionDuration / completedSessions / 1000 / 60) // minutes
          : 0;

      return {
        totalSessions: sessionIds.size,
        totalMessages: recentEvents.filter((e) => e.event === "message_sent").length,
        religionStats,
        dailyUsage,
        averageSessionLength,
      };
    } catch (error) {
      console.error("Error getting analytics:", error);
      return {
        totalSessions: 0,
        totalMessages: 0,
        religionStats: {},
        dailyUsage: {},
        averageSessionLength: 0,
      };
    }
  }

  // Get popular religions
  static getPopularReligions(): Array<{ religion: string; usage: number }> {
    const analytics = this.getAnalytics();
    return Object.entries(analytics.religionStats)
      .map(([religion, stats]) => ({
        religion,
        usage: stats.sessions + stats.messages,
      }))
      .sort((a, b) => b.usage - a.usage);
  }

  // Clear analytics data
  static clearAnalytics(): void {
    localStorage.removeItem(this.ANALYTICS_KEY);
  }

  private static getEvents(): AnalyticsEvent[] {
    try {
      const stored = localStorage.getItem(this.ANALYTICS_KEY);
      if (!stored) return [];

      const parsed = JSON.parse(stored);
      return Array.isArray(parsed) ? parsed : [];
    } catch (error) {
      console.error("Error parsing analytics:", error);
      return [];
    }
  }
}
