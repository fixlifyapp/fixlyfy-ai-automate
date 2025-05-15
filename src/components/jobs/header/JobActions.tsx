
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
}

export const JobActions = ({ 
  onInvoiceClick, 
  onEstimateClick, 
  hasEstimate = false,
  onSyncEstimateToInvoice
}: JobActionsProps) => {
  return (
    <div className="flex gap-3 self-start">
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button>Actions</Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuItem>Complete Job</DropdownMenuItem>
          <DropdownMenuItem onClick={onInvoiceClick}>Send Invoice</DropdownMenuItem>
          <DropdownMenuItem onClick={onEstimateClick}>Send Estimate</DropdownMenuItem>
          {hasEstimate && onSyncEstimateToInvoice && (
            <DropdownMenuItem onClick={onSyncEstimateToInvoice}>
              Sync Estimate to Invoice
            </DropdownMenuItem>
          )}
          <DropdownMenuItem>Reschedule</DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem className="text-fixlyfy-error">Cancel Job</DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
};
