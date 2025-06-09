
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { LineItem } from '@/components/jobs/builder/types';

interface CustomItemFormProps {
  onAdd: (item: LineItem) => void;
  onCancel: () => void;
}

export const CustomItemForm = ({ onAdd, onCancel }: CustomItemFormProps) => {
  const [item, setItem] = useState<Partial<LineItem>>({
    name: '',
    description: '',
    quantity: 1,
    unitPrice: 0,
    taxable: true
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!item.name) return;

    const newItem: LineItem = {
      id: Date.now().toString(),
      name: item.name,
      description: item.description || '',
      quantity: item.quantity || 1,
      unitPrice: item.unitPrice || 0,
      taxable: item.taxable !== false
    };

    onAdd(newItem);
  };

  const handleChange = (field: keyof LineItem, value: any) => {
    setItem(prev => ({ ...prev, [field]: value }));
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4 p-4 border rounded-lg bg-muted/10">
      <h3 className="font-medium">Add Custom Item</h3>
      
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="name">Item Name</Label>
          <Input
            id="name"
            value={item.name || ''}
            onChange={(e) => handleChange('name', e.target.value)}
            placeholder="Enter item name"
            required
          />
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="quantity">Quantity</Label>
          <Input
            id="quantity"
            type="number"
            min="1"
            value={item.quantity || 1}
            onChange={(e) => handleChange('quantity', parseInt(e.target.value) || 1)}
          />
        </div>
      </div>
      
      <div className="space-y-2">
        <Label htmlFor="description">Description</Label>
        <Textarea
          id="description"
          value={item.description || ''}
          onChange={(e) => handleChange('description', e.target.value)}
          placeholder="Item description (optional)"
          rows={2}
        />
      </div>
      
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="unitPrice">Unit Price</Label>
          <Input
            id="unitPrice"
            type="number"
            min="0"
            step="0.01"
            value={item.unitPrice || 0}
            onChange={(e) => handleChange('unitPrice', parseFloat(e.target.value) || 0)}
          />
        </div>
        
        <div className="flex items-center space-x-2 pt-6">
          <Switch
            id="taxable"
            checked={item.taxable !== false}
            onCheckedChange={(checked) => handleChange('taxable', checked)}
          />
          <Label htmlFor="taxable">Taxable</Label>
        </div>
      </div>
      
      <div className="flex justify-end space-x-2">
        <Button type="button" variant="outline" onClick={onCancel}>
          Cancel
        </Button>
        <Button type="submit">
          Add Item
        </Button>
      </div>
    </form>
  );
};
