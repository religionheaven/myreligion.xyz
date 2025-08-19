import { supabase } from '../lib/supabase';

export interface LiveUser {
  id: string;
  username: string;
  email: string;
  is_active: boolean;
  last_activity: string;
  location_data: {
    country?: string;
    city?: string;
    region?: string;
    ip?: string;
  };
  session_duration: number;
  current_page?: string;
}

export interface SiteVisit {
  id: string;
  visitor_id: string;
  user_id?: string;
  username?: string;
  page_path: string;
  referrer?: string;
  location_data: {
    country?: string;
    city?: string;
    region?: string;
  };
  session_duration: number;
  created_at: string;
}

export interface MessageAnalytics {
  id: string;
  user_id: string;
  username: string;
  religion: string;
  message_length: number;
  response_time_ms?: number;
  sentiment_score: number;
  contains_sensitive: boolean;
  location_data: {
    country?: string;
    city?: string;
  };
  created_at: string;
}

export interface UserRequest {
  id: string;
  user_id: string;
  username: string;
  request_type: string;
  request_text: string;
  created_at: string;
}

export interface AdminStats {
  totalUsers: number;
  activeUsers: number;
  totalVisits: number;
  totalMessages: number;
  totalRequests: number;
  topCountries: Array<{ country: string; count: number }>;
  topReligions: Array<{ religion: string; count: number }>;
  recentActivity: number;
}

