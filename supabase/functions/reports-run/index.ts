
import { serve } from 'https://deno.land/std@0.177.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.24.0'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

interface RunReportRequest {
  templateId?: string;
  filters: {
    startDate: string;
    endDate: string;
    technicianId?: string;
  };
  widgets: Array<{
    type: 'chart' | 'table';
    metric: string;
    dimension?: string;
  }>;
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  if (req.method !== 'POST') {
    return new Response(JSON.stringify({ error: 'Method not allowed' }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 405,
    });
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    const body: RunReportRequest = await req.json()

    // Validate input
    if (!body.filters?.startDate || !body.filters?.endDate) {
      return new Response(JSON.stringify({ error: 'startDate and endDate are required' }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 400,
      });
    }

    const widgets = []

    for (const widget of body.widgets || []) {
      try {
        let data = []
        let columns = []

        switch (widget.metric) {
          case 'revenue':
            const { data: revenueData } = await supabaseClient
              .from('fact_jobs')
              .select('date_day, revenue, status')
              .gte('date', body.filters.startDate)
              .lte('date', body.filters.endDate)

            data = revenueData?.reduce((acc, row) => {
              const date = row.date_day
              const existing = acc.find(item => item.date === date)
              if (existing) {
                existing.revenue += row.revenue || 0
              } else {
                acc.push({ date, revenue: row.revenue || 0 })
              }
              return acc
            }, []) || []
            break

          case 'jobs':
            const { data: jobsData } = await supabaseClient
              .from('fact_jobs')
              .select('id, title, status, revenue, technician_name, client_name, date')
              .gte('date', body.filters.startDate)
              .lte('date', body.filters.endDate)

            data = jobsData || []
            columns = [
              { key: 'title', label: 'Job Title' },
              { key: 'status', label: 'Status' },
              { key: 'revenue', label: 'Revenue' },
              { key: 'technician_name', label: 'Technician' },
              { key: 'client_name', label: 'Client' },
              { key: 'date', label: 'Date' }
            ]
            break

          case 'technician_stats':
            const { data: techData } = await supabaseClient
              .from('fact_jobs')
              .select('technician_id, technician_name, revenue, status')
              .gte('date', body.filters.startDate)
              .lte('date', body.filters.endDate)

            data = techData?.reduce((acc, row) => {
              const existing = acc.find(item => item.technician_id === row.technician_id)
              if (existing) {
                existing.total_revenue += row.revenue || 0
                existing.total_jobs += 1
                if (row.status === 'completed') existing.completed_jobs += 1
              } else {
                acc.push({
                  technician_id: row.technician_id,
                  technician_name: row.technician_name,
                  total_revenue: row.revenue || 0,
                  total_jobs: 1,
                  completed_jobs: row.status === 'completed' ? 1 : 0
                })
              }
              return acc
            }, []) || []

            columns = [
              { key: 'technician_name', label: 'Technician' },
              { key: 'total_jobs', label: 'Total Jobs' },
              { key: 'completed_jobs', label: 'Completed' },
              { key: 'total_revenue', label: 'Revenue' }
            ]
            break

          default:
            data = []
        }

        widgets.push({
          id: `widget-${widgets.length + 1}`,
          type: widget.type,
          metric: widget.metric,
          dimension: widget.dimension,
          data,
          columns
        })

      } catch (error) {
        console.error(`Error processing widget ${widget.metric}:`, error)
        widgets.push({
          id: `widget-${widgets.length + 1}`,
          type: widget.type,
          metric: widget.metric,
          error: error.message,
          data: [],
          columns: []
        })
      }
    }

    return new Response(JSON.stringify({ widgets }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })

  } catch (error) {
    console.error('Error in reports-run:', error)
    return new Response(JSON.stringify({ error: error.message }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 500,
    })
  }
})
