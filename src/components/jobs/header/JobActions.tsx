
import { Button } from "@/components/ui/button";
import { FileText, ChevronDown } from "lucide-react";
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
  onPaymentClick: () => void;
  onExpenseClick: () => void;
}

export const JobActions = ({ 
  onInvoiceClick, 
  onEstimateClick, 
  onPaymentClick, 
  onExpenseClick
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
          <DropdownMenuItem>Reschedule</DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem className="text-fixlyfy-error">Cancel Job</DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
};
