
import { serve } from "https://deno.land/std@0.177.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

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
    // Get Supabase connection details from environment variables
    const supabaseUrl = Deno.env.get("SUPABASE_URL");
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
    
    if (!supabaseUrl || !supabaseServiceKey) {
      throw new Error("Missing Supabase configuration");
    }
    
    // Initialize Supabase client with service role key for admin access
    const supabase = createClient(supabaseUrl, supabaseServiceKey);
    
    // Check if the fields already exist in the schema
    const { data: columnsData, error: columnsError } = await supabase
      .from('profiles')
      .select()
      .limit(1);
    
    if (columnsError) {
      throw columnsError;
    }
    
    // Check if the columns already exist
    const needsUpdate = columnsData && columnsData[0] && 
      (!('business_niche' in columnsData[0]) || !('referral_source' in columnsData[0]));
    
    if (!needsUpdate) {
      return new Response(
        JSON.stringify({ message: "Schema is already updated" }),
        { 
          headers: { ...corsHeaders, "Content-Type": "application/json" },
          status: 200
        }
      );
    }
    
    // Execute SQL to add the new columns to the profiles table
    const { error: alterError } = await supabase.rpc('exec_sql', {
      sql_query: `
        ALTER TABLE public.profiles 
        ADD COLUMN IF NOT EXISTS business_niche TEXT,
        ADD COLUMN IF NOT EXISTS referral_source TEXT;
      `
    });
    
    if (alterError) {
      throw alterError;
    }
    
    return new Response(
      JSON.stringify({ success: true, message: "Schema updated successfully" }),
      { 
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 200
      }
    );
  } catch (error) {
    console.error("Error updating schema:", error);
    
    return new Response(
      JSON.stringify({ error: error.message }),
      { 
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 500
      }
    );
  }
});
