
import { serve } from 'https://deno.land/std@0.190.0/http/server.ts'
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
      Deno.env.get('SUPABASE_ANON_KEY') ?? ''
    )

    const { to, body, client_id, job_id } = await req.json()
    
    console.log('Sending SMS via Telnyx:', { to, body, client_id, job_id })

    // Validate inputs
    if (!to || !body) {
      throw new Error('Phone number and message body are required')
    }

    // Clean and validate phone number
    const cleanPhone = to.replace(/\D/g, '')
    if (cleanPhone.length < 10) {
      throw new Error('Valid phone number is required')
    }

    // Format phone number for Telnyx
    const formattedPhone = cleanPhone.length === 10 ? `+1${cleanPhone}` : `+${cleanPhone}`

    const telnyxApiKey = Deno.env.get('TELNYX_API_KEY')
    if (!telnyxApiKey) {
      throw new Error('TELNYX_API_KEY not configured')
    }

    // Get company settings for dynamic phone number
    const { data: companySettings } = await supabaseClient
      .from('company_settings')
      .select('company_phone')
      .limit(1)
      .maybeSingle()

    const fromPhone = companySettings?.company_phone?.replace(/\D/g, '') || null
    
    if (!fromPhone) {
      throw new Error('Company phone number not configured in settings')
    }

    const formattedFromPhone = fromPhone.length === 10 ? `+1${fromPhone}` : `+${fromPhone}`

    const response = await fetch('https://api.telnyx.com/v2/messages', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${telnyxApiKey}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        from: formattedFromPhone,
        to: formattedPhone,
        text: body
      })
    })

    const result = await response.json()
    
    if (!response.ok) {
      throw new Error(result.errors?.[0]?.detail || 'Failed to send SMS')
    }

    console.log('SMS sent successfully via Telnyx:', result)

    return new Response(
      JSON.stringify({ success: true, data: result }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      }
    )
  } catch (error) {
    console.error('Error sending SMS:', error)
    return new Response(
      JSON.stringify({ success: false, error: error.message }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500,
      }
    )
  }
})
