
import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Product, LineItem } from "@/components/jobs/builder/types";

interface ProductEditInEstimateDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  lineItem: LineItem | null;
  onSave: (lineItem: LineItem) => void;
}

export const ProductEditInEstimateDialog = ({
  open,
  onOpenChange,
  lineItem,
  onSave
}: ProductEditInEstimateDialogProps) => {
  const [editItem, setEditItem] = useState<LineItem>(
    lineItem || {
      id: '',
      name: '',
      description: '',
      quantity: 1,
      unitPrice: 0,
      taxable: true
    }
  );

  const handleSave = () => {
    onSave(editItem);
    onOpenChange(false);
  };

  const handleChange = (field: keyof LineItem, value: any) => {
    setEditItem(prev => ({ ...prev, [field]: value }));
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Edit Line Item</DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="name">Item Name</Label>
            <Input
              id="name"
              value={editItem.name}
              onChange={(e) => handleChange("name", e.target.value)}
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              value={editItem.description}
              onChange={(e) => handleChange("description", e.target.value)}
            />
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="quantity">Quantity</Label>
              <Input
                id="quantity"
                type="number"
                min={1}
                value={editItem.quantity}
                onChange={(e) => handleChange("quantity", parseInt(e.target.value) || 1)}
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="unitPrice">Unit Price</Label>
              <Input
                id="unitPrice"
                type="number"
                min={0}
                step="0.01"
                value={editItem.unitPrice}
                onChange={(e) => handleChange("unitPrice", parseFloat(e.target.value) || 0)}
              />
            </div>
          </div>
          
          <div className="flex items-center space-x-2">
            <Switch 
              id="taxable" 
              checked={editItem.taxable}
              onCheckedChange={(checked) => handleChange("taxable", checked)} 
            />
            <Label htmlFor="taxable">Taxable</Label>
          </div>
        </div>
        
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={handleSave}>
            Save Changes
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
