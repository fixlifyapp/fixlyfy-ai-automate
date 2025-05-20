
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
  lineItems,
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

  return (
    <div className="border rounded-md overflow-hidden bg-white">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="w-[50%]">Description</TableHead>
            <TableHead className="w-[80px]">Qty</TableHead>
            <TableHead className="w-[120px]">Unit Price</TableHead>
            <TableHead className="w-[80px]">Discount %</TableHead>
            <TableHead className="w-[120px] text-right">Total</TableHead>
            <TableHead className="w-[80px]"></TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {lineItems.map((item) => (
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
              <TableCell className="text-right font-medium">
                ${calculateLineTotal(item).toFixed(2)}
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
          ))}
          {lineItems.length === 0 && (
            <TableRow>
              <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
                No items added yet. Add items from the catalog or create a custom line item.
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
    </div>
  );
};
