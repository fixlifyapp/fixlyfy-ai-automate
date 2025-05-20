
import { Button } from "@/components/ui/button";
import { Plus, Refresh } from "lucide-react";
import { useNavigate } from "react-router-dom";

export const DashboardActions = ({ onRefresh }: { onRefresh?: () => void }) => {
  const navigate = useNavigate();
  
  return (
    <div className="flex gap-2">
      <Button 
        variant="outline" 
        size="sm"
        onClick={onRefresh}
      >
        <Refresh size={16} className="mr-2" />
        Refresh
      </Button>
      
      <Button 
        className="bg-fixlyfy hover:bg-fixlyfy/90"
        size="sm"
        onClick={() => navigate("/jobs")}
      >
        <Plus size={16} className="mr-2" />
        New Job
      </Button>
    </div>
  );
};
