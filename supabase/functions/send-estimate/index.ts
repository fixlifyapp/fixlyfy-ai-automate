
import { serve } from 'https://deno.land/std@0.190.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.24.0'
import { Resend } from 'npm:resend@2.0.0'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? ''
    )

    const {
      estimateId,
      sendMethod,
      recipientEmail,
      subject,
      message
    } = await req.json()

    console.log('Send estimate request:', { estimateId, sendMethod, recipientEmail })

    // Get estimate details
    const { data: estimate, error: estimateError } = await supabaseClient
      .from('estimates')
      .select(`
        *,
        jobs:job_id (
          *,
          clients:client_id (*)
        )
      `)
      .eq('id', estimateId)
      .single()

    if (estimateError || !estimate) {
      throw new Error('Estimate not found')
    }

    // Get line items
    const { data: lineItems } = await supabaseClient
      .from('line_items')
      .select('*')
      .eq('parent_type', 'estimate')
      .eq('parent_id', estimateId)

    if (sendMethod === 'email') {
      const resend = new Resend(Deno.env.get('RESEND_API_KEY'))
      
      const emailHtml = `
        <h2>Estimate ${estimate.estimate_number}</h2>
        <p>Dear ${estimate.jobs?.clients?.name || 'Valued Customer'},</p>
        <p>${message}</p>
        
        <h3>Estimate Details:</h3>
        <ul>
          ${lineItems?.map(item => 
            `<li>${item.description} - Qty: ${item.quantity} - $${item.unit_price} each</li>`
          ).join('') || ''}
        </ul>
        
        <p><strong>Total: $${estimate.total}</strong></p>
        
        <p>Thank you for choosing our services!</p>
      `

      const { data: emailData, error: emailError } = await resend.emails.send({
        from: 'estimates@fixlyfy.com',
        to: [recipientEmail],
        subject: subject || `Estimate ${estimate.estimate_number}`,
        html: emailHtml
      })

      if (emailError) {
        throw emailError
      }

      console.log('Email sent successfully:', emailData)
    }

    return new Response(
      JSON.stringify({ success: true, message: 'Estimate sent successfully' }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      }
    )
  } catch (error) {
    console.error('Error sending estimate:', error)
    return new Response(
      JSON.stringify({ success: false, error: error.message }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500,
      }
    )
  }
})
