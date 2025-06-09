
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Search, Plus, Minus, Package, DollarSign, Trash2 } from 'lucide-react';
import { useProducts } from '@/hooks/useProducts';
import { formatCurrency } from '@/lib/utils';
import { useIsMobile } from '@/hooks/use-mobile';

interface LineItem {
  id: string;
  name: string;
  description?: string;
  quantity: number;
  unitPrice: number;
  taxable: boolean;
  isWarranty?: boolean;
}

interface ProductSelectorProps {
  items: LineItem[];
  onItemsChange: (items: LineItem[]) => void;
  documentType: 'estimate' | 'invoice';
}

export const ProductSelector = ({ items, onItemsChange, documentType }: ProductSelectorProps) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [showCustomForm, setShowCustomForm] = useState(false);
  const [customProduct, setCustomProduct] = useState({
    name: '',
    description: '',
    price: '',
    taxable: true
  });
  
  const { products, isLoading } = useProducts();
  const isMobile = useIsMobile();

  const filteredProducts = products.filter(product =>
    product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    product.description?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const addProduct = (product: any) => {
    const existingItem = items.find(item => item.id === product.id);
    
    if (existingItem) {
      updateQuantity(existingItem.id, existingItem.quantity + 1);
    } else {
      const newItem: LineItem = {
        id: product.id,
        name: product.name,
        description: product.description,
        quantity: 1,
        unitPrice: product.price,
        taxable: product.taxable || true,
        isWarranty: product.tags?.includes('warranty') || false
      };
      onItemsChange([...items, newItem]);
    }
  };

  const addCustomProduct = () => {
    if (!customProduct.name || !customProduct.price) return;

    const newItem: LineItem = {
      id: `custom-${Date.now()}`,
      name: customProduct.name,
      description: customProduct.description,
      quantity: 1,
      unitPrice: parseFloat(customProduct.price),
      taxable: customProduct.taxable,
      isWarranty: false
    };

    onItemsChange([...items, newItem]);
    setCustomProduct({ name: '', description: '', price: '', taxable: true });
    setShowCustomForm(false);
  };

  const updateQuantity = (itemId: string, newQuantity: number) => {
    if (newQuantity <= 0) {
      removeItem(itemId);
      return;
    }
    
    const updatedItems = items.map(item =>
      item.id === itemId ? { ...item, quantity: newQuantity } : item
    );
    onItemsChange(updatedItems);
  };

  const removeItem = (itemId: string) => {
    const updatedItems = items.filter(item => item.id !== itemId);
    onItemsChange(updatedItems);
  };

  const toggleTaxable = (itemId: string) => {
    const updatedItems = items.map(item =>
      item.id === itemId ? { ...item, taxable: !item.taxable } : item
    );
    onItemsChange(updatedItems);
  };

  const subtotal = items.reduce((sum, item) => sum + (item.quantity * item.unitPrice), 0);
  const taxAmount = items
    .filter(item => item.taxable)
    .reduce((sum, item) => sum + (item.quantity * item.unitPrice * 0.13), 0);
  const total = subtotal + taxAmount;

  return (
    <div className={`space-y-6 ${isMobile ? 'space-y-4' : ''}`}>
      {/* Search Bar */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
        <Input
          placeholder="Search products..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className={`pl-10 ${isMobile ? 'h-12 text-base' : ''}`}
        />
      </div>

      <div className={`grid ${isMobile ? 'grid-cols-1 gap-4' : 'grid-cols-1 lg:grid-cols-2 gap-6'}`}>
        {/* Products Grid */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className={`font-semibold ${isMobile ? 'text-base' : 'text-lg'}`}>Available Products</h3>
            <Button 
              variant="outline" 
              size={isMobile ? "sm" : "default"}
              onClick={() => setShowCustomForm(!showCustomForm)}
            >
              <Plus className="h-4 w-4 mr-2" />
              Custom
            </Button>
          </div>

          {/* Custom Product Form */}
          {showCustomForm && (
            <Card>
              <CardContent className={isMobile ? 'p-4' : 'p-6'}>
                <div className="space-y-4">
                  <Input
                    placeholder="Product name"
                    value={customProduct.name}
                    onChange={(e) => setCustomProduct(prev => ({ ...prev, name: e.target.value }))}
                    className={isMobile ? 'h-12 text-base' : ''}
                  />
                  <Input
                    placeholder="Description (optional)"
                    value={customProduct.description}
                    onChange={(e) => setCustomProduct(prev => ({ ...prev, description: e.target.value }))}
                    className={isMobile ? 'h-12 text-base' : ''}
                  />
                  <Input
                    type="number"
                    placeholder="Price"
                    value={customProduct.price}
                    onChange={(e) => setCustomProduct(prev => ({ ...prev, price: e.target.value }))}
                    className={isMobile ? 'h-12 text-base' : ''}
                  />
                  <div className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      id="taxable"
                      checked={customProduct.taxable}
                      onChange={(e) => setCustomProduct(prev => ({ ...prev, taxable: e.target.checked }))}
                    />
                    <label htmlFor="taxable" className="text-sm">Taxable (13%)</label>
                  </div>
                  <div className="flex gap-2">
                    <Button onClick={addCustomProduct} className={isMobile ? 'flex-1' : ''}>
                      Add Product
                    </Button>
                    <Button variant="outline" onClick={() => setShowCustomForm(false)}>
                      Cancel
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Product List */}
          <div className={`grid gap-3 ${isMobile ? 'grid-cols-1' : 'grid-cols-1 md:grid-cols-2'}`}>
            {isLoading ? (
              Array.from({ length: 4 }).map((_, i) => (
                <Card key={i} className="animate-pulse">
                  <CardContent className="p-4">
                    <div className="h-4 bg-gray-200 rounded mb-2"></div>
                    <div className="h-3 bg-gray-200 rounded w-3/4"></div>
                  </CardContent>
                </Card>
              ))
            ) : (
              filteredProducts.map((product) => {
                const isSelected = items.some(item => item.id === product.id);
                return (
                  <Card 
                    key={product.id} 
                    className={`cursor-pointer transition-all ${
                      isSelected ? 'border-primary bg-primary/5' : 'hover:border-primary/50'
                    }`}
                    onClick={() => addProduct(product)}
                  >
                    <CardContent className={isMobile ? 'p-4' : 'p-4'}>
                      <div className="flex items-start justify-between">
                        <div className="flex-1 min-w-0">
                          <h4 className={`font-medium truncate ${isMobile ? 'text-sm' : ''}`}>
                            {product.name}
                          </h4>
                          {product.description && (
                            <p className={`text-muted-foreground line-clamp-2 ${isMobile ? 'text-xs' : 'text-sm'}`}>
                              {product.description}
                            </p>
                          )}
                          <div className="flex items-center gap-2 mt-2">
                            <span className={`font-semibold text-primary ${isMobile ? 'text-sm' : ''}`}>
                              {formatCurrency(product.price)}
                            </span>
                            {product.category && (
                              <Badge variant="secondary" className={isMobile ? 'text-xs' : ''}>
                                {product.category}
                              </Badge>
                            )}
                          </div>
                        </div>
                        <div className={`ml-2 ${isMobile ? 'min-w-[40px]' : 'min-w-[44px]'}`}>
                          <Button
                            size={isMobile ? "sm" : "default"}
                            variant={isSelected ? "default" : "outline"}
                            className={isMobile ? 'h-10 w-10 p-0' : 'h-10 w-10 p-0'}
                          >
                            <Plus className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                );
              })
            )}
          </div>
        </div>

        {/* Selected Items */}
        <div className="space-y-4">
          <h3 className={`font-semibold ${isMobile ? 'text-base' : 'text-lg'}`}>
            Selected Items ({items.length})
          </h3>

          {items.length === 0 ? (
            <Card>
              <CardContent className={`text-center py-8 ${isMobile ? 'py-6' : ''}`}>
                <Package className={`h-12 w-12 mx-auto mb-4 text-gray-400 ${isMobile ? 'h-8 w-8 mb-2' : ''}`} />
                <p className={`text-muted-foreground ${isMobile ? 'text-sm' : ''}`}>
                  No items selected yet
                </p>
                <p className={`text-sm text-muted-foreground ${isMobile ? 'text-xs' : ''}`}>
                  Add products to get started
                </p>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-3">
              {items.map((item) => (
                <Card key={item.id}>
                  <CardContent className={isMobile ? 'p-4' : 'p-4'}>
                    <div className="flex items-start justify-between">
                      <div className="flex-1 min-w-0">
                        <h4 className={`font-medium ${isMobile ? 'text-sm' : ''}`}>{item.name}</h4>
                        {item.description && (
                          <p className={`text-muted-foreground ${isMobile ? 'text-xs' : 'text-sm'}`}>
                            {item.description}
                          </p>
                        )}
                        <div className="flex items-center gap-4 mt-2">
                          <span className={`text-primary font-medium ${isMobile ? 'text-sm' : ''}`}>
                            {formatCurrency(item.unitPrice)}
                          </span>
                          <button
                            onClick={() => toggleTaxable(item.id)}
                            className={`text-xs px-2 py-1 rounded transition-colors ${
                              item.taxable 
                                ? 'bg-green-100 text-green-800' 
                                : 'bg-gray-100 text-gray-600'
                            }`}
                          >
                            {item.taxable ? 'Taxable' : 'No Tax'}
                          </button>
                        </div>
                      </div>
                      
                      <div className="flex items-center gap-2 ml-4">
                        <div className="flex items-center border rounded">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => updateQuantity(item.id, item.quantity - 1)}
                            className={`h-8 w-8 p-0 ${isMobile ? 'h-10 w-10' : ''}`}
                          >
                            <Minus className="h-3 w-3" />
                          </Button>
                          <span className={`px-3 py-1 border-x min-w-[40px] text-center ${isMobile ? 'text-base' : 'text-sm'}`}>
                            {item.quantity}
                          </span>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => updateQuantity(item.id, item.quantity + 1)}
                            className={`h-8 w-8 p-0 ${isMobile ? 'h-10 w-10' : ''}`}
                          >
                            <Plus className="h-3 w-3" />
                          </Button>
                        </div>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => removeItem(item.id)}
                          className={`h-8 w-8 p-0 text-red-600 hover:text-red-700 hover:bg-red-50 ${isMobile ? 'h-10 w-10' : ''}`}
                        >
                          <Trash2 className="h-3 w-3" />
                        </Button>
                      </div>
                    </div>
                    
                    <div className={`mt-2 pt-2 border-t flex justify-between items-center ${isMobile ? 'text-sm' : ''}`}>
                      <span className="text-muted-foreground">Line Total:</span>
                      <span className="font-medium">
                        {formatCurrency(item.quantity * item.unitPrice)}
                      </span>
                    </div>
                  </CardContent>
                </Card>
              ))}

              {/* Totals */}
              <Card className="bg-muted/50">
                <CardContent className={isMobile ? 'p-4' : 'p-4'}>
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className={isMobile ? 'text-sm' : ''}>Subtotal:</span>
                      <span className={isMobile ? 'text-sm' : ''}>{formatCurrency(subtotal)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className={isMobile ? 'text-sm' : ''}>Tax (13%):</span>
                      <span className={isMobile ? 'text-sm' : ''}>{formatCurrency(taxAmount)}</span>
                    </div>
                    <div className="flex justify-between font-semibold text-lg pt-2 border-t">
                      <span className={isMobile ? 'text-base' : ''}>Total:</span>
                      <span className={isMobile ? 'text-base' : ''}>{formatCurrency(total)}</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
