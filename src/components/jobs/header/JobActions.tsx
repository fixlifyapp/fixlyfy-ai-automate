
import { Button } from "@/components/ui/button";
import { ChevronDown } from "lucide-react";
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuSeparator, 
  DropdownMenuTrigger 
} from "@/components/ui/dropdown-menu";

interface JobActionsProps {
  onInvoiceClick: () => void;
  onEstimateClick: () => void;
  hasEstimate?: boolean;
  onSyncEstimateToInvoice?: () => void;
  onCompleteJob?: () => void;
  onCancelJob?: () => void;
  onReschedule?: () => void;
}

export const JobActions = ({ 
  onInvoiceClick, 
  onEstimateClick, 
  hasEstimate = false,
  onSyncEstimateToInvoice,
  onCompleteJob,
  onCancelJob,
  onReschedule
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
        <DropdownMenuItem onClick={onInvoiceClick}>Send Invoice</DropdownMenuItem>
        <DropdownMenuItem onClick={onEstimateClick}>Send Estimate</DropdownMenuItem>
        {hasEstimate && onSyncEstimateToInvoice && (
          <DropdownMenuItem onClick={onSyncEstimateToInvoice}>
            Convert Estimate to Invoice
          </DropdownMenuItem>
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
