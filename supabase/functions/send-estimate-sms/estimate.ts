
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.24.0'

export const getEstimateData = async (supabaseAdmin: any, estimateId: string) => {
  const { data: estimate, error } = await supabaseAdmin
    .from('estimates')
    .select(`
      *,
      jobs!inner(
        client_id,
        clients!inner(
          id,
          name,
          email,
          phone
        )
      )
    `)
    .eq('id', estimateId)
    .single()

  if (error) {
    console.error('Error fetching estimate:', error)
    return null
  }

  return {
    ...estimate,
    client_id: estimate.jobs.client_id,
    client_name: estimate.jobs.clients.name,
    client_email: estimate.jobs.clients.email,
    client_phone: estimate.jobs.clients.phone
  }
}
