
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
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    const { documentType, documentId, documentNumber } = await req.json()
    console.log(`📥 Download request for ${documentType}:`, { documentId, documentNumber })

    // Get document data
    let document;
    if (documentType === 'estimate') {
      const { data, error } = await supabaseClient
        .from('estimates')
        .select('*')
        .eq('id', documentId)
        .single()
      
      if (error) throw error;
      document = data;
    } else if (documentType === 'invoice') {
      const { data, error } = await supabaseClient
        .from('invoices')
        .select('*')
        .eq('id', documentId)
        .single()
      
      if (error) throw error;
      document = data;
    } else {
      throw new Error('Invalid document type');
    }

    if (!document) {
      throw new Error('Document not found');
    }

    // Get job and client information
    const { data: job, error: jobError } = await supabaseClient
      .from('jobs')
      .select(`
        *,
        clients(*)
      `)
      .eq('id', document.job_id)
      .single()

    if (jobError) throw jobError;

    // For now, return success with document data
    // In a real implementation, you would generate a PDF here
    return new Response(
      JSON.stringify({
        success: true,
        message: `${documentType.charAt(0).toUpperCase() + documentType.slice(1)} #${documentNumber} download initiated`,
        document: {
          id: document.id,
          number: documentType === 'estimate' ? document.estimate_number : document.invoice_number,
          total: document.total,
          status: document.status,
          client: job.clients?.name
        },
        // For now, we'll return a placeholder download URL
        // In production, this would be a real PDF file
        downloadUrl: `data:text/plain;charset=utf-8,${encodeURIComponent(
          `${documentType.toUpperCase()} #${documentNumber}\n` +
          `Client: ${job.clients?.name}\n` +
          `Total: $${document.total}\n` +
          `Status: ${document.status}\n` +
          `Date: ${new Date(document.created_at).toLocaleDateString()}`
        )}`
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      }
    )

  } catch (error) {
    console.error('Error in download-document function:', error)
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
