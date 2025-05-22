
import { Button } from "@/components/ui/button";
import { Plus, FileText, MessageSquare, FileBarChart } from "lucide-react";
import { useNavigate } from "react-router-dom";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

export const QuickActionsPanel = () => {
  const navigate = useNavigate();

  return (
    <div className="flex items-center gap-2">
      <Button 
        className="bg-fixlify hover:bg-fixlify/90"
        onClick={() => navigate("/jobs")}
      >
        <Plus size={16} className="mr-2" />
        New Job
      </Button>
      
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="outline">
            More Actions
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuItem onClick={() => navigate("/estimates")}>
            <FileText size={16} className="mr-2" />
            Create Estimate
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => navigate("/messaging")}>
            <MessageSquare size={16} className="mr-2" />
            Send Bulk SMS
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => navigate("/reports")}>
            <FileBarChart size={16} className="mr-2" />
            Export Report
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
};
