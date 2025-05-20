
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Check, Clock, Loader2, MoreHorizontal, XCircle, Calendar, AlertTriangle } from "lucide-react";
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuLabel, 
  DropdownMenuSeparator, 
  DropdownMenuTrigger 
} from "@/components/ui/dropdown-menu";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";

interface JobStatusBadgeProps {
  status: string;
  jobId?: string;
  onStatusChange: (newStatus: string) => void;
  variant?: "compact" | "full";
  className?: string;
}

export const JobStatusBadge = ({ 
  status, 
  jobId, 
  onStatusChange, 
  variant = "full",
  className 
}: JobStatusBadgeProps) => {
  const [isUpdating, setIsUpdating] = useState(false);

  const getStatusIcon = (statusValue: string) => {
    switch (statusValue) {
      case "completed":
        return <Check size={16} className="mr-1" />;
      case "scheduled":
        return <Calendar size={16} className="mr-1" />;
      case "in-progress":
      case "in_progress":
        return <Loader2 size={16} className="mr-1 animate-spin" />;
      case "canceled":
      case "cancelled":
        return <XCircle size={16} className="mr-1" />;
      case "ask-review":
        return <AlertTriangle size={16} className="mr-1" />;
      default:
        return <Clock size={16} className="mr-1" />;
    }
  };

  const getStatusColor = (statusValue: string) => {
    switch (statusValue) {
      case "open":
        return "bg-fixlyfy-bg-interface text-fixlyfy-primary border-fixlyfy-primary";
      case "scheduled":
        return "bg-fixlyfy-info/10 text-fixlyfy-info border-fixlyfy-info/20";
      case "in-progress":
      case "in_progress":
        return "bg-fixlyfy-warning/10 text-fixlyfy-warning border-fixlyfy-warning/20";
      case "completed":
        return "bg-fixlyfy-success/10 text-fixlyfy-success border-fixlyfy-success/20";
      case "canceled":
      case "cancelled":
        return "bg-fixlyfy-error/10 text-fixlyfy-error border-fixlyfy-error/20";
      case "ask-review":
        return "bg-fixlyfy-secondary/10 text-fixlyfy-secondary border-fixlyfy-secondary/20";
      default:
        return "bg-fixlyfy-bg-interface text-fixlyfy-text-secondary border-fixlyfy-text-secondary/20";
    }
  };

  const getStatusLabel = (statusValue: string) => {
    switch (statusValue) {
      case "open":
        return "Open";
      case "scheduled":
        return "Scheduled";
      case "in-progress":
      case "in_progress":
        return "In Progress";
      case "completed":
        return "Completed";
      case "canceled":
      case "cancelled":
        return "Cancelled";
      case "ask-review":
        return "Ask Review";
      default:
        return statusValue;
    }
  };

  const handleStatusChange = async (newStatus: string) => {
    if (status === newStatus) return;
    
    setIsUpdating(true);
    try {
      // If jobId is provided, update the status in Supabase
      if (jobId) {
        const { error } = await supabase
          .from('jobs')
          .update({ status: newStatus })
          .eq('id', jobId);
          
        if (error) throw error;
      }
      
      // Call the onStatusChange callback
      onStatusChange(newStatus);
      toast.success(`Status updated to ${getStatusLabel(newStatus)}`);
    } catch (error) {
      console.error("Error updating job status:", error);
      toast.error("Failed to update status. Please try again.");
    } finally {
      setIsUpdating(false);
    }
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button 
          variant="outline" 
          size="sm" 
          className={cn(
            "h-7 border font-medium",
            getStatusColor(status),
            isUpdating && "opacity-70 cursor-not-allowed",
            className
          )}
          disabled={isUpdating}
        >
          {isUpdating ? (
            <Loader2 className="h-3 w-3 mr-1 animate-spin" />
          ) : (
            getStatusIcon(status)
          )}
          <span>
            {getStatusLabel(status)}
          </span>
          {variant === "full" && <MoreHorizontal size={14} className="ml-1" />}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="start">
        <DropdownMenuLabel>Job Status</DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuItem 
          className={status === "open" ? "bg-fixlyfy/10" : ""} 
          onClick={() => handleStatusChange("open")}
        >
          <Clock size={16} className="mr-2 text-fixlyfy-primary" />
          Open
        </DropdownMenuItem>
        <DropdownMenuItem 
          className={status === "scheduled" ? "bg-fixlyfy/10" : ""} 
          onClick={() => handleStatusChange("scheduled")}
        >
          <Calendar size={16} className="mr-2 text-fixlyfy-info" />
          Scheduled
        </DropdownMenuItem>
        <DropdownMenuItem 
          className={status === "in-progress" ? "bg-fixlyfy/10" : ""} 
          onClick={() => handleStatusChange("in-progress")}
        >
          <Loader2 size={16} className="mr-2 text-fixlyfy-warning" />
          In Progress
        </DropdownMenuItem>
        <DropdownMenuItem 
          className={status === "completed" ? "bg-fixlyfy/10" : ""} 
          onClick={() => handleStatusChange("completed")}
        >
          <Check size={16} className="mr-2 text-fixlyfy-success" />
          Completed
        </DropdownMenuItem>
        <DropdownMenuItem 
          className={status === "canceled" ? "bg-fixlyfy/10" : ""} 
          onClick={() => handleStatusChange("canceled")}
        >
          <XCircle size={16} className="mr-2 text-fixlyfy-error" />
          Cancelled
        </DropdownMenuItem>
        <DropdownMenuItem 
          className={status === "ask-review" ? "bg-fixlyfy/10" : ""} 
          onClick={() => handleStatusChange("ask-review")}
        >
          <AlertTriangle size={16} className="mr-2 text-fixlyfy-secondary" />
          Ask Review
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};
