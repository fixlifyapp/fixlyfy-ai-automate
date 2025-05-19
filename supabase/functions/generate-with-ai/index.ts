
import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const openAIApiKey = Deno.env.get('OPENAI_API_KEY');

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

    const { prompt, context, mode, data, format } = await req.json();

    if (!prompt) {
      throw new Error('No prompt provided');
    }

    // Build the system message based on mode and context
    let systemMessage = context || 'You are a helpful assistant for a field service management application. Provide concise, helpful responses.';
    let userPrompt = prompt;
    
    // Enhanced prompts based on mode
    if (mode === "insights") {
      systemMessage = context || 'You are an AI business analyst for a field service company. Analyze the provided data and generate actionable insights. Focus on practical recommendations that can improve business performance.';
      userPrompt = `${prompt}\n\nData for analysis: ${JSON.stringify(data, null, 2)}`;
    } 
    else if (mode === "analytics") {
      systemMessage = context || 'You are an AI data analyst for a field service company. Interpret the provided metrics and explain their significance. Focus on trends, anomalies, and actionable takeaways.';
      userPrompt = `${prompt}\n\nMetrics for analysis: ${JSON.stringify(data, null, 2)}`;
    }

    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${openAIApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-4o',
        messages: [
          { role: 'system', content: systemMessage },
          { role: 'user', content: userPrompt }
        ],
        temperature: mode === "analytics" ? 0.3 : 0.7, // Lower temperature for analytics for more factual responses
        max_tokens: mode === "insights" ? 800 : 500, // More tokens for insights
      }),
    });

    if (!response.ok) {
      const errorData = await response.text();
      console.error('OpenAI API error:', errorData);
      throw new Error(`OpenAI API error: ${response.status} ${response.statusText}`);
    }

    const data = await response.json();
    const generatedText = data.choices[0].message.content;

    return new Response(JSON.stringify({ generatedText }), {
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
