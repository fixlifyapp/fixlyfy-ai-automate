
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Trash2 } from 'lucide-react';
import { LineItem } from '../../../builder/types';
import { formatCurrency } from '@/lib/utils';

interface LineItemsTableProps {
  lineItems: LineItem[];
  onRemoveLineItem: (id: string) => void;
  onUpdateLineItem: (id: string, field: string, value: any) => void;
}

export const LineItemsTable = ({
  lineItems,
  onRemoveLineItem,
  onUpdateLineItem
}: LineItemsTableProps) => {
  if (lineItems.length === 0) return null;

  return (
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
      </CardContent>
    </Card>
  );
};
