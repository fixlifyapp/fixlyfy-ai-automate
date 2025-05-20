
import { useState, useEffect, useCallback } from "react";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { EstimateEditor } from "./EstimateEditor";
import { LineItemsTable } from "./LineItemsTable";
import { Estimate } from "@/hooks/useEstimates";
import { useEstimateInfo } from "@/components/jobs/estimates/hooks/useEstimateInfo";
import { useEstimateBuilder } from "./hooks/useEstimateBuilder";
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
  const estimateInfo = useEstimateInfo();
  const estimateBuilder = useEstimateBuilder({
    estimateId: estimateId || null,
    open,
    onSyncToInvoice,
    jobId
  });

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
        setEstimate({
          id: estimateId,
          job_id: jobId,
          number: '',
          date: new Date().toISOString(),
          amount: 0,
          status: 'draft',
          viewed: false,
          discount: 0,
          tax_rate: 0,
          technicians_note: '',
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        });
        
        // Fetch estimate details from Supabase
        const { data, error } = await supabase
          .from('estimates')
          .select('*')
          .eq('id', estimateId)
          .single();
          
        if (error) {
          toast.error("Failed to load estimate");
          return;
        }
        
        if (data) {
          setEstimate({
            ...data,
            discount: data.discount || 0,
            tax_rate: data.tax_rate || 0,
            technicians_note: data.technicians_note || ""
          } as Estimate);
        }
        
        // Fetch estimate items
        const { data: itemsData, error: itemsError } = await supabase
          .from('estimate_items')
          .select('*')
          .eq('estimate_id', estimateId);
          
        if (itemsError) {
          toast.error("Failed to load estimate items");
          return;
        }
        
        if (itemsData) {
          setLineItems(itemsData || []);
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
        technicians_note: "",
        number: estimateInfo.generateUniqueNumber('EST'),
        date: new Date().toISOString(),
        amount: 0,
        status: 'draft',
        viewed: false,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      } as Estimate);
      setLineItems([]);
    }
  }, [estimateId, jobId, estimateInfo]);

  useEffect(() => {
    if (open) {
      loadEstimate();
    }
  }, [open, loadEstimate]);

  // Implement the missing methods
  const addEmptyLineItem = async () => {
    if (!estimate?.id) {
      toast.error("Estimate not loaded");
      return null;
    }
    
    const newItem = {
      estimate_id: estimate.id,
      name: "New Item",
      description: "",
      price: 0,
      quantity: 1,
      taxable: true
    };
    
    try {
      const { data, error } = await supabase
        .from('estimate_items')
        .insert(newItem)
        .select()
        .single();
        
      if (error) throw error;
      
      if (data) {
        setLineItems(prev => [...prev, data]);
        return data;
      }
    } catch (error) {
      console.error("Error adding empty line item:", error);
      toast.error("Failed to add item");
    }
    
    return null;
  };

  const addCustomLine = async (name: string, price: number, quantity: number, taxable: boolean) => {
    if (!estimate?.id) {
      toast.error("Estimate not loaded");
      return;
    }
    
    const newItem = {
      estimate_id: estimate.id,
      name,
      description: name,
      price,
      quantity,
      taxable
    };
    
    try {
      const { data, error } = await supabase
        .from('estimate_items')
        .insert(newItem)
        .select()
        .single();
        
      if (error) throw error;
      
      if (data) {
        setLineItems(prev => [...prev, data]);
      }
    } catch (error) {
      console.error("Error adding custom line:", error);
      toast.error("Failed to add custom line");
    }
  };

  const removeLine = async (lineId: string) => {
    if (!estimate?.id) {
      toast.error("Estimate not loaded");
      return;
    }
    
    try {
      const { error } = await supabase
        .from('estimate_items')
        .delete()
        .eq('id', lineId);
        
      if (error) throw error;
      
      setLineItems(prev => prev.filter(item => item.id !== lineId));
    } catch (error) {
      console.error("Error removing line:", error);
      toast.error("Failed to remove line");
    }
  };

  const updateLine = async (lineId: string, updates: any) => {
    if (!estimate?.id) {
      toast.error("Estimate not loaded");
      return null;
    }
    
    try {
      const { data, error } = await supabase
        .from('estimate_items')
        .update(updates)
        .eq('id', lineId)
        .select()
        .single();
        
      if (error) throw error;
      
      if (data) {
        setLineItems(prev =>
          prev.map(item => (item.id === lineId ? { ...item, ...data } : item))
        );
        return data;
      }
    } catch (error) {
      console.error("Error updating line:", error);
      toast.error("Failed to update line");
    }
    
    return null;
  };

  const handleUpdateDiscount = async (discount: number) => {
    if (estimate) {
      try {
        // Optimistically update the local state
        setEstimate(prev => prev ? { ...prev, discount } : null);
        
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
        setEstimate(prev => prev ? { ...prev, tax_rate } : null);
        
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
        setEstimate(prev => prev ? { ...prev, technicians_note } : null);
        
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
              onAddEmptyLineItem={addEmptyLineItem}
              onAddCustomLine={addCustomLine}
              onRemoveLine={removeLine}
              onUpdateLine={updateLine}
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
              onRemoveLineItem={removeLine}
              onUpdateLineItem={updateLine}
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
