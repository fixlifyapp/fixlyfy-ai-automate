
import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { Save } from "lucide-react";

interface ProductEditInEstimateDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  product: any;
  onSave: (updatedProduct: any) => void;
}

export const ProductEditInEstimateDialog = ({
  open,
  onOpenChange,
  product,
  onSave
}: ProductEditInEstimateDialogProps) => {
  const [editedProduct, setEditedProduct] = useState(product || {});

  useEffect(() => {
    if (product) {
      setEditedProduct(product);
    }
  }, [product]);

  const handleSave = () => {
    onSave(editedProduct);
    onOpenChange(false);
  };

  const handleFieldChange = (field: string, value: any) => {
    setEditedProduct(prev => ({
      ...prev,
      [field]: value
    }));
  };

  if (!product) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Edit Product in Estimate</DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4">
          <div>
            <Label htmlFor="description">Description</Label>
            <Input
              id="description"
              value={editedProduct.description || ''}
              onChange={(e) => handleFieldChange('description', e.target.value)}
            />
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="quantity">Quantity</Label>
              <Input
                id="quantity"
                type="number"
                value={editedProduct.quantity || 1}
                onChange={(e) => handleFieldChange('quantity', Number(e.target.value))}
              />
            </div>
            
            <div>
              <Label htmlFor="unitPrice">Unit Price</Label>
              <Input
                id="unitPrice"
                type="number"
                step="0.01"
                value={editedProduct.unitPrice || editedProduct.price || 0}
                onChange={(e) => handleFieldChange('unitPrice', Number(e.target.value))}
              />
            </div>
          </div>
          
          <div className="flex items-center space-x-2">
            <Checkbox
              id="taxable"
              checked={editedProduct.taxable || false}
              onCheckedChange={(checked) => handleFieldChange('taxable', checked)}
            />
            <Label htmlFor="taxable">Taxable</Label>
          </div>
          
          <div>
            <Label htmlFor="notes">Notes (Optional)</Label>
            <Textarea
              id="notes"
              value={editedProduct.notes || ''}
              onChange={(e) => handleFieldChange('notes', e.target.value)}
              rows={3}
            />
          </div>
        </div>
        
        <div className="flex justify-end space-x-2 pt-4">
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={handleSave} className="gap-2">
            <Save className="h-4 w-4" />
            Save Changes
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};
