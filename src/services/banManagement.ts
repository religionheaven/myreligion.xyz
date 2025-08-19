import { supabase } from '../lib/supabase';

// ============================================================================
// TYPES AND INTERFACES
// ============================================================================

export interface BannedUser {
  id: string;
  user_id: string;
  username: string;
  email: string;
  banned_by: string;
  banned_by_username: string;
  reason: string;
  banned_at: string;
  expires_at?: string;
  is_permanent: boolean;
  is_active: boolean;
}

export interface BannedIP {
  id: string;
  ip_address: string;
  banned_by: string;
  banned_by_username: string;
  reason: string;
  banned_at: string;
  expires_at?: string;
  is_permanent: boolean;
  is_active: boolean;
  associated_user_id?: string;
  associated_username?: string;
}

export interface BanLog {
  id: string;
  admin_user_id: string;
  admin_username: string;
  action: string;
  target_user_id?: string;
  target_username?: string;
  target_ip?: string;
  reason: string;
  details: any;
  created_at: string;
}

// ============================================================================
// BAN MANAGEMENT SERVICE
// ============================================================================

export class BanManagement {
  // --------------------------------------------------------------------------
  // USER BANNING METHODS
  // --------------------------------------------------------------------------

  /**
   * Ban a user (also auto-bans their IP addresses via database trigger)
   */
  static async banUser(
    userIdentifier: string,
    reason: string,
    isPermanent: boolean = true,
    expiresAt?: string,
    isUsername: boolean = false,
  ): Promise<boolean> {
    try {
      let userId: string;

      if (isUsername) {
        // Look up user ID from username
        userId = await this.getUserIdFromUsername(userIdentifier);
        if (!userId) {
          console.error('User not found with username:', userIdentifier);
          return false;
        }
      } else {
        userId = userIdentifier;
      }

      const { error } = await supabase.from('banned_users').insert({
        user_id: userId,
        reason,
        is_permanent: isPermanent,
        expires_at: expiresAt,
      });

      if (error) {
        console.error('Error banning user:', error);
        return false;
      }

      return true;
    } catch (error) {
      console.error('Error in banUser:', error);
      return false;
    }
  }

  /**
   * Unban a user
   */
  static async unbanUser(userIdentifier: string, isUsername: boolean = false): Promise<boolean> {
    try {
      let userId: string;

      if (isUsername) {
        // Look up user ID from username
        userId = await this.getUserIdFromUsername(userIdentifier);
        if (!userId) {
          console.error('User not found with username:', userIdentifier);
          return false;
        }
      } else {
        userId = userIdentifier;
      }

      const { error } = await supabase
        .from('banned_users')
        .update({ is_active: false })
        .eq('user_id', userId)
        .eq('is_active', true);

      if (error) {
        console.error('Error unbanning user:', error);
        return false;
      }

      return true;
    } catch (error) {
      console.error('Error in unbanUser:', error);
      return false;
    }
  }

  // --------------------------------------------------------------------------
  // IP BANNING METHODS
  // --------------------------------------------------------------------------

  /**
   * Ban an IP address
   */
  static async banIP(
    ipAddress: string,
    reason: string,
    isPermanent: boolean = true,
    expiresAt?: string,
    associatedUserId?: string,
  ): Promise<boolean> {
    try {
      const { error } = await supabase.from('banned_ips').insert({
        ip_address: ipAddress,
        reason,
        is_permanent: isPermanent,
        expires_at: expiresAt,
        associated_user_id: associatedUserId,
      });

      if (error) {
        console.error('Error banning IP:', error);
        return false;
      }

      return true;
    } catch (error) {
      console.error('Error in banIP:', error);
      return false;
    }
  }

  /**
   * Unban an IP address
   */
  static async unbanIP(ipAddress: string): Promise<boolean> {
    try {
      const { error } = await supabase
        .from('banned_ips')
        .update({ is_active: false })
        .eq('ip_address', ipAddress)
        .eq('is_active', true);

      if (error) {
        console.error('Error unbanning IP:', error);
        return false;
      }

      return true;
    } catch (error) {
      console.error('Error in unbanIP:', error);
      return false;
    }
  }

