import { createClient } from 'npm:@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '',
      {
        auth: {
          autoRefreshToken: false,
          persistSession: false
        }
      }
    );

    const url = new URL(req.url);
    const action = url.searchParams.get('action');

    switch (action) {
      case 'getTotalUserCount': {
        const { count, error } = await supabaseClient.auth.admin.listUsers({
          page: 1,
          perPage: 1
        });
        
        if (error) {
          throw error;
        }

        return new Response(
          JSON.stringify({ count: count || 0 }),
          {
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          }
        );
      }

      case 'getLiveUsers': {
        // Get active user sessions
        const { data: sessions, error: sessionsError } = await supabaseClient
          .from('user_sessions')
          .select('*')
          .eq('is_active', true)
          .gte('last_activity', new Date(Date.now() - 30 * 60 * 1000).toISOString())
          .order('last_activity', { ascending: false });

        if (sessionsError) {
          throw sessionsError;
        }

        if (!sessions || sessions.length === 0) {
          return new Response(
            JSON.stringify([]),
            {
              headers: { ...corsHeaders, 'Content-Type': 'application/json' },
            }
          );
        }

        // Deduplicate sessions by user_id
        const userSessionMap = new Map();
        sessions.forEach(session => {
          if (session.user_id) {
            const existing = userSessionMap.get(session.user_id);
            if (!existing || new Date(session.last_activity) > new Date(existing.last_activity)) {
              userSessionMap.set(session.user_id, session);
            }
          }
        });

        const uniqueSessions = Array.from(userSessionMap.values());
        const userIds = uniqueSessions.map(s => s.user_id);

        if (userIds.length === 0) {
          return new Response(
            JSON.stringify([]),
            {
              headers: { ...corsHeaders, 'Content-Type': 'application/json' },
            }
          );
        }

        // Get user profiles
        const { data: profiles, error: profilesError } = await supabaseClient
          .from('user_profiles')
          .select('user_id, username')
          .in('user_id', userIds);

        if (profilesError) {
          console.error('Error fetching user profiles:', profilesError);
        }

        const usernameMap = new Map();
        (profiles || []).forEach(profile => {
          usernameMap.set(profile.user_id, profile.username);
        });

        const liveUsers = uniqueSessions.map((session) => ({
          id: session.user_id,
          username: usernameMap.get(session.user_id) || 'Anonymous',
          email: '',
          is_active: session.is_active,
          last_activity: session.last_activity,
          location_data: session.location_data || {},
          session_duration: Math.floor(
            (new Date().getTime() - new Date(session.created_at).getTime()) / 1000 / 60,
          ),
          current_page: session.location_data?.current_page,
        }));

        return new Response(
          JSON.stringify(liveUsers),
          {
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          }
        );
      }

      default:
        return new Response(
          JSON.stringify({ error: 'Invalid action' }),
          {
            status: 400,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          }
        );
    }
  } catch (error) {
    console.error('Error in user-lookup function:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }
});