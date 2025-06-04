
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Plus } from 'lucide-react';
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
    if (!description.trim()) {
      toast.error('Please enter a description');
      return;
    }

    if (price <= 0) {
      toast.error('Please enter a valid price');
      return;
    }

    if (quantity <= 0) {
      toast.error('Please enter a valid quantity');
      return;
    }

    const newItem: LineItem = {
      id: `custom-${Date.now()}-${Math.random()}`,
      description: description.trim(),
      quantity,
      unitPrice: price,
      taxable,
      discount: 0,
      ourPrice: 0,
      name: description.trim(),
      price,
      total: quantity * price
    };

    console.log('Adding custom item:', newItem);
    onAddItem(newItem);
    
    // Reset form
    setDescription('');
    setQuantity(1);
    setPrice(0);
    setTaxable(true);
    
    toast.success('Custom item added successfully');
  };

  return (
    <div className="space-y-4 p-4 border rounded-lg bg-gray-50">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="md:col-span-2">
          <Label htmlFor="description">Description *</Label>
          <Input
            id="description"
            placeholder="Service or product description"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
          />
        </div>
        
        <div>
          <Label htmlFor="quantity">Quantity *</Label>
          <Input
            id="quantity"
            type="number"
            min="1"
            value={quantity}
            onChange={(e) => setQuantity(parseInt(e.target.value) || 1)}
          />
        </div>
        
        <div>
          <Label htmlFor="price">Unit Price * ($)</Label>
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
        
        <div>
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
        
        <div className="flex items-end">
          <Button 
            onClick={handleAddItem} 
            className="w-full"
            disabled={!description.trim() || price <= 0 || quantity <= 0}
          >
            <Plus className="h-4 w-4 mr-2" />
            Add Item
          </Button>
        </div>
      </div>
    </div>
  );
};
