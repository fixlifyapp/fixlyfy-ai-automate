
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Pencil, Trash } from "lucide-react";
import { LineItem } from "@/components/jobs/builder/types";

interface LineItemsTableProps {
  lineItems: LineItem[];
  onUpdateLineItem: (id: string, field: string, value: any) => void;
  onEditLineItem: (id: string) => boolean;
  onRemoveLineItem: (id: string) => void;
}

export const LineItemsTable = ({
  lineItems = [], // Provide default empty array
  onUpdateLineItem,
  onEditLineItem,
  onRemoveLineItem
}: LineItemsTableProps) => {
  
  // Helper function to calculate the total for a line item
  const calculateLineTotal = (item: LineItem): number => {
    const price = item.unitPrice;
    const subtotal = item.quantity * price;
    const discountAmount = item.discount ? subtotal * (item.discount / 100) : 0;
    const afterDiscount = subtotal - discountAmount;
    return afterDiscount;
  };

  // Helper function to calculate the margin for a line item
  const calculateMargin = (item: LineItem): number => {
    const revenue = calculateLineTotal(item);
    const cost = item.quantity * (item.ourPrice || 0);
    return revenue - cost;
  };

  // Helper function to calculate margin percentage
  const calculateMarginPercentage = (item: LineItem): number => {
    const margin = calculateMargin(item);
    const revenue = calculateLineTotal(item);
    if (revenue === 0) return 0;
    return (margin / revenue) * 100;
  };

  return (
    <div className="border rounded-md overflow-hidden bg-white">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="w-[40%]">Description</TableHead>
            <TableHead className="w-[70px]">Qty</TableHead>
            <TableHead className="w-[100px]">Unit Price</TableHead>
            <TableHead className="w-[100px]">Our Price</TableHead>
            <TableHead className="w-[70px]">Discount</TableHead>
            <TableHead className="w-[120px] text-right">Total</TableHead>
            <TableHead className="w-[80px]"></TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {Array.isArray(lineItems) && lineItems.length > 0 ? (
            lineItems.map((item) => (
              <TableRow key={item.id} className="hover:bg-muted/20 group">
                <TableCell>
                  <Input
                    value={item.description || (item.name || "")}
                    onChange={(e) => onUpdateLineItem(item.id, "description", e.target.value)}
                    className="border-transparent focus:border-input bg-transparent"
                  />
                </TableCell>
                <TableCell>
                  <Input
                    type="number"
                    value={item.quantity}
                    min={1}
                    onChange={(e) => onUpdateLineItem(item.id, "quantity", parseInt(e.target.value) || 1)}
                    className="border-transparent focus:border-input bg-transparent w-16"
                  />
                </TableCell>
                <TableCell>
                  <div className="relative">
                    <span className="absolute left-2 top-1/2 transform -translate-y-1/2 text-muted-foreground">$</span>
                    <Input
                      type="number"
                      value={item.unitPrice}
                      min={0}
                      step={0.01}
                      onChange={(e) => {
                        const value = parseFloat(e.target.value) || 0;
                        onUpdateLineItem(item.id, "unitPrice", value);
                      }}
                      className="border-transparent focus:border-input bg-transparent pl-6"
                    />
                  </div>
                </TableCell>
                <TableCell>
                  <div className="relative">
                    <span className="absolute left-2 top-1/2 transform -translate-y-1/2 text-muted-foreground">$</span>
                    <Input
                      type="number"
                      value={item.ourPrice || 0}
                      min={0}
                      step={0.01}
                      onChange={(e) => {
                        const value = parseFloat(e.target.value) || 0;
                        onUpdateLineItem(item.id, "ourPrice", value);
                      }}
                      className="border-transparent focus:border-input bg-transparent pl-6"
                    />
                  </div>
                </TableCell>
                <TableCell>
                  <div className="relative">
                    <Input
                      type="number"
                      value={item.discount || 0}
                      min={0}
                      max={100}
                      onChange={(e) => onUpdateLineItem(item.id, "discount", parseFloat(e.target.value) || 0)}
                      className="border-transparent focus:border-input bg-transparent pr-6 w-16"
                    />
                    <span className="absolute right-2 top-1/2 transform -translate-y-1/2 text-muted-foreground">%</span>
                  </div>
                </TableCell>
                <TableCell className="text-right">
                  <div>
                    <div className="font-medium">${calculateLineTotal(item).toFixed(2)}</div>
                    {item.ourPrice > 0 && (
                      <div className="text-xs text-green-600">
                        M: ${calculateMargin(item).toFixed(2)} ({calculateMarginPercentage(item).toFixed(0)}%)
                      </div>
                    )}
                  </div>
                </TableCell>
                <TableCell>
                  <div className="flex items-center justify-end space-x-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => onEditLineItem(item.id)}
                      title="Edit product details"
                      className="h-8 w-8"
                    >
                      <Pencil size={16} />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => onRemoveLineItem(item.id)}
                      title="Remove item"
                      className="h-8 w-8 text-destructive"
                    >
                      <Trash size={16} />
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))
          ) : (
            <TableRow>
              <TableCell colSpan={7} className="text-center py-8 text-muted-foreground">
                No items added yet. Add items from the catalog or create a custom line item.
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
    </div>
  );
};
