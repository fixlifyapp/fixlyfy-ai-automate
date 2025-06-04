
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Checkbox } from "@/components/ui/checkbox";
import { Plus, Trash, Search } from "lucide-react";
import { ProductSearch } from "../../builder/ProductSearch";
import { UnifiedStepProps } from "../shared/types";

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
}: UnifiedStepProps) => {
  const [showCatalog, setShowCatalog] = useState(false);

  const addEmptyLineItem = () => {
    const newItem = {
      id: `item-${Date.now()}`,
      description: "",
      quantity: 1,
      unitPrice: 0,
      taxable: true,
      discount: 0,
      ourPrice: 0,
      name: "",
      price: 0,
      total: 0
    };
    onLineItemsChange([...lineItems, newItem]);
  };

  const calculateLineTotal = (item: any): number => {
    const subtotal = item.quantity * item.unitPrice;
    const discountAmount = item.discount ? subtotal * (item.discount / 100) : 0;
    return subtotal - discountAmount;
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h3 className="text-lg font-semibold capitalize">{documentType} #{documentNumber}</h3>
          <p className="text-sm text-muted-foreground">
            Add items to your {documentType} below
          </p>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex space-x-2">
        <Button 
          variant="outline" 
          size="sm" 
          className="flex items-center gap-2"
          onClick={() => setShowCatalog(true)}
        >
          <Search size={16} />
          Add from Catalog
        </Button>
        <Button 
          variant="outline" 
          size="sm" 
          className="flex items-center gap-2"
          onClick={addEmptyLineItem}
        >
          <Plus size={16} />
          Add Custom Line
        </Button>
      </div>

      {/* Line Items Table */}
      <div className="border rounded-md overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-[40%]">Description</TableHead>
              <TableHead className="w-[80px]">Qty</TableHead>
              <TableHead className="w-[120px]">Unit Price</TableHead>
              <TableHead className="w-[80px]">Discount%</TableHead>
              <TableHead className="w-[80px]">Taxable</TableHead>
              <TableHead className="w-[120px] text-right">Total</TableHead>
              <TableHead className="w-[60px]"></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {lineItems.length > 0 ? (
              lineItems.map((item, index) => (
                <TableRow key={item.id}>
                  <TableCell>
                    <Input
                      value={item.description}
                      onChange={(e) => onUpdateLineItem(item.id, "description", e.target.value)}
                      placeholder="Item description"
                      className="border-0 p-0 h-auto bg-transparent"
                    />
                  </TableCell>
                  <TableCell>
                    <Input
                      type="number"
                      min="1"
                      value={item.quantity}
                      onChange={(e) => onUpdateLineItem(item.id, "quantity", parseInt(e.target.value) || 1)}
                      className="border-0 p-0 h-auto bg-transparent text-center"
                    />
                  </TableCell>
                  <TableCell>
                    <Input
                      type="number"
                      min="0"
                      step="0.01"
                      value={item.unitPrice}
                      onChange={(e) => onUpdateLineItem(item.id, "unitPrice", parseFloat(e.target.value) || 0)}
                      className="border-0 p-0 h-auto bg-transparent"
                    />
                  </TableCell>
                  <TableCell>
                    <Input
                      type="number"
                      min="0"
                      max="100"
                      value={item.discount || 0}
                      onChange={(e) => onUpdateLineItem(item.id, "discount", parseFloat(e.target.value) || 0)}
                      className="border-0 p-0 h-auto bg-transparent text-center"
                    />
                  </TableCell>
                  <TableCell>
                    <Checkbox
                      checked={item.taxable}
                      onCheckedChange={(checked) => onUpdateLineItem(item.id, "taxable", Boolean(checked))}
                    />
                  </TableCell>
                  <TableCell className="text-right font-medium">
                    ${calculateLineTotal(item).toFixed(2)}
                  </TableCell>
                  <TableCell>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => onRemoveLineItem(item.id)}
                      className="text-destructive p-1"
                    >
                      <Trash size={16} />
                    </Button>
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={7} className="text-center py-8 text-muted-foreground">
                  No items added yet. Add items from the catalog or create a custom line item.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      {/* Summary */}
      <div className="bg-muted/30 rounded-md p-4 space-y-2">
        <div className="flex justify-between text-sm">
          <span className="text-muted-foreground">Subtotal:</span>
          <span>${calculateSubtotal().toFixed(2)}</span>
        </div>
        <div className="flex justify-between text-sm items-center">
          <div className="flex items-center gap-2">
            <span className="text-muted-foreground">Tax (13%):</span>
            <span className="text-xs text-blue-600 font-medium">Fixed Rate</span>
          </div>
          <span>${calculateTotalTax().toFixed(2)}</span>
        </div>
        <div className="flex justify-between font-medium pt-2 border-t">
          <span>Total:</span>
          <span>${calculateGrandTotal().toFixed(2)}</span>
        </div>
      </div>

      {/* Notes */}
      <div className="space-y-2">
        <Label htmlFor="notes">Notes & Terms</Label>
        <Textarea
          id="notes"
          value={notes}
          onChange={(e) => onNotesChange(e.target.value)}
          placeholder="Add notes or terms and conditions..."
          className="min-h-[100px]"
        />
      </div>

      {/* Product Catalog Dialog */}
      <ProductSearch
        open={showCatalog}
        onOpenChange={setShowCatalog}
        onProductSelect={(product) => {
          onAddProduct(product);
          setShowCatalog(false);
        }}
      />
    </div>
  );
};
