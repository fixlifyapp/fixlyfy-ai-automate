
import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.24.0';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Create Supabase client
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    // Get the authorization header
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      throw new Error('No authorization header');
    }

    // Verify the user token
    const token = authHeader.replace('Bearer ', '');
    const { data: userData, error: userError } = await supabaseClient.auth.getUser(token);
    
    if (userError || !userData.user) {
      throw new Error('Invalid token');
    }

    const { name, email, phone, role, serviceArea, sendWelcomeEmail } = await req.json();

    // Generate invitation token
    const invitationToken = crypto.randomUUID();
    
    // Create team invitation record
    const { data: invitation, error: invitationError } = await supabaseClient
      .from('team_invitations')
      .insert({
        name,
        email,
        phone,
        role,
        service_area: serviceArea,
        invitation_token: invitationToken,
        invited_by: userData.user.id,
        status: 'pending'
      })
      .select()
      .single();

    if (invitationError) {
      throw new Error(`Failed to create invitation: ${invitationError.message}`);
    }

    // Send SMS if phone number is provided and user opted for welcome message
    if (phone && sendWelcomeEmail) {
      const twilioAccountSid = Deno.env.get('TWILIO_ACCOUNT_SID');
      const twilioAuthToken = Deno.env.get('TWILIO_AUTH_TOKEN');
      const twilioPhoneNumber = Deno.env.get('TWILIO_PHONE_NUMBER');

      if (twilioAccountSid && twilioAuthToken && twilioPhoneNumber) {
        // Create invitation link (you can customize this URL)
        const invitationLink = `${Deno.env.get('SUPABASE_URL')}/accept-invitation?token=${invitationToken}`;
        
        const smsMessage = `Hi ${name}! You've been invited to join our team as a ${role}. Complete your registration here: ${invitationLink}. This link expires in 7 days.`;

        try {
          const twilioResponse = await fetch(
            `https://api.twilio.com/2010-04-01/Accounts/${twilioAccountSid}/Messages.json`,
            {
              method: 'POST',
              headers: {
                'Authorization': `Basic ${btoa(`${twilioAccountSid}:${twilioAuthToken}`)}`,
                'Content-Type': 'application/x-www-form-urlencoded',
              },
              body: new URLSearchParams({
                From: twilioPhoneNumber,
                To: phone,
                Body: smsMessage,
              }),
            }
          );

          if (!twilioResponse.ok) {
            const errorData = await twilioResponse.text();
            console.error('Twilio SMS error:', errorData);
            throw new Error('Failed to send SMS');
          }

          console.log('SMS sent successfully to:', phone);
        } catch (smsError) {
          console.error('SMS sending failed:', smsError);
          // Don't fail the entire operation if SMS fails
        }
      }
    }

    // Send email notification (simulated for now)
    if (sendWelcomeEmail) {
      console.log(`[Simulation] Sending welcome email to ${email} with invitation token: ${invitationToken}`);
    }

    return new Response(
      JSON.stringify({ 
        success: true, 
        invitation,
        message: `Invitation sent to ${name}`
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );

  } catch (error) {
    console.error('Error in send-team-invitation function:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }
});
