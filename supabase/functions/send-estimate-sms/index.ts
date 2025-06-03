
import { serve } from 'https://deno.land/std@0.190.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.24.0'

import { validateRequest, validatePhoneNumber } from './validation.ts'
import { fetchEstimateData } from './estimate.ts'
import { generatePortalLink } from './portal.ts'
import { formatPhoneNumbers, createSMSMessage } from './messaging.ts'
import { sendSMSViaTelnyx } from './telnyx.ts'
import { logCommunication } from './logging.ts'
import type { SMSRequest } from './types.ts'

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
      throw new Error('No authorization header provided');
    }

    // Use service role client for database access
    const supabaseAdmin = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    // Get the current user
    const token = authHeader.replace('Bearer ', '');
    const { data: userData, error: userError } = await supabaseAdmin.auth.getUser(token);
    if (userError || !userData.user) {
      throw new Error('Failed to authenticate user');
    }

    const requestBody = await req.json()
    const { estimateId, recipientPhone, fromNumber, message } = validateRequest(requestBody)

    console.log('SMS Request:', { estimateId, recipientPhone, fromNumber });

    // Verify the fromNumber belongs to the authenticated user
    await validatePhoneNumber(fromNumber, userData.user.id, supabaseAdmin)

    // Get estimate details with job and client information
    const estimate = await fetchEstimateData(estimateId, supabaseAdmin)
    const client = estimate.jobs?.clients;
    const job = estimate.jobs;

    // Get Telnyx API key
    const telnyxApiKey = Deno.env.get('TELNYX_API_KEY');
    if (!telnyxApiKey) {
      throw new Error('Telnyx API key not configured');
    }

    // Clean and format phone numbers
    const { formattedFromPhone, formattedToPhone } = formatPhoneNumbers(fromNumber, recipientPhone)

    // Generate client portal login token and create portal link
    const portalLink = await generatePortalLink(client?.email || '', job?.id || '', supabaseAdmin)

    // Create SMS message with portal link
    const smsMessage = createSMSMessage(estimate, portalLink, message)

    // Send SMS via Telnyx
    const result = await sendSMSViaTelnyx(formattedFromPhone, formattedToPhone, smsMessage, telnyxApiKey)

    // Log SMS communication with portal link info
    await logCommunication(
      estimateId,
      recipientPhone,
      smsMessage,
      estimate,
      portalLink,
      result.data?.id || '',
      supabaseAdmin
    )

    return new Response(
      JSON.stringify({ 
        success: true, 
        message: 'SMS sent successfully',
        messageId: result.data?.id,
        portalLinkIncluded: !!portalLink
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      }
    )
  } catch (error) {
    console.error('Error sending SMS:', error);
    return new Response(
      JSON.stringify({ 
        success: false, 
        error: error.message 
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500,
      }
    )
  }
})
