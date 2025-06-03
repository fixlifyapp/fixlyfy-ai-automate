
import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Plus, 
  Trash2, 
  Calculator,
  Search,
  Package,
  Edit
} from 'lucide-react';
import { LineItem, Product } from '../../builder/types';
import { ProductCatalog } from '../../builder/ProductCatalog';
import { formatCurrency } from '@/lib/utils';
import { toast } from 'sonner';

interface LineItemsManagerProps {
  lineItems: LineItem[];
  taxRate: number;
  notes: string;
  onLineItemsChange: (items: LineItem[]) => void;
  onTaxRateChange: (rate: number) => void;
  onNotesChange: (notes: string) => void;
  onAddProduct: (product: Product) => void;
  onRemoveLineItem: (id: string) => void;
  onUpdateLineItem: (id: string, field: string, value: any) => void;
  calculateSubtotal: () => number;
  calculateTotalTax: () => number;
  calculateGrandTotal: () => number;
  documentType: 'estimate' | 'invoice';
}

export const LineItemsManager = ({
  lineItems,
  taxRate,
  notes,
  onLineItemsChange,
  onTaxRateChange,
  onNotesChange,
  onAddProduct,
  onRemoveLineItem,
  onUpdateLineItem,
  calculateSubtotal,
  calculateTotalTax,
  calculateGrandTotal,
  documentType
}: LineItemsManagerProps) => {
  const [newItemDescription, setNewItemDescription] = useState('');
  const [newItemQuantity, setNewItemQuantity] = useState(1);
  const [newItemPrice, setNewItemPrice] = useState(0);
  const [newItemTaxable, setNewItemTaxable] = useState(true);

  const handleAddLineItem = () => {
    if (!newItemDescription.trim() || newItemPrice <= 0) {
      toast.error('Please enter valid item details');
      return;
    }

    const newItem: LineItem = {
      id: `temp-${Date.now()}`,
      description: newItemDescription,
      quantity: newItemQuantity,
      unitPrice: newItemPrice,
      taxable: newItemTaxable,
      discount: 0,
      ourPrice: 0,
      name: newItemDescription,
      price: newItemPrice,
      total: newItemQuantity * newItemPrice
    };

    onLineItemsChange([...lineItems, newItem]);
    
    // Reset form
    setNewItemDescription('');
    setNewItemQuantity(1);
    setNewItemPrice(0);
    setNewItemTaxable(true);
    
    toast.success('Item added successfully');
  };

  const handleProductSelect = (product: Product) => {
    onAddProduct(product);
    toast.success(`${product.name} added to ${documentType}`);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold flex items-center gap-2">
          <Calculator className="h-6 w-6 text-blue-600" />
          Add Items & Services
        </h2>
        <Badge variant="outline" className="text-lg px-3 py-1">
          Total: {formatCurrency(calculateGrandTotal())}
        </Badge>
      </div>

      {/* Add Items Options */}
      <Card>
        <CardHeader>
          <CardTitle>Add Items</CardTitle>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="products" className="w-full">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="products" className="flex items-center gap-2">
                <Package className="h-4 w-4" />
                Add from Products
              </TabsTrigger>
              <TabsTrigger value="custom" className="flex items-center gap-2">
                <Edit className="h-4 w-4" />
                Add Custom Product
              </TabsTrigger>
            </TabsList>

            <TabsContent value="products" className="mt-4">
              <div className="border rounded-lg p-4">
                <ProductCatalog onAddProduct={handleProductSelect} />
              </div>
            </TabsContent>

            <TabsContent value="custom" className="mt-4">
              <div className="grid grid-cols-12 gap-4">
                <div className="col-span-4">
                  <Label htmlFor="description">Description</Label>
                  <Input
                    id="description"
                    placeholder="Service or product description"
                    value={newItemDescription}
                    onChange={(e) => setNewItemDescription(e.target.value)}
                  />
                </div>
                <div className="col-span-2">
                  <Label htmlFor="quantity">Quantity</Label>
                  <Input
                    id="quantity"
                    type="number"
                    min="1"
                    value={newItemQuantity}
                    onChange={(e) => setNewItemQuantity(parseInt(e.target.value) || 1)}
                  />
                </div>
                <div className="col-span-2">
                  <Label htmlFor="price">Unit Price</Label>
                  <Input
                    id="price"
                    type="number"
                    min="0"
                    step="0.01"
                    placeholder="0.00"
                    value={newItemPrice}
                    onChange={(e) => setNewItemPrice(parseFloat(e.target.value) || 0)}
                  />
                </div>
                <div className="col-span-2">
                  <Label htmlFor="taxable">Taxable</Label>
                  <Select value={newItemTaxable.toString()} onValueChange={(value) => setNewItemTaxable(value === 'true')}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="true">Yes</SelectItem>
                      <SelectItem value="false">No</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="col-span-2 flex items-end">
                  <Button onClick={handleAddLineItem} className="w-full">
                    <Plus className="h-4 w-4 mr-2" />
                    Add Item
                  </Button>
                </div>
              </div>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>

      {/* Line Items List */}
      {lineItems.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Added Items ({lineItems.length})</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="border rounded-lg overflow-hidden">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-4 py-3 text-left text-sm font-medium text-gray-900">Description</th>
                    <th className="px-4 py-3 text-center text-sm font-medium text-gray-900">Qty</th>
                    <th className="px-4 py-3 text-right text-sm font-medium text-gray-900">Unit Price</th>
                    <th className="px-4 py-3 text-center text-sm font-medium text-gray-900">Taxable</th>
                    <th className="px-4 py-3 text-right text-sm font-medium text-gray-900">Total</th>
                    <th className="px-4 py-3 text-center text-sm font-medium text-gray-900">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {lineItems.map((item) => (
                    <tr key={item.id} className="border-t">
                      <td className="px-4 py-3">
                        <Input
                          value={item.description}
                          onChange={(e) => onUpdateLineItem(item.id, 'description', e.target.value)}
                          className="border-0 p-0 h-auto bg-transparent"
                        />
                      </td>
                      <td className="px-4 py-3 text-center">
                        <Input
                          type="number"
                          min="1"
                          value={item.quantity}
                          onChange={(e) => onUpdateLineItem(item.id, 'quantity', parseInt(e.target.value) || 1)}
                          className="w-16 text-center"
                        />
                      </td>
                      <td className="px-4 py-3 text-right">
                        <Input
                          type="number"
                          min="0"
                          step="0.01"
                          value={item.unitPrice}
                          onChange={(e) => onUpdateLineItem(item.id, 'unitPrice', parseFloat(e.target.value) || 0)}
                          className="w-24 text-right"
                        />
                      </td>
                      <td className="px-4 py-3 text-center">
                        <Select 
                          value={item.taxable.toString()} 
                          onValueChange={(value) => onUpdateLineItem(item.id, 'taxable', value === 'true')}
                        >
                          <SelectTrigger className="w-16">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="true">Yes</SelectItem>
                            <SelectItem value="false">No</SelectItem>
                          </SelectContent>
                        </Select>
                      </td>
                      <td className="px-4 py-3 text-right font-medium">
                        {formatCurrency(item.quantity * item.unitPrice)}
                      </td>
                      <td className="px-4 py-3 text-center">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => onRemoveLineItem(item.id)}
                          className="text-red-600 hover:text-red-700"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Totals Section */}
            <div className="mt-6 flex justify-end">
              <div className="w-80 space-y-2">
                <div className="flex justify-between">
                  <span>Subtotal:</span>
                  <span>{formatCurrency(calculateSubtotal())}</span>
                </div>
                <div className="flex justify-between items-center">
                  <div className="flex items-center gap-2">
                    <span>Tax:</span>
                    <Input
                      type="number"
                      min="0"
                      max="100"
                      step="0.1"
                      value={taxRate}
                      onChange={(e) => onTaxRateChange(parseFloat(e.target.value) || 0)}
                      className="w-16 h-6 text-xs"
                    />
                    <span className="text-xs">%</span>
                  </div>
                  <span>{formatCurrency(calculateTotalTax())}</span>
                </div>
                <div className="flex justify-between font-semibold text-lg border-t pt-2">
                  <span>Total:</span>
                  <span className="text-green-600">{formatCurrency(calculateGrandTotal())}</span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Notes Section */}
      <Card>
        <CardHeader>
          <CardTitle>Additional Notes</CardTitle>
        </CardHeader>
        <CardContent>
          <Textarea
            placeholder="Add any additional notes, terms, or special instructions..."
            value={notes}
            onChange={(e) => onNotesChange(e.target.value)}
            rows={3}
          />
        </CardContent>
      </Card>
    </div>
  );
};
