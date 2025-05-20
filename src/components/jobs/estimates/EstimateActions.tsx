
import { Button } from "@/components/ui/button";
import { Trash2, Loader2 } from "lucide-react";

interface EstimateActionsProps {
  estimate: any;
  onEdit: (estimateId: string) => void;
  onConvert: (estimate: any) => void;
  onAddWarranty: (estimate: any) => void;
  onSend: (estimateId: string) => void;
  onDelete: (estimateId: string) => void;
  isProcessing?: boolean;
}

export const EstimateActions = ({
  estimate,
  onEdit,
  onConvert,
  onAddWarranty,
  onSend,
  onDelete,
  isProcessing = false,
}: EstimateActionsProps) => {
  return (
    <div className="flex justify-end gap-2">
      <Button 
        variant="outline" 
        size="sm"
        className="text-xs"
        onClick={() => onEdit(estimate.id)}
        disabled={isProcessing}
      >
        Edit
      </Button>
      <Button 
        variant="outline" 
        size="sm"
        className="text-xs"
        onClick={() => onConvert(estimate)}
        disabled={isProcessing}
      >
        To Invoice
      </Button>
      <Button 
        variant="outline" 
        size="sm"
        className="text-xs"
        onClick={() => onAddWarranty(estimate)}
        disabled={isProcessing}
      >
        Add Warranty
      </Button>
      {estimate.status === "draft" && (
        <Button 
          variant="outline" 
          size="sm"
          className="text-xs"
          onClick={() => onSend(estimate.id)}
          disabled={isProcessing}
        >
          Send
        </Button>
      )}
      <Button 
        variant="outline" 
        size="sm"
        className="text-xs text-fixlyfy-error"
        onClick={() => onDelete(estimate.id)}
        disabled={isProcessing}
      >
        {isProcessing ? <Loader2 size={14} className="animate-spin" /> : <Trash2 size={14} />}
      </Button>
    </div>
  );
};
