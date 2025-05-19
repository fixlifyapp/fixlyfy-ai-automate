
import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

// Get environment variables
const openAIApiKey = Deno.env.get('OPENAI_API_KEY');
const supabaseUrl = Deno.env.get('SUPABASE_URL');
const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');

// Initialize Supabase client with service role key
const supabase = createClient(supabaseUrl!, supabaseServiceKey!);

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    if (!openAIApiKey) {
      throw new Error('OPENAI_API_KEY is not set in environment variables');
    }

    const { prompt, context, mode, data, format, temperature = 0.7, maxTokens = 800, fetchBusinessData = false, userId } = await req.json();

    if (!prompt) {
      throw new Error('No prompt provided');
    }
    
    // Extract authorization header to get the user's JWT token
    const authHeader = req.headers.get('Authorization');
    let userIdFromToken = null;
    
    if (authHeader && authHeader.startsWith('Bearer ')) {
      const token = authHeader.substring(7);
      try {
        // Verify the token and get the user ID
        const { data: { user }, error: authError } = await supabase.auth.getUser(token);
        if (user && !authError) {
          userIdFromToken = user.id;
          console.log('User authenticated:', userIdFromToken);
        }
      } catch (error) {
        console.error('Error verifying token:', error);
      }
    }
    
    // Use the user ID from the token or fallback to the one provided in the request
    const currentUserId = userIdFromToken || userId;
    
    // Build the system message based on mode and context
    let systemMessage = context || 'You are a helpful assistant for a field service management application. Provide concise, helpful responses.';
    let userPrompt = prompt;
    let businessData = data || {};
    
    // Fetch business data if requested and not already provided
    if (fetchBusinessData && !data) {
      console.log('Fetching business data from database...');
      console.log('Current user ID:', currentUserId);
      
      try {
        // Fetch metrics data - add more queries as needed
        let clientsQuery = supabase.from('clients').select('*');
        let jobsQuery = supabase.from('jobs').select('*');
        
        // If we have a user ID, filter data by user
        if (currentUserId) {
          clientsQuery = clientsQuery.eq('created_by', currentUserId);
          jobsQuery = jobsQuery.eq('created_by', currentUserId);
          console.log('Filtering data for user:', currentUserId);
        }
        
        const [clientsResult, jobsResult] = await Promise.all([
          clientsQuery,
          jobsQuery
        ]);
        
        // Calculate basic metrics
        const clients = clientsResult.data || [];
        const jobs = jobsResult.data || [];
        
        // Calculate revenue from jobs
        let totalRevenue = 0;
        const completedJobs = jobs.filter(job => job.status === 'completed');
        
        // Count jobs by status
        const jobsByStatus = jobs.reduce((acc: Record<string, number>, job: any) => {
          acc[job.status] = (acc[job.status] || 0) + 1;
          return acc;
        }, {});
        
        businessData = {
          clientCount: clients.length,
          jobCount: jobs.length,
          completedJobCount: completedJobs.length,
          revenue: totalRevenue,
          jobsByStatus,
          clients: clients.slice(0, 10), // Limit to first 10 clients
          recentJobs: jobs.slice(0, 5)  // Limit to 5 most recent jobs
        };
        
        console.log('Business data fetched successfully');
        console.log('Business metrics:', { 
          clientCount: businessData.clientCount,
          jobCount: businessData.jobCount,
          completedJobCount: businessData.completedJobCount
        });
      } catch (error) {
        console.error('Error fetching business data:', error);
        businessData = { error: 'Failed to fetch business data' };
      }
    }
    
    // Enhanced prompts based on mode
    switch(mode) {
      case "insights":
        systemMessage = context || 'You are an AI business analyst for a field service company. Analyze the provided data and generate actionable insights. Focus on practical recommendations that can improve business performance. Format your response with bullet points using the "•" symbol.';
        userPrompt = `${prompt}\n\nData for analysis: ${JSON.stringify(businessData, null, 2)}`;
        break;
      case "analytics":
        systemMessage = context || 'You are an AI data analyst for a field service company. Interpret the provided metrics and explain their significance. Focus on trends, anomalies, and actionable takeaways. Format your response with bullet points using the "•" symbol.';
        userPrompt = `${prompt}\n\nMetrics for analysis: ${JSON.stringify(businessData, null, 2)}`;
        break;
      case "recommendations":
        systemMessage = context || 'You are an AI recommendation engine for a field service company. Based on the provided data, suggest personalized recommendations. Focus on actionable, specific suggestions. Format your response with bullet points using the "•" symbol.';
        userPrompt = `${prompt}\n\nData for recommendations: ${JSON.stringify(businessData, null, 2)}`;
        break;
      case "business":
        systemMessage = 'You are an AI business assistant with access to the company\'s data. Your role is to analyze the provided business metrics and respond to queries with specific, data-backed insights. If the data shows specific numbers, mention them. If the data is incomplete, acknowledge this and explain what additional information would be helpful.';
        userPrompt = `${prompt}\n\nCompany business data: ${JSON.stringify(businessData, null, 2)}`;
        break;
      default:
        if (fetchBusinessData) {
          userPrompt = `${prompt}\n\nHere is the current business data for context: ${JSON.stringify(businessData, null, 2)}`;
        }
    }

    console.log('Making OpenAI request with model: gpt-4o');
    console.log('Business data sample:', Object.keys(businessData));
    
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${openAIApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-4o',  // Explicitly using gpt-4o model
        messages: [
          { role: 'system', content: systemMessage },
          { role: 'user', content: userPrompt }
        ],
        temperature: parseFloat(temperature.toString()),
        max_tokens: parseInt(maxTokens.toString()),
      }),
    });

    if (!response.ok) {
      const errorData = await response.text();
      console.error('OpenAI API error:', errorData);
      throw new Error(`OpenAI API error: ${response.status} ${response.statusText} - ${errorData}`);
    }

    const responseData = await response.json();
    console.log('OpenAI response received:', responseData);
    
    const generatedText = responseData.choices[0].message.content;

    return new Response(JSON.stringify({ generatedText, businessData: fetchBusinessData ? businessData : null }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('Error in generate-with-ai function:', error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
