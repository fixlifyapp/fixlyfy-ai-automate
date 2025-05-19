
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
  onInvoiceClick: () => void;
  onEstimateClick: () => void;
  hasEstimate?: boolean;
  onSyncEstimateToInvoice?: () => void;
  onCompleteJob?: () => void;
  onCancelJob?: () => void;
  onReschedule?: () => void;
  onLoadPreviousEstimate?: () => void;
  onLoadPreviousInvoice?: () => void;
  previousEstimates?: { id: string; number: string }[];
  previousInvoices?: { id: string; number: string }[];
}

export const JobActions = ({ 
  onInvoiceClick, 
  onEstimateClick, 
  hasEstimate = false,
  onSyncEstimateToInvoice,
  onCompleteJob,
  onCancelJob,
  onReschedule,
  onLoadPreviousEstimate,
  onLoadPreviousInvoice,
  previousEstimates = [],
  previousInvoices = []
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
        
        {/* Invoice options */}
        {previousInvoices.length > 0 ? (
          <DropdownMenuSub>
            <DropdownMenuSubTrigger>Send Invoice</DropdownMenuSubTrigger>
            <DropdownMenuSubContent>
              <DropdownMenuItem onClick={onInvoiceClick}>Create New Invoice</DropdownMenuItem>
              <DropdownMenuSeparator />
              {previousInvoices.map(invoice => (
                <DropdownMenuItem
                  key={invoice.id}
                  onClick={() => onLoadPreviousInvoice && onLoadPreviousInvoice()}
                >
                  Load from {invoice.number}
                </DropdownMenuItem>
              ))}
            </DropdownMenuSubContent>
          </DropdownMenuSub>
        ) : (
          <DropdownMenuItem onClick={onInvoiceClick}>Send Invoice</DropdownMenuItem>
        )}
        
        {/* Estimate options */}
        {previousEstimates.length > 0 ? (
          <DropdownMenuSub>
            <DropdownMenuSubTrigger>Send Estimate</DropdownMenuSubTrigger>
            <DropdownMenuSubContent>
              <DropdownMenuItem onClick={onEstimateClick}>Create New Estimate</DropdownMenuItem>
              <DropdownMenuSeparator />
              {previousEstimates.map(estimate => (
                <DropdownMenuItem
                  key={estimate.id}
                  onClick={() => onLoadPreviousEstimate && onLoadPreviousEstimate()}
                >
                  Load from {estimate.number}
                </DropdownMenuItem>
              ))}
            </DropdownMenuSubContent>
          </DropdownMenuSub>
        ) : (
          <DropdownMenuItem onClick={onEstimateClick}>Send Estimate</DropdownMenuItem>
        )}
        
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
