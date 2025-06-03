import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Separator } from "@/components/ui/separator";
import { TrendingUp, Shield, Calculator, DollarSign, Plus } from "lucide-react";
import { useProducts } from "@/hooks/useProducts";

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
  existingUpsellItems?: UpsellItem[]; // Add prop to track existing upsells
}

export const EstimateUpsellStep = ({ 
  onContinue, 
  onBack, 
  estimateTotal, 
  existingUpsellItems = [] 
}: EstimateUpsellStepProps) => {
  const [notes, setNotes] = useState("");
  const [upsellItems, setUpsellItems] = useState<UpsellItem[]>([]);
  const [isProcessing, setIsProcessing] = useState(false); // Prevent multiple submissions
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

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5" />
            Available Warranties
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {upsellItems.length === 0 ? (
            <div className="text-center py-8">
              <Shield className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <p className="text-muted-foreground">No warranty products available</p>
              <p className="text-sm text-muted-foreground mt-1">Add warranty products to your catalog to offer them to customers.</p>
            </div>
          ) : (
            upsellItems.map((item) => {
              const Icon = item.icon;
              const isAlreadyAdded = existingUpsellItems.some(existing => 
                existing.id === item.id && existing.selected
              );
              
              return (
                <div key={item.id} className="flex items-center justify-between p-4 border rounded-lg">
                  <div className="flex items-start gap-3 flex-1">
                    <Icon className="h-5 w-5 text-blue-600 mt-0.5" />
                    <div className="flex-1">
                      <h4 className="font-medium flex items-center gap-2">
                        {item.title}
                        {isAlreadyAdded && (
                          <span className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded-full">
                            Already Added
                          </span>
                        )}
                      </h4>
                      {item.description && (
                        <p className="text-sm text-muted-foreground">{item.description}</p>
                      )}
                      <p className="text-lg font-semibold text-green-600 mt-1">
                        +${item.price.toFixed(2)}
                      </p>
                    </div>
                  </div>
                  <Switch
                    checked={item.selected}
                    onCheckedChange={() => handleUpsellToggle(item.id)}
                    disabled={isProcessing}
                  />
                </div>
              );
            })
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Additional Notes</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            <Label htmlFor="upsell-notes">Special Instructions or Comments</Label>
            <Textarea
              id="upsell-notes"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Add any special notes or instructions for the client..."
              rows={3}
            />
          </div>
        </CardContent>
      </Card>

      <Card className="bg-gradient-to-br from-blue-50 to-indigo-50 border-blue-200">
        <CardHeader className="pb-4">
          <CardTitle className="flex items-center gap-2 text-blue-900">
            <Calculator className="h-5 w-5" />
            Estimate Summary
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Base Estimate */}
          <div className="flex items-center justify-between p-3 bg-white rounded-lg border">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center">
                <DollarSign className="h-5 w-5 text-blue-600" />
              </div>
              <div>
                <p className="font-medium text-gray-900">Base Estimate</p>
                <p className="text-sm text-gray-500">Service and materials</p>
              </div>
            </div>
            <span className="text-lg font-semibold text-gray-900">${estimateTotal.toFixed(2)}</span>
          </div>

          {/* Selected Add-ons */}
          {selectedUpsells.length > 0 && (
            <div className="space-y-2">
              <div className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-2">
                <Plus className="h-4 w-4" />
                Selected Add-ons
              </div>
              {selectedUpsells.map(item => (
                <div key={item.id} className="flex items-center justify-between p-3 bg-green-50 rounded-lg border border-green-200">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-green-100 flex items-center justify-center">
                      <Shield className="h-4 w-4 text-green-600" />
                    </div>
                    <div>
                      <p className="font-medium text-green-900">{item.title}</p>
                      <p className="text-sm text-green-600">Extended protection</p>
                    </div>
                  </div>
                  <span className="font-semibold text-green-700">+${item.price.toFixed(2)}</span>
                </div>
              ))}
              
              <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg border-2 border-dashed border-gray-300">
                <span className="font-medium text-gray-700">Add-ons Subtotal:</span>
                <span className="font-semibold text-gray-900">${upsellTotal.toFixed(2)}</span>
              </div>
            </div>
          )}

          {/* Grand Total */}
          <Separator className="my-4" />
          <div className="flex items-center justify-between p-4 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-lg text-white">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-full bg-white/20 flex items-center justify-center">
                <Calculator className="h-6 w-6" />
              </div>
              <div>
                <p className="text-lg font-semibold">Total Estimate</p>
                <p className="text-blue-100 text-sm">Final amount</p>
              </div>
            </div>
            <span className="text-2xl font-bold">${grandTotal.toFixed(2)}</span>
          </div>
        </CardContent>
      </Card>

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
