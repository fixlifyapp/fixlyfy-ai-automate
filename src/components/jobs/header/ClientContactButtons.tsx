
import { Button } from "@/components/ui/button";
import { Phone, MessageSquare, Pencil } from "lucide-react";
import { useJobDetails } from "../context/JobDetailsContext";
import { useMessageContext } from "@/contexts/MessageContext";
import { useNavigate } from "react-router-dom";

interface ClientContactButtonsProps {
  onCallClick: () => void;
  onMessageClick: () => void;
  onEditClient: () => void;
}

export const ClientContactButtons = ({ onCallClick, onMessageClick, onEditClient }: ClientContactButtonsProps) => {
  const { job } = useJobDetails();
  const { openMessageDialog } = useMessageContext();
  const navigate = useNavigate();

  const handleMessageClick = async () => {
    if (job) {
      console.log('Message button clicked for job:', job);
      await openMessageDialog({
        id: job.clientId,
        name: job.client,
        phone: job.phone || "",
        email: ""
      });
    } else {
      console.error('No job data available');
    }
  };

  const handleEditClient = () => {
    if (job?.clientId) {
      navigate(`/clients/${job.clientId}`);
    } else {
      console.error('No client ID available for editing');
    }
  };

  return (
    <div className="flex items-center gap-2">
      {/* Call Button */}
      <Button
        variant="outline"
        size="sm"
        className="h-10 w-10 p-0 border-green-200 text-green-600 hover:bg-green-50 hover:border-green-300 rounded-lg shadow-sm transition-all duration-200"
        onClick={onCallClick}
        title="Call Client"
      >
        <Phone size={18} />
      </Button>

      {/* Message Button */}
      <Button
        variant="outline"
        size="sm"
        className="h-10 w-10 p-0 border-blue-200 text-blue-600 hover:bg-blue-50 hover:border-blue-300 rounded-lg shadow-sm transition-all duration-200"
        onClick={handleMessageClick}
        title="Send Message"
        aria-label="Send message"
      >
        <MessageSquare size={18} />
      </Button>

      {/* Edit Button */}
      <Button 
        variant="outline" 
        size="sm" 
        className="h-10 w-10 p-0 border-purple-200 text-purple-600 hover:bg-purple-50 hover:border-purple-300 rounded-lg shadow-sm transition-all duration-200"
        onClick={handleEditClient}
        title="Edit Client"
        aria-label="Edit client"
      >
        <Pencil size={18} />
      </Button>
    </div>
  );
};
