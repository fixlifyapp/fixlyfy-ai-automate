
import { useCallback } from "react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { Product, LineItem } from "../../../builder/types";

export const useDocumentSmartFeatures = () => {
  // Generate smart notes based on job data
  const generateSmartNotes = useCallback((job: any, documentType: string): string => {
    const notes = [];
    
    if (job.service) {
      notes.push(`Service: ${job.service}`);
    }
    
    if (job.client?.type === 'Commercial') {
      notes.push('Commercial property - Net 30 payment terms');
    }
    
    if (documentType === 'estimate') {
      notes.push('This estimate is valid for 30 days from the date of issue.');
      notes.push('Warranty information will be provided upon acceptance.');
    } else {
      notes.push('Payment due within 30 days of invoice date.');
    }

    return notes.join('\n');
  }, []);

  // Smart line item suggestions
  const suggestLineItems = useCallback(async (jobData: any) => {
    if (!jobData) return;

    try {
      // Get common items for this service type
      const { data: commonItems } = await supabase
        .from('products')
        .select('*')
        .ilike('name', `%${jobData.service || 'service'}%`)
        .limit(3);

      if (commonItems && commonItems.length > 0) {
        toast.success(`Found ${commonItems.length} suggested items based on service type`);
      }
    } catch (error) {
      console.error('Error getting suggestions:', error);
    }
  }, []);

  // Smart product addition with pricing history
  const addProductWithSmartPricing = useCallback(async (
    product: Product,
    setLineItems: React.Dispatch<React.SetStateAction<LineItem[]>>
  ) => {
    try {
      const { data: historicalPricing } = await supabase
        .from('line_items')
        .select('unit_price')
        .eq('description', product.name)
        .order('created_at', { ascending: false })
        .limit(5);

      let suggestedPrice = product.price;
      
      if (historicalPricing && historicalPricing.length > 0) {
        // Calculate average of recent pricing
        const avgPrice = historicalPricing.reduce((sum, item) => sum + (item.unit_price || 0), 0) / historicalPricing.length;
        if (Math.abs(avgPrice - product.price) > product.price * 0.1) {
          suggestedPrice = avgPrice;
          toast.info(`Using recent pricing: $${avgPrice.toFixed(2)} (was $${product.price.toFixed(2)})`);
        }
      }

      const newLineItem: LineItem = {
        id: `item-${Date.now()}`,
        description: product.description || product.name,
        quantity: product.quantity || 1,
        unitPrice: suggestedPrice,
        taxable: product.taxable,
        discount: 0,
        ourPrice: product.ourPrice || 0,
        name: product.name,
        price: suggestedPrice,
        total: (product.quantity || 1) * suggestedPrice
      };
      
      setLineItems(prev => [...prev, newLineItem]);
    } catch (error) {
      console.error('Error adding product with smart pricing:', error);
      // Fallback to original logic
      const newLineItem: LineItem = {
        id: `item-${Date.now()}`,
        description: product.description || product.name,
        quantity: product.quantity || 1,
        unitPrice: product.price,
        taxable: product.taxable,
        discount: 0,
        ourPrice: product.ourPrice || 0,
        name: product.name,
        price: product.price,
        total: (product.quantity || 1) * product.price
      };
      
      setLineItems(prev => [...prev, newLineItem]);
    }
  }, []);

  return {
    generateSmartNotes,
    suggestLineItems,
    addProductWithSmartPricing
  };
};
