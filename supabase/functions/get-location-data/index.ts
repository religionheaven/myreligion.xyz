const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization",
};

Deno.serve(async (req: Request) => {
  try {
    if (req.method === "OPTIONS") {
      return new Response(null, {
        status: 200,
        headers: corsHeaders,
      });
    }

    // Get client IP from headers
    const forwardedFor = req.headers.get('x-forwarded-for');
    const realIp = req.headers.get('x-real-ip');
    const clientIp = forwardedFor?.split(',')[0] || realIp || 'unknown';

    // Try to fetch location data from ipapi.co
    let locationData = {
      country: null,
      city: null,
      region: null,
      ip: clientIp,
      timezone: null,
    };

    try {
      const response = await fetch(`https://ipapi.co/${clientIp}/json/`);
      
      if (response.ok) {
        const data = await response.json();
        locationData = {
          country: data.country_name || null,
          city: data.city || null,
          region: data.region || null,
          ip: clientIp,
          timezone: data.timezone || null,
        };
      }
    } catch (error) {
      console.log('Failed to fetch external location data, using basic IP only');
    }

    return new Response(
      JSON.stringify(locationData),
      {
        headers: {
          'Content-Type': 'application/json',
          ...corsHeaders,
        },
      },
    );
  } catch (error) {
    console.error('Error in get-location-data function:', error);
    
    // Return basic response on any error
    return new Response(
      JSON.stringify({
        country: null,
        city: null,
        region: null,
        ip: 'unknown',
        timezone: null,
      }),
      {
        status: 200,
        headers: {
          'Content-Type': 'application/json',
          ...corsHeaders,
        },
      },
    );
  }
});