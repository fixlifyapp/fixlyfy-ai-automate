
import { Button } from "@/components/ui/button";
import { Phone, MessageSquare, Pencil } from "lucide-react";
import { useJobDetails } from "../context/JobDetailsContext";
import { useNavigate } from "react-router-dom";

interface ClientContactButtonsProps {
  onCallClick: () => void;
  onMessageClick: () => void;
  onEditClient: () => void;
}

export const ClientContactButtons = ({ onCallClick, onMessageClick, onEditClient }: ClientContactButtonsProps) => {
  const { job } = useJobDetails();
  const navigate = useNavigate();

  const handleMessageClick = () => {
    if (job) {
      // Navigate to Connect Center with client information - the page will handle opening the dialog
      const searchParams = new URLSearchParams({
        tab: 'messages',
        clientId: job.clientId,
        clientName: job.client,
        ...(job.phone && { clientPhone: job.phone })
      });
      
      navigate(`/connect?${searchParams.toString()}`);
    }
    
    // Also call the original onMessageClick if needed
    onMessageClick();
  };

  return (
    <div className="flex items-center gap-1">
      <Button
        variant="ghost"
        size="icon"
        className="h-7 w-7 text-fixlyfy hover:bg-fixlyfy/10"
        onClick={onCallClick}
      >
        <Phone size={14} />
      </Button>
      <Button
        variant="ghost"
        size="icon"
        className="h-7 w-7 text-fixlyfy hover:bg-fixlyfy/10"
        onClick={handleMessageClick}
        aria-label="Send message"
      >
        <MessageSquare size={14} />
      </Button>
      <Button 
        variant="ghost" 
        size="icon" 
        className="h-6 w-6"
        onClick={onEditClient}
      >
        <Pencil size={12} />
      </Button>
    </div>
  );
};
