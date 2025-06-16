
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.24.0'

export const generatePortalLink = async (
  clientId: string, 
  documentType: 'estimate' | 'invoice', 
  documentId: string
): Promise<string> => {
  const supabaseAdmin = createClient(
    Deno.env.get('SUPABASE_URL') ?? '',
    Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
  )

  try {
    // Generate portal access token
    const { data: token, error } = await supabaseAdmin
      .rpc('generate_client_portal_access', {
        p_client_id: clientId,
        p_document_type: documentType,
        p_document_id: documentId,
        p_hours_valid: 72
      })

    if (error) {
      console.error('Error generating portal access:', error)
      throw error
    }

    // Return the portal URL with token
    const baseUrl = Deno.env.get('SUPABASE_URL')?.replace('//', '//portal.') || 'https://portal.your-domain.com'
    return `${baseUrl}/portal?token=${token}`

  } catch (error) {
    console.error('Error in generatePortalLink:', error)
    throw error
  }
}
