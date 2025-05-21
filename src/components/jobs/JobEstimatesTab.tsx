import { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { PlusCircle, Edit, Trash, ArrowRight } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { format } from "date-fns";
import { toast } from "sonner";
import { enhancedToast } from "@/components/ui/sonner";
import { EstimateBuilderDialog } from "./dialogs/estimate-builder/EstimateBuilderDialog";
import { Badge } from "@/components/ui/badge";
import { ConvertToInvoiceDialog } from "./estimates/dialogs/ConvertToInvoiceDialog";
import { recordEstimateCreated } from "@/services/jobHistoryService";

interface JobEstimatesTabProps {
  jobId: string;
  onEstimateConverted?: () => void;
}

export const JobEstimatesTab = ({ jobId, onEstimateConverted }: JobEstimatesTabProps) => {
  const [estimates, setEstimates] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isEstimateBuilderOpen, setIsEstimateBuilderOpen] = useState(false);
  const [selectedEstimateId, setSelectedEstimateId] = useState<string | undefined>(undefined);
  const [isConvertDialogOpen, setIsConvertDialogOpen] = useState(false);
  const [selectedEstimate, setSelectedEstimate] = useState<any>(null);
  
  const fetchEstimates = async () => {
    setIsLoading(true);
    try {
      // Using eq for job_id column matches exact job_id
      const { data, error } = await supabase
        .from("estimates")
        .select("*")
        .eq("job_id", jobId)
        .order("created_at", { ascending: false });
        
      if (error) {
        throw error;
      }
      
      setEstimates(data || []);
    } catch (error) {
      console.error("Error fetching estimates:", error);
      // enhancedToast.error call will be silenced by our updated implementation
    } finally {
      setIsLoading(false);
    }
  };
  
  useEffect(() => {
    if (jobId) {
      fetchEstimates();
    }
  }, [jobId]);
  
  const handleCreateEstimate = () => {
    setSelectedEstimateId(undefined);
    setIsEstimateBuilderOpen(true);
  };
  
  const handleEditEstimate = (estimateId: string) => {
    setSelectedEstimateId(estimateId);
    setIsEstimateBuilderOpen(true);
  };
  
  const handleDeleteEstimate = async (estimateId: string) => {
    try {
      const { error } = await supabase
        .from("estimates")
        .delete()
        .eq("id", estimateId);
        
      if (error) {
        throw error;
      }
      
      setEstimates(estimates.filter(est => est.id !== estimateId));
      enhancedToast.success("Estimate deleted successfully");
    } catch (error) {
      console.error("Error deleting estimate:", error);
      enhancedToast.error("Failed to delete estimate");
    }
  };
  
  const handleEstimateCreated = (estimateNumber: string, amount: number) => {
    // Record in job history
    recordEstimateCreated(
      jobId,
      estimateNumber,
      amount
    );
    // Refresh estimates list
    fetchEstimates();
  };
  
  const handleConvertToInvoice = async (estimate: any) => {
    setSelectedEstimate(estimate);
    setIsConvertDialogOpen(true);
  };

  const confirmConvertToInvoice = async () => {
    if (!selectedEstimate) return;
    
    try {
      // Generate unique invoice number
      const invoiceNumber = `INV-${Math.floor(Math.random() * 10000).toString().padStart(4, '0')}`;
      
      // Create invoice
      const { data: invoice, error: invoiceError } = await supabase
        .from("invoices")
        .insert({
          job_id: jobId,
          estimate_id: selectedEstimate.id,
          invoice_number: invoiceNumber,
          total: selectedEstimate.total,
          balance: selectedEstimate.total,
          status: 'unpaid',
          notes: selectedEstimate.notes
        })
        .select()
        .single();
        
      if (invoiceError) {
        throw invoiceError;
      }
      
      // Get estimate line items
      const { data: estimateItems, error: itemsError } = await supabase
        .from("line_items")
        .select("*")
        .eq("parent_type", "estimate")
        .eq("parent_id", selectedEstimate.id);
        
      if (itemsError) {
        throw itemsError;
      }
      
      // Convert estimate items to invoice items
      if (estimateItems && estimateItems.length > 0 && invoice) {
        const invoiceItems = estimateItems.map(item => ({
          parent_type: "invoice",
          parent_id: invoice.id,
          description: item.description,
          quantity: item.quantity,
          unit_price: item.unit_price,
          taxable: item.taxable
        }));
        
        const { error: insertError } = await supabase
          .from("line_items")
          .insert(invoiceItems);
          
        if (insertError) {
          throw insertError;
        }
      }
      
      // Update estimate status
      const { error: updateError } = await supabase
        .from("estimates")
        .update({ status: "converted" })
        .eq("id", selectedEstimate.id);
        
      if (updateError) {
        throw updateError;
      }
      
      enhancedToast.success("Estimate converted to invoice successfully");
      
      // Close the dialog
      setIsConvertDialogOpen(false);
      
      // Refresh estimates list
      fetchEstimates();
      
      // Notify parent component
      if (onEstimateConverted) {
        onEstimateConverted();
      }
    } catch (error) {
      console.error("Error converting estimate to invoice:", error);
      enhancedToast.error("Failed to convert estimate to invoice");
    }
  };

  // Function to render status badge with appropriate color
  const renderStatusBadge = (status: string) => {
    let color = "";
    
    switch (status.toLowerCase()) {
      case "draft":
        color = "bg-gray-200 text-gray-800";
        break;
      case "sent":
        color = "bg-blue-100 text-blue-800";
        break;
      case "approved":
        color = "bg-green-100 text-green-800";
        break;
      case "rejected":
        color = "bg-red-100 text-red-800";
        break;
      case "converted":
        color = "bg-purple-100 text-purple-800";
        break;
      default:
        color = "bg-gray-200";
    }
    
    return (
      <Badge className={color}>
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </Badge>
    );
  };
  
  return (
    <Card className="border-fixlyfy-border shadow-sm">
      <CardContent className="p-6">
        <div className="flex justify-between items-center mb-6">
          <h3 className="text-lg font-medium">Estimates</h3>
          <Button className="gap-2" onClick={handleCreateEstimate}>
            <PlusCircle size={16} />
            New Estimate
          </Button>
        </div>
        
        {isLoading ? (
          <div className="flex justify-center py-8">
            <div className="animate-spin h-8 w-8 border-4 border-fixlyfy border-t-transparent rounded-full"></div>
          </div>
        ) : estimates.length === 0 ? (
          <div className="text-center py-16 text-muted-foreground">
            <p>No estimates found for this job.</p>
            <p className="mt-2">Create your first estimate by clicking the New Estimate button.</p>
          </div>
        ) : (
          <div className="space-y-4">
            {estimates.map((estimate) => (
              <div 
                key={estimate.id} 
                className="border rounded-lg p-4 flex flex-col md:flex-row md:items-center justify-between gap-4"
              >
                <div className="space-y-1">
                  <div className="flex items-center gap-3">
                    <h4 className="font-medium">{estimate.estimate_number}</h4>
                    {renderStatusBadge(estimate.status)}
                  </div>
                  <p className="text-sm text-muted-foreground">
                    Created on {format(new Date(estimate.created_at), 'MMM dd, yyyy')}
                  </p>
                </div>
                
                <div className="text-lg font-semibold">
                  ${parseFloat(estimate.total).toFixed(2)}
                </div>
                
                <div className="flex flex-wrap gap-2 md:justify-end">
                  <Button variant="outline" size="sm" onClick={() => handleEditEstimate(estimate.id)}>
                    <Edit size={16} className="mr-2" />
                    Edit
                  </Button>
                  
                  {estimate.status !== 'converted' && (
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => handleConvertToInvoice(estimate)}
                    >
                      <ArrowRight size={16} className="mr-2" />
                      Convert to Invoice
                    </Button>
                  )}
                  
                  <Button 
                    variant="outline" 
                    size="sm" 
                    className="text-red-600 hover:bg-red-50"
                    onClick={() => handleDeleteEstimate(estimate.id)}
                  >
                    <Trash size={16} className="mr-2" />
                    Delete
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}
        
        <EstimateBuilderDialog
          open={isEstimateBuilderOpen}
          onOpenChange={setIsEstimateBuilderOpen}
          estimateId={selectedEstimateId}
          jobId={jobId}
          onSyncToInvoice={() => {
            fetchEstimates();
            setIsEstimateBuilderOpen(false);
            if (onEstimateConverted) {
              onEstimateConverted();
            }
          }}
        />

        <ConvertToInvoiceDialog
          open={isConvertDialogOpen}
          onOpenChange={setIsConvertDialogOpen}
          estimate={selectedEstimate}
          estimateNumber={selectedEstimate?.estimate_number}
          onConfirm={confirmConvertToInvoice}
        />
      </CardContent>
    </Card>
  );
};
