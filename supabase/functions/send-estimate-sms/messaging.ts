
import type { EstimateData } from './types.ts';

export const formatPhoneNumbers = (fromNumber: string, recipientPhone: string) => {
  const cleanFromPhone = fromNumber.replace(/\D/g, '');
  const cleanToPhone = recipientPhone.replace(/\D/g, '');
  
  const formattedFromPhone = cleanFromPhone.length === 10 ? `+1${cleanFromPhone}` : `+${cleanFromPhone}`;
  const formattedToPhone = cleanToPhone.length === 10 ? `+1${cleanToPhone}` : `+${cleanToPhone}`;
  
  return { formattedFromPhone, formattedToPhone };
};

export const createSMSMessage = (
  estimate: EstimateData,
  portalLink: string,
  customMessage?: string
): string => {
  const client = estimate.jobs?.clients;
  const clientName = client?.name || 'Customer';
  const estimateTotal = estimate.total?.toFixed(2) || '0.00';
  
  if (customMessage) {
    return portalLink && !customMessage.includes('portal.fixlify.app')
      ? `${customMessage}\n\nView details: ${portalLink}`
      : customMessage;
  }

  if (portalLink) {
    return `Hi ${clientName}! Your estimate #${estimate.estimate_number} is ready ($${estimateTotal}). View and manage it here: ${portalLink}`;
  }

  return `Hi ${clientName}! Your estimate #${estimate.estimate_number} is ready. Total: $${estimateTotal}. Please contact us for details.`;
};
