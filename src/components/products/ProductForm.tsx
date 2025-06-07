
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useProducts } from "@/hooks/useProducts";

interface ProductFormProps {
  initialData?: any;
  onSubmit: (data: any) => void;
  onCancel: () => void;
}

export const ProductForm = ({ initialData, onSubmit, onCancel }: ProductFormProps) => {
  const { categories } = useProducts();
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    category: "",
    price: 0,
    cost: 0,
    taxable: true,
    sku: "",
    ...initialData
  });

  useEffect(() => {
    if (initialData) {
      setFormData({
        name: initialData.name || "",
        description: initialData.description || "",
        category: initialData.category || "",
        price: initialData.price || 0,
        cost: initialData.cost || initialData.ourPrice || 0,
        taxable: initialData.taxable !== false,
        sku: initialData.sku || "",
      });
    }
  }, [initialData]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit({
      ...formData,
      ourPrice: formData.cost // Map cost to ourPrice for compatibility
    });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <Label htmlFor="name">Product Name *</Label>
          <Input
            id="name"
            value={formData.name}
            onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
            required
          />
        </div>
        
        <div>
          <Label htmlFor="sku">SKU</Label>
          <Input
            id="sku"
            value={formData.sku}
            onChange={(e) => setFormData(prev => ({ ...prev, sku: e.target.value }))}
          />
        </div>
      </div>

      <div>
        <Label htmlFor="description">Description</Label>
        <Textarea
          id="description"
          value={formData.description}
          onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
          rows={3}
        />
      </div>

      <div>
        <Label htmlFor="category">Category</Label>
        <Select
          value={formData.category}
          onValueChange={(value) => setFormData(prev => ({ ...prev, category: value }))}
        >
          <SelectTrigger>
            <SelectValue placeholder="Select category" />
          </SelectTrigger>
          <SelectContent>
            {categories.map((category) => (
              <SelectItem key={category} value={category}>
                {category}
              </SelectItem>
            ))}
            <SelectItem value="Service">Service</SelectItem>
            <SelectItem value="Material">Material</SelectItem>
            <SelectItem value="Equipment">Equipment</SelectItem>
            <SelectItem value="Labor">Labor</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <Label htmlFor="price">Sale Price *</Label>
          <Input
            id="price"
            type="number"
            step="0.01"
            min="0"
            value={formData.price}
            onChange={(e) => setFormData(prev => ({ ...prev, price: parseFloat(e.target.value) || 0 }))}
            required
          />
        </div>
        
        <div>
          <Label htmlFor="cost">Cost</Label>
          <Input
            id="cost"
            type="number"
            step="0.01"
            min="0"
            value={formData.cost}
            onChange={(e) => setFormData(prev => ({ ...prev, cost: parseFloat(e.target.value) || 0 }))}
          />
        </div>
      </div>

      <div className="flex items-center space-x-2">
        <Switch
          id="taxable"
          checked={formData.taxable}
          onCheckedChange={(checked) => setFormData(prev => ({ ...prev, taxable: checked }))}
        />
        <Label htmlFor="taxable">Taxable</Label>
      </div>

      <div className="flex justify-end space-x-2">
        <Button type="button" variant="outline" onClick={onCancel}>
          Cancel
        </Button>
        <Button type="submit">
          {initialData ? "Update Product" : "Create Product"}
        </Button>
      </div>
    </form>
  );
};
