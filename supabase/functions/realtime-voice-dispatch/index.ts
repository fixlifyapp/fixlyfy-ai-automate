
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.24.0'
import { getBusinessConfig } from './utils/businessConfig.ts'
import { encodeAudioForOpenAI } from './utils/audioConversion.ts'
import { createOpenAISession } from './utils/openaiSession.ts'
import { handleOpenAIMessage, handleTelnyxMessage, TelnyxStreamMessage } from './utils/messageHandlers.ts'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  const { headers } = req;
  const upgradeHeader = headers.get("upgrade") || "";

  if (upgradeHeader.toLowerCase() !== "websocket") {
    return new Response("Expected WebSocket connection", { status: 400 });
  }

  console.log('=== Telnyx Audio Stream WebSocket Connection ===');
  
  const { socket, response } = Deno.upgradeWebSocket(req);
  
  let openAISocket: WebSocket | null = null;
  let sessionConfigured = false;
  let callControlId: string | null = null;
  let businessConfig: any = null;

  const supabaseClient = createClient(
    Deno.env.get('SUPABASE_URL') ?? '',
    Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
  );

  const openaiApiKey = Deno.env.get('OPENAI_API_KEY');
  if (!openaiApiKey) {
    console.error('OPENAI_API_KEY not configured');
    socket.close(1000, 'OpenAI API key not configured');
    return response;
  }

  // Initialize business config
  try {
    businessConfig = await getBusinessConfig(supabaseClient);
    console.log('Business config loaded for realtime session');
  } catch (error) {
    console.error('Failed to load business config:', error);
  }

  socket.onopen = async () => {
    console.log('=== Telnyx Audio Stream Connected ===');
    
    try {
      // Connect to OpenAI Realtime API
      openAISocket = new WebSocket(
        `wss://api.openai.com/v1/realtime?model=gpt-4o-realtime-preview-2024-12-17`,
        [],
        {
          headers: {
            'Authorization': `Bearer ${openaiApiKey}`,
            'OpenAI-Beta': 'realtime=v1'
          }
        }
      );

      openAISocket.onopen = () => {
        console.log('=== Connected to OpenAI Realtime API ===');
      };

      openAISocket.onmessage = async (event) => {
        try {
          const data = JSON.parse(event.data);
          
          // Configure session after connection
          if (data.type === 'session.created' && !sessionConfigured) {
            console.log('=== Configuring OpenAI Session ===');
            createOpenAISession(businessConfig, openAISocket!);
            sessionConfigured = true;
          }

          await handleOpenAIMessage(data, socket, callControlId, supabaseClient, businessConfig, openAISocket!);
        } catch (error) {
          console.error('Error processing OpenAI message:', error);
        }
      };

      openAISocket.onerror = (error) => {
        console.error('OpenAI WebSocket error:', error);
      };

      openAISocket.onclose = () => {
        console.log('OpenAI WebSocket closed');
        socket.close();
      };

    } catch (error) {
      console.error('Error connecting to OpenAI:', error);
    }
  };

  socket.onmessage = async (event) => {
    try {
      const message: TelnyxStreamMessage = JSON.parse(event.data);
      await handleTelnyxMessage(
        message, 
        callControlId, 
        (id: string) => { callControlId = id; }, 
        supabaseClient, 
        openAISocket, 
        encodeAudioForOpenAI
      );
    } catch (error) {
      console.error('Error processing Telnyx message:', error);
    }
  };

  socket.onclose = () => {
    console.log('=== Telnyx Audio Stream Closed ===');
    if (openAISocket) {
      openAISocket.close();
    }
    
    // Update call status
    if (callControlId) {
      supabaseClient
        .from('telnyx_calls')
        .update({
          call_status: 'completed',
          ended_at: new Date().toISOString(),
          streaming_active: false
        })
        .eq('call_control_id', callControlId)
        .then(() => console.log('Call status updated'))
        .catch(error => console.error('Error updating call status:', error));
    }
  };

  socket.onerror = (error) => {
    console.error('Telnyx Audio Stream error:', error);
  };

  return response;
});
