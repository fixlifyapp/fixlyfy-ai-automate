
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { PlusCircle, Search } from "lucide-react";
import { Product } from "../builder/types";
import { formatCurrency } from "@/lib/utils";

interface InvoiceProductSelectorProps {
  onAddProduct: (product: Product) => void;
  onCreateProduct: (product: Product) => void;
}

// Mock products for demonstration
const mockProducts: Product[] = [
  {
    id: "1",
    name: "HVAC Service Call",
    price: 150,
    description: "Standard HVAC diagnostic and service",
    ourprice: 75,
    category: "HVAC"
  },
  {
    id: "2", 
    name: "Plumbing Repair",
    price: 125,
    description: "Standard plumbing repair service",
    ourprice: 65,
    category: "Plumbing"
  },
  {
    id: "3",
    name: "Electrical Inspection",
    price: 100,
    description: "Electrical system inspection",
    ourprice: 50,
    category: "Electrical"
  }
];

export const InvoiceProductSelector = ({ onAddProduct, onCreateProduct }: InvoiceProductSelectorProps) => {
  const [searchTerm, setSearchTerm] = useState("");
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [newProduct, setNewProduct] = useState<Product>({
    id: "",
    name: "",
    price: 0,
    description: "",
    ourprice: 0,
    category: ""
  });

  const filteredProducts = mockProducts.filter(product =>
    product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    product.description?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleCreateProduct = () => {
    const productWithId = {
      ...newProduct,
      id: `custom-${Date.now()}`,
      ourprice: newProduct.ourprice || 0 // Use ourprice consistently
    };
    onCreateProduct(productWithId);
    setNewProduct({
      id: "",
      name: "",
      price: 0,
      description: "",
      ourprice: 0,
      category: ""
    });
    setShowCreateForm(false);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          Product Catalog
          <Button 
            variant="outline" 
            size="sm"
            onClick={() => setShowCreateForm(!showCreateForm)}
          >
            <PlusCircle className="h-4 w-4 mr-2" />
            Add Custom
          </Button>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Search */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
          <Input
            placeholder="Search products..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>

        {/* Create Product Form */}
        {showCreateForm && (
          <div className="border rounded-lg p-4 space-y-3 bg-gray-50">
            <h4 className="font-medium">Create Custom Product</h4>
            <Input
              placeholder="Product name"
              value={newProduct.name}
              onChange={(e) => setNewProduct(prev => ({ ...prev, name: e.target.value }))}
            />
            <div className="grid grid-cols-2 gap-2">
              <Input
                type="number"
                placeholder="Price"
                value={newProduct.price || ''}
                onChange={(e) => setNewProduct(prev => ({ ...prev, price: Number(e.target.value) || 0 }))}
              />
              <Input
                type="number"
                placeholder="Our cost"
                value={newProduct.ourprice || ''}
                onChange={(e) => setNewProduct(prev => ({ ...prev, ourprice: Number(e.target.value) || 0 }))}
              />
            </div>
            <Input
              placeholder="Description"
              value={newProduct.description || ''}
              onChange={(e) => setNewProduct(prev => ({ ...prev, description: e.target.value }))}
            />
            <div className="flex gap-2">
              <Button size="sm" onClick={handleCreateProduct}>
                Create & Add
              </Button>
              <Button variant="outline" size="sm" onClick={() => setShowCreateForm(false)}>
                Cancel
              </Button>
            </div>
          </div>
        )}

        {/* Product List */}
        <div className="space-y-2 max-h-64 overflow-y-auto">
          {filteredProducts.map((product) => (
            <div 
              key={product.id}
              className="flex items-center justify-between p-3 border rounded-lg hover:bg-gray-50 cursor-pointer"
              onClick={() => onAddProduct(product)}
            >
              <div className="flex-1">
                <div className="font-medium">{product.name}</div>
                <div className="text-sm text-gray-500">{product.description}</div>
                <div className="text-xs text-gray-400">
                  Our cost: {formatCurrency(product.ourprice || 0)}
                </div>
              </div>
              <div className="text-right">
                <div className="font-medium">{formatCurrency(product.price)}</div>
                <div className="text-sm text-gray-500">{product.category}</div>
              </div>
            </div>
          ))}
        </div>

        {filteredProducts.length === 0 && (
          <div className="text-center py-6 text-gray-500">
            No products found matching "{searchTerm}"
          </div>
        )}
      </CardContent>
    </Card>
  );
};
