
import { serve } from 'https://deno.land/std@0.177.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.24.0'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

interface SMSRequest {
  recipientPhone: string;
  message: string;
  client_id?: string;
  job_id?: string;
  estimateId?: string;
  invoiceId?: string;
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    console.log('📱 SMS request received');
    
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      throw new Error('No authorization header provided');
    }

    const supabaseAdmin = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    const token = authHeader.replace('Bearer ', '');
    const { data: userData, error: userError } = await supabaseAdmin.auth.getUser(token);
    if (userError || !userData.user) {
      throw new Error('Failed to authenticate user');
    }

    const requestBody: SMSRequest = await req.json();
    console.log('SMS request body:', requestBody);
    
    const { recipientPhone, message, client_id, estimateId, invoiceId } = requestBody;

    if (!recipientPhone || !message) {
      throw new Error('Missing required fields: recipientPhone and message');
    }

    // Get active phone number for this user
    const { data: phoneNumbers, error: phoneError } = await supabaseAdmin
      .from('telnyx_phone_numbers')
      .select('*')
      .eq('user_id', userData.user.id)
      .eq('status', 'active')
      .limit(1);

    if (phoneError || !phoneNumbers || phoneNumbers.length === 0) {
      throw new Error('No active phone number found for user');
    }

    const fromPhone = phoneNumbers[0].phone_number;
    console.log('Using phone number:', fromPhone);

    // Generate portal link if we have estimate or invoice data
    let finalMessage = message;
    if ((estimateId || invoiceId) && client_id) {
      try {
        console.log('Generating portal link for client:', client_id);
        
        const documentType = estimateId ? 'estimate' : 'invoice';
        const documentId = estimateId || invoiceId;
        
        const { data: tokenData, error: tokenError } = await supabaseAdmin.rpc('generate_client_portal_access', {
          p_client_id: client_id,
          p_document_type: documentType,
          p_document_id: documentId,
          p_hours_valid: 72
        });

        if (!tokenError && tokenData) {
          const portalLink = `https://hub.fixlify.app/client-portal?token=${tokenData}`;
          finalMessage = `${message} View details: ${portalLink}`;
          console.log('Portal link added to SMS message');
        } else {
          console.error('Failed to generate portal token:', tokenError);
        }
      } catch (error) {
        console.warn('Failed to generate portal link for SMS:', error);
      }
    }

    // Format phone numbers
    const cleanFromPhone = fromPhone.replace(/\D/g, '');
    const cleanToPhone = recipientPhone.replace(/\D/g, '');
    const formattedFromPhone = cleanFromPhone.length === 10 ? `+1${cleanFromPhone}` : `+${cleanFromPhone}`;
    const formattedToPhone = cleanToPhone.length === 10 ? `+1${cleanToPhone}` : `+${cleanToPhone}`;

    console.log('Sending SMS from:', formattedFromPhone, 'to:', formattedToPhone);

    const telnyxApiKey = Deno.env.get('TELNYX_API_KEY');
    if (!telnyxApiKey) {
      throw new Error('Telnyx API key not configured');
    }

    // Send SMS via Telnyx
    const telnyxResponse = await fetch('https://api.telnyx.com/v2/messages', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${telnyxApiKey}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        from: formattedFromPhone,
        to: formattedToPhone,
        text: finalMessage
      })
    });

    const telnyxResult = await telnyxResponse.json();

    if (!telnyxResponse.ok) {
      console.error('Telnyx API error:', telnyxResult);
      throw new Error(telnyxResult.errors?.[0]?.detail || 'Failed to send SMS via Telnyx');
    }

    console.log('SMS sent successfully:', telnyxResult);

    // Log SMS communication if it's for an estimate or invoice
    if (estimateId || invoiceId) {
      try {
        const tableName = estimateId ? 'estimate_communications' : 'invoice_communications';
        const idField = estimateId ? 'estimate_id' : 'invoice_id';
        const documentId = estimateId || invoiceId;
        
        await supabaseAdmin
          .from(tableName)
          .insert({
            [idField]: documentId,
            communication_type: 'sms',
            recipient: recipientPhone,
            content: finalMessage,
            status: 'sent',
            provider_message_id: telnyxResult.data?.id
          });
      } catch (logError) {
        console.warn('Failed to log SMS communication:', logError);
      }
    }

    return new Response(
      JSON.stringify({ 
        success: true, 
        message: 'SMS sent successfully',
        messageId: telnyxResult.data?.id,
        portalLinkIncluded: finalMessage !== message
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