export class AdminAnalytics {
  // Get live users currently on the site
  static async getLiveUsers(): Promise<LiveUser[]> {
    try {
      const apiUrl = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/user-lookup?action=getLiveUsers`;
      const headers = {
        'Authorization': `Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY}`,
        'Content-Type': 'application/json',
      };

      const response = await fetch(apiUrl, { headers });
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const liveUsers = await response.json();
      return liveUsers;
    } catch (error) {
      console.error('Error in getLiveUsers:', error);
      return [];
    }
  }

  // Get all site visits with analytics
  static async getSiteVisits(limit: number = 100): Promise<SiteVisit[]> {
    try {
      const { data: visits, error } = await supabase
        .from('site_visits')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(limit);

      if (error) {
        console.error('Error fetching site visits:', error);
        return [];
      }

      if (!visits || visits.length === 0) {
        return [];
      }

      // Deduplicate by visitor_id, keeping the most recent visit
      const visitorMap = new Map();
      visits.forEach(visit => {
        const existing = visitorMap.get(visit.visitor_id);
        if (!existing || new Date(visit.created_at) > new Date(existing.created_at)) {
          visitorMap.set(visit.visitor_id, visit);
        }
      });

      const uniqueVisits = Array.from(visitorMap.values());

      // Get unique user IDs
      const userIds = [...new Set(uniqueVisits.map(v => v.user_id).filter(Boolean))];
      
      let usernameMap = new Map();
      if (userIds.length > 0) {
        // Get user profiles for usernames
        const { data: profiles, error: profilesError } = await supabase
          .from('user_profiles')
          .select('user_id, username')
          .in('user_id', userIds);

        if (!profilesError && profiles) {
          profiles.forEach(profile => {
            usernameMap.set(profile.user_id, profile.username);
          });
        }
      }

      return uniqueVisits.map((visit) => ({
        id: visit.id,
        visitor_id: visit.visitor_id,
        user_id: visit.user_id,
        username: visit.user_id ? (usernameMap.get(visit.user_id) || 'Unknown User') : 'Anonymous',
        page_path: visit.page_path,
        referrer: visit.referrer,
        location_data: visit.location_data || {},
        session_duration: visit.session_duration,
        created_at: visit.created_at,
      }));
    } catch (error) {
      console.error('Error in getSiteVisits:', error);
      return [];
    }
  }

  // Get message analytics
  static async getMessageAnalytics(limit: number = 100): Promise<MessageAnalytics[]> {
    try {
      const { data: messages, error } = await supabase
        .from('message_analytics')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(limit);

      if (error) {
        console.error('Error fetching message analytics:', error);
        return [];
      }

      if (!messages || messages.length === 0) {
        return [];
      }

      // Get unique user IDs
      const userIds = [...new Set(messages.map(m => m.user_id).filter(Boolean))];
      
      let usernameMap = new Map();
      if (userIds.length > 0) {
        // Get user profiles for usernames
        const { data: profiles, error: profilesError } = await supabase
          .from('user_profiles')
          .select('user_id, username')
          .in('user_id', userIds);

        if (!profilesError && profiles) {
          profiles.forEach(profile => {
            usernameMap.set(profile.user_id, profile.username);
          });
        }
      }

      return messages.map((msg) => ({
        id: msg.id,
        user_id: msg.user_id,
        username: usernameMap.get(msg.user_id) || 'Unknown User',
        religion: msg.religion,
        message_length: msg.message_length,
        response_time_ms: msg.response_time_ms,
        sentiment_score: msg.sentiment_score,
        contains_sensitive: msg.contains_sensitive,
        location_data: msg.location_data || {},
        created_at: msg.created_at,
      }));
    } catch (error) {
      console.error('Error in getMessageAnalytics:', error);
      return [];
    }
  }

  // Get all user requests
  static async getUserRequests(): Promise<UserRequest[]> {
    try {
      const { data: requests, error } = await supabase
        .from('user_requests')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching user requests:', error);
        return [];
      }

      if (!requests || requests.length === 0) {
        return [];
      }

      // Get unique user IDs
      const userIds = [...new Set(requests.map(r => r.user_id).filter(Boolean))];
      
      let usernameMap = new Map();
      if (userIds.length > 0) {
        // Get user profiles for usernames
        const { data: profiles, error: profilesError } = await supabase
          .from('user_profiles')
          .select('user_id, username')
          .in('user_id', userIds);

        if (!profilesError && profiles) {
          profiles.forEach(profile => {
            usernameMap.set(profile.user_id, profile.username);
          });
        }
      }

      return requests.map((request) => ({
        id: request.id,
        user_id: request.user_id,
        username: usernameMap.get(request.user_id) || 'Unknown User',
        request_type: request.request_type,
        request_text: request.request_text,
        created_at: request.created_at,
      }));
    } catch (error) {
      console.error('Error in getUserRequests:', error);
      return [];
    }
  }

  // Get comprehensive admin statistics
  static async getAdminStats(): Promise<AdminStats> {
    try {
      const [usersResult, visitsResult, messagesResult, requestsResult] = await Promise.all([
        fetch(`${import.meta.env.VITE_SUPABASE_URL}/functions/v1/user-lookup?action=getTotalUserCount`, {
          headers: {
            'Authorization': `Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY}`,
            'Content-Type': 'application/json',
          },
        }).then(res => res.json()),
        supabase.from('site_visits').select('*', { count: 'exact', head: true }),
        supabase.from('message_analytics').select('*', { count: 'exact', head: true }),
        supabase.from('user_requests').select('*', { count: 'exact', head: true }),
      ]);

      const { count: activeUsers } = await supabase
        .from('user_sessions')
        .select('*', { count: 'exact', head: true })
        .eq('is_active', true)
        .gte('last_activity', new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString());

      // Get top countries
      const { data: countryData } = await supabase
        .from('site_visits')
        .select('location_data')
        .not('location_data->country', 'is', null);

      const countryCount: Record<string, number> = {};
      countryData?.forEach((visit) => {
        const country = visit.location_data?.country;
        if (country) {
          countryCount[country] = (countryCount[country] || 0) + 1;
        }
      });

      const topCountries = Object.entries(countryCount)
        .map(([country, count]) => ({ country, count }))
        .sort((a, b) => b.count - a.count)
        .slice(0, 5);

      // Get top religions
      const { data: religionData } = await supabase.from('message_analytics').select('religion');

      const religionCount: Record<string, number> = {};
      religionData?.forEach((msg) => {
        const religion = msg.religion;
        if (religion) {
          religionCount[religion] = (religionCount[religion] || 0) + 1;
        }
      });

      const topReligions = Object.entries(religionCount)
        .map(([religion, count]) => ({ religion, count }))
        .sort((a, b) => b.count - a.count)
        .slice(0, 4);

      // Get recent activity (last hour)
      const { count: recentActivity } = await supabase
        .from('site_visits')
        .select('*', { count: 'exact', head: true })
        .gte('created_at', new Date(Date.now() - 60 * 60 * 1000).toISOString());

      return {
        totalUsers: usersResult?.count || 0,
        activeUsers: activeUsers || 0,
        totalVisits: visitsResult.count || 0,
        totalMessages: messagesResult.count || 0,
        totalRequests: requestsResult.count || 0,
        topCountries,
        topReligions,
        recentActivity: recentActivity || 0,
      };
    } catch (error) {
      console.error('Error fetching admin stats:', error);
      return {
        totalUsers: 0,
        activeUsers: 0,
        totalVisits: 0,
        totalMessages: 0,
        totalRequests: 0,
        topCountries: [],
        topReligions: [],
        recentActivity: 0,
      };
    }
  }

  // Track user session
  static async trackUserSession(
    userId: string,
    sessionToken: string,
    locationData?: any,
  ): Promise<void> {
    try {
      await supabase.from('user_sessions').upsert({
        user_id: userId,
        session_token: sessionToken,
        location_data: locationData || {},
        is_active: true,
        last_activity: new Date().toISOString(),
      });
    } catch (error) {
      console.error('Error tracking user session:', error);
    }
  }

  // Track site visit
  static async trackSiteVisit(
    visitorId: string,
    userId?: string,
    pagePath: string = '/',
    locationData?: any,
  ): Promise<void> {
    try {
      await supabase.from('site_visits').insert({
        visitor_id: visitorId,
        user_id: userId,
        page_path: pagePath,
        referrer: document.referrer || null,
        location_data: locationData || {},
      });
    } catch (error) {
      console.error('Error tracking site visit:', error);
    }
  }

  // Track message analytics
  static async trackMessage(
    messageId: string,
    userId: string,
    sessionId: string,
    religion: string,
    messageLength: number,
    responseTimeMs?: number,
  ): Promise<void> {
    try {
      await supabase.from('message_analytics').insert({
        message_id: messageId,
        user_id: userId,
        session_id: sessionId,
        religion: religion.toLowerCase(),
        message_length: messageLength,
        response_time_ms: responseTimeMs,
        sentiment_score: 0, // Could be enhanced with sentiment analysis
        contains_sensitive: false, // Could be enhanced with content analysis
      });
    } catch (error) {
      console.error('Error tracking message analytics:', error);
    }
  }

  // Log admin action
  static async logAdminAction(
    adminUserId: string,
    action: string,
    targetType?: string,
    targetId?: string,
    details?: any,
  ): Promise<void> {
    try {
      await supabase.from('admin_logs').insert({
        admin_user_id: adminUserId,
        action,
        target_type: targetType,
        target_id: targetId,
        details: details || {},
      });
    } catch (error) {
      console.error('Error logging admin action:', error);
    }
  }
}