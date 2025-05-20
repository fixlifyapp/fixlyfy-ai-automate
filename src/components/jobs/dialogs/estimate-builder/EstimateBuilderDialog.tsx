
import { useState, useEffect, useCallback } from "react";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { EstimateEditor } from "./EstimateEditor";
import { LineItemsTable } from "./LineItemsTable";
import { Estimate } from "@/hooks/useEstimates";
import { useEstimateInfo } from "@/components/jobs/estimates/hooks/useEstimateInfo";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";

interface EstimateBuilderDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  estimateId?: string;
  jobId: string;
  onSyncToInvoice?: () => void;
}

export function EstimateBuilderDialog({ open, onOpenChange, estimateId, jobId, onSyncToInvoice }: EstimateBuilderDialogProps) {
  const [estimate, setEstimate] = useState<Estimate | null>(null);
  const [lineItems, setLineItems] = useState<any[]>([]);
  const { fetchEstimate, addEmptyLineItem, addCustomLine, removeLine, updateLine } = useEstimateInfo();

  const handleOpenChange = (open: boolean) => {
    onOpenChange(open);
    if (!open) {
      setEstimate(null);
      setLineItems([]);
    }
  };

  const loadEstimate = useCallback(async () => {
    if (estimateId) {
      try {
        const fetchedEstimate = await fetchEstimate(estimateId);
        if (fetchedEstimate) {
          setEstimate(fetchedEstimate);
          setLineItems(fetchedEstimate.estimate_items || []);
        } else {
          toast.error("Failed to load estimate");
        }
      } catch (error) {
        console.error("Error loading estimate:", error);
        toast.error("Failed to load estimate");
      }
    } else {
      setEstimate({
        job_id: jobId,
        discount: 0,
        tax_rate: 0,
        technicians_note: ""
      } as Estimate);
      setLineItems([]);
    }
  }, [estimateId, fetchEstimate, jobId]);

  useEffect(() => {
    if (open) {
      loadEstimate();
    }
  }, [open, loadEstimate]);

  const handleAddEmptyLineItem = async () => {
    if (estimate) {
      const newLineItem = await addEmptyLineItem(estimate.id);
      if (newLineItem) {
        setLineItems(prev => [...prev, newLineItem]);
      }
    } else {
      toast.error("Estimate not loaded");
    }
  };

  const handleAddCustomLine = async (name: string, price: number, quantity: number, taxable: boolean) => {
    if (estimate) {
      try {
        const newLineItem = await addCustomLine(estimate.id, name, price, quantity, taxable);
        if (newLineItem) {
          setLineItems(prev => [...prev, newLineItem]);
        }
      } catch (error) {
        console.error("Error adding custom line:", error);
        toast.error("Failed to add custom line");
      }
    } else {
      toast.error("Estimate not loaded");
    }
  };

  const handleRemoveLine = async (lineId: string) => {
    if (estimate) {
      try {
        await removeLine(lineId);
        setLineItems(prev => prev.filter(item => item.id !== lineId));
      } catch (error) {
        console.error("Error removing line:", error);
        toast.error("Failed to remove line");
      }
    } else {
      toast.error("Estimate not loaded");
    }
  };

  const handleUpdateLine = async (lineId: string, updates: any) => {
    if (estimate) {
      try {
        const updatedLine = await updateLine(lineId, updates);
        if (updatedLine) {
          setLineItems(prev =>
            prev.map(item => (item.id === lineId ? { ...item, ...updatedLine } : item))
          );
        }
      } catch (error) {
        console.error("Error updating line:", error);
        toast.error("Failed to update line");
      }
    } else {
      toast.error("Estimate not loaded");
    }
  };

  const handleUpdateDiscount = async (discount: number) => {
    if (estimate) {
      try {
        // Optimistically update the local state
        setEstimate(prev => ({ ...prev, discount }));
        
        // Update the discount in the database
        await supabase
          .from('estimates')
          .update({ discount })
          .eq('id', estimate.id);
      } catch (error) {
        console.error("Error updating discount:", error);
        toast.error("Failed to update discount");
        // Revert the local state in case of an error
        loadEstimate();
      }
    } else {
      toast.error("Estimate not loaded");
    }
  };

  const handleUpdateTax = async (tax_rate: number) => {
    if (estimate) {
      try {
        // Optimistically update the local state
        setEstimate(prev => ({ ...prev, tax_rate }));
        
        // Update the tax in the database
        await supabase
          .from('estimates')
          .update({ tax_rate })
          .eq('id', estimate.id);
      } catch (error) {
        console.error("Error updating tax:", error);
        toast.error("Failed to update tax");
        // Revert the local state in case of an error
        loadEstimate();
      }
    } else {
      toast.error("Estimate not loaded");
    }
  };

  const handleUpdateNote = async (technicians_note: string) => {
    if (estimate) {
      try {
        // Optimistically update the local state
        setEstimate(prev => ({ ...prev, technicians_note }));
        
        // Update the note in the database
        await supabase
          .from('estimates')
          .update({ technicians_note })
          .eq('id', estimate.id);
      } catch (error) {
        console.error("Error updating note:", error);
        toast.error("Failed to update note");
        // Revert the local state in case of an error
        loadEstimate();
      }
    } else {
      toast.error("Estimate not loaded");
    }
  };
  
  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="max-w-6xl">
        <div className="text-lg font-semibold mb-4">
          Estimate Builder
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div>
            <EstimateEditor
              lineItems={lineItems}
              onAddEmptyLineItem={handleAddEmptyLineItem}
              onAddCustomLine={handleAddCustomLine}
              onRemoveLine={handleRemoveLine}
              onUpdateLine={handleUpdateLine}
              onUpdateDiscount={handleUpdateDiscount}
              onUpdateTax={handleUpdateTax}
              onUpdateNote={handleUpdateNote}
              discount={estimate?.discount || 0}
              taxRate={estimate?.tax_rate || 0}
              note={estimate?.technicians_note || ""}
            />
          </div>
          <div>
            <LineItemsTable
              lineItems={lineItems}
              onRemoveLineItem={handleRemoveLine}
              onUpdateLineItem={handleUpdateLine}
              onEditLineItem={() => false}
            />
            {onSyncToInvoice && (
              <button onClick={onSyncToInvoice} className="mt-4 w-full bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded">
                Sync to Invoice
              </button>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
