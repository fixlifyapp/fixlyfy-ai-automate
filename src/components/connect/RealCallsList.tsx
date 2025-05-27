
import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Phone, PhoneCall, Clock, User, Calendar } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { CallingInterface } from "./CallingInterface";

interface Call {
  id: string;
  phone_number: string;
  direction: string;
  status: string;
  duration?: string;
  started_at: string;
  ended_at?: string;
  notes?: string;
  clients?: {
    id: string;
    name: string;
    phone: string;
  };
}

export const RealCallsList = () => {
  const [calls, setCalls] = useState<Call[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadCalls();
    
    // Set up real-time subscription for new calls
    const channel = supabase
      .channel('calls-updates')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'calls'
        },
        () => {
          loadCalls(); // Reload calls when there are changes
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  const loadCalls = async () => {
    try {
      const { data, error } = await supabase
        .from('calls')
        .select(`
          *,
          clients:client_id(id, name, phone)
        `)
        .order('started_at', { ascending: false })
        .limit(50);

      if (error) throw error;
      setCalls(data || []);
    } catch (error) {
      console.error('Error loading calls:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatPhoneNumber = (phoneNumber: string) => {
    const cleaned = phoneNumber.replace(/\D/g, '');
    if (cleaned.length === 11 && cleaned.startsWith('1')) {
      const number = cleaned.slice(1);
      return `(${number.slice(0, 3)}) ${number.slice(3, 6)}-${number.slice(6)}`;
    }
    return phoneNumber;
  };

  const formatDuration = (duration?: string) => {
    if (!duration) return 'N/A';
    return duration;
  };

  const getCallStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'success';
      case 'missed': return 'destructive';
      case 'in-progress': return 'warning';
      default: return 'secondary';
    }
  };

  const getCallDirectionIcon = (direction: string) => {
    switch (direction) {
      case 'outgoing': return <PhoneCall className="h-4 w-4 text-green-600" />;
      case 'incoming': return <Phone className="h-4 w-4 text-blue-600" />;
      case 'missed': return <Phone className="h-4 w-4 text-red-600" />;
      default: return <Phone className="h-4 w-4 text-gray-600" />;
    }
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <CallingInterface />
        <Card>
          <CardContent className="p-8 text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-fixlyfy mx-auto"></div>
            <p className="text-sm text-gray-500 mt-2">Loading call history...</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Calling Interface */}
      <CallingInterface />

      {/* Call History */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Phone className="h-5 w-5" />
            Call History ({calls.length})
          </CardTitle>
        </CardHeader>
        <CardContent>
          {calls.length === 0 ? (
            <div className="text-center py-8">
              <Phone className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No calls yet</h3>
              <p className="text-gray-500">
                Make your first call using the interface above.
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {calls.map((call) => (
                <div
                  key={call.id}
                  className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50"
                >
                  <div className="flex items-center space-x-3">
                    <div className="p-2 bg-gray-100 rounded-full">
                      {getCallDirectionIcon(call.direction)}
                    </div>
                    
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <span className="font-medium">
                          {call.clients?.name || 'Unknown Client'}
                        </span>
                        <Badge variant={getCallStatusColor(call.status) as any}>
                          {call.status}
                        </Badge>
                      </div>
                      <div className="text-sm text-gray-500">
                        {formatPhoneNumber(call.phone_number)}
                      </div>
                      <div className="flex items-center gap-4 text-xs text-gray-400 mt-1">
                        <span className="flex items-center gap-1">
                          <Calendar className="h-3 w-3" />
                          {new Date(call.started_at).toLocaleString()}
                        </span>
                        <span className="flex items-center gap-1">
                          <Clock className="h-3 w-3" />
                          {formatDuration(call.duration)}
                        </span>
                        <span className="capitalize">{call.direction}</span>
                      </div>
                      {call.notes && (
                        <div className="text-sm text-gray-600 mt-1">
                          {call.notes}
                        </div>
                      )}
                    </div>
                  </div>
                  
                  <div className="text-right">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        // TODO: Implement call back functionality
                        console.log('Call back:', call.phone_number);
                      }}
                      className="gap-1"
                    >
                      <Phone className="h-3 w-3" />
                      Call Back
                    </Button>
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
