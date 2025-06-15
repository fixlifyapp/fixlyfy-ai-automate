
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
    const url = new URL(req.url);
    const token = url.searchParams.get('token');

    if (!token) {
      throw new Error('Access token is required');
    }

    console.log('Validating document access token:', token.substring(0, 20) + '...');

    const supabaseAdmin = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    // Validate the access token
    const { data: accessData, error: accessError } = await supabaseAdmin.rpc('validate_document_access', {
      p_token: token
    });

    if (accessError || !accessData || accessData.length === 0) {
      console.error('Invalid or expired access token:', accessError);
      return new Response(
        JSON.stringify({ error: 'Invalid or expired access link' }),
        {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 401,
        }
      )
    }

    const access = accessData[0];
    if (!access.is_valid) {
      return new Response(
        JSON.stringify({ error: 'Access link has expired' }),
        {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 401,
        }
      )
    }

    console.log('Valid access for document:', access.document_type, access.document_id);

    // Fetch the document data based on type
    let documentData = null;
    let lineItems = [];

    if (access.document_type === 'estimate') {
      const { data: estimate, error: estimateError } = await supabaseAdmin
        .from('estimates')
        .select('*')
        .eq('id', access.document_id)
        .single();

      if (estimateError || !estimate) {
        throw new Error('Estimate not found');
      }
      documentData = estimate;
    } else if (access.document_type === 'invoice') {
      const { data: invoice, error: invoiceError } = await supabaseAdmin
        .from('invoices')
        .select('*')
        .eq('id', access.document_id)
        .single();

      if (invoiceError || !invoice) {
        throw new Error('Invoice not found');
      }
      documentData = invoice;
    }

    // Fetch line items
    const { data: lineItemsData, error: lineItemsError } = await supabaseAdmin
      .from('line_items')
      .select('*')
      .eq('parent_id', access.document_id)
      .eq('parent_type', access.document_type);

    if (!lineItemsError && lineItemsData) {
      lineItems = lineItemsData;
    }

    // Fetch job and client information
    const { data: job, error: jobError } = await supabaseAdmin
      .from('jobs')
      .select('*')
      .eq('id', documentData.job_id)
      .single();

    let client = null;
    if (!jobError && job?.client_id) {
      const { data: clientData, error: clientError } = await supabaseAdmin
        .from('clients')
        .select('*')
        .eq('id', job.client_id)
        .single();
      
      if (!clientError) {
        client = clientData;
      }
    }

    // Get company settings
    const { data: companySettings } = await supabaseAdmin
      .from('company_settings')
      .select('*')
      .limit(1)
      .maybeSingle();

    console.log('Document data retrieved successfully');

    return new Response(
      JSON.stringify({
        success: true,
        document: {
          ...documentData,
          line_items: lineItems
        },
        job: job || null,
        client: client || null,
        company: companySettings || null,
        document_type: access.document_type,
        client_email: access.client_email
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      }
    )
  } catch (error) {
    console.error('Error in secure document viewer:', error);
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
