
import { LineItem } from '@/components/jobs/builder/types';

interface UseDocumentCalculationsProps {
  lineItems: LineItem[];
  taxRate: number;
}

export const useDocumentCalculations = ({ lineItems, taxRate }: UseDocumentCalculationsProps) => {
  const calculateSubtotal = () => {
    return lineItems.reduce((sum, item) => {
      return sum + (item.quantity * item.unitPrice);
    }, 0);
  };

  const calculateTotalTax = () => {
    const taxableSubtotal = lineItems.reduce((sum, item) => {
      if (item.taxable) {
        return sum + (item.quantity * item.unitPrice);
      }
      return sum;
    }, 0);
    
    return taxableSubtotal * (taxRate / 100);
  };

  const calculateGrandTotal = () => {
    return calculateSubtotal() + calculateTotalTax();
  };

  const calculateTotalMargin = () => {
    return lineItems.reduce((sum, item) => {
      const cost = item.ourPrice || 0;
      const revenue = item.quantity * item.unitPrice;
      return sum + (revenue - (cost * item.quantity));
    }, 0);
  };

  const calculateMarginPercentage = () => {
    const total = calculateGrandTotal();
    const margin = calculateTotalMargin();
    return total > 0 ? (margin / total) * 100 : 0;
  };

  return {
    calculateSubtotal,
    calculateTotalTax,
    calculateGrandTotal,
    calculateTotalMargin,
    calculateMarginPercentage
  };
};
