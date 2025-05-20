
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { EstimateForm } from "./EstimateForm";
import { useState, useEffect } from "react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";

interface EstimateBuilderDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  estimateId?: string;
  jobId: string;
  onSyncToInvoice?: () => void;
}

export function EstimateBuilderDialog({ 
  open, 
  onOpenChange, 
  estimateId, 
  jobId, 
  onSyncToInvoice 
}: EstimateBuilderDialogProps) {
  const [title, setTitle] = useState("Create Estimate");
  const [isLoading, setIsLoading] = useState(false);
  
  useEffect(() => {
    // Set the title based on whether we're editing or creating
    if (estimateId) {
      setIsLoading(true);
      
      // Fetch the estimate number to display in the title
      const getEstimateDetails = async () => {
        try {
          const { data, error } = await supabase
            .from('estimates')
            .select('estimate_number')
            .eq('id', estimateId)
            .single();
            
          if (error) {
            throw error;
          }
          
          if (data) {
            setTitle(`Edit Estimate ${data.estimate_number}`);
          }
        } catch (error) {
          console.error("Error fetching estimate details:", error);
          toast.error("Failed to load estimate details");
        } finally {
          setIsLoading(false);
        }
      };
      
      getEstimateDetails();
    } else {
      setTitle("Create Estimate");
    }
  }, [estimateId]);
  
  const handleOpenChange = (open: boolean) => {
    onOpenChange(open);
  };
  
  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="max-w-6xl">
        <div className="text-lg font-semibold mb-4">
          {isLoading ? "Loading..." : title}
        </div>
        <EstimateForm 
          estimateId={estimateId || null} 
          jobId={jobId}
          onSyncToInvoice={onSyncToInvoice}
        />
      </DialogContent>
    </Dialog>
  );
}
