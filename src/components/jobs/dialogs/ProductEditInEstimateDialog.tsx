
import { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Product } from "../builder/types";
import { X, Plus } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";

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
  onSave,
}: ProductEditInEstimateDialogProps) => {
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState("");
  const [price, setPrice] = useState(0);
  const [taxable, setTaxable] = useState(true);
  const [tags, setTags] = useState<string[]>([]);
  const [newTag, setNewTag] = useState("");

  useEffect(() => {
    if (product) {
      setName(product.name);
      setDescription(product.description || "");
      setCategory(product.category);
      setPrice(product.price);
      setTaxable(product.taxable !== undefined ? product.taxable : true);
      setTags(product.tags || []);
    } else {
      // Default values
      setName("");
      setDescription("");
      setCategory("");
      setPrice(0);
      setTaxable(true);
      setTags([]);
    }
    setNewTag("");
  }, [product, open]);

  const handleAddTag = () => {
    if (newTag.trim() && !tags.includes(newTag.trim().toLowerCase())) {
      setTags([...tags, newTag.trim().toLowerCase()]);
      setNewTag("");
    }
  };

  const handleRemoveTag = (tagToRemove: string) => {
    setTags(tags.filter(tag => tag !== tagToRemove));
  };

  const handleSubmit = () => {
    if (!name.trim()) {
      toast.error("Product name is required");
      return;
    }
    
    if (!category.trim()) {
      toast.error("Category is required");
      return;
    }
    
    if (!product) {
      toast.error("No product to edit");
      return;
    }
    
    const updatedProduct: Product = {
      ...product,
      name,
      description,
      category,
      price,
      taxable,
      tags
    };
    
    onSave(updatedProduct);
    toast.success("Product updated in estimate");
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && newTag) {
      e.preventDefault();
      handleAddTag();
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Edit Product in Estimate</DialogTitle>
        </DialogHeader>

        <div className="space-y-4 py-2">
          <div className="space-y-2">
            <Label htmlFor="product-name">Product Name</Label>
            <Input
              id="product-name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Enter product name"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="product-description">Description</Label>
            <Input
              id="product-description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Enter product description"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="product-category">Category</Label>
            <Input
              id="product-category"
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              placeholder="Enter category"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="product-price">Price ($)</Label>
            <Input
              id="product-price"
              type="number"
              min="0"
              step="0.01"
              value={price}
              onChange={(e) => setPrice(parseFloat(e.target.value) || 0)}
            />
          </div>

          <div className="flex items-center justify-between">
            <Label htmlFor="taxable" className="cursor-pointer">Taxable Item</Label>
            <Switch
              id="taxable"
              checked={taxable}
              onCheckedChange={setTaxable}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="product-tags">Tags</Label>
            <div className="flex space-x-2">
              <Input
                id="product-tags"
                value={newTag}
                onChange={(e) => setNewTag(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Add tag and press Enter"
                className="flex-1"
              />
              <Button
                variant="outline"
                onClick={handleAddTag}
                disabled={!newTag.trim()}
              >
                <Plus size={16} />
              </Button>
            </div>
            <div className="flex flex-wrap gap-2 mt-2">
              {tags.map(tag => (
                <Badge key={tag} variant="secondary" className="px-2 py-1 gap-1">
                  {tag}
                  <button onClick={() => handleRemoveTag(tag)} className="ml-1">
                    <X size={12} />
                  </button>
                </Badge>
              ))}
            </div>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={handleSubmit}>
            Save Changes
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
