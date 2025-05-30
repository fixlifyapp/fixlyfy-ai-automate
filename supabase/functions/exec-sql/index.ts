
import { serve } from 'https://deno.land/std@0.177.0/http/server.ts'

// SECURITY: This function has been disabled for security reasons
// Direct SQL execution through edge functions poses significant security risks

serve(async (req) => {
  return new Response(JSON.stringify({ 
    error: 'This function has been disabled for security reasons',
    message: 'Direct SQL execution is not permitted through this endpoint'
  }), {
    headers: { 'Content-Type': 'application/json' },
    status: 403,
  })
})
