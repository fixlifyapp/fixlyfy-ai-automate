
import type { EstimateData } from './types.ts';

export const logCommunication = async (
  estimateId: string,
  recipientPhone: string,
  message: string,
  estimate: EstimateData,
  portalLink: string,
  providerMessageId: string,
  supabaseAdmin: any
): Promise<void> => {
  try {
    const client = estimate.jobs?.clients;
    
    await supabaseAdmin
      .from('estimate_communications')
      .insert({
        estimate_id: estimateId,
        communication_type: 'sms',
        recipient: recipientPhone,
        content: message,
        status: 'sent',
        provider_message_id: providerMessageId,
        estimate_number: estimate.estimate_number,
        client_name: client?.name,
        client_email: client?.email,
        client_phone: client?.phone,
        sent_at: new Date().toISOString()
      });

    // Also create a client notification
    if (client?.id) {
      await supabaseAdmin
        .from('client_notifications')
        .insert({
          client_id: client.id,
          type: 'estimate_sent',
          title: 'New Estimate Available',
          message: `Estimate ${estimate.estimate_number} has been sent to you. Total: $${estimate.total?.toFixed(2) || '0.00'}`,
          data: { 
            estimate_id: estimateId, 
            estimate_number: estimate.estimate_number,
            portal_link: portalLink,
            job_id: estimate.jobs?.id
          }
        });
    }
  } catch (logError) {
    console.error('Failed to log SMS communication:', logError);
  }
};
