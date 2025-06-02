
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.24.0'
import { getBusinessConfig } from '../telnyx-voice-webhook/utils/businessConfig.ts'

interface WebSocketMessage {
  type: string;
  audio?: string;
  text?: string;
  callSid?: string;
  from?: string;
  to?: string;
  [key: string]: any;
}

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

  console.log('=== WebSocket Connection Request ===');
  
  const { socket, response } = Deno.upgradeWebSocket(req);
  
  let openAISocket: WebSocket | null = null;
  let sessionConfigured = false;
  let callSid: string | null = null;
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
    console.log('=== Client WebSocket Connected ===');
    
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
        socket.send(JSON.stringify({ type: 'connection_established' }));
      };

      openAISocket.onmessage = async (event) => {
        try {
          const data = JSON.parse(event.data);
          console.log('OpenAI event:', data.type);

          // Configure session after connection
          if (data.type === 'session.created' && !sessionConfigured) {
            console.log('=== Configuring OpenAI Session ===');
            
            const systemPrompt = `You are ${businessConfig?.agent_name || 'AI Assistant'} for ${businessConfig?.company_name || 'the company'}, a ${businessConfig?.business_type || 'service'} business.

COMPANY INFORMATION:
- Company: ${businessConfig?.company_name || 'Service Company'}
- Business Type: ${businessConfig?.business_type || 'Service Provider'}
- Phone: ${businessConfig?.company_phone || '(555) 123-4567'}
${businessConfig?.company_address ? `- Address: ${businessConfig.company_address}, ${businessConfig.company_city}, ${businessConfig.company_state}` : ''}
${businessConfig?.service_zip_codes ? `- Service Areas: ${businessConfig.service_zip_codes}` : ''}

PRICING:
- Diagnostic service: $${businessConfig?.diagnostic_price || 75}
- Emergency surcharge: $${businessConfig?.emergency_surcharge || 50} (for after-hours calls)

SERVICES OFFERED:
${businessConfig?.service_types?.join(', ') || 'HVAC, Plumbing, Electrical, General Repair'}

INSTRUCTIONS:
1. Be helpful, professional, and conversational
2. If they need service, offer to schedule an appointment
3. Ask for their name, phone number, and what service they need
4. Keep responses concise and natural for phone conversation
5. If they want to schedule, say you'll help them book the appointment
6. Be empathetic to their needs

${businessConfig?.custom_prompt_additions || ''}

You represent ${businessConfig?.company_name || 'the company'} and should always mention the company name when introducing yourself.`;

            const sessionUpdate = {
              type: 'session.update',
              session: {
                modalities: ['text', 'audio'],
                instructions: systemPrompt,
                voice: 'alloy',
                input_audio_format: 'pcm16',
                output_audio_format: 'pcm16',
                input_audio_transcription: {
                  model: 'whisper-1'
                },
                turn_detection: {
                  type: 'server_vad',
                  threshold: 0.5,
                  prefix_padding_ms: 300,
                  silence_duration_ms: 1000
                },
                tools: [
                  {
                    type: 'function',
                    name: 'schedule_appointment',
                    description: 'Schedule an appointment for the customer',
                    parameters: {
                      type: 'object',
                      properties: {
                        customer_name: { type: 'string' },
                        customer_phone: { type: 'string' },
                        service_type: { type: 'string' },
                        preferred_date: { type: 'string' },
                        description: { type: 'string' }
                      },
                      required: ['customer_name', 'customer_phone', 'service_type']
                    }
                  }
                ],
                tool_choice: 'auto',
                temperature: 0.7,
                max_response_output_tokens: 'inf'
              }
            };

            openAISocket!.send(JSON.stringify(sessionUpdate));
            sessionConfigured = true;
            console.log('Session configured with business data');
          }

          // Handle function calls
          if (data.type === 'response.function_call_arguments.done') {
            console.log('=== Function Call ===', data);
            if (data.name === 'schedule_appointment') {
              try {
                const args = JSON.parse(data.arguments);
                console.log('Scheduling appointment:', args);
                
                // Log appointment data to database
                if (callSid) {
                  await supabaseClient
                    .from('telnyx_calls')
                    .update({
                      appointment_scheduled: true,
                      appointment_data: {
                        ...args,
                        company_name: businessConfig?.company_name,
                        scheduled_via: 'realtime_api'
                      }
                    })
                    .eq('call_control_id', callSid);
                }

                // Send function result back to OpenAI
                const functionResult = {
                  type: 'conversation.item.create',
                  item: {
                    type: 'function_call_output',
                    call_id: data.call_id,
                    output: JSON.stringify({
                      success: true,
                      message: 'Appointment request received and will be processed'
                    })
                  }
                };
                openAISocket!.send(JSON.stringify(functionResult));
                openAISocket!.send(JSON.stringify({ type: 'response.create' }));
              } catch (error) {
                console.error('Error processing appointment:', error);
              }
            }
          }

          // Forward relevant events to client
          if (data.type.startsWith('response.audio') || 
              data.type.startsWith('conversation.item') ||
              data.type === 'response.done' ||
              data.type === 'error') {
            socket.send(JSON.stringify(data));
          }

        } catch (error) {
          console.error('Error processing OpenAI message:', error);
        }
      };

      openAISocket.onerror = (error) => {
        console.error('OpenAI WebSocket error:', error);
        socket.send(JSON.stringify({ type: 'error', message: 'OpenAI connection error' }));
      };

      openAISocket.onclose = () => {
        console.log('OpenAI WebSocket closed');
        socket.close();
      };

    } catch (error) {
      console.error('Error connecting to OpenAI:', error);
      socket.send(JSON.stringify({ type: 'error', message: 'Failed to connect to OpenAI' }));
    }
  };

  socket.onmessage = async (event) => {
    try {
      const message: WebSocketMessage = JSON.parse(event.data);
      console.log('Client message type:', message.type);

      // Handle call initialization
      if (message.type === 'call_started') {
        callSid = message.callSid;
        console.log('Call started:', callSid);
        
        // Log call to database
        if (callSid && message.from && message.to) {
          try {
            await supabaseClient
              .from('telnyx_calls')
              .insert({
                call_control_id: callSid,
                call_session_id: callSid,
                phone_number: message.from,
                to_number: message.to,
                call_status: 'connected',
                direction: 'incoming',
                started_at: new Date().toISOString(),
                appointment_scheduled: false
              });
          } catch (error) {
            console.error('Error logging call:', error);
          }
        }
      }

      // Forward audio and other relevant messages to OpenAI
      if (openAISocket && openAISocket.readyState === WebSocket.OPEN) {
        if (message.type === 'input_audio_buffer.append' ||
            message.type === 'conversation.item.create' ||
            message.type === 'response.create') {
          openAISocket.send(JSON.stringify(message));
        }
      }

    } catch (error) {
      console.error('Error processing client message:', error);
    }
  };

  socket.onclose = () => {
    console.log('=== Client WebSocket Closed ===');
    if (openAISocket) {
      openAISocket.close();
    }
    
    // Update call status
    if (callSid) {
      supabaseClient
        .from('telnyx_calls')
        .update({
          call_status: 'completed',
          ended_at: new Date().toISOString()
        })
        .eq('call_control_id', callSid)
        .then(() => console.log('Call status updated'))
        .catch(error => console.error('Error updating call status:', error));
    }
  };

  socket.onerror = (error) => {
    console.error('Client WebSocket error:', error);
  };

  return response;
});
