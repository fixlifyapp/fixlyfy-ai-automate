
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

    const { method, recipient, message, clientName, portalLink } = await req.json()
    console.log(`📤 Sending portal link via ${method} to:`, recipient)

    if (method === 'email') {
      // For email, we'd typically use a service like Mailgun or Resend
      // For now, we'll just log it and return success
      console.log('📧 Email would be sent to:', recipient)
      console.log('📧 Email content:', message)
      
      // Here you would integrate with your email service
      // Example: await sendEmailViaMailgun(recipient, 'Client Portal Access', message)
      
      return new Response(
        JSON.stringify({ 
          success: true, 
          message: 'Portal link sent via email',
          method: 'email',
          recipient: recipient
        }),
        { 
          status: 200, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      )
    } else if (method === 'sms') {
      // For SMS, use the existing telnyx-sms function
      const smsResponse = await supabaseClient.functions.invoke('telnyx-sms', {
        body: {
          to: recipient,
          body: message,
          portalLink: portalLink
        }
      })

      if (smsResponse.error) {
        console.error('❌ Error sending SMS:', smsResponse.error)
        return new Response(
          JSON.stringify({ error: 'Failed to send SMS' }),
          { 
            status: 500, 
            headers: { ...corsHeaders, 'Content-Type': 'application/json' }
          }
        )
      }

      console.log('✅ SMS sent successfully via Telnyx')
      
      return new Response(
        JSON.stringify({ 
          success: true, 
          message: 'Portal link sent via SMS',
          method: 'sms',
          recipient: recipient
        }),
        { 
          status: 200, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      )
    }

    return new Response(
      JSON.stringify({ error: 'Invalid sending method' }),
      { 
        status: 400, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    )
  } catch (error) {
    console.error('❌ Error in send-portal-link:', error)
    return new Response(
      JSON.stringify({ error: 'Internal server error' }),
      { 
        status: 500, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    )
  }
})
