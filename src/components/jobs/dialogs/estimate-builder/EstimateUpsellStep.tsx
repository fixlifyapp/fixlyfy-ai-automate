import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { useProducts } from "@/hooks/useProducts";
import { AIWarrantyRecommendationDialog } from "./AIWarrantyRecommendationDialog";
import { AIRecommendationsCard } from "./components/AIRecommendationsCard";
import { WarrantiesList } from "./components/WarrantiesList";
import { EstimateSummaryCard } from "./components/EstimateSummaryCard";
import { NotesSection } from "./components/NotesSection";
import { Shield } from "lucide-react";

interface UpsellItem {
  id: string;
  title: string;
  description: string;
  price: number;
  icon: any;
  selected: boolean;
}

interface EstimateUpsellStepProps {
  onContinue: (upsellItems: UpsellItem[], notes: string) => void;
  onBack: () => void;
  estimateTotal: number;
  existingUpsellItems?: UpsellItem[];
  jobContext?: {
    job_type: string;
    service_category: string;
    job_value: number;
    client_history?: any;
  };
}

export const EstimateUpsellStep = ({ 
  onContinue, 
  onBack, 
  estimateTotal, 
  existingUpsellItems = [],
  jobContext
}: EstimateUpsellStepProps) => {
  const [notes, setNotes] = useState("");
  const [upsellItems, setUpsellItems] = useState<UpsellItem[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [showAIRecommendations, setShowAIRecommendations] = useState(false);
  const { products: warrantyProducts, isLoading } = useProducts("Warranties");

  // Convert warranty products to upsell items and restore previous selections
  useEffect(() => {
    const warrantyUpsells = warrantyProducts.map(product => {
      // Check if this warranty was previously selected
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
    if (isProcessing) return; // Prevent changes during processing
    
    setUpsellItems(prev => prev.map(item => 
      item.id === itemId ? { ...item, selected: !item.selected } : item
    ));
  };

  const selectedUpsells = upsellItems.filter(item => item.selected);
  const upsellTotal = selectedUpsells.reduce((sum, item) => sum + item.price, 0);
  const grandTotal = estimateTotal + upsellTotal;

  const handleContinue = async () => {
    if (isProcessing) return; // Prevent double-clicks
    
    setIsProcessing(true);
    
    try {
      // Only pass newly selected upsells, not ones that were already added
      const newlySelectedUpsells = selectedUpsells.filter(upsell => 
        !existingUpsellItems.some(existing => 
          existing.id === upsell.id && existing.selected
        )
      );
      
      console.log("=== UPSELL STEP CONTINUE ===");
      console.log("All selected upsells:", selectedUpsells);
      console.log("Existing upsells:", existingUpsellItems);
      console.log("Newly selected upsells (to be added):", newlySelectedUpsells);
      
      await onContinue(newlySelectedUpsells, notes);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleAIWarrantySelect = (warranty: any, aiMessage: string) => {
    // Add the AI-recommended warranty to upsell items
    const newUpsellItem: UpsellItem = {
      id: warranty.warranty_id,
      title: warranty.warranty_name,
      description: warranty.description,
      price: warranty.price,
      icon: Shield,
      selected: true
    };

    setUpsellItems(prev => {
      const existing = prev.find(item => item.id === warranty.warranty_id);
      if (existing) {
        return prev.map(item => 
          item.id === warranty.warranty_id ? { ...item, selected: true } : item
        );
      } else {
        return [...prev, newUpsellItem];
      }
    });

    // Add AI message to notes
    const aiNote = `\n\nAI Recommended Warranty: ${warranty.warranty_name}\nSuggested pitch: ${aiMessage}`;
    setNotes(prev => prev + aiNote);
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="text-center">
          <h3 className="text-lg font-semibold">Loading Warranties...</h3>
          <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full mx-auto mt-4"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="text-center">
        <h3 className="text-lg font-semibold">Enhance Your Service</h3>
        <p className="text-muted-foreground">Add valuable warranty services to provide complete protection</p>
      </div>

      <AIRecommendationsCard
        jobContext={jobContext}
      />

      <WarrantiesList
        upsellItems={upsellItems}
        existingUpsellItems={existingUpsellItems}
        isProcessing={isProcessing}
        onUpsellToggle={handleUpsellToggle}
      />

      <NotesSection
        notes={notes}
        onNotesChange={setNotes}
      />

      <EstimateSummaryCard
        estimateTotal={estimateTotal}
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

      {/* AI Warranty Recommendation Dialog */}
      {jobContext && (
        <AIWarrantyRecommendationDialog
          isOpen={showAIRecommendations}
          onClose={() => setShowAIRecommendations(false)}
          onSelectWarranty={handleAIWarrantySelect}
          jobContext={{
            job_type: jobContext.job_type,
            service_category: jobContext.service_category,
            job_value: estimateTotal,
            client_history: jobContext.client_history
          }}
        />
      )}
    </div>
  );
};
