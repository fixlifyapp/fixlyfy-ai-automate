
import React from "react";
import { Button } from "@/components/ui/button";
import { ModernCard } from "@/components/ui/modern-card";
import { Badge } from "@/components/ui/badge";
import { Shield, Check, Star, TrendingUp } from "lucide-react";
import { LineItem } from "../../builder/types";

interface WarrantyUpsellStepProps {
  lineItems: LineItem[];
  onAddWarranty: (warranty: any) => void;
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
  // Mock warranty options
  const warrantyOptions = [
    {
      id: "basic",
      name: "Basic Protection Plan",
      description: "1-year coverage for parts and labor",
      price: 99,
      cost: 49,
      popular: false,
      features: ["1 Year Coverage", "Parts Included", "Labor Included", "Phone Support"]
    },
    {
      id: "premium",
      name: "Premium Protection Plan",
      description: "3-year comprehensive coverage with priority service",
      price: 249,
      cost: 124,
      popular: true,
      features: ["3 Years Coverage", "Parts & Labor", "Priority Service", "24/7 Support", "Annual Maintenance"]
    },
    {
      id: "ultimate",
      name: "Ultimate Care Plan",
      description: "5-year total care with replacement guarantee",
      price: 399,
      cost: 199,
      popular: false,
      features: ["5 Years Coverage", "Total Care", "Replacement Guarantee", "Priority Service", "Annual Maintenance", "Energy Efficiency Guarantee"]
    }
  ];

  const isSelected = (warrantyId: string) => selectedWarranties.includes(warrantyId);

  const handleWarrantyToggle = (warranty: any) => {
    if (isSelected(warranty.id)) {
      onRemoveWarranty(warranty.id);
    } else {
      onAddWarranty(warranty);
    }
  };

  const subtotal = lineItems.reduce((sum, item) => sum + (item.quantity * item.unitPrice), 0);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="text-center space-y-2">
        <div className="flex items-center justify-center gap-2 mb-4">
          <Shield className="h-8 w-8 text-primary" />
        </div>
        <h2 className="text-2xl font-bold">Protect Your Investment</h2>
        <p className="text-muted-foreground max-w-2xl mx-auto">
          Add warranty coverage to provide peace of mind and protect against unexpected repair costs.
          Our warranties are backed by industry-leading service and support.
        </p>
      </div>

      {/* Value Proposition */}
      <ModernCard className="p-6 bg-gradient-to-r from-blue-50 to-purple-50 border-blue-200">
        <div className="flex items-center gap-4">
          <div className="bg-blue-100 p-3 rounded-full">
            <TrendingUp className="h-6 w-6 text-blue-600" />
          </div>
          <div>
            <h3 className="font-semibold text-blue-900">Smart Investment</h3>
            <p className="text-blue-700">
              90% of our customers who purchase warranty coverage save money on future repairs
            </p>
          </div>
        </div>
      </ModernCard>

      {/* Warranty Options */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {warrantyOptions.map((warranty) => (
          <ModernCard
            key={warranty.id}
            className={`p-6 relative cursor-pointer transition-all duration-200 ${
              isSelected(warranty.id) 
                ? 'ring-2 ring-primary shadow-lg' 
                : 'hover:shadow-md'
            } ${warranty.popular ? 'border-primary' : ''}`}
            onClick={() => handleWarrantyToggle(warranty)}
          >
            {warranty.popular && (
              <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                <Badge className="bg-primary text-primary-foreground gap-1">
                  <Star className="h-3 w-3" />
                  Most Popular
                </Badge>
              </div>
            )}
            
            <div className="space-y-4">
              <div className="text-center">
                <h3 className="font-bold text-lg">{warranty.name}</h3>
                <p className="text-muted-foreground text-sm">{warranty.description}</p>
                <div className="mt-3">
                  <span className="text-3xl font-bold">${warranty.price}</span>
                  <span className="text-muted-foreground ml-1">one-time</span>
                </div>
              </div>

              <div className="space-y-2">
                {warranty.features.map((feature, index) => (
                  <div key={index} className="flex items-center gap-2">
                    <Check className="h-4 w-4 text-green-500" />
                    <span className="text-sm">{feature}</span>
                  </div>
                ))}
              </div>

              <Button
                variant={isSelected(warranty.id) ? "default" : "outline"}
                className="w-full"
                onClick={(e) => {
                  e.stopPropagation();
                  handleWarrantyToggle(warranty);
                }}
              >
                {isSelected(warranty.id) ? (
                  <>
                    <Check className="h-4 w-4 mr-2" />
                    Selected
                  </>
                ) : (
                  "Add Protection"
                )}
              </Button>
            </div>
          </ModernCard>
        ))}
      </div>

      {/* Summary */}
      {selectedWarranties.length > 0 && (
        <ModernCard className="p-4 bg-green-50 border-green-200">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Shield className="h-5 w-5 text-green-600" />
              <span className="font-medium text-green-900">
                {selectedWarranties.length} warranty plan{selectedWarranties.length > 1 ? 's' : ''} selected
              </span>
            </div>
            <div className="text-right">
              <p className="text-sm text-green-700">Additional protection value:</p>
              <p className="font-bold text-green-900">
                +${warrantyOptions
                  .filter(w => selectedWarranties.includes(w.id))
                  .reduce((sum, w) => sum + w.price, 0)}
              </p>
            </div>
          </div>
        </ModernCard>
      )}

      {/* Skip Option */}
      <div className="text-center py-4">
        <p className="text-muted-foreground text-sm mb-3">
          No warranty needed right now? You can always add protection later.
        </p>
        <Button variant="ghost" onClick={onContinue} className="text-muted-foreground">
          Skip warranty options
        </Button>
      </div>
    </div>
  );
};
