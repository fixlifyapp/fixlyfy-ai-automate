
import { useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { 
  Tag, 
  MoreHorizontal, 
  Pencil, 
  Phone, 
  MessageSquare,
  Dialog,
  DialogTrigger,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Dialog as UIDialog } from "@/components/ui/dialog";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

interface JobDetailsHeaderProps {
  id?: string;
}

export const JobDetailsHeader = ({ id = "JOB-1001" }: JobDetailsHeaderProps) => {
  const [status, setStatus] = useState<string>("scheduled");
  const [isCallDialogOpen, setIsCallDialogOpen] = useState(false);
  const [isMessageDialogOpen, setIsMessageDialogOpen] = useState(false);
  
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
      balance: 475.99
    };
  };
  
  const job = getJobInfo();

  const handleStatusChange = (newStatus: string) => {
    setStatus(newStatus);
    toast.success(`Job status changed to ${newStatus}`);
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
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Badge className={cn(
                    "cursor-pointer transition-colors pl-3 pr-2 py-1",
                    status === "scheduled" && "bg-fixlyfy-info/10 text-fixlyfy-info hover:bg-fixlyfy-info/20",
                    status === "in-progress" && "bg-fixlyfy-warning/10 text-fixlyfy-warning hover:bg-fixlyfy-warning/20",
                    status === "completed" && "bg-fixlyfy-success/10 text-fixlyfy-success hover:bg-fixlyfy-success/20",
                    status === "canceled" && "bg-fixlyfy-error/10 text-fixlyfy-error hover:bg-fixlyfy-error/20",
                    status === "open" && "bg-fixlyfy-primary/10 text-fixlyfy-primary hover:bg-fixlyfy-primary/20",
                    status === "ask-review" && "bg-fixlyfy-secondary/10 text-fixlyfy-secondary hover:bg-fixlyfy-secondary/20"
                  )}>
                    {status === "scheduled" && "Scheduled"}
                    {status === "in-progress" && "In Progress"}
                    {status === "completed" && "Completed"}
                    {status === "canceled" && "Cancelled"}
                    {status === "open" && "Open"}
                    {status === "ask-review" && "Ask Review"}
                    <MoreHorizontal size={14} className="ml-1" />
                  </Badge>
                </DropdownMenuTrigger>
                <DropdownMenuContent>
                  <DropdownMenuLabel>Change Status</DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={() => handleStatusChange("open")}>
                    <div className="w-2 h-2 rounded-full bg-fixlyfy-primary mr-2" />
                    Open
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => handleStatusChange("scheduled")}>
                    <div className="w-2 h-2 rounded-full bg-fixlyfy-info mr-2" />
                    Scheduled
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => handleStatusChange("in-progress")}>
                    <div className="w-2 h-2 rounded-full bg-fixlyfy-warning mr-2" />
                    In Progress
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => handleStatusChange("completed")}>
                    <div className="w-2 h-2 rounded-full bg-fixlyfy-success mr-2" />
                    Completed
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => handleStatusChange("canceled")}>
                    <div className="w-2 h-2 rounded-full bg-fixlyfy-error mr-2" />
                    Cancelled
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => handleStatusChange("ask-review")}>
                    <div className="w-2 h-2 rounded-full bg-fixlyfy-secondary mr-2" />
                    Ask Review
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
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
              <div className="flex items-center gap-1">
                <Button 
                  variant="ghost" 
                  size="icon" 
                  className="h-7 w-7 text-fixlyfy hover:bg-fixlyfy/10"
                  onClick={() => setIsCallDialogOpen(true)}
                >
                  <Phone size={14} />
                </Button>
                <Button 
                  variant="ghost" 
                  size="icon" 
                  className="h-7 w-7 text-fixlyfy hover:bg-fixlyfy/10"
                  onClick={() => setIsMessageDialogOpen(true)}
                >
                  <MessageSquare size={14} />
                </Button>
                <Button variant="ghost" size="icon" className="h-6 w-6">
                  <Pencil size={12} />
                </Button>
              </div>
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
          
          <div className="flex gap-3 self-start">
            <Button variant="secondary" onClick={() => toast.success("Invoice view opened")}>View Invoice</Button>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button>Actions</Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem>Complete Job</DropdownMenuItem>
                <DropdownMenuItem onClick={() => toast.success("Creating new invoice...")}>Create Invoice</DropdownMenuItem>
                <DropdownMenuItem>Reschedule</DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem className="text-fixlyfy-error">Cancel Job</DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </div>

      {/* Call Dialog */}
      <UIDialog open={isCallDialogOpen} onOpenChange={setIsCallDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Call Client</DialogTitle>
          </DialogHeader>
          <div className="py-6 text-center">
            <p className="text-xl font-medium mb-2">{job.client}</p>
            <p className="text-xl mb-6">{job.phone}</p>
            <div className="grid grid-cols-2 gap-4">
              <Button variant="outline" onClick={() => setIsCallDialogOpen(false)}>Cancel</Button>
              <Button onClick={() => {
                toast.success(`Calling ${job.client}...`);
                setIsCallDialogOpen(false);
              }}>Call Now</Button>
            </div>
          </div>
        </DialogContent>
      </UIDialog>

      {/* Message Dialog */}
      <UIDialog open={isMessageDialogOpen} onOpenChange={setIsMessageDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Message History with {job.client}</DialogTitle>
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
                <span className="text-xs text-fixlyfy-text-secondary mt-1">Michael Johnson, May 14 10:15 AM</span>
              </div>
            </div>
            
            <div className="flex gap-2">
              <textarea 
                className="w-full p-2 border rounded-md focus:ring-2 focus:ring-fixlyfy focus:outline-none" 
                placeholder="Type your message..."
                rows={2}
              />
              <Button onClick={() => toast.success("Message sent to client")}>Send</Button>
            </div>
          </div>
        </DialogContent>
      </UIDialog>
    </div>
  );
};
