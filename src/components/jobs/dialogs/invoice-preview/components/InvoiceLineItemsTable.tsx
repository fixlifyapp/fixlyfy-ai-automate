
import { formatCurrency } from "@/lib/utils";

interface LineItem {
  id: string;
  description: string;
  quantity: number;
  unit_price: number;
  taxable: boolean;
}

interface InvoiceLineItemsTableProps {
  lineItems: LineItem[];
  isLoadingItems: boolean;
}

export const InvoiceLineItemsTable = ({ lineItems, isLoadingItems }: InvoiceLineItemsTableProps) => {
  return (
    <div className="mb-8">
      <h3 className="font-semibold text-gray-900 mb-4">Services & Products:</h3>
      <div className="border rounded-lg overflow-hidden">
        <table className="w-full">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-4 py-3 text-left font-medium text-gray-900">Description</th>
              <th className="px-4 py-3 text-center font-medium text-gray-900">Qty</th>
              <th className="px-4 py-3 text-right font-medium text-gray-900">Unit Price</th>
              <th className="px-4 py-3 text-right font-medium text-gray-900">Total</th>
            </tr>
          </thead>
          <tbody>
            {isLoadingItems ? (
              <tr className="border-t">
                <td colSpan={4} className="px-4 py-8 text-center text-gray-500">
                  Loading items...
                </td>
              </tr>
            ) : lineItems.length > 0 ? (
              lineItems.map((item) => (
                <tr key={item.id} className="border-t">
                  <td className="px-4 py-3 text-gray-700">{item.description}</td>
                  <td className="px-4 py-3 text-center text-gray-700">{item.quantity}</td>
                  <td className="px-4 py-3 text-right text-gray-700">
                    {formatCurrency(item.unit_price)}
                  </td>
                  <td className="px-4 py-3 text-right text-gray-700">
                    {formatCurrency(item.quantity * item.unit_price)}
                  </td>
                </tr>
              ))
            ) : (
              <tr className="border-t">
                <td colSpan={4} className="px-4 py-8 text-center text-gray-500">
                  No items added to this invoice
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};
