
import { Button } from "@/components/ui/button";
import { Trash2 } from "lucide-react";

interface EstimateActionsProps {
  estimate: any;
  onEdit: (estimateId: string) => void;
  onConvert: (estimate: any) => void;
  onAddWarranty: (estimate: any) => void;
  onSend: (estimateId: string) => void;
  onDelete: (estimateId: string) => void;
}

export const EstimateActions = ({
  estimate,
  onEdit,
  onConvert,
  onAddWarranty,
  onSend,
  onDelete,
}: EstimateActionsProps) => {
  return (
    <div className="flex justify-end gap-2">
      <Button 
        variant="outline" 
        size="sm"
        className="text-xs"
        onClick={() => onEdit(estimate.id)}
      >
        Edit
      </Button>
      <Button 
        variant="outline" 
        size="sm"
        className="text-xs"
        onClick={() => onConvert(estimate)}
      >
        To Invoice
      </Button>
      <Button 
        variant="outline" 
        size="sm"
        className="text-xs"
        onClick={() => onAddWarranty(estimate)}
      >
        Add Warranty
      </Button>
      {estimate.status === "draft" && (
        <Button 
          variant="outline" 
          size="sm"
          className="text-xs"
          onClick={() => onSend(estimate.id)}
        >
          Send
        </Button>
      )}
      <Button 
        variant="outline" 
        size="sm"
        className="text-xs text-fixlyfy-error"
        onClick={() => onDelete(estimate.id)}
      >
        <Trash2 size={14} />
      </Button>
    </div>
  );
};
