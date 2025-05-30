
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
    <div className="flex items-center gap-3">
      {/* Call Button */}
      <div className="group relative">
        <div className="absolute inset-0 bg-green-400 rounded-xl blur opacity-50 group-hover:opacity-75 transition-opacity"></div>
        <Button
          variant="ghost"
          size="icon"
          className="relative h-12 w-12 backdrop-blur-sm bg-white/20 border border-white/30 text-white hover:bg-white/30 rounded-xl shadow-lg transform transition-all duration-200 hover:scale-110"
          onClick={onCallClick}
          title="Call Client"
        >
          <Phone size={20} className="drop-shadow" />
        </Button>
      </div>

      {/* Message Button */}
      <div className="group relative">
        <div className="absolute inset-0 bg-blue-400 rounded-xl blur opacity-50 group-hover:opacity-75 transition-opacity"></div>
        <Button
          variant="ghost"
          size="icon"
          className="relative h-12 w-12 backdrop-blur-sm bg-white/20 border border-white/30 text-white hover:bg-white/30 rounded-xl shadow-lg transform transition-all duration-200 hover:scale-110"
          onClick={handleMessageClick}
          title="Send Message"
          aria-label="Send message"
        >
          <MessageSquare size={20} className="drop-shadow" />
        </Button>
      </div>

      {/* Edit Button */}
      <div className="group relative">
        <div className="absolute inset-0 bg-purple-400 rounded-xl blur opacity-50 group-hover:opacity-75 transition-opacity"></div>
        <Button 
          variant="ghost" 
          size="icon" 
          className="relative h-12 w-12 backdrop-blur-sm bg-white/20 border border-white/30 text-white hover:bg-white/30 rounded-xl shadow-lg transform transition-all duration-200 hover:scale-110"
          onClick={handleEditClient}
          title="Edit Client"
          aria-label="Edit client"
        >
          <Pencil size={20} className="drop-shadow" />
        </Button>
      </div>
    </div>
  );
};
