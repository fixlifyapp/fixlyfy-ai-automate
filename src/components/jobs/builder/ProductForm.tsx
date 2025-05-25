
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Product } from "./types";

interface ProductFormProps {
  selectedProduct: Product | null;
  onAddProduct: (product: Product) => void;
  isLoading?: boolean;
}

export const ProductForm = ({ selectedProduct, onAddProduct, isLoading }: ProductFormProps) => {
  const [name, setName] = useState(selectedProduct?.name || "");
  const [description, setDescription] = useState(selectedProduct?.description || "");
  const [price, setPrice] = useState(selectedProduct?.price || 0);
  const [quantity, setQuantity] = useState(selectedProduct?.quantity || 1);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || price <= 0) return;

    const product: Product = {
      id: selectedProduct?.id || `product-${Date.now()}`,
      name,
      description,
      price,
      quantity,
      category: selectedProduct?.category || "General",
      cost: selectedProduct?.cost || 0,
      taxable: selectedProduct?.taxable ?? true
    };

    onAddProduct(product);
    
    // Clear form if not editing
    if (!selectedProduct) {
      setName("");
      setDescription("");
      setPrice(0);
      setQuantity(1);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4 p-4 border rounded-md">
      <h3 className="font-semibold">Add Product</h3>
      
      <div>
        <Label htmlFor="name">Product Name</Label>
        <Input
          id="name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Enter product name"
          required
        />
      </div>

      <div>
        <Label htmlFor="description">Description</Label>
        <Textarea
          id="description"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="Enter product description"
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label htmlFor="price">Price</Label>
          <Input
            id="price"
            type="number"
            step="0.01"
            value={price}
            onChange={(e) => setPrice(Number(e.target.value))}
            placeholder="0.00"
            required
          />
        </div>

        <div>
          <Label htmlFor="quantity">Quantity</Label>
          <Input
            id="quantity"
            type="number"
            value={quantity}
            onChange={(e) => setQuantity(Number(e.target.value))}
            placeholder="1"
            min="1"
            required
          />
        </div>
      </div>

      <Button type="submit" disabled={isLoading || !name || price <= 0}>
        {selectedProduct ? "Update Product" : "Add Product"}
      </Button>
    </form>
  );
};
