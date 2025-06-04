
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Phone, MessageSquare, Pencil, Mail } from "lucide-react";
import { useJobDetails } from "../context/JobDetailsContext";
import { useMessageContext } from "@/contexts/MessageContext";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface ClientContactButtonsProps {
  onCallClick: () => void;
  onMessageClick: () => void;
  onEditClient: () => void;
}

export const ClientContactButtons = ({ onCallClick, onMessageClick, onEditClient }: ClientContactButtonsProps) => {
  const { job } = useJobDetails();
  const { openMessageDialog } = useMessageContext();
  const navigate = useNavigate();
  const [isCallLoading, setIsCallLoading] = useState(false);

  const handleCallClick = async () => {
    if (!job?.phone) {
      toast.error('No phone number available for this client');
      return;
    }

    setIsCallLoading(true);
    
    try {
      const { data, error } = await supabase.functions.invoke('telnyx-make-call', {
        body: {
          to: job.phone,
          clientId: job.clientId,
          jobId: job.id
        }
      });

      if (error || !data?.success) {
        throw new Error(data?.error || 'Failed to initiate call');
      }

      toast.success('Call initiated successfully');
    } catch (error) {
      console.error('Error making call:', error);
      toast.error('Failed to make call: ' + error.message);
    } finally {
      setIsCallLoading(false);
    }
  };

  const handleMessageClick = async () => {
    if (job) {
      console.log('Message button clicked for job:', job);
      await openMessageDialog({
        id: job.clientId,
        name: job.client,
        phone: job.phone || "",
        email: job.email || ""
      });
    } else {
      console.error('No job data available');
    }
  };

  const handleEmailClick = () => {
    if (job?.email) {
      window.open(`mailto:${job.email}`, '_self');
      toast.success(`Opening email to ${job.client}`);
    } else {
      toast.error('No email address available for this client');
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
        disabled={!job?.phone || isCallLoading}
        title="Call Client"
      >
        {isCallLoading ? (
          <div className="animate-spin h-4 w-4 border border-green-300 border-t-green-600 rounded-full" />
        ) : (
          <Phone size={18} />
        )}
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
