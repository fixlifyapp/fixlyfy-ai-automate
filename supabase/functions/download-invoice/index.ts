
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

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
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
    )

    const { invoiceId, jobId } = await req.json()

    // Get invoice data
    const { data: invoice, error: invoiceError } = await supabaseClient
      .from('invoices')
      .select('*')
      .eq('id', invoiceId)
      .single()

    if (invoiceError) {
      throw new Error(`Failed to fetch invoice: ${invoiceError.message}`)
    }

    // Get job and client data
    const { data: job, error: jobError } = await supabaseClient
      .from('jobs')
      .select(`
        *,
        clients(*)
      `)
      .eq('id', jobId)
      .single()

    if (jobError) {
      throw new Error(`Failed to fetch job data: ${jobError.message}`)
    }

    // Get company settings
    const { data: company, error: companyError } = await supabaseClient
      .from('company_settings')
      .select('*')
      .limit(1)
      .single()

    if (companyError) {
      console.warn('No company settings found, using defaults')
    }

    // Generate PDF (this is a simplified implementation)
    // In a real implementation, you would use a PDF generation library
    const pdfContent = generateInvoicePDF(invoice, job, company)
    
    // For now, return a success response with a placeholder PDF URL
    // In production, you would upload the PDF to storage and return the URL
    return new Response(
      JSON.stringify({
        success: true,
        message: 'PDF generated successfully',
        pdfUrl: `data:application/pdf;base64,${btoa(pdfContent)}`
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      },
    )

  } catch (error) {
    console.error('Error in download-invoice function:', error)
    return new Response(
      JSON.stringify({
        success: false,
        error: error.message
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500,
      },
    )
  }
})

function generateInvoicePDF(invoice: any, job: any, company: any) {
  // This is a simplified PDF generation
  // In production, use a proper PDF library like jsPDF or Puppeteer
  const content = `
Invoice #${invoice.invoice_number}
Company: ${company?.company_name || 'Your Company'}
Client: ${job.clients?.name || 'Client'}
Amount: $${invoice.total}
Status: ${invoice.status}
Created: ${new Date(invoice.created_at).toLocaleDateString()}
`
  return content
}
