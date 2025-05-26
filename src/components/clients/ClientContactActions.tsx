
import { Button } from "@/components/ui/button";
import { Phone, Mail, MessageSquare, MapPin } from "lucide-react";
import { toast } from "sonner";

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
  const handleCall = () => {
    if (client.phone) {
      window.open(`tel:${client.phone}`, '_self');
      toast.success(`Calling ${client.name}`);
    } else {
      toast.error('No phone number available');
    }
  };

  const handleEmail = () => {
    if (client.email) {
      window.open(`mailto:${client.email}`, '_self');
      toast.success(`Opening email to ${client.name}`);
    } else {
      toast.error('No email address available');
    }
  };

  const handleMessage = () => {
    if (client.phone) {
      // This would integrate with your messaging system
      toast.success(`Opening message to ${client.name}`);
    } else {
      toast.error('No phone number available for messaging');
    }
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
          disabled={!client.phone}
          className="h-8 w-8 p-0"
        >
          <Phone className="h-4 w-4" />
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
        disabled={!client.phone}
        className="flex items-center gap-2"
      >
        <Phone className="h-4 w-4" />
        Call
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
