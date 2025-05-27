
import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Phone, Plus, Search, MapPin, DollarSign, Calendar, Cloud } from "lucide-react";
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
}

export const PhoneNumberManagement = () => {
  const [searchResults, setSearchResults] = useState<PhoneNumber[]>([]);
  const [ownedNumbers, setOwnedNumbers] = useState<OwnedNumber[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [isPurchasing, setIsPurchasing] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");

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
                    <Phone className="h-5 w-5 text-fixlyfy" />
                    <div>
                      <div className="font-medium">{number.phone_number}</div>
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
                  <Badge variant={number.status === 'owned' ? 'success' : 'secondary'}>
                    {number.status}
                  </Badge>
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
