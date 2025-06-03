
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
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      console.error('send-estimate-sms - No authorization header provided');
      throw new Error('No authorization header provided');
    }

    const supabaseAdmin = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    const token = authHeader.replace('Bearer ', '');
    const { data: userData, error: userError } = await supabaseAdmin.auth.getUser(token);
    if (userError || !userData.user) {
      console.error('send-estimate-sms - Error getting user:', userError);
      throw new Error('Failed to authenticate user');
    }

    const {
      estimateId,
      recipientPhone,
      customMessage
    } = await req.json()

    console.log('send-estimate-sms - Request details:', { estimateId, recipientPhone })

    if (!estimateId || !recipientPhone) {
      throw new Error('Estimate ID and phone number are required')
    }

    // Get estimate details
    const { data: estimate, error: estimateError } = await supabaseAdmin
      .from('estimates')
      .select(`
        *,
        jobs:job_id (
          *,
          clients:client_id (*)
        )
      `)
      .eq('id', estimateId)
      .single()

    if (estimateError || !estimate) {
      console.error('send-estimate-sms - Estimate lookup error:', estimateError)
      throw new Error(`Estimate not found: ${estimateError?.message || 'Unknown error'}`)
    }

    console.log('send-estimate-sms - Found estimate:', estimate.estimate_number)

    // Get company settings
    const { data: companySettings, error: settingsError } = await supabaseAdmin
      .from('company_settings')
      .select('*')
      .eq('user_id', userData.user.id)
      .maybeSingle()

    if (settingsError) {
      console.error('send-estimate-sms - Error fetching company settings:', settingsError)
    }

    const client = estimate.jobs?.clients
    const job = estimate.jobs
    const companyName = companySettings?.company_name?.trim() || 'Our Company'

    // Clean and validate phone number
    const cleanPhone = recipientPhone.replace(/\D/g, '')
    if (cleanPhone.length < 10) {
      throw new Error('Valid phone number is required')
    }

    // Format phone number for Telnyx
    const formattedPhone = cleanPhone.length === 10 ? `+1${cleanPhone}` : `+${cleanPhone}`

    // Check Telnyx configuration
    const telnyxApiKey = Deno.env.get('TELNYX_API_KEY')
    if (!telnyxApiKey) {
      throw new Error('Telnyx API key not configured. Please configure TELNYX_API_KEY in Supabase secrets.')
    }

    // Get company phone number from settings
    const fromPhone = companySettings?.company_phone?.replace(/\D/g, '') || null
    
    if (!fromPhone) {
      throw new Error('Company phone number not configured in settings')
    }

    const formattedFromPhone = fromPhone.length === 10 ? `+1${fromPhone}` : `+${fromPhone}`

    // Generate client portal login token
    let portalLoginLink = '';
    if (client?.email) {
      try {
        console.log('send-estimate-sms - Generating portal login token for:', client.email);
        
        const { data: tokenData, error: tokenError } = await supabaseAdmin.rpc('generate_client_login_token', {
          p_email: client.email
        });
        
        if (!tokenError && tokenData) {
          const currentDomain = req.headers.get('origin') || 'https://your-app.vercel.app';
          portalLoginLink = `${currentDomain}/portal/login?token=${tokenData}`;
          console.log('send-estimate-sms - Portal login link created');
        } else {
          console.error('send-estimate-sms - Failed to generate portal token:', tokenError);
        }
      } catch (error) {
        console.error('send-estimate-sms - Error generating portal token:', error);
      }
    }

    // Create SMS message
    const clientName = client?.name || 'Customer';
    const estimateTotal = estimate.total?.toFixed(2) || '0.00';
    
    let smsMessage;
    if (customMessage) {
      smsMessage = customMessage;
    } else {
      smsMessage = `Hi ${clientName}! Your estimate #${estimate.estimate_number} from ${companyName} is ready. Total: $${estimateTotal}.`;
      
      if (portalLoginLink) {
        smsMessage += ` View it here: ${portalLoginLink}`;
      } else {
        smsMessage += ' Please contact us if you have any questions.';
      }
    }

    console.log('send-estimate-sms - Sending SMS from:', formattedFromPhone, 'to:', formattedPhone);

    const response = await fetch('https://api.telnyx.com/v2/messages', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${telnyxApiKey}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        from: formattedFromPhone,
        to: formattedPhone,
        text: smsMessage
      })
    })

    const result = await response.json()
    
    if (!response.ok) {
      console.error('send-estimate-sms - Telnyx API error:', result)
      throw new Error(result.errors?.[0]?.detail || 'Failed to send SMS via Telnyx')
    }

    console.log('send-estimate-sms - SMS sent successfully via Telnyx:', result)

    // Log SMS communication
    try {
      await supabaseAdmin
        .from('estimate_communications')
        .insert({
          estimate_id: estimateId,
          communication_type: 'sms',
          recipient: recipientPhone,
          content: smsMessage,
          status: 'sent',
          provider_message_id: result.data?.id,
          estimate_number: estimate.estimate_number,
          client_name: client?.name,
          client_email: client?.email,
          client_phone: client?.phone,
          sent_at: new Date().toISOString()
        })
    } catch (logError) {
      console.error('send-estimate-sms - Failed to log SMS communication:', logError)
    }

    return new Response(
      JSON.stringify({ 
        success: true, 
        message: 'Estimate SMS sent successfully',
        messageId: result.data?.id
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      }
    )
  } catch (error) {
    console.error('send-estimate-sms - Error sending estimate SMS:', error)
    return new Response(
      JSON.stringify({ success: false, error: error.message }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500,
      }
    )
  }
})
