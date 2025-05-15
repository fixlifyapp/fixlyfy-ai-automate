
import { useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tag, MoreHorizontal, Pencil } from "lucide-react";
import { cn } from "@/lib/utils";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

// Create simpler inline components instead of importing from separate files

interface JobStatusBadgeProps {
  status: string;
  onStatusChange: (newStatus: string) => void;
}

const JobStatusBadge = ({ status, onStatusChange }: JobStatusBadgeProps) => {
  return (
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
        <DropdownMenuItem onClick={() => onStatusChange("open")}>Open</DropdownMenuItem>
        <DropdownMenuItem onClick={() => onStatusChange("scheduled")}>Scheduled</DropdownMenuItem>
        <DropdownMenuItem onClick={() => onStatusChange("in-progress")}>In Progress</DropdownMenuItem>
        <DropdownMenuItem onClick={() => onStatusChange("completed")}>Completed</DropdownMenuItem>
        <DropdownMenuItem onClick={() => onStatusChange("canceled")}>Cancelled</DropdownMenuItem>
        <DropdownMenuItem onClick={() => onStatusChange("ask-review")}>Ask Review</DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

interface ClientContactButtonsProps {
  onCallClick: () => void;
  onMessageClick: () => void;
}

const ClientContactButtons = ({ onCallClick, onMessageClick }: ClientContactButtonsProps) => {
  return (
    <div className="flex items-center gap-1">
      <Button
        variant="ghost"
        size="icon"
        className="h-7 w-7 text-fixlyfy hover:bg-fixlyfy/10"
        onClick={onCallClick}
      >
        <Pencil size={14} />
      </Button>
      <Button
        variant="ghost"
        size="icon"
        className="h-7 w-7 text-fixlyfy hover:bg-fixlyfy/10"
        onClick={onMessageClick}
      >
        <Pencil size={14} />
      </Button>
      <Button variant="ghost" size="icon" className="h-6 w-6">
        <Pencil size={12} />
      </Button>
    </div>
  );
};

interface JobActionsProps {
  onInvoiceClick: () => void;
  onEstimateClick: () => void;
  onPaymentClick: () => void;
  onExpenseClick: () => void;
}

const JobActions = ({ 
  onInvoiceClick, 
  onEstimateClick, 
  onPaymentClick, 
  onExpenseClick 
}: JobActionsProps) => {
  return (
    <div className="flex gap-3 self-start">
      <div className="space-y-2">
        <div className="flex gap-2">
          <Button 
            variant="secondary" 
            className="flex gap-2 items-center"
            onClick={onInvoiceClick}
          >
            <Pencil size={16} />
            <span>Send Invoice</span>
          </Button>
          <Button 
            variant="outline" 
            className="flex gap-2 items-center"
            onClick={onEstimateClick}
          >
            <Pencil size={16} />
            <span>Send Estimate</span>
          </Button>
        </div>
        <div className="flex gap-2">
          <Button 
            variant="outline" 
            className="flex gap-2 items-center"
            onClick={onPaymentClick}
          >
            <Pencil size={16} />
            <span>Add Payment</span>
          </Button>
          <Button 
            variant="outline" 
            className="flex gap-2 items-center"
            onClick={onExpenseClick}
          >
            <Pencil size={16} />
            <span>Add Expense</span>
          </Button>
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

// Re-use existing dialog imports that work
import { PaymentDialog } from "./dialogs/PaymentDialog";
import { ExpenseDialog } from "./dialogs/ExpenseDialog";

// Simplified inline dialogs
interface CallDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  client: {
    name: string;
    phone: string;
  };
}

import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { toast } from "sonner";

const CallDialog = ({ open, onOpenChange, client }: CallDialogProps) => {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Call Client</DialogTitle>
        </DialogHeader>
        <div className="py-6 text-center">
          <p className="text-xl font-medium mb-2">{client.name}</p>
          <p className="text-xl mb-6">{client.phone}</p>
          <div className="grid grid-cols-2 gap-4">
            <Button variant="outline" onClick={() => onOpenChange(false)}>Cancel</Button>
            <Button onClick={() => {
              toast.success(`Calling ${client.name}...`);
              onOpenChange(false);
            }}>Call Now</Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

interface MessageDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  client: {
    name: string;
  };
}

const MessageDialog = ({ open, onOpenChange, client }: MessageDialogProps) => {
  const [message, setMessage] = useState("");

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Message History with {client.name}</DialogTitle>
        </DialogHeader>
        <div className="py-4">
          <div className="h-64 overflow-y-auto border rounded-md p-3 mb-4 space-y-3">
            <div className="flex flex-col max-w-[80%]">
              <div className="bg-muted p-3 rounded-lg">
                <p className="text-sm">Hello! Just confirming our appointment tomorrow at 1:30 PM.</p>
              </div>
              <span className="text-xs text-fixlyfy-text-secondary mt-1">You, May 14 9:30 AM</span>
            </div>
            
            <div className="flex flex-col max-w-[80%] self-end items-end ml-auto">
              <div className="bg-fixlyfy text-white p-3 rounded-lg">
                <p className="text-sm">Yes, I'll be there. Thank you for the reminder.</p>
              </div>
              <span className="text-xs text-fixlyfy-text-secondary mt-1">{client.name}, May 14 10:15 AM</span>
            </div>
          </div>
          
          <div className="flex gap-2">
            <textarea 
              className="w-full p-2 border rounded-md focus:ring-2 focus:ring-fixlyfy focus:outline-none" 
              placeholder="Type your message..."
              rows={2}
              value={message}
              onChange={(e) => setMessage(e.target.value)}
            />
            <Button onClick={() => {
              toast.success("Message sent to client");
              setMessage("");
            }}>Send</Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { Textarea } from "@/components/ui/textarea";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";

interface InvoiceDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const InvoiceDialog = ({ open, onOpenChange }: InvoiceDialogProps) => {
  // Simplified invoice dialog
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Create Invoice</DialogTitle>
        </DialogHeader>
        <div className="py-4">
          <p>Invoice form would go here</p>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="button" onClick={() => {
              toast.success("Invoice created");
              onOpenChange(false);
            }}>
              Create Invoice
            </Button>
          </DialogFooter>
        </div>
      </DialogContent>
    </Dialog>
  );
};

interface EstimateDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const EstimateDialog = ({ open, onOpenChange }: EstimateDialogProps) => {
  // Simplified estimate dialog
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Create Estimate</DialogTitle>
        </DialogHeader>
        <div className="py-4">
          <p>Estimate form would go here</p>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="button" onClick={() => {
              toast.success("Estimate created");
              onOpenChange(false);
            }}>
              Create Estimate
            </Button>
          </DialogFooter>
        </div>
      </DialogContent>
    </Dialog>
  );
};

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
