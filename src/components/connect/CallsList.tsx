
import { useState, useEffect } from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Phone, Loader2, PhoneOutgoing, PhoneIncoming, PhoneMissed } from "lucide-react";
import { clients } from "@/data/clients";
import { toast } from "@/components/ui/sonner";

interface Call {
  id: string;
  clientId: string;
  clientName: string;
  phoneNumber: string;
  duration: string;
  timestamp: string;
  direction: "incoming" | "outgoing" | "missed";
}

export const CallsList = () => {
  const [calls, setCalls] = useState<Call[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Simulate API call delay
    setTimeout(() => {
      // Generate mock call data
      const mockCalls: Call[] = [];
      for (let i = 0; i < 10; i++) {
        const client = clients[i % clients.length];
        const direction = i % 3 === 0 ? "incoming" : i % 3 === 1 ? "outgoing" : "missed";
        const duration = direction === "missed" ? "0:00" : `${Math.floor(Math.random() * 30)}:${String(Math.floor(Math.random() * 60)).padStart(2, '0')}`;
        
        mockCalls.push({
          id: `call-${i}`,
          clientId: client.id,
          clientName: client.name,
          phoneNumber: client.phone || "(555) 000-0000",
          duration: duration,
          timestamp: new Date(Date.now() - i * 3600000 * (Math.random() * 5 + 1)).toLocaleString(),
          direction: direction
        });
      }
      setCalls(mockCalls);
      setIsLoading(false);
    }, 1000);
  }, []);

  const handleCall = (phoneNumber: string) => {
    toast.info(`Initiating call to ${phoneNumber}...`);
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
                    <h3 className="font-medium">{call.clientName}</h3>
                    <p className="text-sm text-fixlyfy-text-secondary">{call.phoneNumber}</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-sm">
                    {call.direction === "missed" ? (
                      <Badge variant="destructive">Missed</Badge>
                    ) : (
                      call.duration
                    )}
                  </p>
                  <p className="text-xs text-fixlyfy-text-secondary">{call.timestamp}</p>
                </div>
                <Button 
                  variant="ghost" 
                  size="icon"
                  className="h-8 w-8 text-fixlyfy"
                  onClick={() => handleCall(call.phoneNumber)}
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
