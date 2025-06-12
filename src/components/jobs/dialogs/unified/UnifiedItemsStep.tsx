
import React from "react";
import { LineItem, Product } from "../../builder/types";
import { DocumentType } from "../UnifiedDocumentBuilder";
import { UnifiedDocumentForm } from "./UnifiedDocumentForm";

interface UnifiedItemsStepProps {
  documentType: DocumentType;
  documentNumber: string;
  lineItems: LineItem[];
  taxRate: number;
  notes: string;
  onLineItemsChange: (items: LineItem[]) => void;
  onTaxRateChange: (rate: number) => void;
  onNotesChange: (notes: string) => void;
  onAddProduct: (product: Product) => void;
  onRemoveLineItem: (id: string) => void;
  onUpdateLineItem: (id: string, field: string, value: any) => void;
  calculateSubtotal: () => number;
  calculateTotalTax: () => number;
  calculateGrandTotal: () => number;
}

export const UnifiedItemsStep = ({
  documentType,
  documentNumber,
  lineItems,
  taxRate,
  notes,
  onLineItemsChange,
  onTaxRateChange,
  onNotesChange,
  onAddProduct,
  onRemoveLineItem,
  onUpdateLineItem,
  calculateSubtotal,
  calculateTotalTax,
  calculateGrandTotal
}: UnifiedItemsStepProps) => {
  const handleAddEmptyLineItem = () => {
    const newItem: LineItem = {
      id: `temp-${Date.now()}`,
      description: '',
      quantity: 1,
      unitPrice: 0,
      taxable: true,
      discount: 0,
      total: 0
    };
    onLineItemsChange([...lineItems, newItem]);
  };

  const handleAddCustomLine = () => {
    const newItem: LineItem = {
      id: `custom-${Date.now()}`,
      description: 'Custom Service',
      quantity: 1,
      unitPrice: 0,
      taxable: true,
      discount: 0,
      total: 0
    };
    onLineItemsChange([...lineItems, newItem]);
  };

  return (
    <UnifiedDocumentForm
      documentType={documentType}
      documentNumber={documentNumber}
      lineItems={lineItems}
      onRemoveLineItem={onRemoveLineItem}
      onUpdateLineItem={onUpdateLineItem}
      onAddEmptyLineItem={handleAddEmptyLineItem}
      onAddCustomLine={handleAddCustomLine}
      taxRate={taxRate}
      setTaxRate={onTaxRateChange}
      calculateSubtotal={calculateSubtotal}
      calculateTotalTax={calculateTotalTax}
      calculateGrandTotal={calculateGrandTotal}
      notes={notes}
      setNotes={onNotesChange}
    />
  );
};
