
import { Button } from "@/components/ui/button";
import { ChevronDown } from "lucide-react";
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuSeparator, 
  DropdownMenuTrigger,
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger,
} from "@/components/ui/dropdown-menu";

interface JobActionsProps {
  onCompleteJob?: () => void;
  onCancelJob?: () => void;
  onReschedule?: () => void;
  onInvoiceClick?: () => void;
  onEstimateClick?: () => void;
  hasEstimate?: boolean;
  onSyncEstimateToInvoice?: () => void;
  previousEstimates?: { id: string; number: string; }[];
  previousInvoices?: { id: string; number: string; }[];
  onLoadPreviousEstimate?: () => void;
  onLoadPreviousInvoice?: () => void;
}

export const JobActions = ({ 
  onCompleteJob,
  onCancelJob,
  onReschedule,
  onInvoiceClick,
  onEstimateClick,
  hasEstimate,
  onSyncEstimateToInvoice,
  previousEstimates,
  previousInvoices,
  onLoadPreviousEstimate,
  onLoadPreviousInvoice
}: JobActionsProps) => {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button>Actions <ChevronDown size={16} /></Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        {onCompleteJob && (
          <DropdownMenuItem onClick={onCompleteJob}>Complete Job</DropdownMenuItem>
        )}
        
        {onReschedule && (
          <DropdownMenuItem onClick={onReschedule}>Reschedule</DropdownMenuItem>
        )}
        <DropdownMenuSeparator />
        {onCancelJob && (
          <DropdownMenuItem onClick={onCancelJob} className="text-fixlyfy-error">
            Cancel Job
          </DropdownMenuItem>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );
};
