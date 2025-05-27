
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
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      return new Response(JSON.stringify({ error: 'Missing authorization' }), {
        status: 401,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    const { action, fromNumber, toNumber, contactId, instanceId, clientId, jobId }: ConnectCallRequest = await req.json();

    // Get AWS credentials
    const awsAccessKeyId = Deno.env.get('AWS_ACCESS_KEY_ID');
    const awsSecretAccessKey = Deno.env.get('AWS_SECRET_ACCESS_KEY');
    const awsRegion = Deno.env.get('AWS_REGION') || 'us-east-1';
    const connectInstanceId = Deno.env.get('AMAZON_CONNECT_INSTANCE_ID');

    if (!awsAccessKeyId || !awsSecretAccessKey || !connectInstanceId) {
      return new Response(JSON.stringify({ 
        success: false, 
        error: 'Amazon Connect credentials not configured' 
      }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    let response: ConnectCallResponse = { success: false };

    switch (action) {
      case 'initiate':
        if (!fromNumber || !toNumber) {
          return new Response(JSON.stringify({ 
            success: false, 
            error: 'Missing required fields: fromNumber, toNumber' 
          }), {
            status: 400,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' }
          });
        }

        // Store call record in database
        const { data: callRecord, error: dbError } = await supabaseClient
          .from('amazon_connect_calls')
          .insert({
            contact_id: crypto.randomUUID(),
            instance_id: connectInstanceId,
            phone_number: toNumber,
            client_id: clientId,
            call_status: 'initiated',
            started_at: new Date().toISOString(),
          })
          .select()
          .single();

        if (dbError) {
          console.error('Error storing call record:', dbError);
        }

        // In a real implementation, this would make an actual Amazon Connect API call
        // For now, we'll simulate the call initiation
        response = {
          success: true,
          contactId: callRecord?.contact_id || crypto.randomUUID(),
          status: 'initiated'
        };
        break;

      case 'hangup':
        if (!contactId) {
          return new Response(JSON.stringify({ 
            success: false, 
            error: 'Missing contactId' 
          }), {
            status: 400,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' }
          });
        }

        // Update call status
        await supabaseClient
          .from('amazon_connect_calls')
          .update({ 
            call_status: 'completed',
            ended_at: new Date().toISOString()
          })
          .eq('contact_id', contactId);

        response = { success: true, status: 'completed' };
        break;

      default:
        return new Response(JSON.stringify({ 
          success: false, 
          error: 'Invalid action' 
        }), {
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        });
    }

    return new Response(JSON.stringify(response), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });

  } catch (error) {
    console.error('Error in amazon-connect-calls function:', error);
    return new Response(JSON.stringify({ 
      success: false, 
      error: error.message 
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
  }
});
