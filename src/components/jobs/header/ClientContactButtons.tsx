
import { Button } from "@/components/ui/button";
import { Phone, MessageSquare, Pencil, Mail } from "lucide-react";
import { useJobDetails } from "../context/JobDetailsContext";
import { useNavigate } from "react-router-dom";

interface ClientContactButtonsProps {
  onCallClick: () => void;
  onMessageClick: () => void;
  onEditClient: () => void;
}

export const ClientContactButtons = ({ onEditClient }: ClientContactButtonsProps) => {
  const { job } = useJobDetails();
  const navigate = useNavigate();

  const handleCallClick = () => {
    if (job?.clientId && job?.client && job?.phone) {
      navigate(`/connect?tab=calls&clientId=${job.clientId}&clientName=${encodeURIComponent(job.client)}&clientPhone=${encodeURIComponent(job.phone)}`);
    }
  };

  const handleMessageClick = () => {
    if (job?.clientId && job?.client && job?.phone) {
      navigate(`/connect?tab=messages&clientId=${job.clientId}&clientName=${encodeURIComponent(job.client)}&clientPhone=${encodeURIComponent(job.phone)}`);
    }
  };

  const handleEmailClick = () => {
    if (job?.clientId && job?.client && job?.email) {
      navigate(`/connect?tab=emails&clientId=${job.clientId}&clientName=${encodeURIComponent(job.client)}&clientEmail=${encodeURIComponent(job.email)}`);
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
        onClick={handleCallClick}
        disabled={!job?.phone}
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
        disabled={!job?.phone}
        title="Send Message"
        aria-label="Send message"
      >
        <MessageSquare size={18} />
      </Button>

      {/* Email Button */}
      <Button
        variant="outline"
        size="sm"
        className="h-10 w-10 p-0 border-orange-200 text-orange-600 hover:bg-orange-50 hover:border-orange-300 rounded-lg shadow-sm transition-all duration-200"
        onClick={handleEmailClick}
        disabled={!job?.email}
        title="Send Email"
        aria-label="Send email"
      >
        <Mail size={18} />
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
