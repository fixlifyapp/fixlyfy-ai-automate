
import { Button } from "@/components/ui/button";
import { FileText, ChevronDown, Search } from "lucide-react";
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
  onSearchClick?: () => void;
}

export const JobActions = ({ 
  onInvoiceClick, 
  onEstimateClick, 
  onPaymentClick, 
  onExpenseClick,
  onSearchClick
}: JobActionsProps) => {
  return (
    <div className="flex gap-3 self-start">
      <div className="space-y-2">
        {/* Documents dropdown */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" className="flex gap-2 items-center">
              <FileText size={16} />
              <span>Documents</span>
              <ChevronDown size={14} />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem onClick={onInvoiceClick}>
              <FileText size={16} className="mr-2" />
              Send Invoice
            </DropdownMenuItem>
            <DropdownMenuItem onClick={onEstimateClick}>
              <FileText size={16} className="mr-2" />
              Send Estimate
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>

        <div className="flex gap-2">
          <Button 
            variant="outline" 
            className="flex gap-2 items-center"
            onClick={onPaymentClick}
          >
            <FileText size={16} />
            <span>Add Payment</span>
          </Button>
          <Button 
            variant="outline" 
            className="flex gap-2 items-center"
            onClick={onExpenseClick}
          >
            <FileText size={16} />
            <span>Add Expense</span>
          </Button>
          {onSearchClick && (
            <Button 
              variant="outline" 
              className="flex gap-2 items-center"
              onClick={onSearchClick}
            >
              <Search size={16} />
              <span>Search</span>
            </Button>
          )}
        </div>
      </div>
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
