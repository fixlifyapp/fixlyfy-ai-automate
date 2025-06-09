
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Plus, Edit, Trash2, Package } from "lucide-react";
import { ProductEditInEstimateDialog } from "../dialogs/ProductEditInEstimateDialog";

interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  category: string;
  taxable: boolean;
}

interface EstimateProductSelectorProps {
  selectedProducts: any[];
  onProductAdd: (product: Product) => void;
  onProductEdit: (product: any) => void;
  onProductRemove: (productId: string) => void;
}

export const EstimateProductSelector = ({
  selectedProducts,
  onProductAdd,
  onProductEdit,
  onProductRemove
}: EstimateProductSelectorProps) => {
  const [showEditDialog, setShowEditDialog] = useState(false);
  const [editingProduct, setEditingProduct] = useState<any>(null);

  // Mock products catalog
  const mockProducts: Product[] = [
    {
      id: 'prod-1',
      name: 'HVAC Filter',
      description: 'High-efficiency air filter',
      price: 25.00,
      category: 'Parts',
      taxable: true
    },
    {
      id: 'prod-2',
      name: 'Thermostat',
      description: 'Digital programmable thermostat',
      price: 125.00,
      category: 'Parts',
      taxable: true
    },
    {
      id: 'prod-3',
      name: 'Labor - HVAC Service',
      description: 'Professional HVAC service labor',
      price: 85.00,
      category: 'Labor',
      taxable: true
    }
  ];

  const handleEditProduct = (product: any) => {
    setEditingProduct(product);
    setShowEditDialog(true);
  };

  const handleSaveProduct = (updatedProduct: any) => {
    onProductEdit(updatedProduct);
    setShowEditDialog(false);
    setEditingProduct(null);
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(amount);
  };

  return (
    <div className="space-y-6">
      {/* Selected Products */}
      <div>
        <h3 className="text-lg font-semibold mb-4">Selected Products & Services</h3>
        {selectedProducts.length === 0 ? (
          <Card>
            <CardContent className="p-6 text-center text-gray-500">
              <Package className="h-8 w-8 mx-auto mb-2 opacity-50" />
              <p>No products selected yet</p>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-2">
            {selectedProducts.map((product, index) => (
              <Card key={index}>
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <h4 className="font-medium">{product.description || product.name}</h4>
                      <div className="flex items-center gap-4 text-sm text-gray-600 mt-1">
                        <span>Qty: {product.quantity || 1}</span>
                        <span>Unit: {formatCurrency(product.unitPrice || product.price)}</span>
                        <span>Total: {formatCurrency((product.quantity || 1) * (product.unitPrice || product.price))}</span>
                        {product.taxable && <Badge variant="outline" className="text-xs">Taxable</Badge>}
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleEditProduct(product)}
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => onProductRemove(product.id)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>

      {/* Product Catalog */}
      <div>
        <h3 className="text-lg font-semibold mb-4">Add Products & Services</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {mockProducts.map((product) => (
            <Card key={product.id} className="cursor-pointer hover:shadow-md transition-shadow">
              <CardContent className="p-4">
                <div className="space-y-2">
                  <div className="flex items-start justify-between">
                    <h4 className="font-medium">{product.name}</h4>
                    <Badge variant="secondary" className="text-xs">{product.category}</Badge>
                  </div>
                  <p className="text-sm text-gray-600">{product.description}</p>
                  <div className="flex items-center justify-between">
                    <span className="font-semibold text-green-600">{formatCurrency(product.price)}</span>
                    <Button
                      size="sm"
                      onClick={() => onProductAdd({
                        ...product,
                        quantity: 1,
                        unitPrice: product.price
                      })}
                      className="gap-1"
                    >
                      <Plus className="h-3 w-3" />
                      Add
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      {/* Edit Product Dialog */}
      <ProductEditInEstimateDialog
        open={showEditDialog}
        onOpenChange={setShowEditDialog}
        product={editingProduct}
        onSave={handleSaveProduct}
      />
    </div>
  );
};
