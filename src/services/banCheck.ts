import { BanManagement } from "./banManagement";

export class BanCheck {
  private static bannedUsers = new Set<string>();
  private static bannedIPs = new Set<string>();
  private static lastCheck = 0;
  private static readonly CHECK_INTERVAL = 5 * 60 * 1000; // 5 minutes

  // Check if user or IP is banned (with caching)
  static async isBanned(
    userIdentifier?: string,
    ipAddress?: string,
    isUsername: boolean = false
  ): Promise<boolean> {
    // Refresh cache if needed
    await this.refreshCacheIfNeeded();

    // Convert username to user ID if needed
    let userId: string | undefined;
    if (userIdentifier) {
      if (isUsername) {
        const foundUserId = await BanManagement.getUserIdFromUsername(userIdentifier);
        userId = foundUserId || undefined;
      } else {
        userId = userIdentifier;
      }
    }

    // Check cached bans
    if (userId && this.bannedUsers.has(userId)) {
      return true;
    }

    if (ipAddress && this.bannedIPs.has(ipAddress)) {
      return true;
    }

    return false;
  }

  // Force refresh ban cache
  static async refreshBanCache(): Promise<void> {
    try {
      const [bannedUsers, bannedIPs] = await Promise.all([
        BanManagement.getBannedUsers(),
        BanManagement.getBannedIPs(),
      ]);

      // Update cached sets
      this.bannedUsers.clear();
      this.bannedIPs.clear();

      bannedUsers.forEach((ban) => {
        if (ban.is_active && (!ban.expires_at || new Date(ban.expires_at) > new Date())) {
          this.bannedUsers.add(ban.user_id);
        }
      });

      bannedIPs.forEach((ban) => {
        if (ban.is_active && (!ban.expires_at || new Date(ban.expires_at) > new Date())) {
          this.bannedIPs.add(ban.ip_address);
        }
      });

      this.lastCheck = Date.now();
    } catch (error) {
      console.error("Error refreshing ban cache:", error);
    }
  }

  // Refresh cache if interval has passed
  private static async refreshCacheIfNeeded(): Promise<void> {
    if (Date.now() - this.lastCheck > this.CHECK_INTERVAL) {
      await this.refreshBanCache();
    }
  }

  // Get user's current IP address
  static async getCurrentIP(): Promise<string | null> {
    try {
      const response = await fetch("https://api.ipify.org?format=json");
      const data = await response.json();
      return data.ip;
    } catch (error) {
      console.error("Error getting current IP:", error);
      return null;
    }
  }

  // Check ban status and redirect if banned
  static async checkAndEnforceBan(
    userIdentifier?: string,
    isUsername: boolean = false
  ): Promise<boolean> {
    try {
      const currentIP = await this.getCurrentIP();
      const isBanned = await this.isBanned(userIdentifier, currentIP || undefined, isUsername);

      if (isBanned) {
        // Show ban message and prevent access
        this.showBanMessage();
        return true;
      }

      return false;
    } catch (error) {
      console.error("Error checking ban status:", error);
      return false;
    }
  }

  // Show ban message to user
  private static showBanMessage(): void {
    // Create ban overlay
    const overlay = document.createElement("div");
    overlay.style.cssText = `
      position: fixed;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      background-image: url('https://i.imgur.com/uq6ZLW6.png');
      background-size: cover;
      background-position: center;
      background-repeat: no-repeat;
      z-index: 9999;
    `;

    document.body.appendChild(overlay);
  }

  // Add user to ban cache (for real-time updates)
  static addToBanCache(userId?: string, ipAddress?: string): void {
    if (userId) {
      this.bannedUsers.add(userId);
    }
    if (ipAddress) {
      this.bannedIPs.add(ipAddress);
    }
  }

  // Remove user from ban cache (for real-time updates)
  static removeFromBanCache(userId?: string, ipAddress?: string): void {
    if (userId) {
      this.bannedUsers.delete(userId);
    }
    if (ipAddress) {
      this.bannedIPs.delete(ipAddress);
    }
  }
}
