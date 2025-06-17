
import { serve } from 'https://deno.land/std@0.177.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.24.0'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    const { accessId } = await req.json()
    const clientIP = req.headers.get('x-forwarded-for') || req.headers.get('x-real-ip') || 'unknown'
    const userAgent = req.headers.get('user-agent') || 'unknown'

    console.log('🔐 Validating portal access for client ID:', accessId)

    // For portal.fixlify.app - treat accessId as client_id directly (no auth needed)
    if (accessId && accessId.startsWith('C-')) {
      // Get client data directly
      const { data: client, error: clientError } = await supabaseClient
        .from('clients')
        .select('*')
        .eq('id', accessId)
        .single()

      if (clientError || !client) {
        console.log('❌ Client not found:', accessId)
        return new Response(
          JSON.stringify({ error: 'Client not found' }),
          { 
            status: 404, 
            headers: { ...corsHeaders, 'Content-Type': 'application/json' }
          }
        )
      }

      console.log('✅ Valid portal access for client:', client.name)

      return new Response(
        JSON.stringify({ 
          valid: true,
          client: {
            id: client.id,
            name: client.name,
            email: client.email,
            phone: client.phone,
            address: client.address,
            city: client.city,
            state: client.state,
            zip: client.zip
          },
          permissions: {
            view_estimates: true,
            view_invoices: true,
            make_payments: false
          }
        }),
        { 
          status: 200, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      )
    }

    // If not a client ID format, return error
    console.log('❌ Invalid access ID format')
    return new Response(
      JSON.stringify({ error: 'Invalid access format' }),
      { 
        status: 401, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    )
  } catch (error) {
    console.error('❌ Error in validate-portal-access:', error)
    return new Response(
      JSON.stringify({ error: 'Internal server error' }),
      { 
        status: 500, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    )
  }
})
