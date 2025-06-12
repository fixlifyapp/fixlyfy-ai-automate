
import React from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { PlusCircle, Trash2 } from "lucide-react";
import { LineItem } from "@/components/jobs/builder/types";
import { formatCurrency } from "@/lib/utils";

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

export const InvoiceFormStep = ({ formData, onFormDataChange }: InvoiceFormStepProps) => {
  const addLineItem = () => {
    const newItem: LineItem = {
      id: Date.now().toString(),
      description: "",
      quantity: 1,
      unitPrice: 0,
      taxable: true,
      total: 0,
      ourPrice: 0,
      name: "",
      price: 0
    };
    onFormDataChange({ items: [...formData.items, newItem] });
  };

  const removeLineItem = (id: string) => {
    if (formData.items.length > 1) {
      const updatedItems = formData.items.filter(item => item.id !== id);
      onFormDataChange({ items: updatedItems });
    }
  };

  const updateLineItem = (id: string, field: keyof LineItem, value: any) => {
    const updatedItems = formData.items.map(item => {
      if (item.id === id) {
        const updatedItem = { ...item, [field]: value };
        if (field === 'quantity' || field === 'unitPrice') {
          updatedItem.total = updatedItem.quantity * updatedItem.unitPrice;
          updatedItem.price = updatedItem.unitPrice;
        }
        return updatedItem;
      }
      return item;
    });
    onFormDataChange({ items: updatedItems });
  };

  const calculateSubtotal = () => {
    return formData.items.reduce((sum, item) => sum + item.total, 0);
  };

  const calculateTax = () => {
    const taxableAmount = formData.items.reduce((sum, item) => {
      return sum + (item.taxable ? item.total : 0);
    }, 0);
    return taxableAmount * 0.1; // 10% tax rate
  };

  const calculateTotal = () => {
    return calculateSubtotal() + calculateTax();
  };

  return (
    <div className="space-y-6">
      {/* Basic Info */}
      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label htmlFor="invoiceNumber">Invoice Number</Label>
          <Input
            id="invoiceNumber"
            value={formData.invoiceNumber}
            onChange={(e) => onFormDataChange({ invoiceNumber: e.target.value })}
            placeholder="INV-001"
          />
        </div>
        <div>
          <Label htmlFor="issueDate">Issue Date</Label>
          <Input
            id="issueDate"
            type="date"
            value={formData.issueDate}
            onChange={(e) => onFormDataChange({ issueDate: e.target.value })}
          />
        </div>
      </div>

      {/* Line Items */}
      <div>
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-semibold">Items & Services</h3>
          <Button onClick={addLineItem} variant="outline" size="sm">
            <PlusCircle className="h-4 w-4 mr-2" />
            Add Item
          </Button>
        </div>

        <div className="space-y-3">
          {formData.items.map((item) => (
            <div key={item.id} className="border rounded-lg p-4">
              <div className="grid grid-cols-12 gap-3 items-center">
                <div className="col-span-4">
                  <Label className="text-xs">Description</Label>
                  <Input
                    value={item.description}
                    onChange={(e) => updateLineItem(item.id, 'description', e.target.value)}
                    placeholder="Service description"
                  />
                </div>
                <div className="col-span-2">
                  <Label className="text-xs">Quantity</Label>
                  <Input
                    type="number"
                    value={item.quantity}
                    onChange={(e) => updateLineItem(item.id, 'quantity', Number(e.target.value) || 0)}
                    min="0"
                    step="0.01"
                  />
                </div>
                <div className="col-span-2">
                  <Label className="text-xs">Unit Price</Label>
                  <Input
                    type="number"
                    value={item.unitPrice}
                    onChange={(e) => updateLineItem(item.id, 'unitPrice', Number(e.target.value) || 0)}
                    min="0"
                    step="0.01"
                  />
                </div>
                <div className="col-span-2">
                  <Label className="text-xs">Total</Label>
                  <div className="font-medium pt-2">
                    {formatCurrency(item.total)}
                  </div>
                </div>
                <div className="col-span-1">
                  <Label className="text-xs">Taxable</Label>
                  <input
                    type="checkbox"
                    checked={item.taxable}
                    onChange={(e) => updateLineItem(item.id, 'taxable', e.target.checked)}
                    className="mt-2"
                  />
                </div>
                <div className="col-span-1">
                  {formData.items.length > 1 && (
                    <Button
                      onClick={() => removeLineItem(item.id)}
                      variant="outline"
                      size="sm"
                      className="mt-4"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Totals */}
      <div className="bg-gray-50 p-4 rounded-lg">
        <div className="space-y-2">
          <div className="flex justify-between">
            <span>Subtotal:</span>
            <span>{formatCurrency(calculateSubtotal())}</span>
          </div>
          <div className="flex justify-between">
            <span>Tax (10%):</span>
            <span>{formatCurrency(calculateTax())}</span>
          </div>
          <div className="border-t pt-2">
            <div className="flex justify-between text-lg font-bold">
              <span>Total:</span>
              <span>{formatCurrency(calculateTotal())}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Notes */}
      <div>
        <Label htmlFor="notes">Notes</Label>
        <Textarea
          id="notes"
          value={formData.notes}
          onChange={(e) => onFormDataChange({ notes: e.target.value })}
          placeholder="Additional notes..."
          rows={3}
        />
      </div>
    </div>
  );
};
