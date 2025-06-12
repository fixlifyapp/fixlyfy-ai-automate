
import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Product } from "../builder/types";

interface ProductEditInEstimateDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  product: Product | null;
  onSave: (product: Product) => void;
}

export const ProductEditInEstimateDialog = ({
  open,
  onOpenChange,
  product,
  onSave
}: ProductEditInEstimateDialogProps) => {
  const [formData, setFormData] = useState<Product>({
    id: "",
    name: "",
    price: 0,
    category: "",
    description: "",
    ourprice: 0,
    unit: "each",
    taxable: true,
    quantity: 1,
    tags: []
  });

  useEffect(() => {
    if (product) {
      setFormData({
        ...product,
        ourprice: product.ourprice || product.cost || product.our_price || 0,
        quantity: product.quantity || 1,
        tags: product.tags || []
      });
    } else {
      setFormData({
        id: "",
        name: "",
        price: 0,
        category: "",
        description: "",
        ourprice: 0,
        unit: "each",
        taxable: true,
        quantity: 1,
        tags: []
      });
    }
  }, [product, open]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave({
      ...formData,
      id: formData.id || `product-${Date.now()}`,
      ourprice: formData.ourprice || 0 // Use ourprice consistently
    });
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>
            {product ? "Edit Product" : "Add New Product"}
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="name">Product Name</Label>
            <Input
              id="name"
              value={formData.name}
              onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
              placeholder="Enter product name"
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label htmlFor="price">Sell Price</Label>
              <Input
                id="price"
                type="number"
                value={formData.price}
                onChange={(e) => setFormData(prev => ({ ...prev, price: Number(e.target.value) || 0 }))}
                placeholder="0.00"
                step="0.01"
                min="0"
                required
              />
            </div>
            <div>
              <Label htmlFor="ourprice">Our Cost</Label>
              <Input
                id="ourprice"
                type="number"
                value={formData.ourprice || 0}
                onChange={(e) => setFormData(prev => ({ ...prev, ourprice: Number(e.target.value) || 0 }))}
                placeholder="0.00"
                step="0.01"
                min="0"
              />
            </div>
          </div>

          <div>
            <Label htmlFor="category">Category</Label>
            <Input
              id="category"
              value={formData.category || ""}
              onChange={(e) => setFormData(prev => ({ ...prev, category: e.target.value }))}
              placeholder="Enter category"
            />
          </div>

          <div>
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              value={formData.description || ""}
              onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
              placeholder="Enter product description"
              rows={3}
            />
          </div>

          <div className="flex items-center space-x-2">
            <input
              type="checkbox"
              id="taxable"
              checked={formData.taxable}
              onChange={(e) => setFormData(prev => ({ ...prev, taxable: e.target.checked }))}
            />
            <Label htmlFor="taxable">Taxable</Label>
          </div>

          <div className="flex gap-2 justify-end">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit">
              {product ? "Update" : "Add"} Product
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};
