
import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Phone, Search, Plus, MapPin, Hash, Globe } from "lucide-react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { formatPhoneForDisplay } from "@/utils/phoneUtils";

interface AvailableNumber {
  phone_number: string;
  region_information: any;
  features: string[];
  cost_information: any;
  source: 'telnyx';
}

interface ClaimableNumber {
  phone_number: string;
  status: string;
  user_id: string | null;
  source: 'claimable';
}

export function PhoneNumberPurchase() {
  const [searchType, setSearchType] = useState<'city' | 'area-code' | 'local' | 'toll-free'>('city');
  const [searchValue, setSearchValue] = useState('');
  const [country, setCountry] = useState('US');
  const [availableNumbers, setAvailableNumbers] = useState<AvailableNumber[]>([]);
  const [claimableNumber, setClaimableNumber] = useState<ClaimableNumber | null>(null);
  const [isSearching, setIsSearching] = useState(false);
  const queryClient = useQueryClient();

  // Check for claimable number (+14375249932) on component mount
  useEffect(() => {
    checkClaimableNumber();
  }, []);

  const checkClaimableNumber = async () => {
    try {
      const { data, error } = await supabase.functions.invoke('telnyx-phone-numbers', {
        body: {
          action: 'check_claimable',
          phone_number: '+14375249932'
        }
      });

      if (error) throw error;
      
      if (data.claimable) {
        setClaimableNumber({
          phone_number: '+14375249932',
          status: 'available_to_claim',
          user_id: null,
          source: 'claimable'
        });
      }
    } catch (error) {
      console.error('Error checking claimable number:', error);
    }
  };

  // Claim existing number mutation
  const claimNumberMutation = useMutation({
    mutationFn: async (phoneNumber: string) => {
      console.log('Claiming number:', phoneNumber);
      const { data, error } = await supabase.functions.invoke('telnyx-phone-numbers', {
        body: {
          action: 'claim_existing',
          phone_number: phoneNumber
        }
      });

      if (error) {
        console.error('Claim error:', error);
        throw error;
      }
      console.log('Claim response:', data);
      return data;
    },
    onSuccess: (data) => {
      console.log('Successfully claimed:', data);
      toast.success(`🎉 Number ${data.phone_number} claimed successfully and set as default!`);
      
      // Clear the claimable number from state
      setClaimableNumber(null);
      
      // Refresh all related queries
      queryClient.invalidateQueries({ queryKey: ['telnyx-owned-numbers'] });
      queryClient.invalidateQueries({ queryKey: ['user-telnyx-numbers'] });
      queryClient.invalidateQueries({ queryKey: ['phone-numbers-management'] });
    },
    onError: (error) => {
      console.error('Claim error:', error);
      toast.error(`Failed to claim number: ${error.message}`);
    }
  });

  // Search for available numbers
  const searchNumbers = async () => {
    if (!searchValue.trim()) {
      toast.error('Please enter a search term');
      return;
    }

    setIsSearching(true);
    try {
      console.log('Searching for numbers:', { searchType, searchValue, country });
      
      let searchParams: any = {
        action: 'search',
        country_code: country
      };

      // Configure search based on type
      switch (searchType) {
        case 'area-code':
          searchParams.area_code = searchValue;
          break;
        case 'city':
          searchParams.locality = searchValue;
          break;
        case 'local':
          searchParams.number_type = 'local';
          if (searchValue) {
            searchParams.area_code = searchValue;
          }
          break;
        case 'toll-free':
          searchParams.number_type = 'toll_free';
          break;
      }

      const { data, error } = await supabase.functions.invoke('telnyx-phone-numbers', {
        body: searchParams
      });

      if (error) {
        console.error('Search error:', error);
        throw error;
      }
      
      console.log('Search results:', data);
      setAvailableNumbers(data.available_numbers || []);
      
      if (data.available_numbers?.length > 0) {
        toast.success(`Found ${data.available_numbers.length} available numbers`);
      } else {
        toast.info('No numbers found for your search criteria. Try different parameters.');
      }
    } catch (error) {
      console.error('Search error:', error);
      toast.error(`Failed to search for numbers: ${error.message}`);
    } finally {
      setIsSearching(false);
    }
  };

  // Purchase number mutation
  const purchaseNumberMutation = useMutation({
    mutationFn: async (phoneNumber: string) => {
      console.log('Purchasing number:', phoneNumber);
      const { data, error } = await supabase.functions.invoke('telnyx-phone-numbers', {
        body: {
          action: 'purchase',
          phone_number: phoneNumber,
          country_code: country
        }
      });

      if (error) {
        console.error('Purchase error:', error);
        throw error;
      }
      console.log('Purchase response:', data);
      return data;
    },
    onSuccess: (data) => {
      console.log('Successfully purchased:', data);
      toast.success(`📞 Number ${data.phone_number} ordered successfully!`);
      
      // Refresh all related queries
      queryClient.invalidateQueries({ queryKey: ['telnyx-owned-numbers'] });
      queryClient.invalidateQueries({ queryKey: ['user-telnyx-numbers'] });
      queryClient.invalidateQueries({ queryKey: ['phone-numbers-management'] });
      
      // Remove the purchased number from available list
      setAvailableNumbers(prev => prev.filter(num => num.phone_number !== data.phone_number));
    },
    onError: (error) => {
      console.error('Purchase error:', error);
      toast.error(`Failed to purchase number: ${error.message}`);
    }
  });

  const getCostDisplay = (number: AvailableNumber) => {
    return {
      setup: number.cost_information?.upfront_cost || 1.00,
      monthly: number.cost_information?.monthly_cost || 1.00
    };
  };

  const getSearchPlaceholder = () => {
    switch (searchType) {
      case 'area-code':
        return 'e.g., 212, 310, 415';
      case 'city':
        return 'e.g., New York, Los Angeles, San Francisco';
      case 'local':
        return 'Optional: Enter area code for local numbers';
      case 'toll-free':
        return 'Search toll-free numbers (800, 888, 877, etc.)';
      default:
        return 'Enter search term';
    }
  };

  const cities = [
    'New York', 'Los Angeles', 'Chicago', 'Houston', 'Phoenix', 'Philadelphia',
    'San Antonio', 'San Diego', 'Dallas', 'San Jose', 'Austin', 'Jacksonville',
    'Fort Worth', 'Columbus', 'Charlotte', 'San Francisco', 'Indianapolis',
    'Seattle', 'Denver', 'Washington DC', 'Boston', 'Nashville', 'Baltimore',
    'Oklahoma City', 'Louisville', 'Portland', 'Las Vegas', 'Milwaukee',
    'Albuquerque', 'Tucson', 'Fresno', 'Mesa', 'Kansas City', 'Atlanta',
    'Long Beach', 'Colorado Springs', 'Raleigh', 'Miami', 'Virginia Beach',
    'Omaha', 'Oakland', 'Minneapolis', 'Tulsa', 'Arlington', 'Tampa',
    'New Orleans', 'Wichita', 'Cleveland', 'Bakersfield'
  ];

  return (
    <div className="space-y-6">
      {/* Claim Your Telnyx Number Section - Only show if claimable */}
      {claimableNumber && (
        <Card className="border-green-200 bg-green-50">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-green-800">
              <Phone className="h-5 w-5" />
              Claim Your Telnyx Number - Special Offer!
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="bg-white p-4 rounded-lg border border-green-200">
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <span className="font-bold text-xl text-green-800">
                      {formatPhoneForDisplay(claimableNumber.phone_number)}
                    </span>
                    <Badge className="bg-green-100 text-green-800">
                      🎁 FREE - Your Telnyx Number
                    </Badge>
                  </div>
                  <div className="text-sm text-green-700">
                    <div>This is your existing Telnyx number, ready to claim!</div>
                    <div className="flex items-center gap-4 mt-1">
                      <span className="font-medium">Setup: FREE</span>
                      <span className="font-medium">Monthly: $1.00</span>
                      <div className="flex gap-1">
                        <Badge variant="outline" className="text-xs border-green-300">Voice</Badge>
                        <Badge variant="outline" className="text-xs border-green-300">SMS</Badge>
                        <Badge variant="outline" className="text-xs border-green-300">AI Ready</Badge>
                      </div>
                    </div>
                  </div>
                </div>
                <Button
                  onClick={() => claimNumberMutation.mutate(claimableNumber.phone_number)}
                  disabled={claimNumberMutation.isPending}
                  className="gap-2 bg-green-600 hover:bg-green-700"
                >
                  <Phone className="h-4 w-4" />
                  {claimNumberMutation.isPending ? 'Claiming...' : 'Claim FREE'}
                </Button>
              </div>
            </div>
            <div className="text-sm text-green-700">
              <strong>🎉 Special Offer:</strong> This number is already under your Telnyx account. 
              Claim it now for FREE and it will be set as your default number with full AI dispatcher capabilities!
            </div>
          </CardContent>
        </Card>
      )}

      {/* Search & Purchase Section */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Search className="h-5 w-5" />
            Search & Purchase Phone Numbers
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Search Controls */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <Label htmlFor="country">Country</Label>
              <Select value={country} onValueChange={setCountry}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="US">🇺🇸 United States</SelectItem>
                  <SelectItem value="CA">🇨🇦 Canada</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="search-type">Search Type</Label>
              <Select value={searchType} onValueChange={(value: 'city' | 'area-code' | 'local' | 'toll-free') => setSearchType(value)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="city">
                    <div className="flex items-center gap-2">
                      <MapPin className="h-4 w-4" />
                      City/Region
                    </div>
                  </SelectItem>
                  <SelectItem value="area-code">
                    <div className="flex items-center gap-2">
                      <Hash className="h-4 w-4" />
                      Area Code
                    </div>
                  </SelectItem>
                  <SelectItem value="local">
                    <div className="flex items-center gap-2">
                      <Phone className="h-4 w-4" />
                      Local Numbers
                    </div>
                  </SelectItem>
                  <SelectItem value="toll-free">
                    <div className="flex items-center gap-2">
                      <Globe className="h-4 w-4" />
                      Toll-Free
                    </div>
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="search-value">
                {searchType === 'area-code' ? 'Area Code' : 
                 searchType === 'city' ? 'City/Region' : 
                 searchType === 'local' ? 'Area Code (Optional)' : 
                 'Search Toll-Free'}
              </Label>
              {searchType === 'city' ? (
                <Select value={searchValue} onValueChange={setSearchValue}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select a city..." />
                  </SelectTrigger>
                  <SelectContent>
                    {cities.map((city) => (
                      <SelectItem key={city} value={city}>
                        {city}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              ) : (
                <Input
                  id="search-value"
                  placeholder={getSearchPlaceholder()}
                  value={searchValue}
                  onChange={(e) => {
                    if (searchType === 'area-code' || searchType === 'local') {
                      setSearchValue(e.target.value.replace(/\D/g, '').slice(0, 3));
                    } else {
                      setSearchValue(e.target.value);
                    }
                  }}
                  maxLength={searchType === 'area-code' || searchType === 'local' ? 3 : undefined}
                />
              )}
            </div>
          </div>

          <Button 
            onClick={searchNumbers}
            disabled={isSearching || (!searchValue && searchType !== 'toll-free')}
            className="w-full"
          >
            {isSearching ? 'Searching...' : 'Search Available Numbers'}
          </Button>

          {/* Search Results */}
          {availableNumbers.length > 0 && (
            <div className="space-y-3">
              <h4 className="font-medium">Available Numbers ({availableNumbers.length})</h4>
              <div className="grid grid-cols-1 gap-3">
                {availableNumbers.map((number) => {
                  const cost = getCostDisplay(number);
                  
                  return (
                    <div
                      key={number.phone_number}
                      className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50"
                    >
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <span className="font-medium text-lg">
                            {formatPhoneForDisplay(number.phone_number)}
                          </span>
                          <Badge className="bg-blue-100 text-blue-800">
                            📞 Telnyx Number
                          </Badge>
                        </div>
                        <div className="text-sm text-muted-foreground">
                          <div>
                            {number.region_information?.[0]?.region_name || country === 'US' ? 'United States' : 'Canada'}, {' '}
                            {number.region_information?.[0]?.rate_center || 'Local Area'}
                          </div>
                          <div className="flex items-center gap-4 mt-1">
                            <span>Setup: ${cost.setup.toFixed(2)}</span>
                            <span>Monthly: ${cost.monthly.toFixed(2)}</span>
                            <div className="flex gap-1">
                              {number.features?.includes('voice') && (
                                <Badge variant="outline" className="text-xs">Voice</Badge>
                              )}
                              {number.features?.includes('sms') && (
                                <Badge variant="outline" className="text-xs">SMS</Badge>
                              )}
                            </div>
                          </div>
                        </div>
                      </div>
                      <Button
                        onClick={() => purchaseNumberMutation.mutate(number.phone_number)}
                        disabled={purchaseNumberMutation.isPending}
                        className="gap-2"
                      >
                        <Plus className="h-4 w-4" />
                        {purchaseNumberMutation.isPending ? 'Purchasing...' : 'Purchase'}
                      </Button>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {availableNumbers.length === 0 && searchValue && !isSearching && (
            <div className="text-center py-8 text-muted-foreground">
              <Phone className="h-12 w-12 mx-auto mb-4 text-gray-400" />
              <p>No numbers found for your search criteria</p>
              <p className="text-sm">Try different search parameters or contact support for assistance</p>
            </div>
          )}

          {/* Search Help */}
          <div className="bg-blue-50 p-4 rounded-lg">
            <h5 className="font-medium text-blue-800 mb-2">Search Options</h5>
            <div className="grid md:grid-cols-2 gap-4 text-sm text-blue-700">
              <div>
                <strong>City/Region:</strong> Find numbers in specific cities
              </div>
              <div>
                <strong>Area Code:</strong> Search by 3-digit area code
              </div>
              <div>
                <strong>Local Numbers:</strong> Standard geographic numbers
              </div>
              <div>
                <strong>Toll-Free:</strong> 800, 888, 877, 866, 855, 844, 833 numbers
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
