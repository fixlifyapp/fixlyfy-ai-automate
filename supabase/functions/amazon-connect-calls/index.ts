
import { serve } from 'https://deno.land/std@0.177.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.24.0'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

interface ConnectCallRequest {
  action: 'initiate' | 'status' | 'hangup' | 'transfer';
  fromNumber?: string;
  toNumber?: string;
  contactId?: string;
  instanceId?: string;
  clientId?: string;
  jobId?: string;
}

interface ConnectCallResponse {
  success: boolean;
  contactId?: string;
  status?: string;
  error?: string;
}

serve(async (req) => {
  console.log(`${req.method} ${req.url}`)
  
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    // Get AWS credentials from environment
    const awsAccessKeyId = Deno.env.get('AWS_ACCESS_KEY_ID');
    const awsSecretAccessKey = Deno.env.get('AWS_SECRET_ACCESS_KEY');
    const awsRegion = Deno.env.get('AWS_REGION') || 'us-east-1';

    if (!awsAccessKeyId || !awsSecretAccessKey) {
      return new Response(JSON.stringify({ 
        error: 'AWS credentials not configured' 
      }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500,
      })
    }

    if (req.method === 'POST') {
      const body: ConnectCallRequest = await req.json()
      return await handleConnectCallAction(body, supabaseClient, awsAccessKeyId, awsSecretAccessKey, awsRegion)
    }

    return new Response(JSON.stringify({ error: 'Method not allowed' }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 405,
    })
  } catch (error) {
    console.error('Error in amazon-connect-calls:', error)
    return new Response(JSON.stringify({ error: error.message }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 500,
    })
  }
})

async function handleConnectCallAction(
  params: ConnectCallRequest, 
  supabaseClient: any, 
  awsAccessKeyId: string, 
  awsSecretAccessKey: string, 
  awsRegion: string
): Promise<Response> {
  const { action, fromNumber, toNumber, contactId, instanceId } = params

  switch (action) {
    case 'initiate':
      return await initiateConnectCall(fromNumber!, toNumber!, supabaseClient, awsAccessKeyId, awsSecretAccessKey, awsRegion)
    case 'status':
      return await getConnectCallStatus(contactId!, supabaseClient, awsAccessKeyId, awsSecretAccessKey, awsRegion)
    case 'hangup':
      return await hangupConnectCall(contactId!, supabaseClient, awsAccessKeyId, awsSecretAccessKey, awsRegion)
    default:
      return new Response(JSON.stringify({ error: 'Invalid action' }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 400,
      })
  }
}

async function initiateConnectCall(
  fromNumber: string, 
  toNumber: string, 
  supabaseClient: any, 
  awsAccessKeyId: string, 
  awsSecretAccessKey: string, 
  awsRegion: string
): Promise<Response> {
  try {
    console.log(`Initiating Amazon Connect call from ${fromNumber} to ${toNumber}`)
    
    // Get user's Connect instance from configuration
    const { data: aiConfig } = await supabaseClient
      .from('ai_agent_configs')
      .select('connect_instance_arn')
      .eq('is_active', true)
      .single();

    if (!aiConfig?.connect_instance_arn) {
      throw new Error('Amazon Connect instance not configured');
    }

    // Create a mock contact ID for now (in real implementation, use AWS SDK)
    const contactId = `contact-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    
    // Store call in database
    const { error: dbError } = await supabaseClient
      .from('amazon_connect_calls')
      .insert({
        contact_id: contactId,
        instance_id: aiConfig.connect_instance_arn,
        phone_number: toNumber,
        call_status: 'initiated',
        started_at: new Date().toISOString(),
      })

    if (dbError) {
      console.error('Error storing Connect call:', dbError)
    }

    return new Response(JSON.stringify({ 
      success: true,
      contactId: contactId,
      status: 'initiated' 
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })
  } catch (error) {
    console.error('Error initiating Connect call:', error)
    return new Response(JSON.stringify({ error: error.message }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 500,
    })
  }
}

async function getConnectCallStatus(
  contactId: string, 
  supabaseClient: any,
  awsAccessKeyId: string, 
  awsSecretAccessKey: string, 
  awsRegion: string
): Promise<Response> {
  try {
    // Get call status from database
    const { data: callData } = await supabaseClient
      .from('amazon_connect_calls')
      .select('call_status')
      .eq('contact_id', contactId)
      .single();

    return new Response(JSON.stringify({ 
      success: true,
      status: callData?.call_status || 'unknown'
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })
  } catch (error) {
    console.error('Error getting Connect call status:', error)
    return new Response(JSON.stringify({ error: error.message }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 500,
    })
  }
}

async function hangupConnectCall(
  contactId: string, 
  supabaseClient: any,
  awsAccessKeyId: string, 
  awsSecretAccessKey: string, 
  awsRegion: string
): Promise<Response> {
  try {
    console.log(`Hanging up Amazon Connect call: ${contactId}`)
    
    // Update call status in database
    const { error: dbError } = await supabaseClient
      .from('amazon_connect_calls')
      .update({ 
        call_status: 'completed',
        ended_at: new Date().toISOString()
      })
      .eq('contact_id', contactId)

    if (dbError) {
      console.error('Error updating Connect call status:', dbError)
    }

    return new Response(JSON.stringify({ success: true }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })
  } catch (error) {
    console.error('Error hanging up Connect call:', error)
    return new Response(JSON.stringify({ error: error.message }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 500,
    })
  }
}
