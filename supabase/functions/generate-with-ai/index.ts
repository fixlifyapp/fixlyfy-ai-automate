
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

    const { prompt, context, mode, data, format, temperature = 0.7, maxTokens = 800 } = await req.json();

    if (!prompt) {
      throw new Error('No prompt provided');
    }

    // Build the system message based on mode and context
    let systemMessage = context || 'You are a helpful assistant for a field service management application. Provide concise, helpful responses.';
    let userPrompt = prompt;
    
    // Enhanced prompts based on mode
    switch(mode) {
      case "insights":
        systemMessage = context || 'You are an AI business analyst for a field service company. Analyze the provided data and generate actionable insights. Focus on practical recommendations that can improve business performance. Format your response with bullet points using the "•" symbol.';
        userPrompt = `${prompt}\n\nData for analysis: ${JSON.stringify(data, null, 2)}`;
        break;
      case "analytics":
        systemMessage = context || 'You are an AI data analyst for a field service company. Interpret the provided metrics and explain their significance. Focus on trends, anomalies, and actionable takeaways. Format your response with bullet points using the "•" symbol.';
        userPrompt = `${prompt}\n\nMetrics for analysis: ${JSON.stringify(data, null, 2)}`;
        break;
      case "recommendations":
        systemMessage = context || 'You are an AI recommendation engine for a field service company. Based on the provided data, suggest personalized recommendations. Focus on actionable, specific suggestions. Format your response with bullet points using the "•" symbol.';
        userPrompt = `${prompt}\n\nData for recommendations: ${JSON.stringify(data, null, 2)}`;
        break;
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
        temperature: parseFloat(temperature as string),
        max_tokens: parseInt(maxTokens as string),
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
