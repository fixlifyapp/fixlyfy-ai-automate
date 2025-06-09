
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Search, Plus } from 'lucide-react';
import { LineItem, Product } from '@/components/jobs/builder/types';
import { LineItemsTable } from '../estimate-builder/LineItemsTable';

interface InvoiceItemsStepProps {
  lineItems: LineItem[];
  onLineItemsChange: (items: LineItem[]) => void;
  onContinue: () => void;
  onBack?: () => void;
}

export const InvoiceItemsStep = ({
  lineItems,
  onLineItemsChange,
  onContinue,
  onBack
}: InvoiceItemsStepProps) => {
  const [searchTerm, setSearchTerm] = useState('');

  // Mock products for now
  const mockProducts: Product[] = [
    { id: '1', name: 'Labor Hour', description: 'Standard labor charge', price: 85, category: 'Labor', taxable: true },
    { id: '2', name: 'Service Call', description: 'Diagnostic fee', price: 125, category: 'Service', taxable: true },
    { id: '3', name: 'Filter Replacement', description: 'HVAC filter replacement', price: 45, category: 'Parts', taxable: true }
  ];

  const filteredProducts = mockProducts.filter(product =>
    product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    product.description.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleAddProduct = (product: Product) => {
    const newLineItem: LineItem = {
      id: Date.now().toString(),
      name: product.name,
      description: product.description,
      quantity: 1,
      unitPrice: product.price,
      taxable: product.taxable
    };
    onLineItemsChange([...lineItems, newLineItem]);
  };

  const handleAddCustomItem = () => {
    const newLineItem: LineItem = {
      id: Date.now().toString(),
      name: 'Custom Item',
      description: '',
      quantity: 1,
      unitPrice: 0,
      taxable: true
    };
    onLineItemsChange([...lineItems, newLineItem]);
  };

  const handleRemoveLineItem = (id: string) => {
    onLineItemsChange(lineItems.filter(item => item.id !== id));
  };

  const handleUpdateLineItem = (id: string, field: string, value: any) => {
    onLineItemsChange(
      lineItems.map(item =>
        item.id === id ? { ...item, [field]: value } : item
      )
    );
  };

  const handleEditLineItem = (id: string) => {
    // For now, just return true to indicate edit was handled
    return true;
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Add Products & Services</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search products..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-h-60 overflow-y-auto">
              {filteredProducts.map((product) => (
                <div
                  key={product.id}
                  className="border rounded-lg p-3 hover:bg-muted/50 cursor-pointer"
                  onClick={() => handleAddProduct(product)}
                >
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <h4 className="font-medium">{product.name}</h4>
                      <p className="text-sm text-muted-foreground">{product.description}</p>
                    </div>
                    <span className="font-bold">${product.price}</span>
                  </div>
                </div>
              ))}
            </div>

            <Button variant="outline" onClick={handleAddCustomItem} className="w-full">
              <Plus className="h-4 w-4 mr-2" />
              Add Custom Item
            </Button>
          </div>
        </CardContent>
      </Card>

      {lineItems.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Selected Items</CardTitle>
          </CardHeader>
          <CardContent>
            <LineItemsTable
              lineItems={lineItems}
              onUpdateLineItem={handleUpdateLineItem}
              onEditLineItem={handleEditLineItem}
              onRemoveLineItem={handleRemoveLineItem}
            />
          </CardContent>
        </Card>
      )}

      <div className="flex justify-between">
        {onBack && (
          <Button variant="outline" onClick={onBack}>
            Back
          </Button>
        )}
        <Button
          onClick={onContinue}
          disabled={lineItems.length === 0}
          className="ml-auto"
        >
          Continue
        </Button>
      </div>
    </div>
  );
};
