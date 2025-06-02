import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  // This function is no longer used with TeXML approach
  // Keeping it for potential future use with direct WebRTC/WebSocket connections
  
  console.log('Realtime voice dispatch called (not used with TeXML)');
  
  return new Response(JSON.stringify({ 
    message: 'This endpoint is not used with TeXML approach' 
  }), {
    headers: { ...corsHeaders, 'Content-Type': 'application/json' }
  });
});
