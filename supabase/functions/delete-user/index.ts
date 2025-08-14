import { serve } from 'https://deno.land/std@0.177.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.53.0'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  console.log('Function received a request');

  if (req.method === 'OPTIONS') {
    console.log('Responding to OPTIONS request');
    return new Response('ok', { headers: corsHeaders })
  }

  if (req.method !== 'POST') {
    console.log(`Unsupported method: ${req.method}`);
    return new Response('Method Not Allowed', { status: 405, headers: corsHeaders })
  }

  try {
    console.log('Creating Supabase client');
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '',
      { global: { headers: { Authorization: req.headers.get('Authorization')! } } }
    )
    console.log('Supabase client created');

    const authHeader = req.headers.get('Authorization')
    console.log(`Authorization header: ${authHeader}`);

    if (!authHeader) {
      console.log('No Authorization header found');
      return new Response('Unauthorized', { status: 401, headers: corsHeaders })
    }

    const token = authHeader.split(' ')[1]
    console.log('Authenticating user with token');
    const { data: { user }, error: authError } = await supabaseClient.auth.getUser(token)

    if (authError || !user) {
      console.error('Authentication error:', authError)
      return new Response('Unauthorized', { status: 401, headers: corsHeaders })
    }

    console.log(`User authenticated: ${user.id}`);
    const userId = user.id

    console.log(`Attempting to delete user: ${userId}`);
    const { error: userDeleteError } = await supabaseClient.auth.admin.deleteUser(userId);

    if (userDeleteError) {
      console.error('Supabase user deletion error:', userDeleteError.message);
      return new Response(JSON.stringify({ error: userDeleteError.message }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500,
      });
    }

    console.log('User deleted successfully');
    return new Response(JSON.stringify({ message: 'Account and all related data deleted successfully' }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 200,
    });

  } catch (error) {
    console.error('An unexpected error occurred:', error.message);
    return new Response(JSON.stringify({ error: error.message }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 500,
    });
  }
})