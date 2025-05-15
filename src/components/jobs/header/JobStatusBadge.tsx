
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { MoreHorizontal } from "lucide-react";
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuLabel, 
  DropdownMenuSeparator, 
  DropdownMenuTrigger 
} from "@/components/ui/dropdown-menu";
import { cn } from "@/lib/utils";

interface JobStatusBadgeProps {
  status: string;
  onStatusChange: (newStatus: string) => void;
}

export const JobStatusBadge = ({ status, onStatusChange }: JobStatusBadgeProps) => {
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
