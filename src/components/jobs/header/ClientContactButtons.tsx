
import { Button } from "@/components/ui/button";
import { Phone, MessageSquare, Pencil } from "lucide-react";
import { useMessageContext } from "@/contexts/MessageContext";
import { useJobDetails } from "../context/JobDetailsContext";

interface ClientContactButtonsProps {
  onCallClick: () => void;
  onMessageClick: () => void;
  onEditClient: () => void;
}

export const ClientContactButtons = ({ onCallClick, onMessageClick, onEditClient }: ClientContactButtonsProps) => {
  const { openMessageDialog } = useMessageContext();
  const { job } = useJobDetails();

  const handleMessageClick = () => {
    if (job?.clients) {
      openMessageDialog({
        id: job.clients.id,
        name: job.clients.name,
        phone: job.clients.phone || "",
        email: job.clients.email || ""
      }, job.id);
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
