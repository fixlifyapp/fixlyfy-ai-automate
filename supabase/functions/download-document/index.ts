
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
    console.log(`📥 Downloading ${documentType}:`, { documentId, documentNumber })

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

    // Get job and client information for PDF generation
    const { data: job, error: jobError } = await supabaseClient
      .from('jobs')
      .select(`
        *,
        clients(*)
      `)
      .eq('id', document.job_id)
      .single()

    if (jobError) throw jobError;

    // Get company settings for PDF generation
    const { data: company, error: companyError } = await supabaseClient
      .from('company_settings')
      .select('*')
      .limit(1)
      .single()

    if (companyError) {
      console.warn('No company settings found, using defaults')
    }

    // Generate a simple PDF content (in production, use a proper PDF library)
    const pdfContent = generateDocumentPDF(document, job, company, documentType)
    
    // For now, return a data URL (in production, you would upload to storage and return the URL)
    return new Response(
      JSON.stringify({
        success: true,
        downloadUrl: `data:application/pdf;base64,${btoa(pdfContent)}`,
        filename: `${documentType}-${documentNumber}.pdf`
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

function generateDocumentPDF(document: any, job: any, company: any, documentType: string) {
  // This is a simplified PDF generation
  // In production, use a proper PDF library like jsPDF or Puppeteer
  const content = `
${documentType.toUpperCase()} #${documentType === 'estimate' ? document.estimate_number : document.invoice_number}

Company: ${company?.company_name || 'Fixlify Services'}
Address: ${company?.company_address || '123 Business St'}
Phone: ${company?.company_phone || '(555) 123-4567'}

Client: ${job.clients?.name || 'Client Name'}
Email: ${job.clients?.email || 'client@email.com'}
${job.clients?.phone ? `Phone: ${job.clients.phone}` : ''}

Job: ${job.title || 'Service Call'}
${job.description ? `Description: ${job.description}` : ''}
${job.address ? `Address: ${job.address}` : ''}

Amount: $${document.total || 0}
Status: ${document.status || 'draft'}
Created: ${new Date(document.created_at).toLocaleDateString()}
${documentType === 'invoice' && document.due_date ? `Due Date: ${new Date(document.due_date).toLocaleDateString()}` : ''}

${document.notes ? `Notes: ${document.notes}` : ''}
`
  return content
}
