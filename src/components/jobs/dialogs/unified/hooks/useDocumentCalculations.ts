
import { useMemo } from "react";
import { LineItem } from "../../../builder/types";

interface UseDocumentCalculationsProps {
  lineItems: LineItem[];
  taxRate: number;
}

export const useDocumentCalculations = ({ lineItems, taxRate }: UseDocumentCalculationsProps) => {
  const calculateSubtotal = useMemo(() => {
    return () => {
      return lineItems.reduce((total, item) => {
        const lineTotal = item.quantity * item.unitPrice;
        const discountAmount = item.discount ? lineTotal * (item.discount / 100) : 0;
        return total + (lineTotal - discountAmount);
      }, 0);
    };
  }, [lineItems]);

  const calculateTotalTax = useMemo(() => {
    return () => {
      const taxableTotal = lineItems.reduce((total, item) => {
        // Only apply tax if item is explicitly taxable (default to true if not specified)
        if (item.taxable !== false) {
          const lineTotal = item.quantity * item.unitPrice;
          const discountAmount = item.discount ? lineTotal * (item.discount / 100) : 0;
          return total + (lineTotal - discountAmount);
        }
        return total;
      }, 0);
      return (taxableTotal * taxRate) / 100;
    };
  }, [lineItems, taxRate]);

  const calculateGrandTotal = useMemo(() => {
    return () => {
      return calculateSubtotal() + calculateTotalTax();
    };
  }, [calculateSubtotal, calculateTotalTax]);

  const calculateTotalMargin = useMemo(() => {
    return () => {
      return lineItems.reduce((total, item) => {
        const cost = item.ourPrice || 0;
        const lineTotal = item.quantity * item.unitPrice;
        const discountAmount = item.discount ? lineTotal * (item.discount / 100) : 0;
        const revenue = lineTotal - discountAmount;
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
    calculateMarginPercentage
  };
};
