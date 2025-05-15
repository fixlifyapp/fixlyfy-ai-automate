
import { useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tag, MoreHorizontal, Pencil } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { cn } from "@/lib/utils";

interface JobDetailsHeaderProps {
  id?: string;
}

export const JobDetailsHeader = ({ id = "JOB-1001" }: JobDetailsHeaderProps) => {
  const [status, setStatus] = useState<string>("scheduled");
  
  const getJobInfo = () => {
    // In a real app, this would fetch job details from API
    return {
      id: id,
      client: "Michael Johnson",
      service: "HVAC Repair",
      address: "123 Main St, Apt 45",
      phone: "(555) 123-4567",
      email: "michael.johnson@example.com"
    };
  };
  
  const job = getJobInfo();
  
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
                    status === "canceled" && "bg-fixlyfy-error/10 text-fixlyfy-error hover:bg-fixlyfy-error/20"
                  )}>
                    {status === "scheduled" && "Scheduled"}
                    {status === "in-progress" && "In Progress"}
                    {status === "completed" && "Completed"}
                    {status === "canceled" && "Canceled"}
                    <MoreHorizontal size={14} className="ml-1" />
                  </Badge>
                </DropdownMenuTrigger>
                <DropdownMenuContent>
                  <DropdownMenuLabel>Change Status</DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={() => setStatus("scheduled")}>
                    <div className="w-2 h-2 rounded-full bg-fixlyfy-info mr-2" />
                    Scheduled
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => setStatus("in-progress")}>
                    <div className="w-2 h-2 rounded-full bg-fixlyfy-warning mr-2" />
                    In Progress
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => setStatus("completed")}>
                    <div className="w-2 h-2 rounded-full bg-fixlyfy-success mr-2" />
                    Completed
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => setStatus("canceled")}>
                    <div className="w-2 h-2 rounded-full bg-fixlyfy-error mr-2" />
                    Canceled
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
              <Button variant="ghost" size="icon" className="h-6 w-6">
                <Pencil size={12} />
              </Button>
            </div>
            <p className="text-fixlyfy-text-secondary text-sm">
              {job.address}
            </p>
            <div className="flex flex-wrap gap-x-4 gap-y-1 text-sm text-fixlyfy-text-secondary mt-2">
              <span>{job.phone}</span>
              <span>{job.email}</span>
            </div>
          </div>
          
          <div className="flex gap-3 self-start">
            <Button variant="secondary">View Invoice</Button>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button>Actions</Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem>Complete Job</DropdownMenuItem>
                <DropdownMenuItem>Create Invoice</DropdownMenuItem>
                <DropdownMenuItem>Send Reminder</DropdownMenuItem>
                <DropdownMenuItem>Reschedule</DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem className="text-fixlyfy-error">Cancel Job</DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </div>
    </div>
  );
};
