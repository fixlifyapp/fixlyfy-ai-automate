
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
    console.log('📬 Approval notification request received');
    
    const supabaseAdmin = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    const requestBody = await req.json()
    console.log('Request body:', requestBody);
    
    const { 
      approvalId, 
      action, 
      comments, 
      documentType, 
      documentNumber, 
      clientName 
    } = requestBody;

    if (!approvalId || !action || !documentType) {
      throw new Error('Missing required fields');
    }

    // Get the approval details
    const { data: approval, error: approvalError } = await supabaseAdmin
      .from('document_approvals')
      .select('*')
      .eq('id', approvalId)
      .single();

    if (approvalError || !approval) {
      throw new Error('Approval record not found');
    }

    // Find the document owner (user who created it)
    let ownerId;
    if (documentType === 'estimate') {
      const { data: estimate } = await supabaseAdmin
        .from('estimates')
        .select('jobs!inner(created_by)')
        .eq('id', approval.document_id)
        .single();
      ownerId = estimate?.jobs?.created_by;
    } else {
      const { data: invoice } = await supabaseAdmin
        .from('invoices')
        .select('jobs!inner(created_by)')
        .eq('id', approval.document_id)
        .single();
      ownerId = invoice?.jobs?.created_by;
    }

    if (!ownerId) {
      console.warn('Could not find document owner for notification');
      return new Response(JSON.stringify({ success: true, message: 'No owner found' }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    // Get user's phone number for notification
    const { data: userPhoneNumbers } = await supabaseAdmin
      .from('telnyx_phone_numbers')
      .select('phone_number')
      .eq('user_id', ownerId)
      .eq('status', 'active')
      .limit(1);

    if (!userPhoneNumbers || userPhoneNumbers.length === 0) {
      console.warn('No active phone number found for user');
      return new Response(JSON.stringify({ success: true, message: 'No phone number' }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    const userPhone = userPhoneNumbers[0].phone_number;

    // Get message template for this notification type
    const templateType = `${documentType}_${action}`;
    const { data: template } = await supabaseAdmin
      .from('message_templates')
      .select('message_content')
      .eq('user_id', ownerId)
      .eq('template_type', templateType)
      .eq('is_active', true)
      .order('is_default', { ascending: false })
      .limit(1);

    // Create notification message
    let notificationMessage;
    if (template && template.length > 0) {
      // Use custom template with variable replacement
      notificationMessage = template[0].message_content
        .replace('{client_name}', clientName || approval.client_name || 'Client')
        .replace('{estimate_number}', documentNumber)
        .replace('{invoice_number}', documentNumber)
        .replace('{rejection_reason}', comments || 'No reason provided')
        .replace('{total}', approval.total?.toString() || '0.00')
        .replace('{amount_due}', approval.amount_due?.toString() || '0.00');
    } else {
      // Default notification message
      const actionText = action === 'approved' ? 'approved' : 'rejected';
      notificationMessage = `${clientName || approval.client_name || 'Client'} has ${actionText} ${documentType} #${documentNumber}`;
      
      if (comments) {
        notificationMessage += `. Reason: ${comments}`;
      }
    }

    console.log('📱 Sending notification to user:', userPhone);
    console.log('📝 Notification message:', notificationMessage);

    // Send notification via SMS using telnyx-sms function
    const { data: smsData, error: smsError } = await supabaseAdmin.functions.invoke('telnyx-sms', {
      body: {
        recipientPhone: userPhone,
        message: notificationMessage,
        client_id: approval.client_id,
        job_id: '' // No job context for notifications
      }
    });

    if (smsError) {
      console.error('❌ Failed to send notification SMS:', smsError);
      // Don't throw error - approval should still succeed even if notification fails
    } else {
      console.log('✅ Notification SMS sent successfully');
    }

    // If estimate was approved, check if we should send deposit request
    if (documentType === 'estimate' && action === 'approved') {
      console.log('💰 Checking for deposit request...');
      
      const { data: depositTemplate } = await supabaseAdmin
        .from('message_templates')
        .select('message_content')
        .eq('user_id', ownerId)
        .eq('template_type', 'deposit_request')
        .eq('is_active', true)
        .order('is_default', { ascending: false })
        .limit(1);

      if (depositTemplate && depositTemplate.length > 0) {
        // Get estimate total for deposit calculation
        const { data: estimate } = await supabaseAdmin
          .from('estimates')
          .select('total')
          .eq('id', approval.document_id)
          .single();

        const depositAmount = ((estimate?.total || 0) * 0.5).toFixed(2);
        
        let depositMessage = depositTemplate[0].message_content
          .replace('{client_name}', clientName || approval.client_name || 'valued customer')
          .replace('{estimate_number}', documentNumber)
          .replace('{deposit_amount}', depositAmount)
          .replace('{payment_link}', 'Contact us for payment details'); // Placeholder for now

        console.log('💳 Sending deposit request...');
        
        // Send deposit request to client
        const { error: depositError } = await supabaseAdmin.functions.invoke('telnyx-sms', {
          body: {
            recipientPhone: approval.client_phone,
            message: depositMessage,
            client_id: approval.client_id,
            job_id: ''
          }
        });

        if (depositError) {
          console.error('❌ Failed to send deposit request:', depositError);
        } else {
          console.log('✅ Deposit request sent successfully');
        }
      }
    }

    return new Response(
      JSON.stringify({ 
        success: true, 
        message: 'Approval notification sent successfully'
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      }
    )
  } catch (error) {
    console.error('❌ Error sending approval notification:', error);
    return new Response(
      JSON.stringify({ 
        success: false, 
        error: error.message 
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500,
      }
    )
  }
})
