import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  // CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    // Valideer dat de aanroeper is ingelogd
    const authHeader = req.headers.get('Authorization')
    if (!authHeader) {
      return new Response(JSON.stringify({ error: 'Niet geautoriseerd' }), {
        status: 401,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }

    // Supabase client met anon key (voor caller verificatie)
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!
    const supabaseAnonKey = Deno.env.get('SUPABASE_ANON_KEY')!
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!

    const supabaseUser = createClient(supabaseUrl, supabaseAnonKey, {
      global: { headers: { Authorization: authHeader } },
    })

    // Controleer of de aanroeper een manager of projectleider is
    const { data: { user: caller }, error: userError } = await supabaseUser.auth.getUser()
    if (userError || !caller) {
      return new Response(JSON.stringify({ error: 'Niet geautoriseerd' }), {
        status: 401,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }

    const { data: callerProfile } = await supabaseUser
      .from('profiles')
      .select('role')
      .eq('id', caller.id)
      .single()

    if (!callerProfile || !['manager', 'projectleider'].includes(callerProfile.role)) {
      return new Response(
        JSON.stringify({ error: 'Alleen managers en projectleiders kunnen medewerkers uitnodigen' }),
        { status: 403, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // Parse request body
    const { action, ...payload } = await req.json()

    // Admin client met service_role key
    const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey)

    // === INVITE actie ===
    if (action === 'invite') {
      const { voornaam, tussenvoegsel, achternaam, email, role, avatar_id } = payload

      if (!voornaam || !achternaam || !email) {
        return new Response(
          JSON.stringify({ error: 'Voornaam, achternaam en email zijn verplicht' }),
          { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        )
      }

      // Nodig gebruiker uit via Supabase Auth
      const { data: inviteData, error: inviteError } = await supabaseAdmin.auth.admin.inviteUserByEmail(
        email,
        {
          data: { voornaam, tussenvoegsel, achternaam, avatar_id, role: role || 'projectlid' },
          redirectTo: 'https://digilabbnwv.github.io/bnwv_pmw_app/login',
        }
      )

      if (inviteError) {
        return new Response(
          JSON.stringify({ error: inviteError.message }),
          { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        )
      }

      // Maak het profiel aan
      const fullName = [voornaam, tussenvoegsel, achternaam].filter(Boolean).join(' ')
      const { error: profileError } = await supabaseAdmin
        .from('profiles')
        .upsert({
          id: inviteData.user.id,
          voornaam,
          tussenvoegsel: tussenvoegsel || null,
          achternaam,
          email,
          full_name: fullName,
          avatar_id: avatar_id || null,
          role: role || 'projectlid',
          invited_at: new Date().toISOString(),
        })

      if (profileError) {
        return new Response(
          JSON.stringify({ error: 'Profiel aanmaken mislukt: ' + profileError.message }),
          { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        )
      }

      return new Response(
        JSON.stringify({ success: true, user_id: inviteData.user.id }),
        { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // === DELETE actie ===
    if (action === 'delete') {
      const { user_id } = payload

      if (!user_id) {
        return new Response(
          JSON.stringify({ error: 'user_id is verplicht' }),
          { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        )
      }

      // Voorkom dat je jezelf verwijdert
      if (user_id === caller.id) {
        return new Response(
          JSON.stringify({ error: 'Je kunt jezelf niet verwijderen' }),
          { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        )
      }

      // Verwijder profiel (cascades naar project_members etc.)
      await supabaseAdmin.from('profiles').delete().eq('id', user_id)

      // Verwijder auth user
      const { error: deleteError } = await supabaseAdmin.auth.admin.deleteUser(user_id)
      if (deleteError) {
        return new Response(
          JSON.stringify({ error: 'Auth gebruiker verwijderen mislukt: ' + deleteError.message }),
          { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        )
      }

      return new Response(
        JSON.stringify({ success: true }),
        { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // === RESEND INVITE actie ===
    if (action === 'resend') {
      const { email } = payload

      if (!email) {
        return new Response(
          JSON.stringify({ error: 'Email is verplicht' }),
          { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        )
      }

      const { error: resendError } = await supabaseAdmin.auth.admin.inviteUserByEmail(email)

      if (resendError) {
        return new Response(
          JSON.stringify({ error: resendError.message }),
          { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        )
      }

      return new Response(
        JSON.stringify({ success: true }),
        { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    return new Response(
      JSON.stringify({ error: 'Onbekende actie. Gebruik: invite, delete, resend' }),
      { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  } catch (err) {
    return new Response(
      JSON.stringify({ error: err.message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }
})
