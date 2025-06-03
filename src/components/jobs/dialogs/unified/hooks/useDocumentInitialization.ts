
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { DocumentType } from "../../UnifiedDocumentBuilder";
import { Estimate } from "@/hooks/useEstimates";
import { Invoice } from "@/hooks/useInvoices";
import { LineItem } from "../../../builder/types";

interface DocumentFormData {
  documentId?: string;
  documentNumber: string;
  items: Array<{
    description: string;
    quantity: number;
    unitPrice: number;
    taxable: boolean;
  }>;
  notes: string;
  status: string;
  total: number;
}

interface UseDocumentInitializationProps {
  documentType: DocumentType;
  existingDocument?: Estimate | Invoice;
  jobId: string;
  open: boolean;
}

export const useDocumentInitialization = ({
  documentType,
  existingDocument,
  jobId,
  open
}: UseDocumentInitializationProps) => {
  const [formData, setFormData] = useState<DocumentFormData>({
    documentNumber: `${documentType === 'estimate' ? 'EST' : 'INV'}-${Date.now()}`,
    items: [],
    notes: "",
    status: "draft",
    total: 0
  });
  
  const [jobData, setJobData] = useState<any>(null);

  // Smart initialization based on job data and existing documents
  useEffect(() => {
    const initializeDocument = async () => {
      try {
        // Fetch job data for smart defaults
        const { data: job } = await supabase
          .from('jobs')
          .select(`
            *,
            client:clients(*),
            estimates(*),
            invoices(*)
          `)
          .eq('id', jobId)
          .single();

        if (job) {
          setJobData(job);
          
          // Smart document number generation
          if (!existingDocument) {
            const existingDocs = documentType === 'estimate' 
              ? job.estimates || []
              : job.invoices || [];
            
            const nextNumber = existingDocs.length + 1;
            const prefix = documentType === 'estimate' ? 'EST' : 'INV';
            
            setFormData(prev => ({
              ...prev,
              documentNumber: `${prefix}-${jobId.slice(-6)}-${String(nextNumber).padStart(3, '0')}`
            }));
          }
        }
      } catch (error) {
        console.error('Error initializing document:', error);
      }
    };

    if (open && jobId) {
      initializeDocument();
    }
  }, [open, jobId, documentType, existingDocument]);

  return {
    formData,
    setFormData,
    jobData,
    setJobData
  };
};
