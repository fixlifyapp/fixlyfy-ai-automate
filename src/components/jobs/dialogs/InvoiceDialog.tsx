
import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Plus, Trash2 } from 'lucide-react';
import { Product } from '../builder/types';
import { formatCurrency } from '@/lib/utils';

interface LineItem {
  id: string;
  name: string;
  description: string;
  quantity: number;
  unitPrice: number;
  taxable: boolean;
}

interface InvoiceDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  jobId: string;
  onSave: (invoiceData: any) => void;
}

export const InvoiceDialog = ({
  open,
  onOpenChange,
  jobId,
  onSave
}: InvoiceDialogProps) => {
  const [lineItems, setLineItems] = useState<LineItem[]>([]);
  const [notes, setNotes] = useState('');

  const addLineItem = () => {
    const newItem: LineItem = {
      id: Date.now().toString(),
      name: '',
      description: '',
      quantity: 1,
      unitPrice: 0,
      taxable: true
    };
    setLineItems([...lineItems, newItem]);
  };

  const updateLineItem = (id: string, field: keyof LineItem, value: any) => {
    setLineItems(items => items.map(item => 
      item.id === id ? { ...item, [field]: value } : item
    ));
  };

  const removeLineItem = (id: string) => {
    setLineItems(items => items.filter(item => item.id !== id));
  };

  const calculateSubtotal = () => {
    return lineItems.reduce((sum, item) => sum + (item.quantity * item.unitPrice), 0);
  };

  const calculateTax = () => {
    return lineItems
      .filter(item => item.taxable)
      .reduce((sum, item) => sum + (item.quantity * item.unitPrice * 0.13), 0);
  };

  const calculateTotal = () => {
    return calculateSubtotal() + calculateTax();
  };

  const handleSave = () => {
    const invoiceData = {
      id: Date.now().toString(),
      jobId,
      lineItems,
      notes,
      subtotal: calculateSubtotal(),
      tax: calculateTax(),
      total: calculateTotal(),
      status: 'draft',
      createdAt: new Date().toISOString()
    };
    onSave(invoiceData);
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Create Invoice</DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Line Items */}
          <div>
            <div className="flex justify-between items-center mb-4">
              <Label className="text-lg font-medium">Line Items</Label>
              <Button onClick={addLineItem} variant="outline" size="sm">
                <Plus className="h-4 w-4 mr-2" />
                Add Item
              </Button>
            </div>
            
            {lineItems.map((item) => (
              <div key={item.id} className="border rounded-lg p-4 mb-4">
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                  <div className="md:col-span-2">
                    <Label>Item Name</Label>
                    <Input
                      value={item.name}
                      onChange={(e) => updateLineItem(item.id, 'name', e.target.value)}
                      placeholder="Enter item name"
                    />
                  </div>
                  <div>
                    <Label>Quantity</Label>
                    <Input
                      type="number"
                      min="1"
                      value={item.quantity}
                      onChange={(e) => updateLineItem(item.id, 'quantity', parseInt(e.target.value) || 1)}
                    />
                  </div>
                  <div>
                    <Label>Unit Price</Label>
                    <Input
                      type="number"
                      step="0.01"
                      value={item.unitPrice}
                      onChange={(e) => updateLineItem(item.id, 'unitPrice', parseFloat(e.target.value) || 0)}
                    />
                  </div>
                </div>
                
                <div className="mt-4 flex justify-between items-center">
                  <div className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      id={`taxable-${item.id}`}
                      checked={item.taxable}
                      onChange={(e) => updateLineItem(item.id, 'taxable', e.target.checked)}
                    />
                    <Label htmlFor={`taxable-${item.id}`}>Taxable (13%)</Label>
                  </div>
                  <div className="flex items-center space-x-4">
                    <span className="font-medium">
                      Total: {formatCurrency(item.quantity * item.unitPrice)}
                    </span>
                    <Button
                      onClick={() => removeLineItem(item.id)}
                      variant="ghost"
                      size="sm"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Notes */}
          <div>
            <Label>Notes</Label>
            <Textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Add any notes or special instructions..."
              rows={3}
            />
          </div>

          {/* Totals */}
          {lineItems.length > 0 && (
            <div className="border-t pt-4">
              <div className="space-y-2 max-w-md ml-auto">
                <div className="flex justify-between">
                  <span>Subtotal:</span>
                  <span>{formatCurrency(calculateSubtotal())}</span>
                </div>
                <div className="flex justify-between">
                  <span>Tax (13%):</span>
                  <span>{formatCurrency(calculateTax())}</span>
                </div>
                <div className="flex justify-between font-bold text-lg border-t pt-2">
                  <span>Total:</span>
                  <span>{formatCurrency(calculateTotal())}</span>
                </div>
              </div>
            </div>
          )}

          {/* Actions */}
          <div className="flex justify-end space-x-4">
            <Button variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button onClick={handleSave} disabled={lineItems.length === 0}>
              Save Invoice
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
