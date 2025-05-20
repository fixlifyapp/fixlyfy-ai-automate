
import { Button } from "@/components/ui/button";
import { Trash2, Loader2, Pencil } from "lucide-react";

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
  // Add a console log to debug the estimate object
  console.log("Estimate in EstimateActions:", estimate);
  
  const handleEditClick = (e: React.MouseEvent) => {
    // Prevent any default popup behavior
    e.preventDefault();
    e.stopPropagation();
    
    console.log("Edit button clicked for estimate ID:", estimate.id);
    if (estimate && estimate.id) {
      onEdit(estimate.id);
    } else {
      console.error("Cannot edit: Invalid estimate object or missing ID");
    }
  };
  
  return (
    <div className="flex justify-end gap-2">
      <Button 
        variant="outline" 
        size="sm"
        className="text-xs flex items-center gap-1"
        onClick={handleEditClick}
        disabled={isProcessing}
      >
        <Pencil size={14} />
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
