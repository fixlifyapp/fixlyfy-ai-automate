
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Phone, Mail, MessageSquare, MapPin } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { useNavigate } from "react-router-dom";

interface ClientContactActionsProps {
  client: {
    id: string;
    name: string;
    phone?: string;
    email?: string;
    address?: string;
  };
  compact?: boolean;
}

export const ClientContactActions = ({ client, compact = false }: ClientContactActionsProps) => {
  const navigate = useNavigate();
  const [isCallLoading, setIsCallLoading] = useState(false);

  const handleCall = async () => {
    if (!client.phone) {
      toast.error('No phone number available');
      return;
    }

    setIsCallLoading(true);
    
    try {
      const { data, error } = await supabase.functions.invoke('telnyx-make-call', {
        body: {
          to: client.phone,
          clientId: client.id
        }
      });

      if (error || !data?.success) {
        throw new Error(data?.error || 'Failed to initiate call');
      }

      toast.success(`Calling ${client.name}`);
    } catch (error) {
      console.error('Error making call:', error);
      toast.error('Failed to make call: ' + error.message);
    } finally {
      setIsCallLoading(false);
    }
  };

  const handleEmail = () => {
    if (!client.email) {
      toast.error('No email address available');
      return;
    }
    
    // Navigate to Connect Center with email tab and auto-open composer
    navigate(`/connect?tab=emails&clientId=${client.id}&clientName=${encodeURIComponent(client.name)}&clientEmail=${encodeURIComponent(client.email)}&autoOpen=true`);
  };

  const handleMessage = () => {
    if (!client.phone) {
      toast.error('No phone number available for messaging');
      return;
    }
    
    // Navigate to Connect Center with messages tab and auto-open message dialog
    navigate(`/connect?tab=messages&clientId=${client.id}&clientName=${encodeURIComponent(client.name)}&clientPhone=${encodeURIComponent(client.phone)}&autoOpen=true`);
  };

  const handleDirections = () => {
    if (client.address) {
      const encodedAddress = encodeURIComponent(client.address);
      window.open(`https://maps.google.com/?q=${encodedAddress}`, '_blank');
      toast.success('Opening directions');
    } else {
      toast.error('No address available');
    }
  };

  if (compact) {
    return (
      <div className="flex items-center gap-1">
        <Button
          variant="ghost"
          size="sm"
          onClick={handleCall}
          disabled={!client.phone || isCallLoading}
          className="h-8 w-8 p-0"
        >
          {isCallLoading ? (
            <div className="animate-spin h-3 w-3 border border-gray-300 border-t-gray-600 rounded-full" />
          ) : (
            <Phone className="h-4 w-4" />
          )}
        </Button>
        <Button
          variant="ghost"
          size="sm"
          onClick={handleMessage}
          disabled={!client.phone}
          className="h-8 w-8 p-0"
        >
          <MessageSquare className="h-4 w-4" />
        </Button>
        <Button
          variant="ghost"
          size="sm"
          onClick={handleEmail}
          disabled={!client.email}
          className="h-8 w-8 p-0"
        >
          <Mail className="h-4 w-4" />
        </Button>
        <Button
          variant="ghost"
          size="sm"
          onClick={handleDirections}
          disabled={!client.address}
          className="h-8 w-8 p-0"
        >
          <MapPin className="h-4 w-4" />
        </Button>
      </div>
    );
  }

  return (
    <div className="flex items-center gap-2">
      <Button
        variant="outline"
        size="sm"
        onClick={handleCall}
        disabled={!client.phone || isCallLoading}
        className="flex items-center gap-2"
      >
        {isCallLoading ? (
          <>
            <div className="animate-spin h-4 w-4 border border-gray-300 border-t-gray-600 rounded-full" />
            Calling...
          </>
        ) : (
          <>
            <Phone className="h-4 w-4" />
            Call
          </>
        )}
      </Button>
      <Button
        variant="outline"
        size="sm"
        onClick={handleMessage}
        disabled={!client.phone}
        className="flex items-center gap-2"
      >
        <MessageSquare className="h-4 w-4" />
        Message
      </Button>
      <Button
        variant="outline"
        size="sm"
        onClick={handleEmail}
        disabled={!client.email}
        className="flex items-center gap-2"
      >
        <Mail className="h-4 w-4" />
        Email
      </Button>
      <Button
        variant="outline"
        size="sm"
        onClick={handleDirections}
        disabled={!client.address}
        className="flex items-center gap-2"
      >
        <MapPin className="h-4 w-4" />
        Directions
      </Button>
    </div>
  );
};
