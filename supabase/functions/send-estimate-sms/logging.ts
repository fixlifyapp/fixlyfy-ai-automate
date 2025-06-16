
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.24.0'

interface SMSLogData {
  estimateId: string;
  recipientPhone: string;
  message: string;
  status: string;
  provider: string;
  messageId?: string;
}

export const logSMSEvent = async (supabaseAdmin: any, logData: SMSLogData) => {
  try {
    await supabaseAdmin
      .from('estimate_communications')
      .insert({
        estimate_id: logData.estimateId,
        communication_type: 'sms',
        recipient: logData.recipientPhone,
        content: logData.message,
        status: logData.status,
        provider_message_id: logData.messageId
      });
    
    console.log('SMS event logged successfully');
  } catch (error) {
    console.error('Failed to log SMS event:', error);
  }
};