  // --------------------------------------------------------------------------
  // DATA RETRIEVAL METHODS
  // --------------------------------------------------------------------------

  /**
   * Get all banned users with username resolution
   */
  static async getBannedUsers(): Promise<BannedUser[]> {
    try {
      // Get banned users data
      const { data: bannedData, error: bannedError } = await supabase
        .from('banned_users')
        .select('*')
        .eq('is_active', true)
        .order('banned_at', { ascending: false });

      if (bannedError) {
        console.error('Error fetching banned users:', bannedError);
        return [];
      }

      if (!bannedData || bannedData.length === 0) {
        return [];
      }

      // Get user details from auth system
      const userMap = await this.getUserMap(bannedData);

      // Map banned users with usernames
      return bannedData.map((ban) => ({
        id: ban.id,
        user_id: ban.user_id,
        username: userMap.get(ban.user_id)?.username || 'Unknown',
        email: userMap.get(ban.user_id)?.email || '',
        banned_by: ban.banned_by,
        banned_by_username: userMap.get(ban.banned_by)?.username || 'System',
        reason: ban.reason,
        banned_at: ban.banned_at,
        expires_at: ban.expires_at,
        is_permanent: ban.is_permanent,
        is_active: ban.is_active,
      }));
    } catch (error) {
      console.error('Error in getBannedUsers:', error);
      return [];
    }
  }

  /**
   * Get all banned IPs with username resolution
   */
  static async getBannedIPs(): Promise<BannedIP[]> {
    try {
      // Get banned IPs data
      const { data: bannedData, error: bannedError } = await supabase
        .from('banned_ips')
        .select('*')
        .eq('is_active', true)
        .order('banned_at', { ascending: false });

      if (bannedError) {
        console.error('Error fetching banned IPs:', bannedError);
        return [];
      }

      if (!bannedData || bannedData.length === 0) {
        return [];
      }

      // Get user details from auth system
      const userMap = await this.getUserMap(bannedData);

      // Map banned IPs with usernames
      return bannedData.map((ban) => ({
        id: ban.id,
        ip_address: ban.ip_address,
        banned_by: ban.banned_by,
        banned_by_username: userMap.get(ban.banned_by)?.username || 'System',
        reason: ban.reason,
        banned_at: ban.banned_at,
        expires_at: ban.expires_at,
        is_permanent: ban.is_permanent,
        is_active: ban.is_active,
        associated_user_id: ban.associated_user_id,
        associated_username: userMap.get(ban.associated_user_id)?.username,
      }));
    } catch (error) {
      console.error('Error in getBannedIPs:', error);
      return [];
    }
  }

  /**
   * Get ban logs with username resolution
   */
  static async getBanLogs(limit: number = 100): Promise<BanLog[]> {
    try {
      // Get ban logs data
      const { data: logData, error: logError } = await supabase
        .from('ban_logs')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(limit);

      if (logError) {
        console.error('Error fetching ban logs:', logError);
        return [];
      }

      if (!logData || logData.length === 0) {
        return [];
      }

      // Get user details from auth system
      const userMap = await this.getUserMap(logData);

      // Map ban logs with usernames
      return logData.map((log) => ({
        id: log.id,
        admin_user_id: log.admin_user_id,
        admin_username: userMap.get(log.admin_user_id)?.username || 'System',
        action: log.action,
        target_user_id: log.target_user_id,
        target_username: userMap.get(log.target_user_id)?.username,
        target_ip: log.target_ip,
        reason: log.reason,
        details: log.details,
        created_at: log.created_at,
      }));
    } catch (error) {
      console.error('Error in getBanLogs:', error);
      return [];
    }
  }

  // --------------------------------------------------------------------------
  // UTILITY METHODS
  // --------------------------------------------------------------------------

