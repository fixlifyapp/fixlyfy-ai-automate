
import { useMemo } from "react";
import { LineItem } from "../../../builder/types";

interface UseDocumentCalculationsProps {
  lineItems: LineItem[];
  taxRate?: number; // Add taxRate as optional prop
}

// Lock tax rate to 13% globally
const LOCKED_TAX_RATE = 13;

export const useDocumentCalculations = ({ lineItems, taxRate }: UseDocumentCalculationsProps) => {
  // Use the passed taxRate or fallback to locked rate
  const effectiveTaxRate = taxRate || LOCKED_TAX_RATE;

  const calculateSubtotal = useMemo(() => {
    return () => {
      return lineItems.reduce((total, item) => {
        return total + (item.quantity * item.unitPrice);
      }, 0);
    };
  }, [lineItems]);

  const calculateTotalTax = useMemo(() => {
    return () => {
      const taxableTotal = lineItems.reduce((total, item) => {
        if (item.taxable) {
          return total + (item.quantity * item.unitPrice);
        }
        return total;
      }, 0);
      console.log('useDocumentCalculations - Using tax rate:', effectiveTaxRate);
      return (taxableTotal * effectiveTaxRate) / 100;
    };
  }, [lineItems, effectiveTaxRate]);

  const calculateGrandTotal = useMemo(() => {
    return () => {
      return calculateSubtotal() + calculateTotalTax();
    };
  }, [calculateSubtotal, calculateTotalTax]);

  const calculateTotalMargin = useMemo(() => {
    return () => {
      return lineItems.reduce((total, item) => {
        const cost = item.ourPrice || 0;
        const revenue = item.quantity * item.unitPrice;
        return total + (revenue - (cost * item.quantity));
      }, 0);
    };
  }, [lineItems]);

  const calculateMarginPercentage = useMemo(() => {
    return () => {
      const totalRevenue = calculateSubtotal();
      const totalMargin = calculateTotalMargin();
      
      if (totalRevenue === 0) return 0;
      return (totalMargin / totalRevenue) * 100;
    };
  }, [calculateSubtotal, calculateTotalMargin]);

  return {
    calculateSubtotal,
    calculateTotalTax,
    calculateGrandTotal,
    calculateTotalMargin,
    calculateMarginPercentage,
    taxRate: effectiveTaxRate,
    taxLabel: `Tax (${effectiveTaxRate}%)`,
    taxDisplayText: `${effectiveTaxRate}% Tax`
  };
};
