
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
  const TELNYX_API_KEY = Deno.env.get('TELNYX_API_KEY');
  
  if (!OPENAI_API_KEY) {
    console.error('OpenAI API key not found');
    return new Response('OpenAI API key not configured', { status: 500 });
  }

  const supabaseUrl = Deno.env.get('SUPABASE_URL');
  const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');
  const supabase = createClient(supabaseUrl!, supabaseServiceKey!);

  let openAISocket: WebSocket | null = null;
  let clientData: any = null;
  let aiConfig: any = null;
  let sessionCreated = false;
  let callRecordId: string | null = null;
  let conversation: string[] = [];
  let isTelnyxStream = false;

  // Check if this is a Telnyx media stream by looking at headers or URL params
  const url = new URL(req.url);
  const userAgent = headers.get("user-agent") || "";
  if (userAgent.includes("Telnyx") || url.searchParams.has("telnyx")) {
    isTelnyxStream = true;
    console.log('Detected Telnyx media stream connection');
  }

  const initOpenAI = () => {
    console.log('Connecting to OpenAI Realtime API...');
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
      console.log('Connected to OpenAI Realtime API');
    };

    openAISocket.onmessage = async (event) => {
      const data = JSON.parse(event.data);
      console.log('OpenAI message:', data.type);

      if (data.type === 'session.created') {
        sessionCreated = true;
        await sendSessionUpdate();
      } else if (data.type === 'response.function_call_arguments.done') {
        await handleFunctionCall(data);
      } else if (data.type === 'conversation.item.input_audio_transcription.completed') {
        conversation.push(`User: ${data.transcript}`);
        console.log('User said:', data.transcript);
      } else if (data.type === 'response.audio_transcript.done') {
        if (data.transcript) {
          conversation.push(`AI: ${data.transcript}`);
          console.log('AI said:', data.transcript);
        }
      }

      // Forward appropriate messages to client
      if (!isTelnyxStream || (data.type.includes('audio') || data.type.includes('transcript'))) {
        socket.send(event.data);
      }
    };

    openAISocket.onerror = (error) => {
      console.error('OpenAI WebSocket error:', error);
      socket.send(JSON.stringify({ type: 'error', message: 'OpenAI connection error' }));
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

    const instructions = `You are ${aiConfig?.agent_name || 'an AI assistant'} for ${aiConfig?.company_name || 'our company'}, a ${aiConfig?.business_niche || 'service'} business.

IMPORTANT INSTRUCTIONS:
1. Always greet callers warmly and ask how you can help them
2. Use the lookup_client function to check if they're an existing client
3. If they need service, use the schedule_appointment function to book them
4. Be helpful, professional, and gather necessary information for scheduling
5. Confirm appointment details clearly before ending the call
6. Keep responses conversational and natural

Your diagnostic service costs $${aiConfig?.diagnostic_price || 75} with a $${aiConfig?.emergency_surcharge || 50} emergency surcharge for after-hours calls.

Service areas: ${aiConfig?.service_areas?.join(', ') || 'All areas'}
Services offered: ${aiConfig?.service_types?.join(', ') || 'HVAC, Plumbing, Electrical, General Repair'}

${aiConfig?.custom_prompt_additions || ''}`;

    const sessionUpdate = {
      type: 'session.update',
      session: {
        modalities: ['text', 'audio'],
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
          }
        ],
        tool_choice: 'auto',
        temperature: 0.8,
        max_response_output_tokens: 'inf'
      }
    };

    console.log('Sending session update...');
    openAISocket.send(JSON.stringify(sessionUpdate));
  };

  const handleFunctionCall = async (data: any) => {
    console.log('Function call:', data.name, data.arguments);
    
    try {
      const args = JSON.parse(data.arguments);
      let result: any = {};

      if (data.name === 'lookup_client') {
        // Look up client by phone
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
          clientData = result.client;
        } else {
          result = { found: false, message: 'No existing client found with that phone number' };
        }

      } else if (data.name === 'schedule_appointment') {
        // Create new client and job
        let client_id;

        if (clientData) {
          // Use existing client
          client_id = clientData.id;
        } else {
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
          }
        }

        if (client_id) {
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
                source: 'ai_voice_dispatch'
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

            // Update call record with appointment info
            if (callRecordId) {
              await supabase
                .from('telnyx_calls')
                .update({
                  appointment_scheduled: true,
                  appointment_data: result.appointment
                })
                .eq('id', callRecordId);
            }
          }
        }
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
    console.log('Client WebSocket connected');
    initOpenAI();
  };

  socket.onmessage = (event) => {
    try {
      const message = JSON.parse(event.data);
      
      // Handle Telnyx media stream metadata
      if (message.event === 'start' && message.media) {
        console.log('Telnyx media stream started');
        callRecordId = message.custom_parameters?.call_record_id;
        return;
      }
      
      // Handle Telnyx audio data
      if (message.event === 'media' && message.media?.payload) {
        // Forward Telnyx audio to OpenAI
        if (openAISocket?.readyState === WebSocket.OPEN) {
          openAISocket.send(JSON.stringify({
            type: 'input_audio_buffer.append',
            audio: message.media.payload
          }));
        }
        return;
      }

      // Forward other client messages to OpenAI
      if (openAISocket?.readyState === WebSocket.OPEN) {
        openAISocket.send(event.data);
      }
    } catch (error) {
      console.error('Error processing message:', error);
      
      // Fallback: forward raw data to OpenAI
      if (openAISocket?.readyState === WebSocket.OPEN) {
        openAISocket.send(event.data);
      }
    }
  };

  socket.onclose = async () => {
    console.log('Client WebSocket disconnected');
    
    // Save conversation transcript if we have one
    if (conversation.length > 0 && callRecordId) {
      try {
        await supabase
          .from('telnyx_calls')
          .update({
            ai_transcript: conversation.join('\n')
          })
          .eq('id', callRecordId);
        
        console.log('Saved conversation transcript to database');
      } catch (error) {
        console.error('Error saving conversation transcript:', error);
      }
    }
    
    if (openAISocket) {
      openAISocket.close();
    }
  };

  return response;
});
