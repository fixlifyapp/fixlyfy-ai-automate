
import { serve } from "https://deno.land/std@0.177.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import "https://deno.land/x/xhr@0.1.0/mod.ts";

// Define the OpenAI API interface
interface OpenAIRequest {
  model: string;
  messages: {
    role: "system" | "user" | "assistant";
    content: string;
  }[];
}

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  // CORS handling
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    // Get API key from environment variables
    const apiKey = Deno.env.get("OPENAI_API_KEY");
    if (!apiKey) {
      return new Response(
        JSON.stringify({ error: "OpenAI API key not configured" }),
        { 
          status: 500,
          headers: { ...corsHeaders, "Content-Type": "application/json" }
        }
      );
    }

    // Parse request body
    const requestData = await req.json();
    console.log("Received request data:", JSON.stringify(requestData));
    
    // Extract parameters with more flexible fallbacks
    const {
      prompt,
      context,
      systemContext,
      userPrompt,
      data,
      mode = "text",
      temperature = 0.7,
      maxTokens = 800
    } = requestData;

    // Validate that we have either prompt or userPrompt
    const finalUserPrompt = userPrompt || prompt || "";
    if (!finalUserPrompt) {
      return new Response(
        JSON.stringify({ error: "No prompt or userPrompt provided" }),
        { 
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" }
        }
      );
    }
    
    // Use either provided context or systemContext, with a fallback
    const finalSystemContext = systemContext || context || "You are a helpful assistant.";
    
    console.log("Using context:", finalSystemContext);
    console.log("Using prompt:", finalUserPrompt);

    // Prepare the message content, including data if provided
    let userMessageContent = finalUserPrompt;
    if (data) {
      userMessageContent = `Here is the data: ${JSON.stringify(data)}\n\n${finalUserPrompt}`;
    }
    
    // Prepare the request body
    const openaiRequest: OpenAIRequest = {
      model: "gpt-4o",
      messages: [
        {
          role: "system",
          content: finalSystemContext
        },
        {
          role: "user",
          content: userMessageContent
        }
      ],
    };

    console.log("Sending to OpenAI:", JSON.stringify(openaiRequest));
    
    // Send the request to the OpenAI API
    const openaiResponse = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify(openaiRequest),
    });

    if (!openaiResponse.ok) {
      const errorBody = await openaiResponse.text();
      console.error("OpenAI API error:", errorBody);
      throw new Error(`OpenAI API error: ${errorBody}`);
    }

    const result = await openaiResponse.json();
    const generatedText = result.choices[0]?.message?.content;

    if (!generatedText) {
      throw new Error("No response content from OpenAI");
    }

    console.log("Successfully generated response");

    // Return the AI-generated content in the format expected by the frontend
    return new Response(
      JSON.stringify({ generatedText }),
      { 
        status: 200,
        headers: { ...corsHeaders, "Content-Type": "application/json" }
      }
    );
  } catch (error) {
    console.error("Error:", error.message);
    return new Response(
      JSON.stringify({ error: error.message }),
      { 
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" }
      }
    );
  }
});
