import { createClient } from 'npm:@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
};

Deno.serve(async (req: Request) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    if (req.method !== 'POST') {
      return new Response(
        JSON.stringify({ error: 'Method not allowed' }),
        { status: 405, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const { action, userIds, username } = await req.json();

    // Create Supabase client with service role key
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!,
      { auth: { persistSession: false } }
    );

    let result = null;

    switch (action) {
      case 'getUserIdFromUsername':
        if (!username) {
          return new Response(
            JSON.stringify({ error: 'Username required' }),
            { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          );
        }

        const { data: userData, error: userError } = await supabase.auth.admin.listUsers();
        if (userError) {
          console.error('Error fetching users:', userError);
          return new Response(
            JSON.stringify({ error: 'Failed to fetch users' }),
            { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          );
        }

        const user = userData?.users?.find(
          (u) => u.user_metadata?.username?.toLowerCase() === username.toLowerCase()
        );
        result = user?.id || null;
        break;

      case 'getUserMap':
        if (!userIds || !Array.isArray(userIds)) {
          return new Response(
            JSON.stringify({ error: 'User IDs array required' }),
            { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          );
        }

        const { data: allUserData, error: allUserError } = await supabase.auth.admin.listUsers();
        if (allUserError) {
          console.error('Error fetching users:', allUserError);
          return new Response(
            JSON.stringify({ error: 'Failed to fetch users' }),
            { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          );
        }

        const userMap: Record<string, { username: string; email: string }> = {};
        if (allUserData?.users) {
          allUserData.users.forEach((user) => {
            if (userIds.includes(user.id)) {
              userMap[user.id] = {
                username: user.user_metadata?.username || 'Unknown',
                email: user.email || '',
              };
            }
          });
        }
        result = userMap;
        break;

      default:
        return new Response(
          JSON.stringify({ error: 'Invalid action' }),
          { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
    }

    return new Response(
      JSON.stringify({ result }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Edge function error:', error);
    return new Response(
      JSON.stringify({ error: 'Internal server error' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});