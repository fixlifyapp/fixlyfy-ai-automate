
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { useProducts } from "@/hooks/useProducts";
import { Shield } from "lucide-react";
import { EstimateSummaryCard } from "./components/EstimateSummaryCard";
import { NotesSection } from "./components/NotesSection";
import { WarrantiesList } from "./components/WarrantiesList";
import { AIRecommendationsCard } from "./components/AIRecommendationsCard";
import { UpsellStepProps } from "../shared/types";

export const EstimateUpsellStep = ({ 
  onContinue, 
  onBack, 
  documentTotal, 
  existingUpsellItems = [],
  jobContext
}: UpsellStepProps) => {
  const [notes, setNotes] = useState("");
  const [upsellItems, setUpsellItems] = useState<any[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const { products: warrantyProducts, isLoading } = useProducts("Warranties");

  // Convert warranty products to upsell items and restore previous selections
  useEffect(() => {
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
  }, [warrantyProducts, existingUpsellItems]);

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
        <h3 className="text-lg font-semibold">Enhance Your Service</h3>
        <p className="text-muted-foreground">Add valuable warranty services for complete protection</p>
      </div>

      {/* AI Recommendations */}
      {jobContext && (
        <AIRecommendationsCard 
          jobContext={{
            job_type: jobContext.job_type || 'General Service',
            service_category: jobContext.service_category || 'Maintenance',
            job_value: jobContext.job_value || 0,
            client_history: jobContext.client_history
          }} 
        />
      )}

      {/* Warranties List */}
      <WarrantiesList
        upsellItems={upsellItems}
        existingUpsellItems={existingUpsellItems}
        isProcessing={isProcessing}
        onUpsellToggle={handleUpsellToggle}
      />

      {/* Notes Section */}
      <NotesSection
        notes={notes}
        onNotesChange={setNotes}
      />

      {/* Summary */}
      <EstimateSummaryCard
        estimateTotal={documentTotal}
        selectedUpsells={selectedUpsells}
        upsellTotal={upsellTotal}
        grandTotal={grandTotal}
      />

      {/* Navigation */}
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
