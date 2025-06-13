
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
      console.log("=== FETCHING ESTIMATE DATA ===");
      console.log("Estimate number:", estimateNumber);
      console.log("Job ID:", jobId);
      
      // First try the view
      const { data: details, error: detailsError } = await supabase
        .from('estimate_details_view')
        .select('*')
        .eq('estimate_number', estimateNumber)
        .maybeSingle();

      console.log("View query result:", details);

      if (details) {
        console.log("Found estimate details from view:", details);
        setEstimateDetails(details);
        
        // Fetch line items immediately when we have estimate details
        console.log("Fetching line items for estimate ID:", details.estimate_id);
        const { data: items, error: itemsError } = await supabase
          .from('line_items')
          .select('*')
          .eq('parent_type', 'estimate')
          .eq('parent_id', details.estimate_id);

        console.log("Line items fetch result:", items);
        
        if (!itemsError && items) {
          console.log("Line items loaded:", items.length, "items");
          setLineItems(items);
        } else {
          console.error("Error fetching line items:", itemsError);
        }
      } else {
        console.log("No data from view, trying direct fetch approach");
        
        // Get the most recent estimate with this number
        const { data: estimate, error: estimateError } = await supabase
          .from('estimates')
          .select('*')
          .eq('estimate_number', estimateNumber)
          .order('created_at', { ascending: false })
          .limit(1)
          .maybeSingle();

        console.log("Direct estimate fetch result:", estimate);

        if (estimate) {
          // Get job and client details separately
          const targetJobId = jobId || estimate.job_id;
          console.log("Target job ID for lookup:", targetJobId);
          
          if (targetJobId) {
            const { data: job, error: jobError } = await supabase
              .from('jobs')
              .select(`
                *,
                clients:client_id(*)
              `)
              .eq('id', targetJobId)
              .single();

            console.log("Job fetch result:", job);

            if (!jobError && job?.clients) {
              const clientData = Array.isArray(job.clients) ? job.clients[0] : job.clients;
              console.log("Client data extracted:", clientData);
              
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

              console.log("Final estimate details built:", estimateDetailsData);
              setEstimateDetails(estimateDetailsData);
              
              // Fetch line items for this estimate
              console.log("Fetching line items for estimate ID:", estimate.id);
              const { data: items, error: itemsError } = await supabase
                .from('line_items')
                .select('*')
                .eq('parent_type', 'estimate')
                .eq('parent_id', estimate.id);

              console.log("Line items fetch result:", items);
              
              if (!itemsError && items) {
                console.log("Line items loaded:", items.length, "items");
                setLineItems(items);
              } else {
                console.error("Error fetching line items:", itemsError);
              }
            } else {
              console.error("Error fetching job or no client found:", jobError);
            }
          }
        }
      }

      console.log("=== ESTIMATE DATA FETCH COMPLETED ===");

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
