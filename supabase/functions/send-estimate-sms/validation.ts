
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.24.0'

export const validateRequest = (body: any) => {
  const { estimateId, recipientPhone, fromNumber } = body;
  
  if (!estimateId || !recipientPhone || !fromNumber) {
    throw new Error('Missing required fields: estimateId, recipientPhone, fromNumber');
  }
  
  return { estimateId, recipientPhone, fromNumber, message: body.message };
};

export const validatePhoneNumber = async (
  fromNumber: string, 
  userId: string, 
  supabaseAdmin: any
) => {
  const { data: phoneNumberCheck, error: phoneError } = await supabaseAdmin
    .from('telnyx_phone_numbers')
    .select('*')
    .eq('phone_number', fromNumber)
    .eq('user_id', userId)
    .eq('status', 'active')
    .single();

  if (phoneError || !phoneNumberCheck) {
    throw new Error('Phone number not found or not authorized for this user');
  }

  return phoneNumberCheck;
};
