
import React from "react";
import { UnifiedDocumentForm } from "@/components/jobs/dialogs/unified/UnifiedDocumentForm";
import { LineItem } from "@/components/jobs/builder/types";

interface InvoiceFormStepProps {
  formData: {
    invoiceNumber: string;
    items: LineItem[];
    notes: string;
    issueDate: string;
    dueDate: string;
  };
  onFormDataChange: (updates: any) => void;
  jobId: string;
}

// Lock tax rate to 13%
const LOCKED_TAX_RATE = 13;

export const InvoiceFormStep = ({ formData, onFormDataChange, jobId }: InvoiceFormStepProps) => {
  const handleUpdateLineItem = (id: string, field: string, value: any) => {
    const updatedItems = formData.items.map(item => 
      item.id === id ? { ...item, [field]: value } : item
    );
    onFormDataChange({ items: updatedItems });
  };

  const handleRemoveLineItem = (id: string) => {
    const updatedItems = formData.items.filter(item => item.id !== id);
    onFormDataChange({ items: updatedItems });
  };

  const handleEditLineItem = (id: string) => {
    return true;
  };

  const calculateSubtotal = () => {
    return formData.items.reduce((sum, item) => sum + (item.quantity * item.unitPrice), 0);
  };

  const calculateTotalTax = () => {
    const subtotal = calculateSubtotal();
    return subtotal * (LOCKED_TAX_RATE / 100);
  };

  const calculateGrandTotal = () => {
    return calculateSubtotal() + calculateTotalTax();
  };

  const calculateTotalMargin = () => {
    return formData.items.reduce((total, item) => {
      const margin = (item.unitPrice - (item.ourPrice || 0)) * item.quantity;
      return total + margin;
    }, 0);
  };

  const calculateMarginPercentage = () => {
    const subtotal = calculateSubtotal();
    const margin = calculateTotalMargin();
    return subtotal > 0 ? (margin / subtotal) * 100 : 0;
  };

  return (
    <UnifiedDocumentForm
      documentType="invoice"
      documentNumber={formData.invoiceNumber}
      lineItems={formData.items}
      onRemoveLineItem={handleRemoveLineItem}
      onUpdateLineItem={handleUpdateLineItem}
      onEditLineItem={handleEditLineItem}
      onAddEmptyLineItem={() => {}}
      onAddCustomLine={() => {}}
      taxRate={LOCKED_TAX_RATE}
      setTaxRate={() => {}} // No-op since tax rate is locked
      calculateSubtotal={calculateSubtotal}
      calculateTotalTax={calculateTotalTax}
      calculateGrandTotal={calculateGrandTotal}
      calculateTotalMargin={calculateTotalMargin}
      calculateMarginPercentage={calculateMarginPercentage}
      notes={formData.notes}
      setNotes={(notes) => onFormDataChange({ notes })}
      showMargin={false}
    />
  );
};
