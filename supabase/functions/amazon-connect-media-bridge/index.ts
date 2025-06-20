
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  const { headers } = req;
  const upgradeHeader = headers.get("upgrade") || "";

  if (upgradeHeader.toLowerCase() !== "websocket") {
    return new Response("Expected WebSocket connection", { status: 400 });
  }

  const { socket, response } = Deno.upgradeWebSocket(req);
  
  const OPENAI_API_KEY = Deno.env.get('OPENAI_API_KEY');
  if (!OPENAI_API_KEY) {
    console.error('OpenAI API key not found');
    return new Response('OpenAI API key not configured', { status: 500 });
  }

  const supabaseUrl = Deno.env.get('SUPABASE_URL');
  const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');
  const supabase = createClient(supabaseUrl!, supabaseServiceKey!);

  let openAISocket: WebSocket | null = null;
  let connectCallData: any = null;
  let aiConfig: any = null;
  let sessionCreated = false;
  let audioBuffer: Int16Array = new Int16Array(0);

  // Audio format conversion: 8kHz (Connect) <-> 24kHz (OpenAI)
  const resampleAudio = (inputBuffer: Int16Array, inputRate: number, outputRate: number): Int16Array => {
    const ratio = outputRate / inputRate;
    const outputLength = Math.floor(inputBuffer.length * ratio);
    const outputBuffer = new Int16Array(outputLength);
    
    for (let i = 0; i < outputLength; i++) {
      const inputIndex = i / ratio;
      const index = Math.floor(inputIndex);
      const fraction = inputIndex - index;
      
      if (index + 1 < inputBuffer.length) {
        outputBuffer[i] = Math.round(
          inputBuffer[index] * (1 - fraction) + inputBuffer[index + 1] * fraction
        );
      } else {
        outputBuffer[i] = inputBuffer[index] || 0;
      }
    }
    
    return outputBuffer;
  };

  const encodeAudioForOpenAI = (int16Array: Int16Array): string => {
    const uint8Array = new Uint8Array(int16Array.buffer);
    let binary = '';
    const chunkSize = 0x8000;
    
    for (let i = 0; i < uint8Array.length; i += chunkSize) {
      const chunk = uint8Array.subarray(i, Math.min(i + chunkSize, uint8Array.length));
      binary += String.fromCharCode.apply(null, Array.from(chunk));
    }
    
    return btoa(binary);
  };

  const decodeAudioFromOpenAI = (base64Audio: string): Int16Array => {
    const binaryString = atob(base64Audio);
    const bytes = new Uint8Array(binaryString.length);
    
    for (let i = 0; i < binaryString.length; i++) {
      bytes[i] = binaryString.charCodeAt(i);
    }
    
    return new Int16Array(bytes.buffer);
  };

  // Initialize OpenAI Realtime connection
  const initOpenAI = async () => {
    console.log('Connecting to OpenAI Realtime API for Amazon Connect...');
    openAISocket = new WebSocket(
      'wss://api.openai.com/v1/realtime?model=gpt-4o-realtime-preview-2024-12-17',
      {
        headers: {
          'Authorization': `Bearer ${OPENAI_API_KEY}`,
          'OpenAI-Beta': 'realtime=v1'
        }
      }
    );

    openAISocket.onopen = () => {
      console.log('Connected to OpenAI Realtime API from Amazon Connect');
    };

    openAISocket.onmessage = async (event) => {
      const data = JSON.parse(event.data);
      console.log('OpenAI message type:', data.type);

      if (data.type === 'session.created') {
        sessionCreated = true;
        await sendSessionUpdate();
      } else if (data.type === 'response.audio.delta') {
        // Convert 24kHz audio back to 8kHz for Amazon Connect
        const openAIAudio = decodeAudioFromOpenAI(data.delta);
        const connectAudio = resampleAudio(openAIAudio, 24000, 8000);
        const encodedForConnect = encodeAudioForOpenAI(connectAudio);
        
        // Send audio back to Amazon Connect
        socket.send(JSON.stringify({
          type: 'media',
          media: {
            type: 'audio',
            payload: encodedForConnect,
            chunk: '1'
          }
        }));
      } else if (data.type === 'response.function_call_arguments.done') {
        await handleFunctionCall(data);
      }
    };

    openAISocket.onerror = (error) => {
      console.error('OpenAI WebSocket error:', error);
      socket.send(JSON.stringify({
        type: 'error',
        message: 'AI connection error'
      }));
    };

    openAISocket.onclose = () => {
      console.log('OpenAI connection closed');
      socket.close();
    };
  };

  const sendSessionUpdate = async () => {
    if (!openAISocket || !sessionCreated) return;

    // Get AI config for personalization
    try {
      const { data: config } = await supabase
        .from('ai_agent_configs')
        .select('*')
        .eq('is_active', true)
        .single();
      
      aiConfig = config;
    } catch (error) {
      console.error('Error fetching AI config:', error);
    }

    const instructions = `You are ${aiConfig?.agent_name || 'an AI assistant'} for ${aiConfig?.company_name || 'our company'}, a ${aiConfig?.business_niche || 'service'} business connected through Amazon Connect.

IMPORTANT INSTRUCTIONS:
1. You are handling a live phone call through Amazon Connect
2. Always greet callers warmly and ask how you can help them
3. Use the lookup_client function to check if they're an existing client
4. If they're a new client, use the schedule_appointment function to book them
5. Be helpful, professional, and gather necessary information for scheduling
6. Confirm appointment details clearly
7. Keep responses concise and conversational for phone calls

Your diagnostic service costs $${aiConfig?.diagnostic_price || 75} with a $${aiConfig?.emergency_surcharge || 50} emergency surcharge for after-hours calls.

${aiConfig?.custom_prompt_additions || ''}`;

    const sessionUpdate = {
      type: 'session.update',
      session: {
        modalities: ['audio'],
        instructions: instructions,
        voice: aiConfig?.voice_id || 'alloy',
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
            name: 'lookup_client',
            description: 'Look up existing client information by phone number',
            parameters: {
              type: 'object',
              properties: {
                phone: { 
                  type: 'string',
                  description: 'Client phone number'
                }
              },
              required: ['phone']
            }
          },
          {
            type: 'function',
            name: 'schedule_appointment',
            description: 'Schedule a new appointment for a client',
            parameters: {
              type: 'object',
              properties: {
                client_name: { type: 'string' },
                phone: { type: 'string' },
                email: { type: 'string' },
                address: { type: 'string' },
                service_type: { type: 'string' },
                preferred_date: { type: 'string' },
                preferred_time: { type: 'string' },
                description: { type: 'string' },
                is_emergency: { type: 'boolean' }
              },
              required: ['client_name', 'phone', 'service_type', 'description']
            }
          },
          {
            type: 'function',
            name: 'transfer_to_agent',
            description: 'Transfer the call to a human agent when requested or needed',
            parameters: {
              type: 'object',
              properties: {
                reason: { type: 'string', description: 'Reason for transfer' },
                urgency: { type: 'string', enum: ['low', 'medium', 'high'] }
              },
              required: ['reason']
            }
          }
        ],
        tool_choice: 'auto',
        temperature: 0.8,
        max_response_output_tokens: 'inf'
      }
    };

    console.log('Sending session update for Amazon Connect...');
    openAISocket.send(JSON.stringify(sessionUpdate));
  };

  const handleFunctionCall = async (data: any) => {
    console.log('Function call from Amazon Connect:', data.name, data.arguments);
    
    try {
      const args = JSON.parse(data.arguments);
      let result: any = {};

      if (data.name === 'lookup_client') {
        const { data: client, error } = await supabase
          .from('clients')
          .select(`
            *,
            client_properties (*),
            jobs (
              id, title, service, date, status, notes
            )
          `)
          .eq('phone', args.phone)
          .order('created_at', { ascending: false, foreignTable: 'jobs' })
          .limit(5, { foreignTable: 'jobs' })
          .single();

        if (error && error.code !== 'PGRST116') {
          console.error('Client lookup error:', error);
          result = { found: false, error: 'Database error' };
        } else if (client) {
          result = {
            found: true,
            client: {
              name: client.name,
              phone: client.phone,
              email: client.email,
              address: client.address,
              type: client.type,
              recent_jobs: client.jobs || []
            }
          };
        } else {
          result = { found: false, message: 'No existing client found with that phone number' };
        }

      } else if (data.name === 'schedule_appointment') {
        // Create new client and job
        let client_id;

        // Create new client
        const { data: newClient, error: clientError } = await supabase
          .from('clients')
          .insert({
            name: args.client_name,
            phone: args.phone,
            email: args.email || null,
            address: args.address || null,
            type: 'residential'
          })
          .select()
          .single();

        if (clientError) {
          console.error('Error creating client:', clientError);
          result = { success: false, error: 'Failed to create client record' };
        } else {
          client_id = newClient.id;

          // Create job/appointment
          const { data: job, error: jobError } = await supabase
            .from('jobs')
            .insert({
              client_id: client_id,
              title: `${args.service_type} Service Call`,
              service: args.service_type,
              status: 'scheduled',
              priority: args.is_emergency ? 'high' : 'medium',
              date: args.preferred_date || new Date().toISOString().split('T')[0],
              description: args.description,
              custom_fields: {
                preferred_time: args.preferred_time,
                is_emergency: args.is_emergency,
                source: 'amazon_connect_ai',
                contact_id: connectCallData?.contactId
              }
            })
            .select()
            .single();

          if (jobError) {
            console.error('Error creating job:', jobError);
            result = { success: false, error: 'Failed to schedule appointment' };
          } else {
            result = {
              success: true,
              appointment: {
                job_id: job.id,
                client_name: args.client_name,
                service_type: args.service_type,
                scheduled_date: job.date,
                preferred_time: args.preferred_time,
                is_emergency: args.is_emergency
              }
            };
          }
        }

      } else if (data.name === 'transfer_to_agent') {
        // Log transfer request and signal Amazon Connect to transfer
        const { error: logError } = await supabase
          .from('amazon_connect_calls')
          .update({
            call_status: 'transferred',
            ai_transcript: `Transfer requested: ${args.reason}`,
            ended_at: new Date().toISOString()
          })
          .eq('contact_id', connectCallData?.contactId);

        if (logError) {
          console.error('Error logging transfer:', logError);
        }

        result = {
          success: true,
          transfer_requested: true,
          reason: args.reason,
          urgency: args.urgency || 'medium'
        };

        // Signal Amazon Connect to transfer (this will close the connection)
        socket.send(JSON.stringify({
          type: 'transfer_request',
          reason: args.reason,
          urgency: args.urgency || 'medium'
        }));
      }

      // Send function result back to OpenAI
      const functionResult = {
        type: 'conversation.item.create',
        item: {
          type: 'function_call_output',
          call_id: data.call_id,
          output: JSON.stringify(result)
        }
      };

      openAISocket?.send(JSON.stringify(functionResult));
      openAISocket?.send(JSON.stringify({ type: 'response.create' }));

    } catch (error) {
      console.error('Function execution error:', error);
      
      const errorResult = {
        type: 'conversation.item.create',
        item: {
          type: 'function_call_output',
          call_id: data.call_id,
          output: JSON.stringify({ error: 'Function execution failed' })
        }
      };

      openAISocket?.send(JSON.stringify(errorResult));
    }
  };

  socket.onopen = () => {
    console.log('Amazon Connect WebSocket connected');
    initOpenAI();
  };

  socket.onmessage = async (event) => {
    try {
      const message = JSON.parse(event.data);
      console.log('Amazon Connect message type:', message.type);

      if (message.type === 'start') {
        // Store call data from Amazon Connect
        connectCallData = {
          contactId: message.start?.contactId,
          customerNumber: message.start?.customerNumber,
          instanceId: message.start?.instanceId
        };
        
        console.log('Amazon Connect call started:', connectCallData);

        // Log call in database
        try {
          const { error: logError } = await supabase
            .from('amazon_connect_calls')
            .insert({
              contact_id: connectCallData.contactId,
              instance_id: connectCallData.instanceId,
              phone_number: connectCallData.customerNumber,
              call_status: 'in_progress',
              started_at: new Date().toISOString(),
              user_id: '00000000-0000-0000-0000-000000000000' // Fallback for logging
            });
          
          if (logError) {
            console.error('Error logging call start:', logError);
          }
        } catch (logErr) {
          console.error('Failed to log call start:', logErr);
        }

      } else if (message.type === 'media' && message.media?.type === 'audio') {
        // Handle incoming audio from Amazon Connect (8kHz PCM16)
        const connectAudio = decodeAudioFromOpenAI(message.media.payload);
        
        // Resample from 8kHz to 24kHz for OpenAI
        const openAIAudio = resampleAudio(connectAudio, 8000, 24000);
        const encodedForOpenAI = encodeAudioForOpenAI(openAIAudio);

        // Forward to OpenAI
        if (openAISocket?.readyState === WebSocket.OPEN) {
          openAISocket.send(JSON.stringify({
            type: 'input_audio_buffer.append',
            audio: encodedForOpenAI
          }));
        }

      } else if (message.type === 'stop') {
        console.log('Amazon Connect call ended');
        
        // Update call status in database
        try {
          const { error: updateError } = await supabase
            .from('amazon_connect_calls')
            .update({
              call_status: 'completed',
              ended_at: new Date().toISOString()
            })
            .eq('contact_id', connectCallData?.contactId);
          
          if (updateError) {
            console.error('Error updating call end:', updateError);
          }
        } catch (updateErr) {
          console.error('Failed to update call end:', updateErr);
        }

        // Close OpenAI connection
        if (openAISocket) {
          openAISocket.close();
        }
      }

    } catch (error) {
      console.error('Error processing Amazon Connect message:', error);
    }
  };

  socket.onclose = () => {
    console.log('Amazon Connect WebSocket disconnected');
    if (openAISocket) {
      openAISocket.close();
    }
  };

  return response;
});
