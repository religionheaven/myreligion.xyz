import { AdminAnalytics } from "./adminAnalytics";
import { supabase } from "../lib/supabase";

export class SessionTracking {
  private static sessionToken: string | null = null;
  private static visitorId: string | null = null;
  private static isTracking = false;

  // Initialize session tracking
  static initialize(userId?: string): void {
    // Reset tracking state if no user (sign out)
    if (!userId) {
      this.cleanup();
      return;
    }

    if (this.isTracking && this.sessionToken) return;

    this.sessionToken = this.generateSessionToken();
    this.visitorId = this.getOrCreateVisitorId();
    this.isTracking = true;

    // Track initial page visit
    this.trackPageVisit("/", userId);

    // Track user session if authenticated
    if (userId) {
      this.trackUserSession(userId);
    }

    // Set up activity tracking
    this.setupActivityTracking();
    this.setupPageVisibilityTracking();
  }

  // Cleanup session tracking
  static cleanup(): void {
    this.isTracking = false;
    this.sessionToken = null;
    // Keep visitorId for anonymous tracking
  }

  // Generate unique session token
  private static generateSessionToken(): string {
    return `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  // Get or create visitor ID
  private static getOrCreateVisitorId(): string {
    let visitorId = localStorage.getItem("religion_visitor_id");
    if (!visitorId) {
      visitorId = `visitor_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      localStorage.setItem("religion_visitor_id", visitorId);
    }
    return visitorId;
  }

  // Track user session
  private static async trackUserSession(userId: string): Promise<void> {
    if (!this.sessionToken) return;

    try {
      const locationData = await this.getLocationData();

      // Insert or update user session with IP and location data
      const { error } = await supabase.from("user_sessions").upsert(
        {
          user_id: userId,
          session_token: this.sessionToken,
          ip_address: locationData.ip === "unknown" ? null : locationData.ip,
          location_data: locationData,
          is_active: true,
          last_activity: new Date().toISOString(),
        },
        {
          onConflict: "session_token",
        }
      );

      if (error) {
        console.error("Error tracking user session:", error);
      }
    } catch (error) {
      console.error("Error tracking user session:", error);
    }
  }

  // Track page visit
  static async trackPageVisit(pagePath: string, userId?: string): Promise<void> {
    if (!this.visitorId) return;

    try {
      const locationData = await this.getLocationData();
      await AdminAnalytics.trackSiteVisit(this.visitorId, userId, pagePath, locationData);
    } catch (error) {
      console.error("Error tracking page visit:", error);
    }
  }

  // Get location data from IP
  private static async getLocationData(): Promise<any> {
    try {
      // Check if Supabase environment variables are available
      const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
      const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

      if (!supabaseUrl || !supabaseKey || supabaseUrl.trim() === "" || supabaseKey.trim() === "") {
        console.warn("Supabase environment variables not configured");
        return { ip: "unknown", country: null, city: null, region: null, timezone: null };
      }

      // Validate URL format
      try {
        new URL(`${supabaseUrl}/functions/v1/get-location-data`);
      } catch (urlError) {
        console.warn("Invalid Supabase URL format:", supabaseUrl);
        return { ip: "unknown", country: null, city: null, region: null, timezone: null };
      }

      // Use Supabase Edge Function to get location data
      const apiUrl = `${supabaseUrl}/functions/v1/get-location-data`;
      const headers = {
        Authorization: `Bearer ${supabaseKey}`,
        "Content-Type": "application/json",
      };

      const response = await fetch(apiUrl, {
        headers,
        method: "GET",
        signal: AbortSignal.timeout(5000), // 5 second timeout
      });

      if (response.ok) {
        const data = await response.json();
        return data;
      } else {
        console.warn("Edge function returned non-OK status:", response.status);
        return { ip: "unknown", country: null, city: null, region: null, timezone: null };
      }
    } catch (error) {
      if (error.name === "AbortError") {
        console.warn("Location data request timed out, using fallback");
      } else if (error.name === "TypeError" && error.message.includes("Failed to fetch")) {
        console.warn("Network error fetching location data, using fallback");
      } else {
        console.warn("Error getting location data, using fallback:", error);
      }
      return { ip: "unknown", country: null, city: null, region: null, timezone: null };
    }
  }

  // Setup activity tracking
  private static setupActivityTracking(): void {
    // Track mouse movement, clicks, and keyboard activity
    const activityEvents = ["mousedown", "mousemove", "keypress", "scroll", "touchstart"];

    let lastActivity = Date.now();
    const updateActivity = () => {
      lastActivity = Date.now();
    };

    activityEvents.forEach((event) => {
      document.addEventListener(event, updateActivity, { passive: true });
    });

    // Update session activity every 30 seconds if user is active
    setInterval(() => {
      const timeSinceActivity = Date.now() - lastActivity;
      if (timeSinceActivity < 30000) {
        // Active within last 30 seconds
        this.updateSessionActivity();
      }
    }, 30000);
  }

  // Setup page visibility tracking
  private static setupPageVisibilityTracking(): void {
    document.addEventListener("visibilitychange", () => {
      if (document.visibilityState === "visible") {
        this.updateSessionActivity();
      }
    });

    // Track when user leaves the page
    window.addEventListener("beforeunload", () => {
      this.endSession();
    });
  }

  // Update session activity
  private static updateSessionActivity(): void {
    if (this.sessionToken && this.isTracking) {
      // Update last activity timestamp
      supabase
        .from("user_sessions")
        .update({
          last_activity: new Date().toISOString(),
          is_active: true,
        })
        .eq("session_token", this.sessionToken)
        .then(({ error }) => {
          if (error) {
            console.error("Error updating session activity:", error);
          }
        });
    }
  }

  // End session
  private static endSession(): void {
    if (this.sessionToken) {
      // Mark session as inactive
      supabase
        .from("user_sessions")
        .update({ is_active: false })
        .eq("session_token", this.sessionToken)
        .then(({ error }) => {
          if (error) {
            console.error("Error ending session:", error);
          }
        });
    }

    this.isTracking = false;
  }

  // Track message sent
  static async trackMessage(
    messageId: string,
    userId: string,
    sessionId: string,
    religion: string,
    messageLength: number,
    responseTimeMs?: number
  ): Promise<void> {
    try {
      await AdminAnalytics.trackMessage(
        messageId,
        userId,
        sessionId,
        religion,
        messageLength,
        responseTimeMs
      );
    } catch (error) {
      console.error("Error tracking message:", error);
    }
  }

  // Get current session info
  static getSessionInfo(): { sessionToken: string | null; visitorId: string | null } {
    return {
      sessionToken: this.sessionToken,
      visitorId: this.visitorId,
    };
  }
}
