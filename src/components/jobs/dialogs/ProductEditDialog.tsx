
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

interface ProductEditDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  product: Product | null;
  onSave: (product: Product) => void;
  categories: string[];
}

export const ProductEditDialog = ({
  open,
  onOpenChange,
  product,
  onSave,
  categories
}: ProductEditDialogProps) => {
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState("");
  const [price, setPrice] = useState(0);
  const [ourPrice, setOurPrice] = useState(0);
  const [taxable, setTaxable] = useState(true);
  const [tags, setTags] = useState<string[]>([]);
  const [newTag, setNewTag] = useState("");
  const [customCategory, setCustomCategory] = useState("");
  const [showCustomCategory, setShowCustomCategory] = useState(false);

  useEffect(() => {
    if (product) {
      setName(product.name);
      setDescription(product.description);
      setCategory(product.category);
      setPrice(product.price);
      setOurPrice(product.ourPrice || 0);
      setTaxable(product.taxable !== undefined ? product.taxable : true);
      setTags(product.tags || []);
    } else {
      // Default values for new product
      setName("");
      setDescription("");
      setCategory(categories[0] || "");
      setPrice(0);
      setOurPrice(0);
      setTaxable(true);
      setTags([]);
    }
    setNewTag("");
    setCustomCategory("");
    setShowCustomCategory(false);
  }, [product, categories, open]);

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
    const finalCategory = showCustomCategory ? customCategory : category;
    
    const updatedProduct: Product = {
      id: product?.id || "",
      name,
      description,
      category: finalCategory,
      price,
      ourPrice,
      taxable,
      tags
    };
    
    onSave(updatedProduct);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && newTag) {
      e.preventDefault();
      handleAddTag();
    }
  };

  const getMargin = () => {
    const margin = price - ourPrice;
    const percentage = price > 0 ? (margin / price) * 100 : 0;
    return {
      amount: margin.toFixed(2),
      percentage: percentage.toFixed(0)
    };
  };

  const margin = getMargin();

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>{product ? "Edit Product" : "Create New Product"}</DialogTitle>
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
            {!showCustomCategory ? (
              <div className="flex space-x-2">
                <select
                  id="product-category"
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  {categories.map((cat) => (
                    <option key={cat} value={cat}>
                      {cat}
                    </option>
                  ))}
                  <option value="custom">+ Add New Category</option>
                </select>
              </div>
            ) : (
              <div className="flex space-x-2">
                <Input
                  id="custom-category"
                  value={customCategory}
                  onChange={(e) => setCustomCategory(e.target.value)}
                  placeholder="Enter new category"
                  className="flex-1"
                />
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => setShowCustomCategory(false)}
                >
                  <X size={16} />
                </Button>
              </div>
            )}
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="product-price">Customer Price ($)</Label>
              <Input
                id="product-price"
                type="number"
                min="0"
                step="0.01"
                value={price}
                onChange={(e) => setPrice(parseFloat(e.target.value) || 0)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="product-our-price">
                Our Price ($) <span className="text-sm text-muted-foreground">(Internal)</span>
              </Label>
              <Input
                id="product-our-price"
                type="number"
                min="0"
                step="0.01"
                value={ourPrice}
                onChange={(e) => setOurPrice(parseFloat(e.target.value) || 0)}
              />
            </div>
          </div>

          <div className="bg-muted/30 p-3 rounded-md border">
            <div className="flex justify-between items-center">
              <span className="text-sm font-medium">Profit Margin:</span>
              <span className="font-medium">${margin.amount} ({margin.percentage}%)</span>
            </div>
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
            {product ? "Save Changes" : "Create Product"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
