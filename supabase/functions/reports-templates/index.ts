
import { serve } from 'https://deno.land/std@0.177.0/http/server.ts'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

const reportTemplates = [
  {
    id: 'jobs-overview',
    name: 'Jobs Overview',
    description: 'Comprehensive view of all jobs, revenue, and performance metrics',
    category: 'Operations',
    widgets: [
      { type: 'chart', metric: 'revenue', dimension: 'date' },
      { type: 'table', metric: 'jobs', dimension: 'status' }
    ]
  },
  {
    id: 'sales-performance',
    name: 'Sales Performance',
    description: 'Track sales metrics, conversion rates, and revenue trends',
    category: 'Sales',
    widgets: [
      { type: 'chart', metric: 'revenue', dimension: 'month' },
      { type: 'chart', metric: 'conversion_rate', dimension: 'week' }
    ]
  },
  {
    id: 'technician-performance',
    name: 'Technician Performance',
    description: 'Individual and team technician productivity and metrics',
    category: 'Team',
    widgets: [
      { type: 'table', metric: 'technician_stats', dimension: 'technician' },
      { type: 'chart', metric: 'jobs_completed', dimension: 'technician' }
    ]
  },
  {
    id: 'financial-summary',
    name: 'Financial Summary',
    description: 'Revenue, expenses, profit margins, and financial health',
    category: 'Finance',
    widgets: [
      { type: 'chart', metric: 'profit_margin', dimension: 'month' },
      { type: 'table', metric: 'expenses', dimension: 'category' }
    ]
  }
];

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  if (req.method !== 'GET') {
    return new Response(JSON.stringify({ error: 'Method not allowed' }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 405,
    });
  }

  try {
    return new Response(JSON.stringify({ templates: reportTemplates }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 500,
    });
  }
});
