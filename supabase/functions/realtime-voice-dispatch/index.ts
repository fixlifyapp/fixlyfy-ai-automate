
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.24.0'
import { getBusinessConfig } from '../telnyx-voice-webhook/utils/businessConfig.ts'

interface TelnyxStreamMessage {
  event: string;
  sequence_number: number;
  media?: {
    track: string;
    chunk: number;
    timestamp: string;
    payload: string;
  };
  start?: {
    streamSid: string;
    accountSid: string;
    callSid: string;
    tracks: string[];
    mediaFormat: {
      encoding: string;
      sampleRate: number;
      channels: number;
    };
  };
  stop?: {
    streamSid: string;
    accountSid: string;
    callSid: string;
  };
}

interface OpenAIRealtimeMessage {
  type: string;
  audio?: string;
  text?: string;
  [key: string]: any;
}

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// Convert Telnyx audio (mulaw) to PCM16 for OpenAI
const convertMulawToPCM16 = (mulawData: Uint8Array): Uint8Array => {
  const mulawToLinear = [
    -32124, -31100, -30076, -29052, -28028, -27004, -25980, -24956,
    -23932, -22908, -21884, -20860, -19836, -18812, -17788, -16764,
    -15996, -15484, -14972, -14460, -13948, -13436, -12924, -12412,
    -11900, -11388, -10876, -10364, -9852, -9340, -8828, -8316,
    -7932, -7676, -7420, -7164, -6908, -6652, -6396, -6140,
    -5884, -5628, -5372, -5116, -4860, -4604, -4348, -4092,
    -3900, -3772, -3644, -3516, -3388, -3260, -3132, -3004,
    -2876, -2748, -2620, -2492, -2364, -2236, -2108, -1980,
    -1884, -1820, -1756, -1692, -1628, -1564, -1500, -1436,
    -1372, -1308, -1244, -1180, -1116, -1052, -988, -924,
    -876, -844, -812, -780, -748, -716, -684, -652,
    -620, -588, -556, -524, -492, -460, -428, -396,
    -372, -356, -340, -324, -308, -292, -276, -260,
    -244, -228, -212, -196, -180, -164, -148, -132,
    -120, -112, -104, -96, -88, -80, -72, -64,
    -56, -48, -40, -32, -24, -16, -8, 0,
    32124, 31100, 30076, 29052, 28028, 27004, 25980, 24956,
    23932, 22908, 21884, 20860, 19836, 18812, 17788, 16764,
    15996, 15484, 14972, 14460, 13948, 13436, 12924, 12412,
    11900, 11388, 10876, 10364, 9852, 9340, 8828, 8316,
    7932, 7676, 7420, 7164, 6908, 6652, 6396, 6140,
    5884, 5628, 5372, 5116, 4860, 4604, 4348, 4092,
    3900, 3772, 3644, 3516, 3388, 3260, 3132, 3004,
    2876, 2748, 2620, 2492, 2364, 2236, 2108, 1980,
    1884, 1820, 1756, 1692, 1628, 1564, 1500, 1436,
    1372, 1308, 1244, 1180, 1116, 1052, 988, 924,
    876, 844, 812, 780, 748, 716, 684, 652,
    620, 588, 556, 524, 492, 460, 428, 396,
    372, 356, 340, 324, 308, 292, 276, 260,
    244, 228, 212, 196, 180, 164, 148, 132,
    120, 112, 104, 96, 88, 80, 72, 64,
    56, 48, 40, 32, 24, 16, 8, 0
  ];

  const pcm16Data = new Int16Array(mulawData.length);
  for (let i = 0; i < mulawData.length; i++) {
    pcm16Data[i] = mulawToLinear[mulawData[i]];
  }
  
  return new Uint8Array(pcm16Data.buffer);
};

// Convert base64 audio to proper encoding
const encodeAudioForOpenAI = (base64Audio: string): string => {
  try {
    // Decode base64 to get mulaw data
    const binaryString = atob(base64Audio);
    const mulawData = new Uint8Array(binaryString.length);
    for (let i = 0; i < binaryString.length; i++) {
      mulawData[i] = binaryString.charCodeAt(i);
    }
    
    // Convert mulaw to PCM16
    const pcm16Data = convertMulawToPCM16(mulawData);
    
    // Encode PCM16 back to base64
    let binary = '';
    const chunkSize = 0x8000;
    
    for (let i = 0; i < pcm16Data.length; i += chunkSize) {
      const chunk = pcm16Data.subarray(i, Math.min(i + chunkSize, pcm16Data.length));
      binary += String.fromCharCode.apply(null, Array.from(chunk));
    }
    
    return btoa(binary);
  } catch (error) {
    console.error('Error encoding audio:', error);
    return base64Audio; // Return original if conversion fails
  }
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
                modalities: ['audio'],
                instructions: systemPrompt,
                voice: 'alloy',
                input_audio_format: 'pcm16',
                output_audio_format: 'pcm16',
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

          // Handle audio output from OpenAI
          if (data.type === 'response.audio.delta') {
            // Send audio back to Telnyx
            const audioMessage = {
              event: 'media',
              media: {
                payload: data.delta
              }
            };
            socket.send(JSON.stringify(audioMessage));
          }

          // Handle function calls
          if (data.type === 'response.function_call_arguments.done') {
            console.log('=== Function Call ===', data);
            if (data.name === 'schedule_appointment') {
              try {
                const args = JSON.parse(data.arguments);
                console.log('Scheduling appointment:', args);
                
                // Log appointment data to database
                if (callControlId) {
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
                    .eq('call_control_id', callControlId);
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
      console.log('Telnyx message type:', message.event);

      // Handle stream start
      if (message.event === 'start' && message.start) {
        callControlId = message.start.callSid;
        console.log('Stream started for call:', callControlId);
        
        // Update call status in database
        if (callControlId) {
          try {
            await supabaseClient
              .from('telnyx_calls')
              .update({
                call_status: 'streaming',
                streaming_active: true
              })
              .eq('call_control_id', callControlId);
          } catch (error) {
            console.error('Error updating call status:', error);
          }
        }
      }

      // Handle audio media
      if (message.event === 'media' && message.media && openAISocket && openAISocket.readyState === WebSocket.OPEN) {
        // Convert and send audio to OpenAI
        const encodedAudio = encodeAudioForOpenAI(message.media.payload);
        
        const audioMessage = {
          type: 'input_audio_buffer.append',
          audio: encodedAudio
        };
        
        openAISocket.send(JSON.stringify(audioMessage));
      }

      // Handle stream stop
      if (message.event === 'stop') {
        console.log('Stream stopped');
        if (openAISocket) {
          openAISocket.close();
        }
      }

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
