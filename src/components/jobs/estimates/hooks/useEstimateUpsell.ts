
import { useState } from 'react';
import { Product } from '../../builder/types';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

interface UpsellRecommendation {
  id: string;
  product: Product;
  reason: string;
  confidence: number;
}

export const useEstimateUpsell = (estimateId: string) => {
  const [recommendations, setRecommendations] = useState<UpsellRecommendation[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  // Mock warranty and upsell products
  const warrantyProducts: Product[] = [
    {
      id: 'warranty-1yr',
      name: '1-Year Extended Warranty',
      price: 99,
      description: 'Extends warranty coverage for 1 additional year',
      ourprice: 25,
      category: 'Warranty',
      unit: 'each',
      taxable: true
    },
    {
      id: 'warranty-2yr',
      name: '2-Year Extended Warranty',
      price: 179,
      description: 'Extends warranty coverage for 2 additional years',
      ourprice: 45,
      category: 'Warranty',
      unit: 'each',
      taxable: true
    }
  ];

  const generateRecommendations = async (currentItems: any[]) => {
    setIsLoading(true);
    try {
      // Generate AI-powered upsell recommendations based on current items
      const mockRecommendations: UpsellRecommendation[] = [];

      // Add warranty recommendations
      warrantyProducts.forEach(product => {
        mockRecommendations.push({
          id: `rec-${product.id}`,
          product,
          reason: 'Protect your investment with extended warranty coverage',
          confidence: 0.85
        });
      });

      // Add service-specific upsells based on current items
      if (currentItems.some(item => {
        const description = typeof item === 'object' && item !== null 
          ? (item as any).description || ''
          : String(item);
        return description.toLowerCase().includes('hvac');
      })) {
        mockRecommendations.push({
          id: 'rec-maintenance',
          product: {
            id: 'hvac-maintenance',
            name: 'Annual HVAC Maintenance Plan',
            price: 199,
            description: 'Yearly maintenance plan with 2 service visits',
            ourprice: 75,
            category: 'Service Plan',
            unit: 'plan',
            taxable: true
          },
          reason: 'Regular maintenance extends equipment life and improves efficiency',
          confidence: 0.92
        });
      }

      setRecommendations(mockRecommendations);
    } catch (error) {
      console.error('Error generating recommendations:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const addUpsellToEstimate = async (productId: string) => {
    try {
      const product = recommendations.find(r => r.product.id === productId)?.product;
      if (!product) throw new Error('Product not found');

      // Get current estimate
      const { data: estimate, error: fetchError } = await supabase
        .from('estimates')
        .select('*')
        .eq('id', estimateId)
        .single();

      if (fetchError) throw fetchError;

      // Add new item to existing items with proper type handling
      const currentItems = Array.isArray(estimate.items) ? estimate.items : [];
      const newItem = {
        id: `item-${Date.now()}`,
        description: product.name,
        quantity: 1,
        unitPrice: product.price,
        total: product.price,
        taxable: product.taxable || true,
        ourPrice: product.ourprice || 0
      };

      const updatedItems = [...currentItems, newItem];

      // Recalculate totals safely with type guards and Number conversion
      const subtotal = updatedItems.reduce((sum, item: any) => {
        if (typeof item === 'object' && item !== null) {
          const itemTotal = Number(item.total) || (Number(item.quantity || 0) * Number(item.unitPrice || 0)) || 0;
          return sum + itemTotal;
        }
        return sum;
      }, 0);
      
      const taxAmount = subtotal * (Number(estimate.tax_rate) || 0.1);
      const total = subtotal + taxAmount;

      // Update estimate
      const { error: updateError } = await supabase
        .from('estimates')
        .update({
          items: updatedItems,
          subtotal,
          tax_amount: taxAmount,
          total,
          updated_at: new Date().toISOString()
        })
        .eq('id', estimateId);

      if (updateError) throw updateError;

      toast.success(`${product.name} added to estimate`);
      return true;
    } catch (error: any) {
      console.error('Error adding upsell to estimate:', error);
      toast.error('Failed to add item to estimate');
      return false;
    }
  };

  return {
    recommendations,
    isLoading,
    generateRecommendations,
    addUpsellToEstimate
  };
};
