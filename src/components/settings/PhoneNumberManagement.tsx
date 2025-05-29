
import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Phone, Plus, Search, MapPin, DollarSign, Calendar, Cloud, Bot, Settings } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface PhoneNumber {
  phoneNumber: string;
  locality: string;
  region: string;
  price: string;
  capabilities: {
    voice: boolean;
    sms: boolean;
    mms: boolean;
  };
}

interface OwnedNumber {
  id: string;
  phone_number: string;
  status: string;
  purchased_at: string;
  monthly_price: number;
  connect_instance_id?: string;
  connect_phone_number_arn?: string;
  ai_dispatcher_enabled?: boolean;
}

export const PhoneNumberManagement = () => {
  const [searchResults, setSearchResults] = useState<PhoneNumber[]>([]);
  const [ownedNumbers, setOwnedNumbers] = useState<OwnedNumber[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [isPurchasing, setIsPurchasing] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [updatingAI, setUpdatingAI] = useState<string | null>(null);
  const [aiSettingsOpen, setAiSettingsOpen] = useState(false);
  const [selectedNumber, setSelectedNumber] = useState<any>(null);

  useEffect(() => {
    fetchOwnedNumbers();
  }, []);

  const fetchOwnedNumbers = async () => {
    try {
      const { data, error } = await supabase.functions.invoke('manage-phone-numbers', {
        body: { action: 'list-owned' }
      });

      if (error) throw error;
      setOwnedNumbers(data.phone_numbers || []);
    } catch (error) {
      console.error('Error loading owned numbers:', error);
      toast.error('Failed to load owned phone numbers');
    }
  };

  const searchPhoneNumbers = async () => {
    if (!searchQuery.trim()) {
      toast.error('Please enter a search term (area code, city, or state)');
      return;
    }

    setIsSearching(true);
    try {
      const { data, error } = await supabase.functions.invoke('manage-phone-numbers', {
        body: {
          action: 'search',
          areaCode: searchQuery.match(/^\d{3}$/) ? searchQuery : undefined,
          contains: searchQuery.match(/^\d{3}$/) ? undefined : searchQuery,
          country: 'US'
        }
      });

      if (error) throw error;

      if (data.success) {
        setSearchResults(data.phone_numbers || []);
        if (data.phone_numbers?.length === 0) {
          toast.info('No phone numbers found for your search');
        }
      } else {
        throw new Error(data.error || 'Failed to search phone numbers');
      }
    } catch (error) {
      console.error('Error searching phone numbers:', error);
      toast.error('Failed to search phone numbers');
    } finally {
      setIsSearching(false);
    }
  };

  const purchasePhoneNumber = async (phoneNumber: string) => {
    setIsPurchasing(phoneNumber);
    try {
      const { data, error } = await supabase.functions.invoke('manage-phone-numbers', {
        body: {
          action: 'purchase',
          phoneNumber: phoneNumber
        }
      });

      if (error) throw error;

      if (data.success) {
        toast.success('Phone number purchased successfully!');
        fetchOwnedNumbers();
        setSearchResults(prev => prev.filter(num => num.phoneNumber !== phoneNumber));
      } else {
        toast.error(data.error || 'Failed to purchase phone number');
      }
    } catch (error) {
      console.error('Error purchasing phone number:', error);
      toast.error('Failed to purchase phone number');
    } finally {
      setIsPurchasing(null);
    }
  };

  const toggleAIDispatcher = async (phoneNumber: any, enabled: boolean) => {
    setUpdatingAI(phoneNumber.id);
    try {
      const { error } = await supabase
        .from('phone_numbers')
        .update({ ai_dispatcher_enabled: enabled })
        .eq('id', phoneNumber.id);

      if (error) throw error;

      await supabase.functions.invoke('manage-ai-dispatcher', {
        body: { action: enabled ? 'enable' : 'disable', phoneNumberId: phoneNumber.id }
      });

      toast.success(`AI Dispatcher ${enabled ? 'enabled' : 'disabled'}`);
      fetchOwnedNumbers();
    } catch (error) {
      toast.error('Failed to update AI Dispatcher');
    } finally {
      setUpdatingAI(null);
    }
  };

  const openAISettings = (number: any) => {
    setSelectedNumber(number);
    setAiSettingsOpen(true);
  };

  const formatPhoneNumber = (phone: string) => {
    return phone.replace(/^\+1/, '').replace(/(\d{3})(\d{3})(\d{4})/, '($1) $2-$3');
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold mb-2">Phone Number Management</h2>
        <p className="text-gray-600">
          Purchase and manage phone numbers through Amazon Connect for your business communications.
        </p>
        <div className="flex items-center gap-2 mt-2 text-sm text-blue-600">
          <Cloud className="h-4 w-4" />
          <span>Powered by Amazon Connect</span>
        </div>
      </div>

      {/* Owned Numbers */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Phone className="h-5 w-5 text-fixlyfy" />
            Your Phone Numbers ({ownedNumbers.length})
          </CardTitle>
        </CardHeader>
        <CardContent>
          {ownedNumbers.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <Phone className="h-12 w-12 mx-auto mb-4 text-gray-300" />
              <h3 className="text-lg font-medium mb-2">No phone numbers yet</h3>
              <p className="text-sm">Purchase your first phone number to start making calls</p>
            </div>
          ) : (
            <div className="space-y-3">
              {ownedNumbers.map((number) => (
                <div
                  key={number.id}
                  className="flex items-center justify-between p-4 border border-gray-200 rounded-lg"
                >
                  <div className="flex items-center gap-3">
                    <div className={`p-2 rounded-full ${number.ai_dispatcher_enabled ? 'bg-blue-100' : 'bg-green-100'}`}>
                      {number.ai_dispatcher_enabled ? (
                        <Bot className="h-4 w-4 text-blue-600" />
                      ) : (
                        <Phone className="h-4 w-4 text-green-600" />
                      )}
                    </div>
                    <div>
                      <div className="font-medium flex items-center gap-2">
                        {formatPhoneNumber(number.phone_number)}
                        {number.ai_dispatcher_enabled && (
                          <Badge className="bg-blue-600">
                            <Bot className="h-3 w-3 mr-1" />
                            AI Active
                          </Badge>
                        )}
                      </div>
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <Calendar className="h-3 w-3" />
                        Purchased: {new Date(number.purchased_at).toLocaleDateString()}
                        <DollarSign className="h-3 w-3 ml-2" />
                        ${number.monthly_price}/month
                      </div>
                      {number.connect_instance_id && (
                        <div className="flex items-center gap-1 text-xs text-blue-600 mt-1">
                          <Cloud className="h-3 w-3" />
                          Connect Instance: {number.connect_instance_id.slice(-8)}
                        </div>
                      )}
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-4">
                    <div className="flex items-center space-x-2">
                      <Switch
                        checked={number.ai_dispatcher_enabled || false}
                        onCheckedChange={(enabled) => toggleAIDispatcher(number, enabled)}
                        disabled={updatingAI === number.id}
                      />
                      <Label>AI Dispatcher</Label>
                    </div>
                    
                    {number.ai_dispatcher_enabled && (
                      <Button size="sm" variant="outline" onClick={() => openAISettings(number)}>
                        <Settings className="h-4 w-4 mr-1" />
                        AI Settings
                      </Button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Search New Numbers */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Search className="h-5 w-5 text-fixlyfy" />
            Find New Phone Numbers
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex gap-3 mb-6">
            <Input
              placeholder="Enter area code (e.g., 415) or city name (e.g., San Francisco)"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="flex-1"
              onKeyPress={(e) => e.key === 'Enter' && searchPhoneNumbers()}
            />
            <Button 
              onClick={searchPhoneNumbers} 
              disabled={isSearching}
              className="gap-2"
            >
              <Search className="h-4 w-4" />
              {isSearching ? 'Searching...' : 'Search'}
            </Button>
          </div>

          {searchResults.length > 0 && (
            <div className="space-y-3">
              <div className="flex items-center gap-2 mb-4">
                <h3 className="font-medium">Available Numbers ({searchResults.length})</h3>
                <Badge variant="outline" className="text-blue-600 border-blue-200">
                  <Cloud className="h-3 w-3 mr-1" />
                  Amazon Connect
                </Badge>
              </div>
              {searchResults.map((number) => (
                <div
                  key={number.phoneNumber}
                  className="flex items-center justify-between p-4 border border-gray-200 rounded-lg"
                >
                  <div className="flex items-center gap-3">
                    <Phone className="h-5 w-5 text-fixlyfy" />
                    <div>
                      <div className="font-medium">{number.phoneNumber}</div>
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <MapPin className="h-3 w-3" />
                        {number.locality}, {number.region}
                        <DollarSign className="h-3 w-3 ml-2" />
                        ${number.price} setup + $1.00/month
                      </div>
                      <div className="flex gap-1 mt-1">
                        {number.capabilities.voice && <Badge variant="outline" className="text-xs">Voice</Badge>}
                        {number.capabilities.sms && <Badge variant="outline" className="text-xs">SMS</Badge>}
                        {number.capabilities.mms && <Badge variant="outline" className="text-xs">MMS</Badge>}
                      </div>
                    </div>
                  </div>
                  <Button
                    onClick={() => purchasePhoneNumber(number.phoneNumber)}
                    disabled={isPurchasing === number.phoneNumber}
                    size="sm"
                    className="gap-2"
                  >
                    <Plus className="h-4 w-4" />
                    {isPurchasing === number.phoneNumber ? 'Purchasing...' : `Buy $${number.price}`}
                  </Button>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};
