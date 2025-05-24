
import { Button } from "@/components/ui/button";
import { Phone, MessageSquare, Pencil } from "lucide-react";
import { useNavigate } from "react-router-dom";

interface ClientContactButtonsProps {
  onCallClick: () => void;
  onMessageClick: () => void;
  onEditClient: () => void;
  clientId?: string;
  clientName?: string;
  clientPhone?: string;
}

export const ClientContactButtons = ({ 
  onCallClick, 
  onMessageClick, 
  onEditClient,
  clientId,
  clientName,
  clientPhone
}: ClientContactButtonsProps) => {
  const navigate = useNavigate();

  const handleMessageClick = () => {
    if (clientId && clientName) {
      // Navigate to Connect Center with client information
      navigate(`/connect?tab=messages&clientId=${clientId}&clientName=${encodeURIComponent(clientName)}&clientPhone=${encodeURIComponent(clientPhone || '')}`);
    } else {
      // Fallback to original behavior
      onMessageClick();
    }
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
