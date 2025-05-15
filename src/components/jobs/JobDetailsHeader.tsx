
import { useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tag, MoreHorizontal, Pencil } from "lucide-react";
import { cn } from "@/lib/utils";
import { JobStatusBadge } from "./status/JobStatusBadge";
import { ClientContactButtons } from "./client/ClientContactButtons";
import { JobActions } from "./actions/JobActions";
import { CallDialog } from "./dialogs/CallDialog";
import { MessageDialog } from "./dialogs/MessageDialog";
import { InvoiceDialog } from "./dialogs/InvoiceDialog";
import { EstimateDialog } from "./dialogs/EstimateDialog";
import { PaymentDialog } from "./dialogs/PaymentDialog";
import { ExpenseDialog } from "./dialogs/ExpenseDialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

interface JobDetailsHeaderProps {
  id?: string;
}

export const JobDetailsHeader = ({ id = "JOB-1001" }: JobDetailsHeaderProps) => {
  const [status, setStatus] = useState<string>("scheduled");
  const [isCallDialogOpen, setIsCallDialogOpen] = useState(false);
  const [isMessageDialogOpen, setIsMessageDialogOpen] = useState(false);
  const [isInvoiceDialogOpen, setIsInvoiceDialogOpen] = useState(false);
  const [isEstimateDialogOpen, setIsEstimateDialogOpen] = useState(false);
  const [isPaymentDialogOpen, setIsPaymentDialogOpen] = useState(false);
  const [isExpenseDialogOpen, setIsExpenseDialogOpen] = useState(false);
  
  const getJobInfo = () => {
    // In a real app, this would fetch job details from API
    return {
      id: id,
      client: "Michael Johnson",
      service: "HVAC Repair",
      address: "123 Main St, Apt 45",
      phone: "(555) 123-4567",
      email: "michael.johnson@example.com",
      total: 475.99,
      balance: 475.99,
      companyName: "Fixlyfy Services",
      companyLogo: "/placeholder.svg",
      companyAddress: "456 Business Ave, Suite 789",
      companyPhone: "(555) 987-6543",
      companyEmail: "info@fixlyfy.com",
      legalText: "All services are subject to our terms and conditions. Payment due within 30 days."
    };
  };
  
  const job = getJobInfo();

  const handleStatusChange = (newStatus: string) => {
    setStatus(newStatus);
  };
  
  return (
    <div className="fixlyfy-card">
      <div className="p-6">
        <div className="flex flex-col md:flex-row justify-between md:items-center gap-4">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <Badge variant="outline" className="text-sm px-3 py-1 border-fixlyfy/20">
                {job.id}
              </Badge>
              <JobStatusBadge status={status} onStatusChange={handleStatusChange} />
              <div className="flex gap-1">
                <Badge className="bg-fixlyfy/10 text-fixlyfy border-none">HVAC</Badge>
                <Badge className="bg-fixlyfy/10 text-fixlyfy border-none">Residential</Badge>
                <Button variant="ghost" size="icon" className="h-6 w-6">
                  <Tag size={14} />
                </Button>
              </div>
            </div>
            <div className="flex gap-2 items-center">
              <h2 className="text-lg font-medium">{job.client}</h2>
              <ClientContactButtons
                onCallClick={() => setIsCallDialogOpen(true)}
                onMessageClick={() => setIsMessageDialogOpen(true)}
              />
            </div>
            <div className="mt-2 flex items-center gap-2">
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" size="sm" className="h-7">
                    <span className={cn(
                      status === "open" && "text-fixlyfy-primary",
                      status === "scheduled" && "text-fixlyfy-info",
                      status === "in-progress" && "text-fixlyfy-warning",
                      status === "completed" && "text-fixlyfy-success",
                      status === "canceled" && "text-fixlyfy-error",
                      status === "ask-review" && "text-fixlyfy-secondary"
                    )}>
                      {status === "open" && "Open"}
                      {status === "scheduled" && "Scheduled"}
                      {status === "in-progress" && "In Progress"}
                      {status === "completed" && "Completed"}
                      {status === "canceled" && "Cancelled"}
                      {status === "ask-review" && "Ask Review"}
                    </span>
                    <MoreHorizontal size={14} className="ml-1" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent>
                  <DropdownMenuLabel>Job Status</DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={() => handleStatusChange("open")}>Open</DropdownMenuItem>
                  <DropdownMenuItem onClick={() => handleStatusChange("scheduled")}>Scheduled</DropdownMenuItem>
                  <DropdownMenuItem onClick={() => handleStatusChange("in-progress")}>In Progress</DropdownMenuItem>
                  <DropdownMenuItem onClick={() => handleStatusChange("completed")}>Completed</DropdownMenuItem>
                  <DropdownMenuItem onClick={() => handleStatusChange("canceled")}>Cancelled</DropdownMenuItem>
                  <DropdownMenuItem onClick={() => handleStatusChange("ask-review")}>Ask Review</DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
              <div className="border-l h-5 border-gray-300 mx-1"></div>
              <div className="text-sm">
                <span className="text-fixlyfy-text-secondary">Total:</span> 
                <span className="ml-1 font-medium">${job.total.toFixed(2)}</span>
              </div>
              <div className="text-sm">
                <span className="text-fixlyfy-text-secondary">Balance:</span> 
                <span className="ml-1 font-medium">${job.balance.toFixed(2)}</span>
              </div>
            </div>
            <p className="text-fixlyfy-text-secondary text-sm mt-2">
              {job.address}
            </p>
            <div className="flex flex-wrap gap-x-4 gap-y-1 text-sm text-fixlyfy-text-secondary mt-2">
              <span>{job.phone}</span>
              <span>{job.email}</span>
            </div>
          </div>
          
          <JobActions
            onInvoiceClick={() => setIsInvoiceDialogOpen(true)}
            onEstimateClick={() => setIsEstimateDialogOpen(true)}
            onPaymentClick={() => setIsPaymentDialogOpen(true)}
            onExpenseClick={() => setIsExpenseDialogOpen(true)}
          />
        </div>
      </div>

      {/* Dialog Components */}
      <CallDialog 
        open={isCallDialogOpen} 
        onOpenChange={setIsCallDialogOpen} 
        client={{ 
          name: job.client, 
          phone: job.phone 
        }} 
      />
      
      <MessageDialog 
        open={isMessageDialogOpen} 
        onOpenChange={setIsMessageDialogOpen} 
        client={{ name: job.client }} 
      />
      
      <InvoiceDialog 
        open={isInvoiceDialogOpen} 
        onOpenChange={setIsInvoiceDialogOpen} 
      />
      
      <EstimateDialog 
        open={isEstimateDialogOpen} 
        onOpenChange={setIsEstimateDialogOpen} 
      />
      
      <PaymentDialog 
        open={isPaymentDialogOpen} 
        onOpenChange={setIsPaymentDialogOpen} 
        balance={job.balance} 
      />
      
      <ExpenseDialog 
        open={isExpenseDialogOpen} 
        onOpenChange={setIsExpenseDialogOpen} 
      />
    </div>
  );
};
