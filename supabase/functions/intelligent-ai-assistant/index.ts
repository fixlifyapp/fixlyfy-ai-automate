
import { serve } from 'https://deno.land/std@0.177.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.24.0'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

interface AIRequest {
  prompt: string;
  context: {
    page: string;
    userActions?: any[];
    preferences?: any[];
    currentTask?: string;
  };
  userId?: string;
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    const authHeader = req.headers.get('Authorization')
    if (!authHeader) {
      return new Response(JSON.stringify({ error: 'No authorization header' }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 401,
      })
    }

    const token = authHeader.replace('Bearer ', '')
    const { data: userData, error: userError } = await supabaseClient.auth.getUser(token)
    
    if (userError) {
      return new Response(JSON.stringify({ error: 'Invalid token' }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 401,
      })
    }

    const { prompt, context } = await req.json() as AIRequest
    const userId = userData.user.id

    // Get user's recent actions for context
    const { data: userActions } = await supabaseClient
      .from('user_actions')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .limit(20)

    // Get user preferences
    const { data: userPreferences } = await supabaseClient
      .from('user_ai_preferences')
      .select('*')
      .eq('user_id', userId)

    // Get user profile for business context
    const { data: profile } = await supabaseClient
      .from('profiles')
      .select('business_niche, role')
      .eq('id', userId)
      .single()

    // Build personalized system prompt
    const businessNiche = profile?.business_niche || 'Field Service'
    const userRole = profile?.role || 'user'
    
    let systemPrompt = `You are an intelligent AI assistant for a ${businessNiche} management platform. 
    You help ${userRole}s optimize their workflow and make better business decisions.
    
    Current context:
    - User is on: ${context.page}
    - User role: ${userRole}
    - Business type: ${businessNiche}
    `

    // Add user behavior insights
    if (userActions && userActions.length > 0) {
      const recentPages = [...new Set(userActions.slice(0, 10).map(a => a.page))]
      const commonActions = userActions.reduce((acc, action) => {
        acc[action.action_type] = (acc[action.action_type] || 0) + 1
        return acc
      }, {} as Record<string, number>)

      systemPrompt += `
      
Recent user behavior:
- Recently visited pages: ${recentPages.join(', ')}
- Common actions: ${Object.entries(commonActions).map(([action, count]) => `${action} (${count}x)`).join(', ')}
      `
    }

    // Add personalized recommendations based on page
    const pageSpecificContext = getPageSpecificContext(context.page, userActions || [])
    systemPrompt += pageSpecificContext

    systemPrompt += `
    
Provide helpful, actionable advice. Be concise and specific. Focus on improving efficiency and business outcomes.
If suggesting actions, be specific about steps to take.
`

    const openAIApiKey = Deno.env.get('OPENAI_API_KEY')
    
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${openAIApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: prompt }
        ],
        temperature: 0.7,
        max_tokens: 1000,
      }),
    })

    const aiData = await response.json()
    const aiResponse = aiData.choices[0].message.content

    // Store the recommendation for learning
    await supabaseClient
      .from('ai_recommendations')
      .insert({
        user_id: userId,
        recommendation_type: context.page,
        content: aiResponse,
        context: {
          prompt,
          page: context.page,
          user_actions_count: userActions?.length || 0
        }
      })

    return new Response(JSON.stringify({ 
      response: aiResponse,
      suggestions: generateSmartSuggestions(context.page, userActions || [])
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })

  } catch (error) {
    console.error('Error in intelligent-ai-assistant:', error)
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })
  }
})

function getPageSpecificContext(page: string, userActions: any[]): string {
  const pageActions = userActions.filter(a => a.page === page)
  
  switch (page) {
    case '/jobs':
      return `
      
Job Management Context:
- Help with job scheduling, technician assignment, and workflow optimization
- Look for patterns in job completion times and suggest improvements
- Identify bottlenecks in job processing
      `
    case '/clients':
      return `
      
Client Management Context:
- Focus on client satisfaction, retention strategies, and communication
- Analyze client patterns and suggest upselling opportunities
- Help with client segmentation and targeted approaches
      `
    case '/dashboard':
      return `
      
Dashboard Context:
- Provide business insights and KPI analysis
- Suggest actions based on current metrics
- Help identify trends and opportunities for growth
      `
    case '/schedule':
      return `
      
Schedule Management Context:
- Optimize technician schedules and route planning
- Suggest better time allocation and resource management
- Help balance workload across team members
      `
    default:
      return ''
  }
}

function generateSmartSuggestions(page: string, userActions: any[]): string[] {
  const suggestions: string[] = []
  
  switch (page) {
    case '/jobs':
      suggestions.push(
        'Review overdue jobs and prioritize urgent tasks',
        'Check technician availability for today\'s jobs',
        'Update job statuses to keep clients informed'
      )
      break
    case '/clients':
      suggestions.push(
        'Follow up with clients who haven\'t been contacted recently',
        'Review client satisfaction scores and address issues',
        'Identify opportunities for service upgrades'
      )
      break
    case '/dashboard':
      suggestions.push(
        'Analyze this week\'s performance vs targets',
        'Review revenue trends and identify growth opportunities',
        'Check team productivity and workload distribution'
      )
      break
    case '/schedule':
      suggestions.push(
        'Optimize routes to reduce travel time',
        'Balance workload across available technicians',
        'Schedule preventive maintenance for regular clients'
      )
      break
  }
  
  return suggestions
}
