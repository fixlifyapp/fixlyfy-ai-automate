
import { Button } from "@/components/ui/button";
import { Phone, MessageSquare, Pencil } from "lucide-react";

interface ClientContactButtonsProps {
  onCallClick: () => void;
  onMessageClick: () => void;
  onEditClient: () => void;
}

export const ClientContactButtons = ({ onCallClick, onMessageClick, onEditClient }: ClientContactButtonsProps) => {
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
        onClick={onMessageClick}
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
