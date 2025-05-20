
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";

interface EstimateUpsellOptionsProps {
  onAddCustomLine: () => void;
}

export const EstimateUpsellOptions = ({
  onAddCustomLine,
}: EstimateUpsellOptionsProps) => {
  const [showUpsellOptions, setShowUpsellOptions] = useState(false);

  const handleAddUpsell = () => {
    setShowUpsellOptions(!showUpsellOptions);
  };

  const handleAddWarranty = () => {
    // This would open the warranty dialog in the parent component
    setShowUpsellOptions(false);
  };

  const handleAddMaintenancePlan = () => {
    // Add maintenance plan and close menu
    onAddCustomLine();
    setShowUpsellOptions(false);
  };

  return (
    <div className="relative inline-block">
      <Button 
        onClick={handleAddUpsell} 
        variant="outline"
        className="gap-2"
      >
        <Plus size={16} />
        Add Upsell
      </Button>
      
      {showUpsellOptions && (
        <div className="absolute right-0 mt-2 w-56 bg-background border rounded-md shadow-lg z-10">
          <div className="py-1">
            <Button 
              variant="ghost" 
              className="w-full justify-start px-4 py-2 text-sm" 
              onClick={handleAddWarranty}
            >
              Add Warranty
            </Button>
            <Button 
              variant="ghost" 
              className="w-full justify-start px-4 py-2 text-sm" 
              onClick={handleAddMaintenancePlan}
            >
              Add Maintenance Plan
            </Button>
          </div>
        </div>
      )}
    </div>
  );
};
