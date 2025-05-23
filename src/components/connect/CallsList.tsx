
import { useState, useEffect } from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Phone, Loader2, PhoneOutgoing, PhoneIncoming, PhoneMissed } from "lucide-react";
import { toast } from "@/components/ui/sonner";
import { supabase } from "@/integrations/supabase/client";
import { useRealtimeSync } from "@/hooks/useRealtimeSync";

interface Call {
  id: string;
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
        .limit(20);

      if (error) throw error;
      setCalls(data || []);
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

  const handleCall = (phoneNumber: string) => {
    toast.info(`Initiating call to ${phoneNumber}...`);
  };

  const formatTimestamp = (timestamp: string) => {
    return new Date(timestamp).toLocaleString();
  };

  return (
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
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-sm">
                    {call.direction === "missed" ? (
                      <Badge variant="destructive">Missed</Badge>
                    ) : (
                      call.duration || "Unknown"
                    )}
                  </p>
                  <p className="text-xs text-fixlyfy-text-secondary">
                    {formatTimestamp(call.started_at)}
                  </p>
                </div>
                <Button 
                  variant="ghost" 
                  size="icon"
                  className="h-8 w-8 text-fixlyfy"
                  onClick={() => handleCall(call.phone_number)}
                >
                  <Phone size={16} />
                </Button>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
};
