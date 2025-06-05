
import { serve } from 'https://deno.land/std@0.190.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.24.0'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const supabaseAdmin = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    // Update the webhook URL in the database for the existing phone number
    const { data: updated, error } = await supabaseAdmin
      .from('telnyx_phone_numbers')
      .update({ 
        webhook_url: 'https://mqppvcrlvsgrsqelglod.supabase.co/functions/v1/sms-receiver',
        updated_at: new Date().toISOString()
      })
      .eq('phone_number', '+14375249932')
      .select()

    if (error) {
      console.error('Error updating webhook URL:', error)
      throw error
    }

    console.log('Updated phone number record:', updated)

    return new Response(
      JSON.stringify({ 
        success: true, 
        message: 'Webhook URL updated successfully',
        updated_record: updated[0]
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      }
    )

  } catch (error) {
    console.error('Error updating webhook URL:', error)
    return new Response(
      JSON.stringify({ 
        success: false, 
        error: error.message || 'Failed to update webhook URL'
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500,
      }
    )
  }
})
