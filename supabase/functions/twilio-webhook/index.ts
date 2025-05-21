
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.7.1';

// Set up CORS headers
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
    // For webhook handling, we need to parse form data
    const formData = await req.formData();
    
    // Extract Twilio SMS webhook data
    const messageSid = formData.get('MessageSid') as string;
    const from = formData.get('From') as string;
    const to = formData.get('To') as string;
    const body = formData.get('Body') as string;
    
    // Log the incoming message
    console.log('Received message:', { from, to, body, messageSid });
    
    // Create Supabase client with service role key for database access
    const supabaseUrl = Deno.env.get('SUPABASE_URL') || '';
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') || '';
    const supabase = createClient(supabaseUrl, supabaseServiceKey);
    
    // Find which user owns this phone number
    const { data: phoneNumberData } = await supabase
      .from('user_phone_numbers')
      .select('user_id')
      .eq('phone_number', to)
      .eq('status', 'active')
      .single();
    
    if (!phoneNumberData) {
      throw new Error('No user found for this phone number');
    }
    
    // Find or create the client based on their phone number
    const { data: clientData, error: clientError } = await supabase
      .from('clients')
      .select('id')
      .eq('phone', from)
      .single();
      
    let clientId;
    
    if (clientError || !clientData) {
      // Create a new client if not found
      const { data: newClient, error: newClientError } = await supabase
        .from('clients')
        .insert({
          name: `Client ${from}`, 
          phone: from,
          created_by: phoneNumberData.user_id
        })
        .select('id')
        .single();
        
      if (newClientError) throw newClientError;
      clientId = newClient.id;
    } else {
      clientId = clientData.id;
    }
    
    // Find or create conversation for this client
    const { data: conversationData, error: conversationError } = await supabase
      .from('conversations')
      .select('id')
      .eq('client_id', clientId)
      .single();
      
    let conversationId;
    
    if (conversationError || !conversationData) {
      // Create a new conversation if not found
      const { data: newConversation, error: newConversationError } = await supabase
        .from('conversations')
        .insert({
          client_id: clientId
        })
        .select('id')
        .single();
        
      if (newConversationError) throw newConversationError;
      conversationId = newConversation.id;
    } else {
      conversationId = conversationData.id;
    }
    
    // Store the message in the database
    await supabase
      .from('messages')
      .insert({
        conversation_id: conversationId,
        body: body,
        direction: 'inbound',
        sender: from,
        recipient: to,
        message_sid: messageSid
      });
    
    // Return TwiML response
    const twimlResponse = `
      <?xml version="1.0" encoding="UTF-8"?>
      <Response></Response>
    `;
    
    return new Response(twimlResponse, {
      status: 200,
      headers: { 
        'Content-Type': 'text/xml',
        ...corsHeaders
      }
    });
  } catch (error) {
    console.error('Error handling webhook:', error);
    
    return new Response(
      JSON.stringify({ success: false, error: error.message }),
      {
        status: 500,
        headers: { 'Content-Type': 'application/json', ...corsHeaders }
      }
    );
  }
});
