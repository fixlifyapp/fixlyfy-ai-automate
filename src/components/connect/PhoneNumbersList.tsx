
import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Skeleton } from "@/components/ui/skeleton";
import { 
  Phone, 
  Bot, 
  Settings, 
  MapPin, 
  DollarSign, 
  Zap,
  Loader2
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { PhoneNumber } from "@/types/database";
import { toast } from "@/components/ui/use-toast";
import { AIDispatcherSettings } from "./AIDispatcherSettings";

export const PhoneNumbersList = () => {
  const [phoneNumbers, setPhoneNumbers] = useState<PhoneNumber[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [aiToggleLoading, setAiToggleLoading] = useState<string | null>(null);
  const [showAISettings, setShowAISettings] = useState(false);
  const [selectedPhoneNumber, setSelectedPhoneNumber] = useState<PhoneNumber | null>(null);

  useEffect(() => {
    fetchPhoneNumbers();
  }, []);

  const fetchPhoneNumbers = async () => {
    setIsLoading(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data, error } = await supabase
        .from('phone_numbers')
        .select('*')
        .eq('purchased_by', user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setPhoneNumbers(data || []);
    } catch (error) {
      console.error('Error fetching phone numbers:', error);
      toast({
        title: "Error",
        description: "Failed to load phone numbers",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const toggleAIDispatcher = async (phoneNumber: PhoneNumber) => {
    setAiToggleLoading(phoneNumber.id);
    try {
      const newStatus = !phoneNumber.ai_dispatcher_enabled;
      
      // Call the manage-ai-dispatcher function
      const { error } = await supabase.functions.invoke('manage-ai-dispatcher', {
        body: {
          action: newStatus ? 'enable' : 'disable',
          phoneNumberId: phoneNumber.id
        }
      });

      if (error) throw error;

      // Update local state
      setPhoneNumbers(prev => prev.map(pn => 
        pn.id === phoneNumber.id 
          ? { ...pn, ai_dispatcher_enabled: newStatus }
          : pn
      ));

      toast({
        title: "Success",
        description: `AI Dispatcher ${newStatus ? 'enabled' : 'disabled'} successfully`
      });

      // If enabling AI for the first time, open settings dialog
      if (newStatus) {
        setSelectedPhoneNumber({ ...phoneNumber, ai_dispatcher_enabled: newStatus });
        setShowAISettings(true);
      }

    } catch (error) {
      console.error('Error toggling AI dispatcher:', error);
      toast({
        title: "Error",
        description: "Failed to update AI Dispatcher settings",
        variant: "destructive"
      });
    } finally {
      setAiToggleLoading(null);
    }
  };

  const openAISettings = (phoneNumber: PhoneNumber) => {
    setSelectedPhoneNumber(phoneNumber);
    setShowAISettings(true);
  };

  const formatPhoneNumber = (phone: string) => {
    return phone.replace(/^\+1/, '').replace(/(\d{3})(\d{3})(\d{4})/, '($1) $2-$3');
  };

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Your Phone Numbers</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="flex items-center justify-between p-4 border rounded-lg">
                <div className="flex items-center gap-3">
                  <Skeleton className="h-10 w-10 rounded-full" />
                  <div>
                    <Skeleton className="h-4 w-32 mb-2" />
                    <Skeleton className="h-3 w-24" />
                  </div>
                </div>
                <Skeleton className="h-6 w-16" />
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <>
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Phone className="h-5 w-5" />
            Your Phone Numbers ({phoneNumbers.length})
          </CardTitle>
        </CardHeader>
        <CardContent>
          {phoneNumbers.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <Phone className="mx-auto h-12 w-12 text-gray-400 mb-4" />
              <p className="text-lg font-medium">No phone numbers purchased</p>
              <p className="text-sm">Purchase a phone number to get started</p>
            </div>
          ) : (
            <div className="space-y-4">
              {phoneNumbers.map((phoneNumber) => (
                <div key={phoneNumber.id} className="flex items-center justify-between p-4 border rounded-lg hover:bg-muted/50">
                  <div className="flex items-center gap-3">
                    <div className={`p-2 rounded-full ${
                      phoneNumber.ai_dispatcher_enabled 
                        ? 'bg-blue-100 text-blue-600' 
                        : 'bg-gray-100 text-gray-600'
                    }`}>
                      {phoneNumber.ai_dispatcher_enabled ? (
                        <Bot className="h-6 w-6" />
                      ) : (
                        <Phone className="h-6 w-6" />
                      )}
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-medium">
                          {formatPhoneNumber(phoneNumber.phone_number)}
                        </span>
                        {phoneNumber.ai_dispatcher_enabled ? (
                          <Badge className="bg-blue-100 text-blue-800 border-blue-200">
                            <Bot className="h-3 w-3 mr-1" />
                            AI Active
                          </Badge>
                        ) : (
                          <Badge variant="outline">Standard</Badge>
                        )}
                      </div>
                      <div className="flex items-center gap-4 text-sm text-muted-foreground">
                        {phoneNumber.locality && (
                          <div className="flex items-center gap-1">
                            <MapPin className="h-3 w-3" />
                            {phoneNumber.locality}, {phoneNumber.region}
                          </div>
                        )}
                        <div className="flex items-center gap-1">
                          <DollarSign className="h-3 w-3" />
                          ${phoneNumber.monthly_price}/month
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-3">
                    {/* AI Settings Button */}
                    {phoneNumber.ai_dispatcher_enabled && (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => openAISettings(phoneNumber)}
                        className="text-blue-600 border-blue-200 hover:bg-blue-50"
                      >
                        <Settings className="h-4 w-4 mr-1" />
                        AI Settings
                      </Button>
                    )}
                    
                    {/* AI Dispatcher Toggle */}
                    <div className="flex items-center gap-2">
                      <Zap className="h-4 w-4 text-muted-foreground" />
                      <span className="text-sm text-muted-foreground">AI</span>
                      {aiToggleLoading === phoneNumber.id ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : (
                        <Switch
                          checked={phoneNumber.ai_dispatcher_enabled || false}
                          onCheckedChange={() => toggleAIDispatcher(phoneNumber)}
                        />
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* AI Settings Dialog */}
      {selectedPhoneNumber && (
        <AIDispatcherSettings
          open={showAISettings}
          onOpenChange={setShowAISettings}
          phoneNumberId={selectedPhoneNumber.id}
          phoneNumber={formatPhoneNumber(selectedPhoneNumber.phone_number)}
        />
      )}
    </>
  );
};
