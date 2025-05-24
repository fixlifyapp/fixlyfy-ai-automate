import { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Search, Phone, ShoppingCart, Trash2, MapPin, AlertCircle, Info } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { PhoneNumber } from "@/types/database";
import { Alert, AlertDescription } from "@/components/ui/alert";

interface PhoneNumbersListProps {
  searchResults?: any[];
}

interface SearchInfo {
  total_found: number;
  search_criteria: any;
  number_types_searched: string[];
}

export const PhoneNumbersList = ({ searchResults = [] }: PhoneNumbersListProps) => {
  const [searchTerm, setSearchTerm] = useState("");
  const [availableNumbers, setAvailableNumbers] = useState<any[]>([]);
  const [ownedNumbers, setOwnedNumbers] = useState<PhoneNumber[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [isPurchasing, setIsPurchasing] = useState<string | null>(null);
  const [searchInfo, setSearchInfo] = useState<SearchInfo | null>(null);

  // Load owned numbers on component mount
  useEffect(() => {
    loadOwnedNumbers();
  }, []);

  // Filter search results to show only Twilio numbers
  const twilioNumbersFromSearch = searchResults.filter(result => result.type === 'twilio_number');

  const loadOwnedNumbers = async () => {
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
    setIsSearching(true);
    setSearchInfo(null);
    
    try {
      const searchParams: any = {};
      
      // Check if search term is an area code (3 digits)
      if (/^\d{3}$/.test(searchTerm)) {
        searchParams.areaCode = searchTerm;
      } else if (/^\d+$/.test(searchTerm)) {
        // If it's all digits, search by contains
        searchParams.contains = searchTerm;
      } else if (searchTerm.trim()) {
        // Otherwise search by locality/region
        searchParams.locality = searchTerm;
      }

      console.log('Searching with params:', searchParams);

      const { data, error } = await supabase.functions.invoke('manage-phone-numbers', {
        body: { action: 'search', ...searchParams }
      });

      if (error) throw error;
      
      console.log('Search response:', data);
      
      setAvailableNumbers(data.available_phone_numbers || []);
      setSearchInfo(data.search_info || null);
      
      if (data.available_phone_numbers?.length === 0) {
        toast.info('No phone numbers found. Try a different area code or search term.');
      } else {
        toast.success(`Found ${data.available_phone_numbers?.length || 0} available numbers`);
      }
    } catch (error) {
      console.error('Error searching phone numbers:', error);
      toast.error('Failed to search phone numbers. Please check your Twilio credentials.');
    } finally {
      setIsSearching(false);
    }
  };

  const purchasePhoneNumber = async (phoneNumber: string) => {
    setIsPurchasing(phoneNumber);
    try {
      const { data, error } = await supabase.functions.invoke('manage-phone-numbers', {
        body: { action: 'purchase', phoneNumber }
      });

      if (error) throw error;
      
      toast.success(`Successfully purchased ${phoneNumber}`);
      
      // Remove from available and reload owned
      setAvailableNumbers(prev => prev.filter(num => num.phoneNumber !== phoneNumber));
      loadOwnedNumbers();
    } catch (error) {
      console.error('Error purchasing phone number:', error);
      toast.error('Failed to purchase phone number');
    } finally {
      setIsPurchasing(null);
    }
  };

  const releasePhoneNumber = async (phoneNumberId: string) => {
    try {
      const { error } = await supabase.functions.invoke('manage-phone-numbers', {
        body: { action: 'release', phoneNumberId }
      });

      if (error) throw error;
      
      toast.success('Phone number released successfully');
      loadOwnedNumbers();
    } catch (error) {
      console.error('Error releasing phone number:', error);
      toast.error('Failed to release phone number');
    }
  };

  const formatPhoneNumber = (phoneNumber: string | undefined) => {
    if (!phoneNumber || typeof phoneNumber !== 'string') {
      return 'N/A';
    }
    
    const cleaned = phoneNumber.replace(/\D/g, '');
    if (cleaned.length === 11 && cleaned.startsWith('1')) {
      const number = cleaned.slice(1);
      return `(${number.slice(0, 3)}) ${number.slice(3, 6)}-${number.slice(6)}`;
    }
    return phoneNumber;
  };

  const getSuggestedSearches = () => {
    return [
      { label: "San Francisco Bay Area", value: "415" },
      { label: "Los Angeles", value: "213" },
      { label: "New York City", value: "212" },
      { label: "Chicago", value: "312" },
      { label: "Miami", value: "305" },
      { label: "Seattle", value: "206" }
    ];
  };

  // Combine available numbers from both sources
  const allAvailableNumbers = [...availableNumbers, ...twilioNumbersFromSearch];

  return (
    <div className="space-y-6">
      {/* Search Section */}
      <Card className="p-6">
        <h3 className="text-lg font-semibold mb-4">Search Available Phone Numbers</h3>
        <div className="flex gap-3 mb-4">
          <div className="flex-1">
            <Input
              placeholder="Enter area code (e.g., 415), city (e.g., San Francisco), or partial number..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && searchPhoneNumbers()}
            />
          </div>
          <Button 
            onClick={searchPhoneNumbers}
            disabled={isSearching}
            className="bg-fixlyfy hover:bg-fixlyfy/90"
          >
            <Search size={16} className="mr-2" />
            {isSearching ? 'Searching...' : 'Search'}
          </Button>
        </div>

        {/* Search Suggestions */}
        <div className="mb-4">
          <p className="text-sm text-gray-600 mb-2">Popular area codes:</p>
          <div className="flex flex-wrap gap-2">
            {getSuggestedSearches().map((suggestion) => (
              <Button
                key={suggestion.value}
                variant="outline"
                size="sm"
                onClick={() => {
                  setSearchTerm(suggestion.value);
                  // Auto-search when clicking suggestion
                  setTimeout(() => searchPhoneNumbers(), 100);
                }}
                className="text-xs"
              >
                {suggestion.label} ({suggestion.value})
              </Button>
            ))}
          </div>
        </div>

        {/* Search Info */}
        {searchInfo && (
          <Alert className="mb-4">
            <Info className="h-4 w-4" />
            <AlertDescription>
              Found {searchInfo.total_found} numbers across {searchInfo.number_types_searched.join(', ')} number types.
              {searchInfo.total_found === 0 && " Try a different area code or search term."}
            </AlertDescription>
          </Alert>
        )}

        <div className="text-sm text-gray-600">
          <p>Search tips:</p>
          <ul className="list-disc list-inside ml-2 space-y-1">
            <li>Area code (3 digits, e.g., "415") - Most reliable</li>
            <li>City name (e.g., "San Francisco") - May have limited results</li>
            <li>Partial phone number (e.g., "5551234")</li>
            <li>Leave empty to search popular area codes</li>
          </ul>
        </div>
      </Card>

      {/* Available Numbers */}
      {allAvailableNumbers.length > 0 && (
        <Card className="p-6">
          <h3 className="text-lg font-semibold mb-4">Available Numbers ({allAvailableNumbers.length})</h3>
          <div className="grid gap-4">
            {allAvailableNumbers.map((number, index) => {
              const phoneNum = number.phoneNumber || number.phone;
              const formattedPhone = formatPhoneNumber(phoneNum);
              
              return (
                <div key={index} className="flex items-center justify-between p-4 border rounded-lg">
                  <div className="flex-1">
                    <div className="flex items-center gap-3">
                      <Phone size={16} className="text-fixlyfy" />
                      <span className="font-medium">{formattedPhone}</span>
                      <div className="flex gap-2">
                        {number.capabilities?.voice && <Badge variant="outline">Voice</Badge>}
                        {number.capabilities?.SMS && <Badge variant="outline">SMS</Badge>}
                        {number.capabilities?.MMS && <Badge variant="outline">MMS</Badge>}
                      </div>
                      {number.phoneNumberType && (
                        <Badge variant="secondary">{number.phoneNumberType}</Badge>
                      )}
                    </div>
                    <div className="flex items-center gap-2 mt-2 text-sm text-fixlyfy-text-secondary">
                      <MapPin size={14} />
                      <span>{number.locality || 'Unknown'}, {number.region || 'Unknown'}</span>
                      {number.rateCenter && (
                        <>
                          <span>•</span>
                          <span>{number.rateCenter}</span>
                        </>
                      )}
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-sm text-fixlyfy-text-secondary mb-2">
                      ${number.price || '1.00'} setup + $1.00/month
                    </div>
                    <Button
                      size="sm"
                      onClick={() => purchasePhoneNumber(phoneNum)}
                      disabled={isPurchasing === phoneNum || !phoneNum}
                      className="bg-fixlyfy hover:bg-fixlyfy/90"
                    >
                      <ShoppingCart size={14} className="mr-1" />
                      {isPurchasing === phoneNum ? 'Purchasing...' : 'Purchase'}
                    </Button>
                  </div>
                </div>
              );
            })}
          </div>
        </Card>
      )}

      {/* No Results Message */}
      {!isSearching && searchInfo && searchInfo.total_found === 0 && (
        <Card className="p-6">
          <div className="text-center py-8">
            <AlertCircle className="mx-auto h-12 w-12 mb-3 text-gray-400" />
            <h3 className="text-lg font-medium mb-2">No Numbers Found</h3>
            <p className="text-gray-600 mb-4">
              No phone numbers are available for your search criteria.
            </p>
            <div className="text-sm text-gray-500">
              <p>Try searching for:</p>
              <ul className="list-disc list-inside mt-2">
                <li>A different area code (415, 650, 510, etc.)</li>
                <li>A major city name</li>
                <li>Leave the search empty for random available numbers</li>
              </ul>
            </div>
          </div>
        </Card>
      )}

      {/* Owned Numbers */}
      <Card className="p-6">
        <h3 className="text-lg font-semibold mb-4">Your Phone Numbers ({ownedNumbers.length})</h3>
        {ownedNumbers.length === 0 ? (
          <div className="text-center py-8 text-fixlyfy-text-secondary">
            <Phone className="mx-auto h-12 w-12 mb-3" />
            <p>No phone numbers purchased yet</p>
            <p className="text-sm mt-1">Search and purchase numbers above to get started</p>
          </div>
        ) : (
          <div className="grid gap-4">
            {ownedNumbers.map((number) => (
              <div key={number.id} className="flex items-center justify-between p-4 border rounded-lg bg-fixlyfy-bg-hover">
                <div className="flex-1">
                  <div className="flex items-center gap-3">
                    <Phone size={16} className="text-fixlyfy" />
                    <span className="font-medium">{formatPhoneNumber(number.phone_number)}</span>
                    <Badge className="bg-green-100 text-green-800">Owned</Badge>
                    <div className="flex gap-2">
                      {number.capabilities?.voice && <Badge variant="outline">Voice</Badge>}
                      {number.capabilities?.sms && <Badge variant="outline">SMS</Badge>}
                      {number.capabilities?.mms && <Badge variant="outline">MMS</Badge>}
                    </div>
                  </div>
                  <div className="flex items-center gap-2 mt-2 text-sm text-fixlyfy-text-secondary">
                    <MapPin size={14} />
                    <span>{number.locality || 'Unknown'}, {number.region || 'Unknown'}</span>
                    <span>•</span>
                    <span>Purchased: {new Date(number.purchased_at!).toLocaleDateString()}</span>
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-sm text-fixlyfy-text-secondary mb-2">
                    ${number.monthly_price}/month
                  </div>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => releasePhoneNumber(number.id)}
                    className="text-red-600 hover:text-red-700"
                  >
                    <Trash2 size={14} className="mr-1" />
                    Release
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}
      </Card>
    </div>
  );
};
