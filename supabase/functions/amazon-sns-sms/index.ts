
import { serve } from 'https://deno.land/std@0.177.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.24.0'

interface SNSMessage {
  to: string;
  body: string;
  from?: string;
  client_id?: string;
  job_id?: string;
}

serve(async (req) => {
  try {
    if (req.method !== 'POST') {
      return new Response(JSON.stringify({ error: 'Method not allowed' }), {
        status: 405,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      return new Response(JSON.stringify({ error: 'Missing authorization header' }), {
        status: 401,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    // Get AWS credentials from environment
    const awsAccessKeyId = Deno.env.get('AWS_ACCESS_KEY_ID');
    const awsSecretAccessKey = Deno.env.get('AWS_SECRET_ACCESS_KEY');
    const awsRegion = Deno.env.get('AWS_REGION') || 'us-east-1';

    if (!awsAccessKeyId || !awsSecretAccessKey) {
      return new Response(JSON.stringify({ error: 'AWS credentials not configured' }), {
        status: 500,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    // Verify user authentication
    const token = authHeader.replace('Bearer ', '');
    const { data: userData, error: userError } = await supabaseClient.auth.getUser(token);
    
    if (userError || !userData.user) {
      return new Response(JSON.stringify({ error: 'Invalid token' }), {
        status: 401,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    const { to, body, from, client_id, job_id }: SNSMessage = await req.json();

    if (!to || !body) {
      return new Response(JSON.stringify({ error: 'Missing required fields: to, body' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    // Create AWS SNS request
    const snsEndpoint = `https://sns.${awsRegion}.amazonaws.com/`;
    const timestamp = new Date().toISOString();
    
    // Format phone number for SNS (remove any non-digit characters except +)
    const formattedPhone = to.startsWith('+') ? to : `+1${to.replace(/\D/g, '')}`;

    const params = new URLSearchParams({
      'Action': 'Publish',
      'PhoneNumber': formattedPhone,
      'Message': body,
      'Version': '2010-03-31'
    });

    // Create AWS Signature V4
    const host = `sns.${awsRegion}.amazonaws.com`;
    const canonicalRequest = `POST\n/\n\n` +
      `host:${host}\n` +
      `x-amz-date:${timestamp.replace(/[:\-]|\.\d{3}/g, '')}\n\n` +
      `host;x-amz-date\n` +
      await crypto.subtle.digest('SHA-256', new TextEncoder().encode(params.toString()));

    // For simplicity, using a basic AWS request (in production, implement full AWS Signature V4)
    const response = await fetch(snsEndpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        'Authorization': `AWS4-HMAC-SHA256 Credential=${awsAccessKeyId}/${timestamp.slice(0, 8)}/${awsRegion}/sns/aws4_request`,
        'X-Amz-Date': timestamp.replace(/[:\-]|\.\d{3}/g, ''),
        'Host': host
      },
      body: params.toString()
    });

    const responseText = await response.text();
    
    if (!response.ok) {
      console.error('SNS Error:', responseText);
      return new Response(JSON.stringify({ 
        error: 'Failed to send SMS via SNS',
        details: responseText 
      }), {
        status: 500,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    // Parse SNS response to get MessageId
    const messageIdMatch = responseText.match(/<MessageId>([^<]+)<\/MessageId>/);
    const messageId = messageIdMatch ? messageIdMatch[1] : null;

    // Log the message to database
    try {
      // Find or create conversation
      let conversationId = null;
      
      if (client_id) {
        const { data: existingConversation } = await supabaseClient
          .from('conversations')
          .select('id')
          .eq('client_id', client_id)
          .single();

        if (existingConversation) {
          conversationId = existingConversation.id;
        } else {
          const { data: newConversation } = await supabaseClient
            .from('conversations')
            .insert({ client_id, job_id })
            .select('id')
            .single();
          
          conversationId = newConversation?.id;
        }
      }

      // Insert message record
      await supabaseClient
        .from('messages')
        .insert({
          conversation_id: conversationId,
          direction: 'outbound',
          sender: from || 'system',
          recipient: formattedPhone,
          body: body,
          status: 'sent',
          message_sid: messageId
        });

    } catch (dbError) {
      console.error('Database error:', dbError);
      // Don't fail the entire request if DB logging fails
    }

    return new Response(JSON.stringify({
      success: true,
      message_id: messageId,
      to: formattedPhone,
      status: 'sent'
    }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    });

  } catch (error) {
    console.error('SNS SMS Error:', error);
    return new Response(JSON.stringify({
      error: 'Internal server error',
      details: error.message
    }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
});
