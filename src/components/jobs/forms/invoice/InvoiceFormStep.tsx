
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Plus, Trash2, Receipt } from "lucide-react";
import { Checkbox } from "@/components/ui/checkbox";

interface InvoiceFormStepProps {
  formData: any;
  onUpdateFormData: (updates: any) => void;
  isFromEstimate?: boolean;
}

export const InvoiceFormStep = ({ formData, onUpdateFormData, isFromEstimate }: InvoiceFormStepProps) => {
  const addItem = () => {
    const newItem = {
      description: "",
      quantity: 1,
      unitPrice: 0,
      taxable: true
    };
    
    onUpdateFormData({
      items: [...formData.items, newItem]
    });
  };

  const updateItem = (index: number, field: string, value: any) => {
    const updatedItems = [...formData.items];
    updatedItems[index] = { ...updatedItems[index], [field]: value };
    onUpdateFormData({ items: updatedItems });
  };

  const removeItem = (index: number) => {
    const updatedItems = formData.items.filter((_: any, i: number) => i !== index);
    onUpdateFormData({ items: updatedItems });
  };

  const calculateSubtotal = () => {
    return formData.items.reduce((sum: number, item: any) => sum + (item.quantity * item.unitPrice), 0);
  };

  const calculateTax = () => {
    return formData.items.reduce((sum: number, item: any) => {
      if (item.taxable) {
        return sum + (item.quantity * item.unitPrice * 0.13); // 13% tax
      }
      return sum;
    }, 0);
  };

  const calculateTotal = () => {
    return calculateSubtotal() + calculateTax();
  };

  return (
    <div className="space-y-6">
      {isFromEstimate && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <div className="flex items-center gap-2">
            <Receipt className="h-4 w-4 text-blue-600" />
            <span className="text-sm font-medium text-blue-800">
              Converting from Estimate
            </span>
          </div>
          <p className="text-xs text-blue-600 mt-1">
            Items have been imported from the estimate. You can edit or remove items before creating the invoice.
          </p>
        </div>
      )}

      <div className="grid grid-cols-3 gap-4">
        <div>
          <Label htmlFor="invoiceNumber">Invoice Number</Label>
          <Input
            id="invoiceNumber"
            value={formData.invoiceNumber}
            onChange={(e) => onUpdateFormData({ invoiceNumber: e.target.value })}
          />
        </div>
        
        <div>
          <Label htmlFor="issueDate">Issue Date</Label>
          <Input
            id="issueDate"
            type="date"
            value={formData.issueDate}
            onChange={(e) => onUpdateFormData({ issueDate: e.target.value })}
          />
        </div>
        
        <div>
          <Label htmlFor="dueDate">Due Date</Label>
          <Input
            id="dueDate"
            type="date"
            value={formData.dueDate}
            onChange={(e) => onUpdateFormData({ dueDate: e.target.value })}
          />
        </div>
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Invoice Items</CardTitle>
            <Button onClick={addItem} size="sm" className="gap-2">
              <Plus className="h-4 w-4" />
              Add Item
            </Button>
          </div>
        </CardHeader>
        
        <CardContent>
          {formData.items.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <Receipt className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>No items added yet</p>
              <p className="text-sm">Click "Add Item" to get started</p>
            </div>
          ) : (
            <div className="space-y-4">
              {formData.items.map((item: any, index: number) => (
                <div key={index} className="grid grid-cols-12 gap-3 items-end p-4 border rounded-lg">
                  <div className="col-span-4">
                    <Label>Description</Label>
                    <Input
                      placeholder="Item description"
                      value={item.description}
                      onChange={(e) => updateItem(index, 'description', e.target.value)}
                    />
                  </div>
                  
                  <div className="col-span-2">
                    <Label>Quantity</Label>
                    <Input
                      type="number"
                      min="1"
                      value={item.quantity}
                      onChange={(e) => updateItem(index, 'quantity', parseInt(e.target.value) || 1)}
                    />
                  </div>
                  
                  <div className="col-span-2">
                    <Label>Unit Price</Label>
                    <Input
                      type="number"
                      min="0"
                      step="0.01"
                      value={item.unitPrice}
                      onChange={(e) => updateItem(index, 'unitPrice', parseFloat(e.target.value) || 0)}
                    />
                  </div>
                  
                  <div className="col-span-2">
                    <Label>Total</Label>
                    <div className="h-10 flex items-center px-3 border rounded-md bg-muted">
                      ${(item.quantity * item.unitPrice).toFixed(2)}
                    </div>
                  </div>
                  
                  <div className="col-span-1 flex items-center gap-2">
                    <div className="flex items-center space-x-2">
                      <Checkbox
                        id={`tax-${index}`}
                        checked={item.taxable}
                        onCheckedChange={(checked) => updateItem(index, 'taxable', checked)}
                      />
                      <Label htmlFor={`tax-${index}`} className="text-xs">Tax</Label>
                    </div>
                  </div>
                  
                  <div className="col-span-1">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => removeItem(index)}
                      className="text-red-600 hover:text-red-700"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {formData.items.length > 0 && (
        <Card>
          <CardContent className="pt-6">
            <div className="space-y-2">
              <div className="flex justify-between">
                <span>Subtotal:</span>
                <span>${calculateSubtotal().toFixed(2)}</span>
              </div>
              <div className="flex justify-between">
                <span>Tax (13%):</span>
                <span>${calculateTax().toFixed(2)}</span>
              </div>
              <div className="flex justify-between font-semibold text-lg border-t pt-2">
                <span>Total:</span>
                <span>${calculateTotal().toFixed(2)}</span>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      <div>
        <Label htmlFor="notes">Notes</Label>
        <Textarea
          id="notes"
          placeholder="Additional notes or terms..."
          value={formData.notes}
          onChange={(e) => onUpdateFormData({ notes: e.target.value })}
        />
      </div>
    </div>
  );
};
