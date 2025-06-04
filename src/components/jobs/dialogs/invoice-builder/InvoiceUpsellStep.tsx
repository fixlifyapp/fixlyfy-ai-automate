
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { useProducts } from "@/hooks/useProducts";
import { Shield, Info } from "lucide-react";
import { EstimateSummaryCard } from "../estimate-builder/components/EstimateSummaryCard";
import { NotesSection } from "../estimate-builder/components/NotesSection";
import { WarrantiesList } from "../estimate-builder/components/WarrantiesList";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { UpsellStepProps } from "../shared/types";

export const InvoiceUpsellStep = ({ 
  onContinue, 
  onBack, 
  documentTotal, 
  existingUpsellItems = [],
  estimateToConvert
}: UpsellStepProps) => {
  const [notes, setNotes] = useState("");
  const [upsellItems, setUpsellItems] = useState<any[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [hasExistingWarranties, setHasExistingWarranties] = useState(false);
  const { products: warrantyProducts, isLoading } = useProducts("Warranties");

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

  const handleUpsellToggle = (itemId: string) => {
    if (isProcessing) return;
    
    setUpsellItems(prev => prev.map(item => 
      item.id === itemId ? { ...item, selected: !item.selected } : item
    ));
  };

  const selectedUpsells = upsellItems.filter(item => item.selected);
  const upsellTotal = selectedUpsells.reduce((sum, item) => sum + item.price, 0);
  const grandTotal = documentTotal + upsellTotal;

  const handleContinue = async () => {
    if (isProcessing) return;
    
    setIsProcessing(true);
    
    try {
      const newlySelectedUpsells = selectedUpsells.filter(upsell => 
        !existingUpsellItems.some(existing => 
          existing.id === upsell.id && existing.selected
        )
      );
      
      await onContinue(newlySelectedUpsells, notes);
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
            isProcessing={isProcessing}
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
        <Button variant="outline" onClick={onBack} disabled={isProcessing}>
          Back to Items
        </Button>
        <Button 
          onClick={handleContinue} 
          className="gap-2"
          disabled={isProcessing}
        >
          {isProcessing ? "Processing..." : "Continue to Send"}
        </Button>
      </div>
    </div>
  );
};
