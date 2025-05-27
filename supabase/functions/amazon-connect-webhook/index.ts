
import { serve } from 'https://deno.land/std@0.177.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.24.0'

interface ConnectCallEvent {
  contactId: string;
  instanceId: string;
  phoneNumber: string;
  callDuration?: number;
  appointmentScheduled: boolean;
  appointmentData?: {
    service: string;
    date: string;
    time: string;
    clientName: string;
    clientPhone: string;
    address?: string;
    urgency?: 'normal' | 'urgent' | 'emergency';
    estimatedCost?: number;
  };
  aiTranscript?: string;
  callStatus: string;
}

serve(async (req) => {
  try {
    if (req.method !== 'POST') {
      return new Response(JSON.stringify({ error: 'Method not allowed' }), {
        status: 405,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    const callEvent: ConnectCallEvent = await req.json();

    console.log('Amazon Connect webhook received:', callEvent);

    // Validate required fields
    if (!callEvent.contactId || !callEvent.instanceId || !callEvent.phoneNumber) {
      return new Response(JSON.stringify({ 
        error: 'Missing required fields: contactId, instanceId, phoneNumber' 
      }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    // Format phone number for consistency
    const formattedPhone = callEvent.phoneNumber.startsWith('+') 
      ? callEvent.phoneNumber 
      : `+1${callEvent.phoneNumber.replace(/\D/g, '')}`;

    // Find AI agent config by instance ID to determine the tenant/company
    const { data: aiConfig, error: configError } = await supabaseClient
      .from('ai_agent_configs')
      .select('*')
      .eq('connect_instance_arn', callEvent.instanceId)
      .eq('is_active', true)
      .single();

    if (configError || !aiConfig) {
      console.error('AI Agent config not found for instance:', callEvent.instanceId);
      return new Response(JSON.stringify({ 
        error: 'AI Agent configuration not found for this Connect instance' 
      }), {
        status: 404,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    // Log the call to Amazon Connect calls table
    const { data: connectCall, error: callLogError } = await supabaseClient
      .from('amazon_connect_calls')
      .insert({
        contact_id: callEvent.contactId,
        instance_id: callEvent.instanceId,
        phone_number: formattedPhone,
        ai_agent_config_id: aiConfig.id,
        call_duration: callEvent.callDuration,
        appointment_scheduled: callEvent.appointmentScheduled,
        appointment_data: callEvent.appointmentData,
        ai_transcript: callEvent.aiTranscript,
        call_status: callEvent.callStatus
      })
      .select()
      .single();

    if (callLogError) {
      console.error('Failed to log Connect call:', callLogError);
    }

    // If appointment was scheduled, create/update client and job
    if (callEvent.appointmentScheduled && callEvent.appointmentData) {
      const appointmentData = callEvent.appointmentData;
      
      // Find or create client
      let clientId = null;
      const { data: existingClient } = await supabaseClient
        .from('clients')
        .select('id')
        .eq('phone', formattedPhone)
        .single();

      if (existingClient) {
        clientId = existingClient.id;
        
        // Update client name if we have it from the call
        if (appointmentData.clientName) {
          await supabaseClient
            .from('clients')
            .update({ 
              name: appointmentData.clientName,
              updated_at: new Date().toISOString()
            })
            .eq('id', clientId);
        }
      } else {
        // Create new client
        const { data: newClient, error: clientError } = await supabaseClient
          .from('clients')
          .insert({
            name: appointmentData.clientName || 'New Client',
            phone: formattedPhone,
            address: appointmentData.address,
            type: 'Residential',
            status: 'active',
            created_by: aiConfig.user_id
          })
          .select('id')
          .single();

        if (clientError) {
          console.error('Failed to create client:', clientError);
          return new Response(JSON.stringify({ 
            error: 'Failed to create client record' 
          }), {
            status: 500,
            headers: { 'Content-Type': 'application/json' }
          });
        }

        clientId = newClient.id;
      }

      // Update Amazon Connect call with client_id
      if (connectCall) {
        await supabaseClient
          .from('amazon_connect_calls')
          .update({ client_id: clientId })
          .eq('id', connectCall.id);
      }

      // Generate job ID
      const jobId = `JOB-${Date.now()}`;
      
      // Parse appointment date and time
      const appointmentDateTime = new Date(`${appointmentData.date} ${appointmentData.time}`);
      
      // Determine job status based on urgency
      let jobStatus = 'scheduled';
      if (appointmentData.urgency === 'emergency') {
        jobStatus = 'urgent';
      }

      // Calculate estimated cost with emergency surcharge if needed
      let estimatedCost = appointmentData.estimatedCost || aiConfig.diagnostic_price;
      if (appointmentData.urgency === 'emergency') {
        estimatedCost += aiConfig.emergency_surcharge;
      }

      // Create job
      const { data: newJob, error: jobError } = await supabaseClient
        .from('jobs')
        .insert({
          id: jobId,
          client_id: clientId,
          title: `${appointmentData.service} Service`,
          description: `AI Agent scheduled appointment: ${appointmentData.service}`,
          service: appointmentData.service,
          date: appointmentDateTime.toISOString(),
          schedule_start: appointmentDateTime.toISOString(),
          schedule_end: new Date(appointmentDateTime.getTime() + 2 * 60 * 60 * 1000).toISOString(), // 2 hours
          status: jobStatus,
          address: appointmentData.address,
          notes: `Scheduled via AI Agent. Phone: ${formattedPhone}`,
          created_by: aiConfig.user_id,
          tags: appointmentData.urgency ? [appointmentData.urgency] : []
        })
        .select()
        .single();

      if (jobError) {
        console.error('Failed to create job:', jobError);
        return new Response(JSON.stringify({ 
          error: 'Failed to create job record' 
        }), {
          status: 500,
          headers: { 'Content-Type': 'application/json' }
        });
      }

      // Send confirmation SMS to client
      try {
        const confirmationMessage = `Hi ${appointmentData.clientName}, your ${appointmentData.service} appointment is confirmed for ${appointmentData.date} at ${appointmentData.time}. Job ID: ${jobId}. We'll contact you before arrival.`;
        
        // Use Amazon SNS to send confirmation
        await fetch(`${Deno.env.get('SUPABASE_URL')}/functions/v1/amazon-sns-sms`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')}`
          },
          body: JSON.stringify({
            to: formattedPhone,
            body: confirmationMessage,
            client_id: clientId,
            job_id: jobId
          })
        });
      } catch (smsError) {
        console.error('Failed to send confirmation SMS:', smsError);
        // Don't fail the entire request if SMS fails
      }

      // Log to job history
      await supabaseClient
        .from('job_history')
        .insert({
          job_id: jobId,
          type: 'job-created',
          title: 'Job Created via AI Agent',
          description: `Job automatically created from Amazon Connect AI Agent call. Contact ID: ${callEvent.contactId}`,
          user_id: aiConfig.user_id,
          user_name: 'AI Agent',
          new_value: { 
            source: 'amazon_connect_ai',
            contact_id: callEvent.contactId,
            estimated_cost: estimatedCost
          }
        });

      return new Response(JSON.stringify({
        success: true,
        client_id: clientId,
        job_id: jobId,
        estimated_cost: estimatedCost,
        message: 'Appointment scheduled and job created successfully'
      }), {
        status: 200,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    // If no appointment was scheduled, just log the call
    return new Response(JSON.stringify({
      success: true,
      message: 'Call logged successfully',
      appointment_scheduled: false
    }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    });

  } catch (error) {
    console.error('Amazon Connect webhook error:', error);
    return new Response(JSON.stringify({
      error: 'Internal server error',
      details: error.message
    }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
});
