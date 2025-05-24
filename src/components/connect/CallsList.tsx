
import { useState, useEffect } from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Phone, Loader2, PhoneOutgoing, PhoneIncoming, PhoneMissed, Clock } from "lucide-react";
import { toast } from "@/components/ui/sonner";
import { supabase } from "@/integrations/supabase/client";
import { useRealtimeSync } from "@/hooks/useRealtimeSync";
import { CallDialog } from "./CallDialog";

interface Call {
  id: string;
  call_sid: string | null;
  client_id: string | null;
  phone_number: string;
  direction: "incoming" | "outgoing" | "missed";
  duration: string | null;
  status: string | null;
  started_at: string;
  ended_at: string | null;
  notes: string | null;
  created_at: string;
  updated_at: string;
  clients?: {
    id: string;
    name: string;
  } | null;
}

export const CallsList = () => {
  const [calls, setCalls] = useState<Call[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [callDialogOpen, setCallDialogOpen] = useState(false);
  const [selectedPhoneNumber, setSelectedPhoneNumber] = useState<string>("");

  const fetchCalls = async () => {
    try {
      setIsLoading(true);
      const { data, error } = await supabase
        .from('calls')
        .select(`
          *,
          clients:client_id(id, name)
        `)
        .order('started_at', { ascending: false })
        .limit(50);

      if (error) throw error;
      
      // Type assertion to ensure direction field matches expected type
      const typedCalls = (data || []).map(call => ({
        ...call,
        direction: call.direction as "incoming" | "outgoing" | "missed"
      }));
      
      setCalls(typedCalls);
    } catch (error) {
      console.error("Error fetching calls:", error);
      toast.error("Failed to load calls");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchCalls();
  }, []);

  // Set up real-time sync for calls
  useRealtimeSync({
    tables: ['calls'],
    onUpdate: fetchCalls,
    enabled: true
  });

  const handleCallClick = (phoneNumber: string) => {
    setSelectedPhoneNumber(phoneNumber);
    setCallDialogOpen(true);
  };

  const formatTimestamp = (timestamp: string) => {
    return new Date(timestamp).toLocaleString();
  };

  const formatDuration = (started: string, ended: string | null) => {
    if (!ended) return null;
    const duration = Math.floor((new Date(ended).getTime() - new Date(started).getTime()) / 1000);
    const mins = Math.floor(duration / 60);
    const secs = duration % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const getStatusBadge = (status: string | null) => {
    if (!status) return null;
    
    const statusColors: Record<string, string> = {
      'ringing': 'bg-blue-100 text-blue-800',
      'in-progress': 'bg-green-100 text-green-800',
      'completed': 'bg-gray-100 text-gray-800',
      'failed': 'bg-red-100 text-red-800',
      'busy': 'bg-yellow-100 text-yellow-800',
      'no-answer': 'bg-orange-100 text-orange-800'
    };

    return (
      <Badge className={statusColors[status] || 'bg-gray-100 text-gray-800'}>
        {status.replace('-', ' ').toUpperCase()}
      </Badge>
    );
  };

  return (
    <>
      <Card className="border-fixlyfy-border">
        <CardHeader>
          <CardTitle>Recent Calls</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          {isLoading ? (
            <div className="flex justify-center py-8">
              <Loader2 size={24} className="animate-spin text-fixlyfy" />
            </div>
          ) : calls.length === 0 ? (
            <div className="text-center py-8 text-fixlyfy-text-secondary">
              No calls found
            </div>
          ) : (
            <div className="divide-y divide-fixlyfy-border">
              {calls.map((call) => (
                <div key={call.id} className="flex items-center justify-between p-4 hover:bg-fixlyfy-bg-hover">
                  <div className="flex items-center space-x-4">
                    <div className="bg-muted rounded-full p-2">
                      {call.direction === "incoming" ? (
                        <PhoneIncoming className="h-5 w-5 text-green-500" />
                      ) : call.direction === "outgoing" ? (
                        <PhoneOutgoing className="h-5 w-5 text-blue-500" />
                      ) : (
                        <PhoneMissed className="h-5 w-5 text-red-500" />
                      )}
                    </div>
                    <div>
                      <h3 className="font-medium">
                        {call.clients?.name || "Unknown Contact"}
                      </h3>
                      <p className="text-sm text-fixlyfy-text-secondary">{call.phone_number}</p>
                      <div className="flex items-center gap-2 mt-1">
                        {getStatusBadge(call.status)}
                        {call.ended_at && (
                          <div className="flex items-center gap-1 text-xs text-gray-500">
                            <Clock size={12} />
                            {formatDuration(call.started_at, call.ended_at)}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                  <div className="text-right flex items-center gap-2">
                    <div>
                      <p className="text-xs text-fixlyfy-text-secondary">
                        {formatTimestamp(call.started_at)}
                      </p>
                    </div>
                    <Button 
                      variant="ghost" 
                      size="icon"
                      className="h-8 w-8 text-fixlyfy"
                      onClick={() => handleCallClick(call.phone_number)}
                    >
                      <Phone size={16} />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      <CallDialog
        isOpen={callDialogOpen}
        onClose={() => setCallDialogOpen(false)}
        phoneNumber={selectedPhoneNumber}
      />
    </>
  );
};
