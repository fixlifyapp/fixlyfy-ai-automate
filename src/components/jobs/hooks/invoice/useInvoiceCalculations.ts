
import { useCallback } from "react";
import { LineItem } from "@/components/jobs/builder/types";

export const useInvoiceCalculations = (lineItems: LineItem[], taxRate: number) => {
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

  return {
    calculateSubtotal,
    calculateTotalTax,
    calculateGrandTotal
  };
};
