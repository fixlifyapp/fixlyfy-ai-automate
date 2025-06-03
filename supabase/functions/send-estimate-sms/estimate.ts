
import type { EstimateData } from './types.ts';

export const fetchEstimateData = async (
  estimateId: string,
  supabaseAdmin: any
): Promise<EstimateData> => {
  const { data: estimate, error: estimateError } = await supabaseAdmin
    .from('estimates')
    .select(`
      *,
      jobs:job_id (
        *,
        clients:client_id (*)
      )
    `)
    .eq('id', estimateId)
    .single();

  if (estimateError || !estimate) {
    throw new Error(`Estimate not found: ${estimateError?.message || 'Unknown error'}`);
  }

  return estimate;
};
