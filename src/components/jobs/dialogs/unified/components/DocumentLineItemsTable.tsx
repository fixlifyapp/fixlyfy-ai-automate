
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { Trash2, Edit3 } from "lucide-react";
import { LineItem } from "../../../builder/types";
import { useState } from "react";
import { useIsMobile } from "@/hooks/use-mobile";

interface DocumentLineItemsTableProps {
  documentType: "estimate" | "invoice";
  lineItems: LineItem[];
  onRemoveLineItem?: (id: string) => void;
  onUpdateLineItem?: (id: string, field: string, value: any) => void;
}

export const DocumentLineItemsTable = ({
  documentType,
  lineItems = [],
  onRemoveLineItem,
  onUpdateLineItem
}: DocumentLineItemsTableProps) => {
  const [editingId, setEditingId] = useState<string | null>(null);
  const isMobile = useIsMobile();

  const handleEdit = (id: string) => {
    setEditingId(id);
  };

  const handleSave = () => {
    setEditingId(null);
  };

  const handleFieldChange = (id: string, field: string, value: any) => {
    if (onUpdateLineItem) {
      onUpdateLineItem(id, field, value);
    }
  };

  const calculateLineTotal = (item: LineItem): number => {
    const subtotal = item.quantity * item.unitPrice;
    const discountAmount = item.discount ? subtotal * (item.discount / 100) : 0;
    return subtotal - discountAmount;
  };

  if (isMobile) {
    // Mobile card layout
    return (
      <div className="space-y-3 p-3">
        {lineItems.map((item) => (
          <div key={item.id} className="border rounded-lg p-3 bg-white shadow-sm">
            <div className="flex justify-between items-start mb-2">
              <div className="flex-1">
                {editingId === item.id ? (
                  <Input
                    value={item.description || item.name || ""}
                    onChange={(e) => handleFieldChange(item.id, "description", e.target.value)}
                    className="text-sm"
                    onBlur={handleSave}
                    autoFocus
                  />
                ) : (
                  <h4 className="font-medium text-sm line-clamp-2">
                    {item.description || item.name}
                  </h4>
                )}
              </div>
              <div className="flex gap-1 ml-2">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => handleEdit(item.id)}
                  className="h-8 w-8 p-0"
                >
                  <Edit3 className="h-3 w-3" />
                </Button>
                {onRemoveLineItem && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => onRemoveLineItem(item.id)}
                    className="h-8 w-8 p-0 text-destructive"
                  >
                    <Trash2 className="h-3 w-3" />
                  </Button>
                )}
              </div>
            </div>
            
            <div className="grid grid-cols-2 gap-3 text-xs">
              <div>
                <span className="text-muted-foreground block">Quantity</span>
                {editingId === item.id ? (
                  <Input
                    type="number"
                    value={item.quantity}
                    onChange={(e) => handleFieldChange(item.id, "quantity", Number(e.target.value))}
                    className="text-xs h-8"
                    min="1"
                  />
                ) : (
                  <span className="font-medium">{item.quantity}</span>
                )}
              </div>
              <div>
                <span className="text-muted-foreground block">Unit Price</span>
                {editingId === item.id ? (
                  <Input
                    type="number"
                    value={item.unitPrice}
                    onChange={(e) => handleFieldChange(item.id, "unitPrice", Number(e.target.value))}
                    className="text-xs h-8"
                    min="0"
                    step="0.01"
                  />
                ) : (
                  <span className="font-medium">${item.unitPrice.toFixed(2)}</span>
                )}
              </div>
              {item.discount && item.discount > 0 && (
                <div>
                  <span className="text-muted-foreground block">Discount</span>
                  {editingId === item.id ? (
                    <Input
                      type="number"
                      value={item.discount || 0}
                      onChange={(e) => handleFieldChange(item.id, "discount", Number(e.target.value))}
                      className="text-xs h-8"
                      min="0"
                      max="100"
                    />
                  ) : (
                    <span className="font-medium">{item.discount}%</span>
                  )}
                </div>
              )}
              <div>
                <span className="text-muted-foreground block">Taxable</span>
                <div className="flex items-center space-x-1 mt-1">
                  <Checkbox
                    checked={item.taxable !== false}
                    onCheckedChange={(checked) => handleFieldChange(item.id, "taxable", checked)}
                    className="h-4 w-4"
                  />
                  <span className="text-xs">{item.taxable !== false ? 'Yes' : 'No'}</span>
                </div>
              </div>
              <div>
                <span className="text-muted-foreground block">Total</span>
                <span className="font-semibold text-green-600">
                  ${calculateLineTotal(item).toFixed(2)}
                </span>
              </div>
            </div>
          </div>
        ))}
        
        {lineItems.length === 0 && (
          <div className="text-center py-8 text-muted-foreground">
            <p className="text-sm">No items added yet</p>
            <p className="text-xs">Add products to get started</p>
          </div>
        )}
      </div>
    );
  }

  // Desktop table layout
  return (
    <div className="border rounded-md overflow-hidden">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="w-[35%]">Description</TableHead>
            <TableHead className="w-[80px] text-center">Qty</TableHead>
            <TableHead className="w-[120px] text-right">Unit Price</TableHead>
            <TableHead className="w-[100px] text-center">Discount</TableHead>
            <TableHead className="w-[80px] text-center">Taxable</TableHead>
            <TableHead className="w-[120px] text-right">Total</TableHead>
            <TableHead className="w-[100px]">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {lineItems.map((item) => (
            <TableRow key={item.id} className="hover:bg-muted/50">
              <TableCell>
                {editingId === item.id ? (
                  <Input
                    value={item.description || item.name || ""}
                    onChange={(e) => handleFieldChange(item.id, "description", e.target.value)}
                    onBlur={handleSave}
                    autoFocus
                    className="h-8"
                  />
                ) : (
                  <div className="line-clamp-2">
                    {item.description || item.name}
                  </div>
                )}
              </TableCell>
              <TableCell className="text-center">
                {editingId === item.id ? (
                  <Input
                    type="number"
                    value={item.quantity}
                    onChange={(e) => handleFieldChange(item.id, "quantity", Number(e.target.value))}
                    className="h-8 w-16 text-center"
                    min="1"
                  />
                ) : (
                  item.quantity
                )}
              </TableCell>
              <TableCell className="text-right">
                {editingId === item.id ? (
                  <Input
                    type="number"
                    value={item.unitPrice}
                    onChange={(e) => handleFieldChange(item.id, "unitPrice", Number(e.target.value))}
                    className="h-8 w-20 text-right"
                    min="0"
                    step="0.01"
                  />
                ) : (
                  `$${item.unitPrice.toFixed(2)}`
                )}
              </TableCell>
              <TableCell className="text-center">
                {editingId === item.id ? (
                  <Input
                    type="number"
                    value={item.discount || 0}
                    onChange={(e) => handleFieldChange(item.id, "discount", Number(e.target.value))}
                    className="h-8 w-16 text-center"
                    min="0"
                    max="100"
                  />
                ) : (
                  `${item.discount || 0}%`
                )}
              </TableCell>
              <TableCell className="text-center">
                <div className="flex justify-center">
                  <Checkbox
                    checked={item.taxable !== false}
                    onCheckedChange={(checked) => handleFieldChange(item.id, "taxable", checked)}
                    className="h-4 w-4"
                  />
                </div>
              </TableCell>
              <TableCell className="text-right font-medium">
                ${calculateLineTotal(item).toFixed(2)}
              </TableCell>
              <TableCell>
                <div className="flex gap-1">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleEdit(item.id)}
                    className="h-8 w-8 p-0"
                  >
                    <Edit3 className="h-4 w-4" />
                  </Button>
                  {onRemoveLineItem && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => onRemoveLineItem(item.id)}
                      className="h-8 w-8 p-0 text-destructive"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  )}
                </div>
              </TableCell>
            </TableRow>
          ))}
          {lineItems.length === 0 && (
            <TableRow>
              <TableCell colSpan={7} className="text-center py-8 text-muted-foreground">
                No items added yet. Add products to get started.
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
    </div>
  );
};
