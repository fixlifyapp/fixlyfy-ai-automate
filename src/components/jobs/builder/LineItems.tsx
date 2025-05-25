
import { LineItem } from "./types";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Trash2, Edit } from "lucide-react";

interface LineItemsProps {
  lineItems: LineItem[];
  onRemove: (id: string) => void;
  onUpdate: (id: string, field: string, value: any) => void;
  onEdit: (id: string) => void;
}

export const LineItems = ({ lineItems, onRemove, onUpdate, onEdit }: LineItemsProps) => {
  return (
    <div className="space-y-4">
      <h3 className="font-semibold">Line Items ({lineItems.length})</h3>
      
      {lineItems.length === 0 ? (
        <p className="text-muted-foreground text-sm">No items added yet</p>
      ) : (
        <div className="space-y-2">
          {lineItems.map((item) => (
            <div key={item.id} className="p-3 border rounded-md">
              <div className="flex justify-between items-start mb-2">
                <div className="flex-1">
                  <h4 className="font-medium text-sm">{item.name || item.description}</h4>
                  {item.description && item.name !== item.description && (
                    <p className="text-xs text-muted-foreground">{item.description}</p>
                  )}
                </div>
                
                <div className="flex gap-1">
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => onEdit(item.id)}
                  >
                    <Edit size={14} />
                  </Button>
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => onRemove(item.id)}
                  >
                    <Trash2 size={14} />
                  </Button>
                </div>
              </div>
              
              <div className="grid grid-cols-3 gap-2">
                <div>
                  <label className="text-xs text-muted-foreground">Quantity</label>
                  <Input
                    type="number"
                    value={item.quantity}
                    onChange={(e) => onUpdate(item.id, "quantity", Number(e.target.value))}
                    min="1"
                    className="h-8"
                  />
                </div>
                
                <div>
                  <label className="text-xs text-muted-foreground">Unit Price</label>
                  <Input
                    type="number"
                    step="0.01"
                    value={item.unitPrice}
                    onChange={(e) => onUpdate(item.id, "unitPrice", Number(e.target.value))}
                    className="h-8"
                  />
                </div>
                
                <div>
                  <label className="text-xs text-muted-foreground">Total</label>
                  <div className="h-8 flex items-center text-sm font-medium">
                    ${(item.quantity * item.unitPrice).toFixed(2)}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
