
import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Shield, DollarSign, TrendingUp, Check, Info, ArrowRight, X } from "lucide-react";
import { useProducts } from "@/hooks/useProducts";
import { LineItem } from "../../builder/types";
import { formatCurrency } from "@/lib/utils";
import { toast } from "sonner";

interface WarrantyProduct {
  id: string;
  name: string;
  description?: string;
  price: number;
  cost: number;
  margin: number;
  marginPercent: number;
  benefits: string[];
  recommended: boolean;
}

interface WarrantyUpsellStepProps {
  lineItems: LineItem[];
  onAddWarranty: (warranty: WarrantyProduct) => void;
  onRemoveWarranty: (warrantyId: string) => void;
  onContinue: () => void;
  onBack: () => void;
  selectedWarranties: string[];
}

export const WarrantyUpsellStep = ({
  lineItems,
  onAddWarranty,
  onRemoveWarranty,
  onContinue,
  onBack,
  selectedWarranties
}: WarrantyUpsellStepProps) => {
  const { products, isLoading } = useProducts();
  const [warranties, setWarranties] = useState<WarrantyProduct[]>([]);
  const [showSkipConfirm, setShowSkipConfirm] = useState(false);

  // Filter and transform warranty products
  useEffect(() => {
    if (products.length > 0) {
      const warrantyProducts = products.filter(product => 
        product.tags?.some(tag => 
          tag.toLowerCase().includes('warranty') || 
          tag.toLowerCase().includes('warranties')
        ) || 
        product.name.toLowerCase().includes('warranty') ||
        product.category?.toLowerCase().includes('warranty')
      );

      const transformedWarranties: WarrantyProduct[] = warrantyProducts.map(product => {
        const margin = product.price - product.cost;
        const marginPercent = product.price > 0 ? (margin / product.price) * 100 : 0;
        
        return {
          id: product.id,
          name: product.name,
          description: product.description,
          price: product.price,
          cost: product.cost,
          margin,
          marginPercent,
          benefits: generateBenefits(product.name, product.description),
          recommended: marginPercent > 50 // Mark high-margin warranties as recommended
        };
      });

      setWarranties(transformedWarranties);
    }
  }, [products]);

  const generateBenefits = (name: string, description?: string): string[] => {
    const baseBenefits = [
      "Peace of mind for customer",
      "Covers unexpected repairs",
      "Builds customer trust",
      "Increases service value"
    ];

    // Add specific benefits based on warranty type
    if (name.toLowerCase().includes('extended')) {
      baseBenefits.push("Extended coverage period");
    }
    if (name.toLowerCase().includes('parts')) {
      baseBenefits.push("Parts replacement included");
    }
    if (name.toLowerCase().includes('labor')) {
      baseBenefits.push("Labor costs covered");
    }

    return baseBenefits.slice(0, 4); // Limit to 4 benefits
  };

  const handleWarrantyToggle = (warranty: WarrantyProduct, enabled: boolean) => {
    if (enabled) {
      onAddWarranty(warranty);
      toast.success(`${warranty.name} added to estimate`);
    } else {
      onRemoveWarranty(warranty.id);
      toast.success(`${warranty.name} removed from estimate`);
    }
  };

  const handleSkip = () => {
    if (selectedWarranties.length === 0) {
      setShowSkipConfirm(true);
    } else {
      onContinue();
    }
  };

  const confirmSkip = () => {
    setShowSkipConfirm(false);
    onContinue();
  };

  const totalWarrantyValue = warranties
    .filter(w => selectedWarranties.includes(w.id))
    .reduce((sum, w) => sum + w.price, 0);

  const totalWarrantyMargin = warranties
    .filter(w => selectedWarranties.includes(w.id))
    .reduce((sum, w) => sum + w.margin, 0);

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="text-center">
          <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full mx-auto"></div>
          <p className="mt-2 text-muted-foreground">Loading warranty options...</p>
        </div>
      </div>
    );
  }

  if (warranties.length === 0) {
    return (
      <div className="space-y-6">
        <div className="text-center py-8">
          <Shield className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
          <h3 className="text-lg font-semibold mb-2">No Warranties Available</h3>
          <p className="text-muted-foreground mb-4">
            No warranty products found in your catalog. Consider adding warranty products with "warranty" tags.
          </p>
          <Button onClick={onContinue}>Continue Without Warranties</Button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="text-center">
        <h3 className="text-xl font-semibold mb-2">Enhance Customer Protection</h3>
        <p className="text-muted-foreground">
          Add warranties to increase customer satisfaction and boost revenue
        </p>
      </div>

      {/* Summary Card */}
      {selectedWarranties.length > 0 && (
        <Card className="bg-primary/5 border-primary/20">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="bg-primary/10 p-2 rounded-lg">
                  <TrendingUp className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <p className="font-semibold">Additional Revenue</p>
                  <p className="text-sm text-muted-foreground">
                    {selectedWarranties.length} warranty{selectedWarranties.length !== 1 ? 'ies' : ''} selected
                  </p>
                </div>
              </div>
              <div className="text-right">
                <p className="text-lg font-bold text-primary">{formatCurrency(totalWarrantyValue)}</p>
                <p className="text-sm text-green-600">+{formatCurrency(totalWarrantyMargin)} margin</p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Warranty Options */}
      <div className="grid gap-4 md:grid-cols-2">
        {warranties.map((warranty) => (
          <Card key={warranty.id} className={`relative transition-all duration-200 ${
            selectedWarranties.includes(warranty.id) 
              ? 'ring-2 ring-primary bg-primary/5' 
              : 'hover:shadow-md'
          }`}>
            {warranty.recommended && (
              <Badge className="absolute -top-2 left-4 bg-orange-500 text-white">
                Recommended
              </Badge>
            )}
            
            <CardHeader className="pb-3">
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                  <div className="bg-blue-100 p-2 rounded-lg">
                    <Shield className="h-5 w-5 text-blue-600" />
                  </div>
                  <div>
                    <h4 className="font-semibold">{warranty.name}</h4>
                    <p className="text-sm text-muted-foreground">
                      {warranty.description || "Comprehensive warranty coverage"}
                    </p>
                  </div>
                </div>
                <Switch
                  checked={selectedWarranties.includes(warranty.id)}
                  onCheckedChange={(checked) => handleWarrantyToggle(warranty, checked)}
                />
              </div>
            </CardHeader>

            <CardContent className="space-y-4">
              {/* Pricing */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <DollarSign className="h-4 w-4 text-green-600" />
                  <span className="font-semibold">{formatCurrency(warranty.price)}</span>
                </div>
                <Badge variant="outline" className="text-green-600 border-green-200">
                  {warranty.marginPercent.toFixed(0)}% margin
                </Badge>
              </div>

              {/* Benefits */}
              <div className="space-y-2">
                <p className="text-sm font-medium text-muted-foreground">Benefits:</p>
                <ul className="space-y-1">
                  {warranty.benefits.map((benefit, index) => (
                    <li key={index} className="flex items-center gap-2 text-sm">
                      <Check className="h-3 w-3 text-green-500 flex-shrink-0" />
                      {benefit}
                    </li>
                  ))}
                </ul>
              </div>

              {/* Why Recommend */}
              <div className="bg-blue-50 p-3 rounded-lg">
                <div className="flex items-start gap-2">
                  <Info className="h-4 w-4 text-blue-600 flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="text-sm font-medium text-blue-900">Why recommend this?</p>
                    <p className="text-xs text-blue-700 mt-1">
                      Warranties increase customer satisfaction, reduce callbacks, and provide 
                      additional profit margin of {formatCurrency(warranty.margin)}.
                    </p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Skip Confirmation Modal */}
      {showSkipConfirm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <Card className="w-full max-w-md mx-4">
            <CardHeader>
              <div className="flex items-center gap-3">
                <div className="bg-orange-100 p-2 rounded-lg">
                  <Info className="h-5 w-5 text-orange-600" />
                </div>
                <div>
                  <h4 className="font-semibold">Skip Warranties?</h4>
                  <p className="text-sm text-muted-foreground">
                    You're missing out on additional revenue
                  </p>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-sm">
                Adding warranties can increase your profit margin and provide better customer protection. 
                Are you sure you want to skip this step?
              </p>
              <div className="flex gap-2">
                <Button 
                  variant="outline" 
                  onClick={() => setShowSkipConfirm(false)}
                  className="flex-1"
                >
                  Add Warranties
                </Button>
                <Button 
                  onClick={confirmSkip}
                  variant="destructive"
                  className="flex-1"
                >
                  Skip Anyway
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Navigation */}
      <div className="flex justify-between pt-4 border-t">
        <Button variant="outline" onClick={onBack}>
          Back to Items
        </Button>
        <div className="flex gap-2">
          <Button variant="ghost" onClick={handleSkip}>
            <X className="h-4 w-4 mr-2" />
            Skip Warranties
          </Button>
          <Button onClick={onContinue}>
            Continue
            <ArrowRight className="h-4 w-4 ml-2" />
          </Button>
        </div>
      </div>
    </div>
  );
};
