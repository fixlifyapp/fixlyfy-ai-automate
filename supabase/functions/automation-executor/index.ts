
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface AutomationExecutionRequest {
  automationId: string;
  triggerData: Record<string, any>;
  entityId?: string;
  entityType?: string;
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    const { automationId, triggerData, entityId, entityType }: AutomationExecutionRequest = await req.json();

    // Get automation details with actions
    const { data: automation, error: automationError } = await supabaseClient
      .from('automations')
      .select(`
        *,
        automation_actions (
          *
        )
      `)
      .eq('id', automationId)
      .eq('status', 'active')
      .single();

    if (automationError || !automation) {
      return new Response(JSON.stringify({ error: 'Automation not found or inactive' }), {
        headers: { 'Content-Type': 'application/json', ...corsHeaders },
        status: 404,
      });
    }

    // Log automation execution start
    const { data: executionLog } = await supabaseClient
      .from('automation_executions')
      .insert({
        automation_id: automationId,
        trigger_data: triggerData,
        status: 'running',
        started_at: new Date().toISOString()
      })
      .select()
      .single();

    let successfulActions = 0;
    let failedActions = 0;
    const actionResults = [];

    // Execute actions in sequence
    for (const action of automation.automation_actions.sort((a, b) => a.sequence_order - b.sequence_order)) {
      try {
        // Add delay if specified
        if (action.delay_minutes > 0) {
          console.log(`Waiting ${action.delay_minutes} minutes before executing action ${action.id}`);
          // In a real implementation, you might want to use a queue system for delays
          await new Promise(resolve => setTimeout(resolve, action.delay_minutes * 60 * 1000));
        }

        let result;
        
        switch (action.action_type) {
          case 'send_email':
            result = await executeEmailAction(supabaseClient, action, triggerData);
            break;
          case 'send_sms':
            result = await executeSmsAction(supabaseClient, action, triggerData);
            break;
          case 'create_task':
            result = await executeTaskAction(supabaseClient, action, triggerData);
            break;
          default:
            throw new Error(`Unknown action type: ${action.action_type}`);
        }

        actionResults.push({
          actionId: action.id,
          actionType: action.action_type,
          status: 'success',
          result
        });
        successfulActions++;

      } catch (error) {
        console.error(`Error executing action ${action.id}:`, error);
        actionResults.push({
          actionId: action.id,
          actionType: action.action_type,
          status: 'failed',
          error: error.message
        });
        failedActions++;
      }
    }

    // Update execution log
    await supabaseClient
      .from('automation_executions')
      .update({
        status: failedActions > 0 ? 'completed_with_errors' : 'completed',
        completed_at: new Date().toISOString(),
        actions_executed: successfulActions,
        actions_failed: failedActions,
        execution_results: actionResults
      })
      .eq('id', executionLog.id);

    return new Response(
      JSON.stringify({ 
        success: true, 
        executionId: executionLog.id,
        actionsExecuted: successfulActions,
        actionsFailed: failedActions,
        results: actionResults
      }),
      {
        headers: { 'Content-Type': 'application/json', ...corsHeaders },
      }
    );

  } catch (error) {
    console.error('Error in automation-executor function:', error);
    return new Response(
      JSON.stringify({ error: error.message || 'Failed to execute automation' }),
      {
        status: 500,
        headers: { 'Content-Type': 'application/json', ...corsHeaders },
      }
    );
  }
});

async function executeEmailAction(supabaseClient: any, action: any, triggerData: any) {
  const config = action.action_config;
  
  // Replace variables in message
  let message = config.message || '';
  let subject = config.subject || 'Automated Message';
  
  // Replace common variables
  Object.keys(triggerData).forEach(key => {
    const value = triggerData[key];
    message = message.replace(new RegExp(`{{${key}}}`, 'g'), value);
    subject = subject.replace(new RegExp(`{{${key}}}`, 'g'), value);
  });

  // Get recipient email
  let recipientEmail = config.to_email;
  if (triggerData.clientEmail) {
    recipientEmail = triggerData.clientEmail;
  }

  if (!recipientEmail) {
    throw new Error('No recipient email found');
  }

  // Create HTML email with tracking
  const emailHtml = `
    <html>
      <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333;">
        <div style="max-width: 600px; margin: 0 auto; padding: 20px;">
          ${message.replace(/\n/g, '<br>')}
          
          <!-- Tracking pixel -->
          <img src="${Deno.env.get('SUPABASE_URL')}/functions/v1/track-email-open?type=automation&id=${action.automation_id}" width="1" height="1" style="display:none;" />
        </div>
      </body>
    </html>
  `;

  // Call send-email function
  const { data: emailResult, error: emailError } = await supabaseClient.functions.invoke('send-email', {
    body: {
      to: recipientEmail,
      subject: subject,
      html: emailHtml,
      text: message,
      conversationId: action.automation_id
    }
  });

  if (emailError) {
    throw emailError;
  }

  return { messageId: emailResult.messageId, recipient: recipientEmail };
}

async function executeSmsAction(supabaseClient: any, action: any, triggerData: any) {
  // SMS implementation would go here
  // For now, just log that SMS would be sent
  console.log('SMS action would be executed:', action);
  return { status: 'sms_not_implemented' };
}

async function executeTaskAction(supabaseClient: any, action: any, triggerData: any) {
  const config = action.action_config;
  
  // Create a task
  const { data: task, error: taskError } = await supabaseClient
    .from('tasks')
    .insert({
      title: config.title || 'Automated Task',
      description: config.description || '',
      status: 'pending',
      created_by_automation: true,
      automation_id: action.automation_id
    })
    .select()
    .single();

  if (taskError) {
    throw taskError;
  }

  return { taskId: task.id };
}
