
import { BusinessConfig } from './businessConfig.ts';

export const createOpenAISession = (businessConfig: BusinessConfig, openAISocket: WebSocket) => {
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

  openAISocket.send(JSON.stringify(sessionUpdate));
  console.log('Session configured with business data');
};
