
import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Plus, Edit } from 'lucide-react';
import { LineItem } from '../../../builder/types';
import { toast } from 'sonner';

interface CustomItemFormProps {
  onAddItem: (item: LineItem) => void;
}

export const CustomItemForm = ({ onAddItem }: CustomItemFormProps) => {
  const [description, setDescription] = useState('');
  const [quantity, setQuantity] = useState(1);
  const [price, setPrice] = useState(0);
  const [taxable, setTaxable] = useState(true);

  const handleAddItem = () => {
    if (!description.trim() || price <= 0) {
      toast.error('Please enter valid item details');
      return;
    }

    const newItem: LineItem = {
      id: `temp-${Date.now()}`,
      description,
      quantity,
      unitPrice: price,
      taxable,
      discount: 0,
      ourPrice: 0,
      name: description,
      price,
      total: quantity * price
    };

    onAddItem(newItem);
    
    // Reset form
    setDescription('');
    setQuantity(1);
    setPrice(0);
    setTaxable(true);
    
    toast.success('Item added successfully');
  };

  return (
    <div className="grid grid-cols-12 gap-4">
      <div className="col-span-4">
        <Label htmlFor="description">Description</Label>
        <Input
          id="description"
          placeholder="Service or product description"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
        />
      </div>
      <div className="col-span-2">
        <Label htmlFor="quantity">Quantity</Label>
        <Input
          id="quantity"
          type="number"
          min="1"
          value={quantity}
          onChange={(e) => setQuantity(parseInt(e.target.value) || 1)}
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
          value={price}
          onChange={(e) => setPrice(parseFloat(e.target.value) || 0)}
        />
      </div>
      <div className="col-span-2">
        <Label htmlFor="taxable">Taxable</Label>
        <Select value={taxable.toString()} onValueChange={(value) => setTaxable(value === 'true')}>
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
        <Button onClick={handleAddItem} className="w-full">
          <Plus className="h-4 w-4 mr-2" />
          Add Item
        </Button>
      </div>
    </div>
  );
};
