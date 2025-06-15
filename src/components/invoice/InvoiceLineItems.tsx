
import { formatCurrency } from '@/lib/utils';

interface LineItem {
  description: string;
  quantity: number;
  unitPrice?: number;
  price?: number;
}

interface InvoiceLineItemsProps {
  items: LineItem[];
  total: number;
}

export const InvoiceLineItems = ({ items, total }: InvoiceLineItemsProps) => {
  if (!items || items.length === 0) {
    return null;
  }

  return (
    <div className="mb-8">
      <h3 className="text-lg font-semibold mb-4">Items</h3>
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b">
              <th className="text-left py-2">Description</th>
              <th className="text-right py-2">Qty</th>
              <th className="text-right py-2">Rate</th>
              <th className="text-right py-2">Amount</th>
            </tr>
          </thead>
          <tbody>
            {items.map((item: LineItem, index: number) => (
              <tr key={index} className="border-b">
                <td className="py-3">{item.description}</td>
                <td className="text-right py-3">{item.quantity}</td>
                <td className="text-right py-3">{formatCurrency(item.unitPrice || item.price || 0)}</td>
                <td className="text-right py-3">{formatCurrency((item.quantity || 1) * (item.unitPrice || item.price || 0))}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      
      <div className="flex justify-end mt-4">
        <div className="w-64">
          <div className="flex justify-between py-2">
            <span>Subtotal:</span>
            <span>{formatCurrency(total)}</span>
          </div>
          <div className="flex justify-between py-2 font-bold text-lg border-t">
            <span>Total:</span>
            <span>{formatCurrency(total)}</span>
          </div>
        </div>
      </div>
    </div>
  );
};
