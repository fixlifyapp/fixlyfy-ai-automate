
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";

interface EstimateDetails {
  estimate_id: string;
  estimate_number: string;
  total: number;
  status: string;
  notes?: string;
  job_id: string;
  job_title: string;
  job_description?: string;
  client_id: string;
  client_name: string;
  client_email?: string;
  client_phone?: string;
  client_company?: string;
}

interface LineItem {
  id: string;
  description: string;
  quantity: number;
  unit_price: number;
  taxable: boolean;
}

export const useEstimateData = (estimateNumber: string, jobId?: string) => {
  const [estimateDetails, setEstimateDetails] = useState<EstimateDetails | null>(null);
  const [lineItems, setLineItems] = useState<LineItem[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const fetchEstimateAndClientDetails = async () => {
    if (!estimateNumber) return;
    
    setIsLoading(true);
    try {
      console.log("Fetching estimate details for estimate number:", estimateNumber);
      
      // First try the view
      const { data: details, error: detailsError } = await supabase
        .from('estimate_details_view')
        .select('*')
        .eq('estimate_number', estimateNumber)
        .maybeSingle();

      if (detailsError && detailsError.code !== 'PGRST116') {
        console.error('Error fetching estimate details:', detailsError);
      }

      console.log("Estimate details from view:", details);

      if (details) {
        setEstimateDetails(details);
      } else {
        console.log("No data from view, trying direct fetch with order by created_at desc");
        
        // Get the most recent estimate with this number
        const { data: estimate, error: estimateError } = await supabase
          .from('estimates')
          .select('*')
          .eq('estimate_number', estimateNumber)
          .order('created_at', { ascending: false })
          .limit(1)
          .maybeSingle();

        if (estimateError) {
          console.error('Error fetching estimate directly:', estimateError);
          return;
        }

        console.log("Found estimate:", estimate);

        if (estimate) {
          // Get job and client details
          if (jobId || estimate.job_id) {
            const targetJobId = jobId || estimate.job_id;
            
            const { data: job, error: jobError } = await supabase
              .from('jobs')
              .select(`
                *,
                client:clients(*)
              `)
              .eq('id', targetJobId)
              .single();

            if (!jobError && job?.client) {
              const clientData = Array.isArray(job.client) ? job.client[0] : job.client;
              
              // Build estimate details
              const estimateDetailsData: EstimateDetails = {
                estimate_id: estimate.id,
                estimate_number: estimate.estimate_number,
                total: estimate.total || 0,
                status: estimate.status || 'draft',
                notes: estimate.notes,
                job_id: estimate.job_id || '',
                job_title: job.title || '',
                job_description: job.description || '',
                client_id: clientData.id || '',
                client_name: clientData.name || 'Unknown Client',
                client_email: clientData.email,
                client_phone: clientData.phone,
                client_company: clientData.company || ''
              };

              setEstimateDetails(estimateDetailsData);
              console.log("Estimate details built:", estimateDetailsData);
            } else {
              console.error("Error fetching job:", jobError);
            }
          } else {
            console.error("No job ID found for estimate");
          }
        } else {
          console.error("No estimate found with number:", estimateNumber);
        }
      }

      // Fetch line items if we have an estimate ID
      const estimateId = details?.estimate_id || estimateDetails?.estimate_id;
      if (estimateId) {
        console.log("Fetching line items for estimate ID:", estimateId);
        const { data: items, error: itemsError } = await supabase
          .from('line_items')
          .select('*')
          .eq('parent_type', 'estimate')
          .eq('parent_id', estimateId);

        if (itemsError) {
          console.error('Error fetching line items:', itemsError);
        } else if (items) {
          console.log("Line items loaded:", items.length, "items");
          setLineItems(items);
        }
      }

    } catch (error: any) {
      console.error('Error in fetchEstimateAndClientDetails:', error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchEstimateAndClientDetails();
  }, [estimateNumber, jobId]);

  return {
    estimateDetails,
    lineItems,
    isLoading,
    refetchData: fetchEstimateAndClientDetails
  };
};
