
import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Product } from "@/components/jobs/builder/types";

interface ProductEditDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  product: Product | null;
  onSave: (product: Product) => void;
}

export const ProductEditDialog = ({
  open,
  onOpenChange,
  product,
  onSave
}: ProductEditDialogProps) => {
  const [editProduct, setEditProduct] = useState<Product>(
    product || {
      id: '',
      name: '',
      description: '',
      price: 0,
      category: '',
      taxable: true
    }
  );

  const handleSave = () => {
    onSave(editProduct);
    onOpenChange(false);
  };

  const handleChange = (field: keyof Product, value: any) => {
    setEditProduct(prev => ({ ...prev, [field]: value }));
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Edit Product</DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="name">Product Name</Label>
            <Input
              id="name"
              value={editProduct.name}
              onChange={(e) => handleChange("name", e.target.value)}
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              value={editProduct.description || ''}
              onChange={(e) => handleChange("description", e.target.value)}
            />
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="price">Price</Label>
              <Input
                id="price"
                type="number"
                min={0}
                step="0.01"
                value={editProduct.price}
                onChange={(e) => handleChange("price", parseFloat(e.target.value) || 0)}
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="category">Category</Label>
              <Input
                id="category"
                value={editProduct.category}
                onChange={(e) => handleChange("category", e.target.value)}
              />
            </div>
          </div>
          
          <div className="flex items-center space-x-2">
            <Switch 
              id="taxable" 
              checked={editProduct.taxable}
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
