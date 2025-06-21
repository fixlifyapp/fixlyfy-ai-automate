import { serve } from 'https://deno.land/std@0.177.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.24.0'

serve(async (req) => {
  const supabaseAdmin = createClient(
    Deno.env.get('SUPABASE_URL') ?? '',
    Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
  );

  const { phone_number } = await req.json();
  
  // Check what phone numbers are in the database
  const { data: allNumbers } = await supabaseAdmin
    .from('telnyx_phone_numbers')
    .select('phone_number, user_id, status');
  
  console.log('All phone numbers in DB:', allNumbers);
  
  // Test the lookup logic
  const normalizePhone = (phone: string): string => {
    const cleaned = phone.replace(/\D/g, '');
    if (cleaned.startsWith('1') && cleaned.length === 11) {
      return cleaned.substring(1);
    }
    return cleaned;
  };
  
  const baseNumber = normalizePhone(phone_number);
  
  const { data: found, error } = await supabaseAdmin
    .from('telnyx_phone_numbers')
    .select('user_id, phone_number')
    .or(`phone_number.ilike.%${baseNumber},phone_number.ilike.+1${baseNumber},phone_number.ilike.+${baseNumber}`)
    .eq('status', 'active');

  return new Response(JSON.stringify({
    input: phone_number,
    normalized: baseNumber,
    found,
    error,
    allNumbers
  }), {
    headers: { 'Content-Type': 'application/json' }
  });
}); 