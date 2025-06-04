
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { useProducts } from "@/hooks/useProducts";
import { Shield, Info } from "lucide-react";
import { EstimateSummaryCard } from "../estimate-builder/components/EstimateSummaryCard";
import { NotesSection } from "../estimate-builder/components/NotesSection";
import { WarrantiesList } from "../estimate-builder/components/WarrantiesList";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { UpsellStepProps } from "../shared/types";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export const InvoiceUpsellStep = ({ 
  onContinue, 
  onBack, 
  documentTotal, 
  existingUpsellItems = [],
  estimateToConvert,
  jobContext
}: UpsellStepProps) => {
  const [notes, setNotes] = useState("");
  const [upsellItems, setUpsellItems] = useState<any[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [isSavingWarranty, setIsSavingWarranty] = useState(false);
  const [hasExistingWarranties, setHasExistingWarranties] = useState(false);
  const { products: warrantyProducts, isLoading } = useProducts("Warranties");

  // Get invoice ID from jobContext or other source
  const invoiceId = jobContext?.invoiceId;

  // Check if warranties were already added in the estimate
  useEffect(() => {
    if (estimateToConvert) {
      // Check if the estimate already contains warranty items
      const estimateItems = estimateToConvert.line_items || [];
      const hasWarranties = estimateItems.some((item: any) => 
        item.description?.toLowerCase().includes('warranty') ||
        item.name?.toLowerCase().includes('warranty') ||
        warrantyProducts.some(wp => wp.name === item.name)
      );
      setHasExistingWarranties(hasWarranties);
    }
  }, [estimateToConvert, warrantyProducts]);

  // Convert warranty products to upsell items and restore previous selections
  useEffect(() => {
    if (hasExistingWarranties) {
      // If warranties already exist, don't show them as options
      setUpsellItems([]);
      return;
    }

    const warrantyUpsells = warrantyProducts.map(product => {
      const existingSelection = existingUpsellItems.find(item => item.id === product.id);
      
      return {
        id: product.id,
        title: product.name,
        description: product.description || "",
        price: product.price,
        icon: Shield,
        selected: existingSelection ? existingSelection.selected : false
      };
    });
    setUpsellItems(warrantyUpsells);
  }, [warrantyProducts, existingUpsellItems, hasExistingWarranties]);

  const handleUpsellToggle = async (itemId: string) => {
    if (isProcessing || isSavingWarranty) return;
    
    setIsSavingWarranty(true);
    
    try {
      const item = upsellItems.find(item => item.id === itemId);
      if (!item || !invoiceId) {
        toast.error("Unable to save warranty - missing information");
        return;
      }

      const newSelectedState = !item.selected;

      if (newSelectedState) {
        // Add warranty to database
        const { error: lineItemError } = await supabase
          .from('line_items')
          .insert({
            parent_id: invoiceId,
            parent_type: 'invoice',
            description: item.title + (item.description ? ` - ${item.description}` : ''),
            quantity: 1,
            unit_price: item.price,
            taxable: false // Warranties are typically not taxed
          });

        if (lineItemError) {
          console.error('Error adding warranty line item:', lineItemError);
          toast.error(`Failed to add ${item.title}`);
          return;
        }

        // Update invoice total and balance
        const newTotal = documentTotal + item.price;
        const { error: updateError } = await supabase
          .from('invoices')
          .update({ 
            total: newTotal,
            balance: newTotal // Assuming no payments yet
          })
          .eq('id', invoiceId);

        if (updateError) {
          console.error('Error updating invoice total:', updateError);
          toast.error('Failed to update invoice total');
          return;
        }

        toast.success(`${item.title} added to invoice`);
      } else {
        // Remove warranty from database
        const { error: deleteError } = await supabase
          .from('line_items')
          .delete()
          .eq('parent_id', invoiceId)
          .eq('parent_type', 'invoice')
          .eq('description', item.title + (item.description ? ` - ${item.description}` : ''));

        if (deleteError) {
          console.error('Error removing warranty line item:', deleteError);
          toast.error(`Failed to remove ${item.title}`);
          return;
        }

        // Update invoice total and balance
        const newTotal = Math.max(0, documentTotal - item.price);
        const { error: updateError } = await supabase
          .from('invoices')
          .update({ 
            total: newTotal,
            balance: newTotal // Assuming no payments yet
          })
          .eq('id', invoiceId);

        if (updateError) {
          console.error('Error updating invoice total:', updateError);
          toast.error('Failed to update invoice total');
          return;
        }

        toast.success(`${item.title} removed from invoice`);
      }

      // Update local state
      setUpsellItems(prev => prev.map(upsellItem => 
        upsellItem.id === itemId ? { ...upsellItem, selected: newSelectedState } : upsellItem
      ));

    } catch (error) {
      console.error('Error toggling warranty:', error);
      toast.error('Failed to update warranty');
    } finally {
      setIsSavingWarranty(false);
    }
  };

  const selectedUpsells = upsellItems.filter(item => item.selected);
  const upsellTotal = selectedUpsells.reduce((sum, item) => sum + item.price, 0);
  const grandTotal = documentTotal + upsellTotal;

  const handleContinue = async () => {
    if (isProcessing || isSavingWarranty) return;
    
    setIsProcessing(true);
    
    try {
      // Save notes if any
      if (notes.trim() && invoiceId) {
        const { error: notesError } = await supabase
          .from('invoices')
          .update({ notes: notes.trim() })
          .eq('id', invoiceId);

        if (notesError) {
          console.error('Error saving notes:', notesError);
          toast.error('Failed to save notes');
          return;
        }
      }

      // Continue with selected upsells (they're already saved to database)
      await onContinue(selectedUpsells, notes);
    } catch (error) {
      console.error('Error in handleContinue:', error);
      toast.error('Failed to continue');
    } finally {
      setIsProcessing(false);
    }
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="text-center">
          <h3 className="text-lg font-semibold">Loading Additional Services...</h3>
          <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full mx-auto mt-4"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="text-center">
        <h3 className="text-lg font-semibold">Enhance Your Invoice</h3>
        <p className="text-muted-foreground">Add valuable warranty services for complete protection</p>
      </div>

      {hasExistingWarranties ? (
        <Alert>
          <Shield className="h-4 w-4" />
          <AlertDescription>
            <strong>Warranties Already Included</strong>
            <br />
            This invoice already includes warranty services from the original estimate. 
            No additional warranty options are needed at this time.
          </AlertDescription>
        </Alert>
      ) : (
        <>
          <Alert>
            <Info className="h-4 w-4" />
            <AlertDescription>
              <strong>Warranty Recommendation</strong>
              <br />
              No warranty was added to the original estimate. Consider offering warranty protection 
              to provide additional value and peace of mind for your customer. Warranties help build 
              trust and can increase customer satisfaction while protecting your work.
            </AlertDescription>
          </Alert>

          <WarrantiesList
            upsellItems={upsellItems}
            existingUpsellItems={existingUpsellItems}
            isProcessing={isProcessing || isSavingWarranty}
            onUpsellToggle={handleUpsellToggle}
          />
        </>
      )}

      <NotesSection
        notes={notes}
        onNotesChange={setNotes}
      />

      <EstimateSummaryCard
        estimateTotal={documentTotal}
        selectedUpsells={selectedUpsells}
        upsellTotal={upsellTotal}
        grandTotal={grandTotal}
      />

      <div className="flex justify-between pt-4">
        <Button 
          variant="outline" 
          onClick={onBack} 
          disabled={isProcessing || isSavingWarranty}
        >
          Back to Items
        </Button>
        <Button 
          onClick={handleContinue} 
          className="gap-2"
          disabled={isProcessing || isSavingWarranty}
        >
          {isProcessing ? "Processing..." : isSavingWarranty ? "Saving..." : "Continue to Send"}
        </Button>
      </div>
    </div>
  );
};
