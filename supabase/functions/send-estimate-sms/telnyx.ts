
import type { TelnyxResponse } from './types.ts';

export const sendSMSViaTelnyx = async (
  fromPhone: string,
  toPhone: string,
  message: string,
  telnyxApiKey: string
): Promise<TelnyxResponse> => {
  console.log('Sending SMS from:', fromPhone, 'to:', toPhone);
  console.log('SMS content:', message.substring(0, 100) + '...');

  const response = await fetch('https://api.telnyx.com/v2/messages', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${telnyxApiKey}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      from: fromPhone,
      to: toPhone,
      text: message
    })
  });

  const result = await response.json();

  if (!response.ok) {
    console.error('Telnyx API error:', result);
    throw new Error(result.errors?.[0]?.detail || 'Failed to send SMS via Telnyx');
  }

  console.log('SMS sent successfully:', result);
  return result;
};