  /**
   * Check if user or IP is banned
   */
  static async isBanned(
    userIdentifier?: string,
    ipAddress?: string,
    isUsername: boolean = false,
  ): Promise<boolean> {
    try {
      let userId: string | undefined;

      if (userIdentifier) {
        if (isUsername) {
          // Look up user ID from username
          userId = await this.getUserIdFromUsername(userIdentifier);
          if (!userId) {
            console.error('User not found with username:', userIdentifier);
            return false;
          }
        } else {
          userId = userIdentifier;
        }
      }

      const { data, error } = await supabase.rpc('is_banned', {
        check_user_id: userId || null,
        check_ip: ipAddress || null,
      });

      if (error) {
        console.error('Error checking ban status:', error);
        return false;
      }

      return data || false;
    } catch (error) {
      console.error('Error in isBanned:', error);
      return false;
    }
  }

  /**
   * Get user's IP addresses from sessions
   */
  static async getUserIPs(userId: string): Promise<string[]> {
    try {
      const { data, error } = await supabase
        .from('user_sessions')
        .select('ip_address')
        .eq('user_id', userId)
        .not('ip_address', 'is', null);

      if (error) {
        console.error('Error fetching user IPs:', error);
        return [];
      }

      const uniqueIPs = [...new Set(data.map((session) => session.ip_address))];
      return uniqueIPs.filter((ip) => ip !== null);
    } catch (error) {
      console.error('Error in getUserIPs:', error);
      return [];
    }
  }

  /**
   * Log admin action
   */
  static async logBanAction(
    action: string,
    targetUserIdentifier?: string,
    targetIP?: string,
    reason: string = '',
    details: any = {},
    isUsername: boolean = false,
  ): Promise<void> {
    try {
      let targetUserId: string | undefined;

      if (targetUserIdentifier) {
        if (isUsername) {
          // Look up user ID from username
          targetUserId = await this.getUserIdFromUsername(targetUserIdentifier);
        } else {
          targetUserId = targetUserIdentifier;
        }
      }

      await supabase.from('ban_logs').insert({
        action,
        target_user_id: targetUserId,
        target_ip: targetIP,
        reason,
        details,
      });
    } catch (error) {
      console.error('Error logging ban action:', error);
    }
  }

  // --------------------------------------------------------------------------
  // PRIVATE HELPER METHODS
  // --------------------------------------------------------------------------

  /**
   * Get user ID from username
   */
  private static async getUserIdFromUsername(username: string): Promise<string | null> {
    try {
      const response = await fetch(`${import.meta.env.VITE_SUPABASE_URL}/functions/v1/user-lookup`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          action: 'getUserIdFromUsername',
          username: username,
        }),
      });

      if (!response.ok) {
        console.error('Error fetching user ID from username:', response.statusText);
        return null;
      }

      const { result } = await response.json();
      return result;

    } catch (error) {
      console.error('Error in getUserIdFromUsername:', error);
      return null;
    }
  }


  /**
   * Create a user map from auth system for username resolution
   */
  private static async getUserMap(
    data: any[],
  ): Promise<Map<string, { username: string; email: string }>> {
    const userMap = new Map();

    try {
      // Collect all unique user IDs
      const userIds = new Set<string>();
      data.forEach((item) => {
        if (item.user_id) userIds.add(item.user_id);
        if (item.banned_by) userIds.add(item.banned_by);
        if (item.associated_user_id) userIds.add(item.associated_user_id);
        if (item.admin_user_id) userIds.add(item.admin_user_id);
        if (item.target_user_id) userIds.add(item.target_user_id);
      });

      if (userIds.size === 0) {
        return userMap;
      }

      // Fetch user data from Edge Function
      const response = await fetch(`${import.meta.env.VITE_SUPABASE_URL}/functions/v1/user-lookup`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          action: 'getUserMap',
          userIds: Array.from(userIds),
        }),
      });

      if (!response.ok) {
        console.error('Error fetching user map:', response.statusText);
        return userMap;
      }

      const { result } = await response.json();
      
      // Build user map from result
      if (result) {
        Object.entries(result).forEach(([userId, userData]: [string, any]) => {
          userMap.set(userId, userData);
        });
      }
    } catch (error) {
      console.error('Error building user map:', error);
    }

    return userMap;
  }
}
