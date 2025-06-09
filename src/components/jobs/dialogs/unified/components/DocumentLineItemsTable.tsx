
import React from 'react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { Trash } from "lucide-react";
import { LineItem } from "@/components/jobs/builder/types";

interface DocumentLineItemsTableProps {
  lineItems: LineItem[];
  onUpdateLineItem: (id: string, field: string, value: any) => void;
  onRemoveLineItem: (id: string) => void;
}

export const DocumentLineItemsTable = ({
  lineItems,
  onUpdateLineItem,
  onRemoveLineItem
}: DocumentLineItemsTableProps) => {
  
  const calculateLineTotal = (item: LineItem): number => {
    return item.quantity * item.unitPrice;
  };

  return (
    <div className="border rounded-md overflow-hidden bg-white">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="w-[40%]">Description</TableHead>
            <TableHead className="w-[10%]">Qty</TableHead>
            <TableHead className="w-[15%]">Price</TableHead>
            <TableHead className="w-[10%]">Taxable</TableHead>
            <TableHead className="w-[15%] text-right">Total</TableHead>
            <TableHead className="w-[10%]"></TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {lineItems.length > 0 ? (
            lineItems.map((item) => (
              <TableRow key={item.id} className="hover:bg-muted/20">
                <TableCell>
                  <div className="space-y-2">
                    <Input
                      value={item.name}
                      onChange={(e) => onUpdateLineItem(item.id, 'name', e.target.value)}
                      placeholder="Item name"
                      className="font-medium"
                    />
                    <Input
                      value={item.description}
                      onChange={(e) => onUpdateLineItem(item.id, 'description', e.target.value)}
                      placeholder="Description"
                      className="text-sm"
                    />
                  </div>
                </TableCell>
                <TableCell>
                  <Input
                    type="number"
                    min="1"
                    value={item.quantity}
                    onChange={(e) => onUpdateLineItem(item.id, 'quantity', parseInt(e.target.value) || 1)}
                    className="w-20"
                  />
                </TableCell>
                <TableCell>
                  <Input
                    type="number"
                    min="0"
                    step="0.01"
                    value={item.unitPrice}
                    onChange={(e) => onUpdateLineItem(item.id, 'unitPrice', parseFloat(e.target.value) || 0)}
                    className="w-24"
                  />
                </TableCell>
                <TableCell>
                  <Switch
                    checked={item.taxable}
                    onCheckedChange={(checked) => onUpdateLineItem(item.id, 'taxable', checked)}
                  />
                </TableCell>
                <TableCell className="text-right">
                  <div className="font-medium">${calculateLineTotal(item).toFixed(2)}</div>
                </TableCell>
                <TableCell>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => onRemoveLineItem(item.id)}
                    className="h-8 w-8 text-destructive"
                  >
                    <Trash size={16} />
                  </Button>
                </TableCell>
              </TableRow>
            ))
          ) : (
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
