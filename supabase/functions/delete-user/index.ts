import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.53.0'
import { serve } from 'https://deno.land/std@0.177.0/http/server.ts'

serve(async (req) => {
  if (req.method !== 'POST') {
    return new Response('Method Not Allowed', { status: 405 })
  }

  const supabaseClient = createClient(
    Deno.env.get('SUPABASE_URL') ?? '',
    Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
  )

  try {
    const authHeader = req.headers.get('Authorization')
    if (!authHeader) {
      return new Response('Unauthorized', { status: 401 })
    }
    const token = authHeader.split(' ')[1]
    const { data: { user }, error: authError } = await supabaseClient.auth.getUser(token)

    if (authError || !user) {
      console.error('Auth error:', authError)
      return new Response('Unauthorized', { status: 401 })
    }

    const userId = user.id

    // Delete the user from auth.users.
    // Due to ON DELETE CASCADE rules, all related data in public schema tables
    // (profiles, folders, routines, exercises, sets, workout_sessions, session_exercises, session_sets, measurements)
    // will be automatically deleted by the database.
    const { error: userDeleteError } = await supabaseClient.auth.admin.deleteUser(userId);

    if (userDeleteError) {
      console.error('Supabase user deletion error:', userDeleteError);
      return new Response(JSON.stringify({ error: userDeleteError.message }), {
        headers: { 'Content-Type': 'application/json' },
        status: 500,
      });
    }

    return new Response(JSON.stringify({ message: 'Account and all related data deleted successfully' }), {
      headers: { 'Content-Type': 'application/json' },
      status: 200,
    });

  } catch (error) {
    console.error('Function error:', error);
    return new Response(JSON.stringify({ error: error.message }), {
      headers: { 'Content-Type': 'application/json' },
      status: 500,
    });
  }
})