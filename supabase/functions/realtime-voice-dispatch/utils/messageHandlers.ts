
export interface TelnyxStreamMessage {
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

export interface OpenAIRealtimeMessage {
  type: string;
  audio?: string;
  text?: string;
  [key: string]: any;
}

export const handleOpenAIMessage = async (
  data: OpenAIRealtimeMessage,
  socket: WebSocket,
  callControlId: string | null,
  supabaseClient: any,
  businessConfig: any,
  openAISocket: WebSocket
) => {
  console.log('OpenAI event:', data.type);

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
        openAISocket.send(JSON.stringify(functionResult));
        openAISocket.send(JSON.stringify({ type: 'response.create' }));
      } catch (error) {
        console.error('Error processing appointment:', error);
      }
    }
  }
};

export const handleTelnyxMessage = async (
  message: TelnyxStreamMessage,
  callControlId: string | null,
  setCallControlId: (id: string) => void,
  supabaseClient: any,
  openAISocket: WebSocket | null,
  encodeAudioForOpenAI: (audio: string) => string
) => {
  console.log('Telnyx message type:', message.event);

  // Handle stream start
  if (message.event === 'start' && message.start) {
    const newCallControlId = message.start.callSid;
    setCallControlId(newCallControlId);
    console.log('Stream started for call:', newCallControlId);
    
    // Update call status in database
    if (newCallControlId) {
      try {
        await supabaseClient
          .from('telnyx_calls')
          .update({
            call_status: 'streaming',
            streaming_active: true
          })
          .eq('call_control_id', newCallControlId);
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
};
