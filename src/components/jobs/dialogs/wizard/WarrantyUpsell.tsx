
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Shield, Star, CheckCircle, ArrowRight, TrendingUp } from 'lucide-react';
import { useProducts } from '@/hooks/useProducts';
import { formatCurrency } from '@/lib/utils';
import { useIsMobile } from '@/hooks/use-mobile';

interface LineItem {
  id: string;
  name: string;
  description?: string;
  quantity: number;
  unitPrice: number;
  taxable: boolean;
  isWarranty?: boolean;
}

interface WarrantyUpsellProps {
  currentItems: LineItem[];
  onItemsChange: (items: LineItem[]) => void;
  documentType: 'estimate' | 'invoice';
}

export const WarrantyUpsell = ({ currentItems, onItemsChange, documentType }: WarrantyUpsellProps) => {
  const [selectedWarranties, setSelectedWarranties] = useState<string[]>([]);
  const { products } = useProducts();
  const isMobile = useIsMobile();

  // Filter products to show only warranties
  const warranties = products.filter(product => 
    product.tags?.includes('warranty') || 
    product.category?.toLowerCase().includes('warranty') ||
    product.name.toLowerCase().includes('warranty')
  );

  // Mock warranty data if none exist
  const mockWarranties = warranties.length === 0 ? [
    {
      id: 'warranty-1',
      name: 'Extended Parts Warranty',
      description: 'Covers all parts for an additional 2 years beyond manufacturer warranty',
      price: 149.99,
      category: 'warranty',
      benefits: ['2 Year Extended Coverage', 'Free Parts Replacement', 'Priority Service'],
      popularity: 85
    },
    {
      id: 'warranty-2', 
      name: 'Labor Protection Plan',
      description: 'Covers labor costs for repairs and maintenance for 1 year',
      price: 89.99,
      category: 'warranty',
      benefits: ['1 Year Labor Coverage', 'Emergency Service', '24/7 Support'],
      popularity: 72
    },
    {
      id: 'warranty-3',
      name: 'Complete Care Package',
      description: 'Comprehensive coverage including parts, labor, and preventive maintenance',
      price: 299.99,
      category: 'warranty',
      benefits: ['Complete Coverage', 'Preventive Maintenance', 'Annual Inspections'],
      popularity: 64
    }
  ] : warranties;

  const addWarranty = (warranty: any) => {
    if (selectedWarranties.includes(warranty.id)) return;

    const warrantyItem: LineItem = {
      id: warranty.id,
      name: warranty.name,
      description: warranty.description,
      quantity: 1,
      unitPrice: warranty.price,
      taxable: true,
      isWarranty: true
    };

    setSelectedWarranties(prev => [...prev, warranty.id]);
    onItemsChange([...currentItems, warrantyItem]);
  };

  const removeWarranty = (warrantyId: string) => {
    setSelectedWarranties(prev => prev.filter(id => id !== warrantyId));
    onItemsChange(currentItems.filter(item => item.id !== warrantyId));
  };

  const isSelected = (warrantyId: string) => selectedWarranties.includes(warrantyId);

  const totalWithoutWarranty = currentItems
    .filter(item => !item.isWarranty)
    .reduce((sum, item) => sum + (item.quantity * item.unitPrice), 0);

  const warrantyValue = currentItems
    .filter(item => item.isWarranty)
    .reduce((sum, item) => sum + (item.quantity * item.unitPrice), 0);

  return (
    <div className={`space-y-6 ${isMobile ? 'space-y-4' : ''}`}>
      {/* Header */}
      <div className="text-center space-y-4">
        <div className="flex items-center justify-center gap-3">
          <div className="p-3 bg-primary/10 rounded-full">
            <Shield className="h-8 w-8 text-primary" />
          </div>
          <div>
            <h2 className={`font-bold ${isMobile ? 'text-lg' : 'text-2xl'}`}>
              Protect Your Investment
            </h2>
            <p className={`text-muted-foreground ${isMobile ? 'text-sm' : ''}`}>
              Add warranty protection to give your customer peace of mind
            </p>
          </div>
        </div>

        {/* Stats */}
        <div className={`grid grid-cols-2 gap-4 max-w-md mx-auto ${isMobile ? 'text-sm' : ''}`}>
          <div className="text-center">
            <div className={`font-bold text-primary ${isMobile ? 'text-lg' : 'text-2xl'}`}>87%</div>
            <div className="text-muted-foreground">Customer Satisfaction</div>
          </div>
          <div className="text-center">
            <div className={`font-bold text-green-600 ${isMobile ? 'text-lg' : 'text-2xl'}`}>+{formatCurrency(warrantyValue)}</div>
            <div className="text-muted-foreground">Added Value</div>
          </div>
        </div>
      </div>

      {/* Warranty Options */}
      <div className={`grid gap-4 ${isMobile ? 'grid-cols-1' : 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3'}`}>
        {mockWarranties.map((warranty) => (
          <Card 
            key={warranty.id}
            className={`relative transition-all cursor-pointer ${
              isSelected(warranty.id) 
                ? 'border-primary bg-primary/5 shadow-md' 
                : 'hover:border-primary/50 hover:shadow-sm'
            }`}
            onClick={() => isSelected(warranty.id) ? removeWarranty(warranty.id) : addWarranty(warranty)}
          >
            {/* Popularity Badge */}
            {warranty.popularity && warranty.popularity > 80 && (
              <div className="absolute -top-2 -right-2">
                <Badge className="bg-orange-500 text-white gap-1">
                  <Star className="h-3 w-3" />
                  Popular
                </Badge>
              </div>
            )}

            <CardHeader className={isMobile ? 'p-4 pb-2' : 'p-6 pb-4'}>
              <div className="flex items-start justify-between">
                <div>
                  <CardTitle className={isMobile ? 'text-base' : 'text-lg'}>
                    {warranty.name}
                  </CardTitle>
                  <div className={`font-bold text-primary mt-1 ${isMobile ? 'text-lg' : 'text-xl'}`}>
                    {formatCurrency(warranty.price)}
                  </div>
                </div>
                <div className={`ml-2 ${isSelected(warranty.id) ? 'text-primary' : 'text-gray-400'}`}>
                  <CheckCircle className="h-6 w-6" />
                </div>
              </div>
            </CardHeader>

            <CardContent className={isMobile ? 'p-4 pt-0' : 'p-6 pt-0'}>
              <p className={`text-muted-foreground mb-4 ${isMobile ? 'text-sm' : ''}`}>
                {warranty.description}
              </p>

              {/* Benefits */}
              {warranty.benefits && (
                <div className="space-y-2">
                  <h4 className={`font-medium ${isMobile ? 'text-sm' : ''}`}>Includes:</h4>
                  <ul className="space-y-1">
                    {warranty.benefits.map((benefit, index) => (
                      <li key={index} className={`flex items-center gap-2 ${isMobile ? 'text-sm' : ''}`}>
                        <CheckCircle className="h-3 w-3 text-green-600" />
                        <span className="text-muted-foreground">{benefit}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Action Button */}
              <Button 
                variant={isSelected(warranty.id) ? "default" : "outline"}
                className={`w-full mt-4 ${isMobile ? 'h-12' : ''}`}
                onClick={(e) => {
                  e.stopPropagation();
                  isSelected(warranty.id) ? removeWarranty(warranty.id) : addWarranty(warranty);
                }}
              >
                {isSelected(warranty.id) ? (
                  <>
                    <CheckCircle className="h-4 w-4 mr-2" />
                    Added
                  </>
                ) : (
                  <>
                    <Shield className="h-4 w-4 mr-2" />
                    Add Warranty
                  </>
                )}
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Revenue Impact */}
      {warrantyValue > 0 && (
        <Card className="bg-gradient-to-r from-green-50 to-emerald-50 border-green-200">
          <CardContent className={isMobile ? 'p-4' : 'p-6'}>
            <div className="flex items-center gap-4">
              <div className="p-3 bg-green-100 rounded-full">
                <TrendingUp className="h-6 w-6 text-green-600" />
              </div>
              <div className="flex-1">
                <h3 className={`font-semibold text-green-900 ${isMobile ? 'text-base' : 'text-lg'}`}>
                  Great Choice!
                </h3>
                <p className={`text-green-700 ${isMobile ? 'text-sm' : ''}`}>
                  You've added {formatCurrency(warrantyValue)} in warranty value to this {documentType}.
                  {documentType === 'estimate' && ' This increases your close rate by an average of 23%.'}
                </p>
              </div>
              <div className="text-right">
                <div className={`font-bold text-green-900 ${isMobile ? 'text-lg' : 'text-xl'}`}>
                  +{formatCurrency(warrantyValue)}
                </div>
                <div className={`text-green-600 ${isMobile ? 'text-xs' : 'text-sm'}`}>Revenue</div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Skip Option */}
      <div className="text-center">
        <p className={`text-muted-foreground ${isMobile ? 'text-sm' : ''}`}>
          {selectedWarranties.length === 0 
            ? "You can proceed without adding warranties, but they help protect your customer's investment."
            : `${selectedWarranties.length} warranty option${selectedWarranties.length > 1 ? 's' : ''} selected.`
          }
        </p>
      </div>
    </div>
  );
};
