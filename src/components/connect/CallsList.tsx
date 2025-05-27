
import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Phone, PhoneCall, PhoneIncoming, PhoneOutgoing, Clock, User } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface Call {
  id: string;
  phone_number: string;
  direction: string;
  status: string;
  duration: string;
  started_at: string;
  ended_at?: string;
  client_id?: string;
  notes?: string;
  clients?: {
    name: string;
  };
}

export const CallsList = () => {
  const [calls, setCalls] = useState<Call[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [phoneNumber, setPhoneNumber] = useState("");
  const [isCalling, setIsCalling] = useState(false);
  const [ownedNumbers, setOwnedNumbers] = useState<any[]>([]);

  useEffect(() => {
    fetchCalls();
    fetchOwnedNumbers();
  }, []);

  const fetchCalls = async () => {
    try {
      const { data, error } = await supabase
        .from('calls')
        .select(`
          *,
          clients (name)
        `)
        .order('started_at', { ascending: false })
        .limit(20);

      if (error) throw error;
      setCalls(data || []);
    } catch (error) {
      console.error('Error fetching calls:', error);
      toast.error('Failed to load calls');
    } finally {
      setIsLoading(false);
    }
  };

  const fetchOwnedNumbers = async () => {
    try {
      const { data, error } = await supabase.functions.invoke('manage-phone-numbers', {
        body: { action: 'list-owned' }
      });

      if (error) throw error;
      setOwnedNumbers(data.phone_numbers || []);
    } catch (error) {
      console.error('Error loading owned numbers:', error);
    }
  };

  const makeCall = async () => {
    if (!phoneNumber.trim()) {
      toast.error('Please enter a phone number');
      return;
    }

    if (ownedNumbers.length === 0) {
      toast.error('No phone numbers available. Please purchase a number first.');
      return;
    }

    setIsCalling(true);
    try {
      const { data, error } = await supabase.functions.invoke('make-call', {
        body: {
          to: phoneNumber,
          from: ownedNumbers[0].phone_number
        }
      });

      if (error) throw error;

      if (data.success) {
        toast.success('Call initiated successfully');
        setPhoneNumber("");
        fetchCalls(); // Refresh calls list
      } else {
        toast.error(data.error || 'Failed to make call');
      }
    } catch (error) {
      console.error('Error making call:', error);
      toast.error('Failed to initiate call');
    } finally {
      setIsCalling(false);
    }
  };

  const getCallIcon = (direction: string) => {
    switch (direction) {
      case 'inbound':
        return <PhoneIncoming className="h-4 w-4 text-green-600" />;
      case 'outbound':
        return <PhoneOutgoing className="h-4 w-4 text-blue-600" />;
      case 'missed':
        return <Phone className="h-4 w-4 text-red-600" />;
      default:
        return <Phone className="h-4 w-4 text-gray-600" />;
    }
  };

  const getCallStatusBadge = (status: string) => {
    const variants: Record<string, any> = {
      completed: 'success',
      missed: 'destructive',
      busy: 'secondary',
      'no-answer': 'outline'
    };
    
    return (
      <Badge variant={variants[status] || 'secondary'}>
        {status.replace('-', ' ')}
      </Badge>
    );
  };

  return (
    <div className="space-y-6">
      {/* Make Call Section */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <PhoneCall className="h-5 w-5 text-fixlyfy" />
            Make a Call
          </CardTitle>
        </CardHeader>
        <CardContent>
          {ownedNumbers.length > 0 ? (
            <div className="flex gap-3">
              <Input
                placeholder="Enter phone number (e.g., +1234567890)"
                value={phoneNumber}
                onChange={(e) => setPhoneNumber(e.target.value)}
                className="flex-1"
              />
              <Button 
                onClick={makeCall} 
                disabled={isCalling || !phoneNumber.trim()}
                className="gap-2"
              >
                <PhoneCall className="h-4 w-4" />
                {isCalling ? 'Calling...' : 'Call'}
              </Button>
            </div>
          ) : (
            <div className="text-center py-4">
              <Phone className="h-8 w-8 text-gray-400 mx-auto mb-2" />
              <p className="text-sm text-muted-foreground mb-3">
                No phone numbers available. Purchase a number to start making calls.
              </p>
              <Button variant="outline" onClick={() => window.location.href = '/settings'}>
                Purchase Phone Number
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Calls History */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Phone className="h-5 w-5 text-fixlyfy" />
            Call History
          </CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex items-center justify-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-fixlyfy"></div>
            </div>
          ) : calls.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <Phone className="h-12 w-12 mx-auto mb-4 text-gray-300" />
              <h3 className="text-lg font-medium mb-2">No calls yet</h3>
              <p className="text-sm">Your call history will appear here</p>
            </div>
          ) : (
            <div className="space-y-3">
              {calls.map((call) => (
                <div
                  key={call.id}
                  className="flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:bg-gray-50"
                >
                  <div className="flex items-center gap-3">
                    {getCallIcon(call.direction)}
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-medium">{call.phone_number}</span>
                        {call.clients && (
                          <span className="text-sm text-muted-foreground flex items-center gap-1">
                            <User className="h-3 w-3" />
                            {call.clients.name}
                          </span>
                        )}
                      </div>
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <Clock className="h-3 w-3" />
                        {new Date(call.started_at).toLocaleString()}
                        {call.duration && (
                          <span>• Duration: {call.duration}</span>
                        )}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    {getCallStatusBadge(call.status)}
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};
