
import { useMemo, useCallback } from "react";
import { LineItem } from "../../../builder/types";

interface UseDocumentCalculationsProps {
  lineItems: LineItem[];
  taxRate: number;
}

export const useDocumentCalculations = ({ lineItems, taxRate }: UseDocumentCalculationsProps) => {
  const calculateSubtotal = useCallback(() => {
    return lineItems.reduce((sum, item) => sum + (item.quantity * item.unitPrice), 0);
  }, [lineItems]);

  const calculateTotalTax = useCallback(() => {
    const subtotal = calculateSubtotal();
    return subtotal * (taxRate / 100);
  }, [calculateSubtotal, taxRate]);

  const calculateGrandTotal = useCallback(() => {
    return calculateSubtotal() + calculateTotalTax();
  }, [calculateSubtotal, calculateTotalTax]);

  const calculateTotalMargin = useCallback(() => {
    return lineItems.reduce((sum, item) => {
      const itemMargin = (item.unitPrice - (item.ourPrice || 0)) * item.quantity;
      return sum + itemMargin;
    }, 0);
  }, [lineItems]);

  const calculateMarginPercentage = useCallback(() => {
    const totalRevenue = calculateSubtotal();
    const totalMargin = calculateTotalMargin();
    return totalRevenue > 0 ? (totalMargin / totalRevenue) * 100 : 0;
  }, [calculateSubtotal, calculateTotalMargin]);

  return {
    calculateSubtotal,
    calculateTotalTax,
    calculateGrandTotal,
    calculateTotalMargin,
    calculateMarginPercentage
  };
};
