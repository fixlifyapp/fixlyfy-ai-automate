
import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent } from "@/components/ui/card";
import { PlusCircle, Trash2 } from "lucide-react";
import { Product } from "../builder/types";
import { formatCurrency } from "@/lib/utils";

interface SimpleEstimateBuilderProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onEstimateCreated: () => void;
}

interface EstimateLineItem {
  id: string;
  description: string;
  quantity: number;
  unitPrice: number;
  total: number;
  taxable: boolean;
}

const defaultProducts: Product[] = [
  {
    id: "hvac-service",
    name: "HVAC Service Call",
    price: 150,
    description: "Standard HVAC diagnostic and service",
    ourprice: 75,
    category: "HVAC",
    unit: "each",
    taxable: true
  },
  {
    id: "plumbing-service",
    name: "Plumbing Service Call",
    price: 125,
    description: "Standard plumbing diagnostic and service",
    ourprice: 65,
    category: "Plumbing", 
    unit: "each",
    taxable: true
  },
  {
    id: "electrical-service",
    name: "Electrical Service Call",
    price: 175,
    description: "Standard electrical diagnostic and service",
    ourprice: 85,
    category: "Electrical",
    unit: "each",
    taxable: true
  }
];

export const SimpleEstimateBuilder = ({
  open,
  onOpenChange,
  onEstimateCreated
}: SimpleEstimateBuilderProps) => {
  const [lineItems, setLineItems] = useState<EstimateLineItem[]>([]);
  const [notes, setNotes] = useState("");
  const [estimateNumber, setEstimateNumber] = useState("");

  useEffect(() => {
    if (open) {
      // Initialize with one empty line item
      setLineItems([{
        id: Date.now().toString(),
        description: "",
        quantity: 1,
        unitPrice: 0,
        total: 0,
        taxable: true
      }]);
      setNotes("");
      setEstimateNumber(`EST-${Date.now()}`);
    }
  }, [open]);

  const addLineItem = () => {
    const newItem: EstimateLineItem = {
      id: Date.now().toString(),
      description: "",
      quantity: 1,
      unitPrice: 0,
      total: 0,
      taxable: true
    };
    setLineItems([...lineItems, newItem]);
  };

  const removeLineItem = (id: string) => {
    if (lineItems.length > 1) {
      setLineItems(lineItems.filter(item => item.id !== id));
    }
  };

  const updateLineItem = (id: string, field: keyof EstimateLineItem, value: any) => {
    setLineItems(lineItems.map(item => {
      if (item.id === id) {
        const updatedItem = { ...item, [field]: value };
        if (field === 'quantity' || field === 'unitPrice') {
          updatedItem.total = updatedItem.quantity * updatedItem.unitPrice;
        }
        return updatedItem;
      }
      return item;
    }));
  };

  const addProduct = (product: Product) => {
    const newItem: EstimateLineItem = {
      id: Date.now().toString(),
      description: product.name,
      quantity: 1,
      unitPrice: product.price,
      total: product.price,
      taxable: product.taxable || true
    };
    setLineItems([...lineItems, newItem]);
  };

  const calculateSubtotal = () => {
    return lineItems.reduce((sum, item) => sum + item.total, 0);
  };

  const calculateTax = () => {
    const taxableAmount = lineItems.reduce((sum, item) => {
      return sum + (item.taxable ? item.total : 0);
    }, 0);
    return taxableAmount * 0.1; // 10% tax rate
  };

  const calculateTotal = () => {
    return calculateSubtotal() + calculateTax();
  };

  const handleSave = () => {
    // In a real implementation, this would save to the database
    console.log("Saving estimate:", {
      estimateNumber,
      lineItems,
      notes,
      subtotal: calculateSubtotal(),
      tax: calculateTax(),
      total: calculateTotal()
    });
    
    onEstimateCreated();
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Create Quick Estimate</DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Estimate Number */}
          <div>
            <Label htmlFor="estimateNumber">Estimate Number</Label>
            <Input
              id="estimateNumber"
              value={estimateNumber}
              onChange={(e) => setEstimateNumber(e.target.value)}
              placeholder="EST-001"
            />
          </div>

          {/* Quick Add Products */}
          <Card>
            <CardContent className="pt-6">
              <h3 className="font-medium mb-3">Quick Add Services</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
                {defaultProducts.map((product) => (
                  <Button
                    key={product.id}
                    variant="outline"
                    onClick={() => addProduct(product)}
                    className="text-left h-auto p-3"
                  >
                    <div>
                      <div className="font-medium">{product.name}</div>
                      <div className="text-sm text-muted-foreground">
                        {formatCurrency(product.price)}
                      </div>
                    </div>
                  </Button>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Line Items */}
          <div>
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold">Line Items</h3>
              <Button onClick={addLineItem} variant="outline" size="sm">
                <PlusCircle className="h-4 w-4 mr-2" />
                Add Item
              </Button>
            </div>

            <div className="space-y-3">
              {lineItems.map((item) => (
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
                      {lineItems.length > 1 && (
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
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Additional notes..."
              rows={3}
            />
          </div>

          {/* Actions */}
          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button onClick={handleSave}>
              Create Estimate
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
