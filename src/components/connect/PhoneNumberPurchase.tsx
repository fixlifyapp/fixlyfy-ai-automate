import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Phone, Search, Plus, Settings, CheckCircle, PhoneCall } from "lucide-react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { formatPhoneForDisplay } from "@/utils/phoneUtils";
import { AddExistingNumberDialog } from "@/components/telnyx/AddExistingNumberDialog";

interface AvailableNumber {
  phone_number: string;
  region_information: any;
  features: string[];
  cost_information: any;
  source?: 'local' | 'telnyx';
}

export function PhoneNumberPurchase() {
  const [searchAreaCode, setSearchAreaCode] = useState('437'); // Default to test area code
  const [availableNumbers, setAvailableNumbers] = useState<AvailableNumber[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const queryClient = useQueryClient();

  // Add Existing Number Section
  const [isAddExistingNumberDialogOpen, setIsAddExistingNumberDialogOpen] = useState(false);

  // Search for available numbers
  const searchNumbers = async () => {
    if (!searchAreaCode) {
      toast.error('Please enter an area code');
      return;
    }

    setIsSearching(true);
    try {
      console.log('Searching for numbers in area code:', searchAreaCode);
      const { data, error } = await supabase.functions.invoke('telnyx-phone-numbers', {
        body: {
          action: 'search',
          area_code: searchAreaCode,
          country_code: 'US'
        }
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
        toast.info('No numbers found for this area code');
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
          country_code: 'US'
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
      if (data.type === 'test') {
        toast.success(`🎉 Test number ${data.phone_number} purchased successfully! (Free for testing)`);
      } else {
        toast.success(`📞 Number ${data.phone_number} ordered successfully!`);
      }
      
      // Refresh the phone numbers list
      queryClient.invalidateQueries({ queryKey: ['telnyx-owned-numbers'] });
      queryClient.invalidateQueries({ queryKey: ['user-telnyx-numbers'] });
      
      // Remove the purchased number from available list
      setAvailableNumbers(prev => prev.filter(num => num.phone_number !== data.phone_number));
    },
    onError: (error) => {
      console.error('Purchase error:', error);
      toast.error(`Failed to purchase number: ${error.message}`);
    }
  });

  const getCostDisplay = (number: AvailableNumber) => {
    if (number.source === 'local') {
      return {
        setup: number.cost_information?.setup_cost || 0,
        monthly: number.cost_information?.monthly_cost || 0
      };
    }
    
    return {
      setup: number.cost_information?.upfront_cost || 1.00,
      monthly: number.cost_information?.monthly_cost || 1.00
    };
  };

  const getNumberType = (number: AvailableNumber) => {
    if (number.source === 'local') {
      return { type: 'test', color: 'bg-green-100 text-green-800' };
    }
    return { type: 'real', color: 'bg-blue-100 text-blue-800' };
  };

  return (
    <div className="space-y-6">
      {/* Add Existing Number Section */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Plus className="h-5 w-5" />
            Already Have a Telnyx Number?
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-muted-foreground">
            If you already purchased a Telnyx number, you can add it to your account here.
          </p>
          <AddExistingNumberDialog />
        </CardContent>
      </Card>

      {/* Search Section */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Search className="h-5 w-5" />
            Search Available Numbers
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex gap-4">
            <div className="flex-1">
              <Label htmlFor="area-code">Area Code</Label>
              <Input
                id="area-code"
                placeholder="e.g., 437, 212, 310"
                value={searchAreaCode}
                onChange={(e) => setSearchAreaCode(e.target.value)}
              />
              <p className="text-sm text-muted-foreground mt-1">
                Try "437" to see the test number available for $0
              </p>
            </div>
            <div className="flex items-end">
              <Button onClick={searchNumbers} disabled={isSearching}>
                {isSearching ? 'Searching...' : 'Search'}
              </Button>
            </div>
          </div>

          {availableNumbers.length > 0 && (
            <div className="space-y-3">
              <h4 className="font-medium">Available Numbers ({availableNumbers.length})</h4>
              <div className="grid grid-cols-1 gap-3">
                {availableNumbers.map((number) => {
                  const cost = getCostDisplay(number);
                  const numberType = getNumberType(number);
                  
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
                          <Badge className={numberType.color}>
                            {numberType.type === 'test' ? '🧪 Test Number' : '📞 Real Number'}
                          </Badge>
                          {cost.setup === 0 && cost.monthly === 0 && (
                            <Badge variant="outline" className="text-green-600">
                              FREE
                            </Badge>
                          )}
                        </div>
                        <div className="text-sm text-muted-foreground">
                          <div>
                            {number.region_information?.[0]?.region_name || 'Canada'}, {' '}
                            {number.region_information?.[0]?.rate_center || 'Toronto Area'}
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
                        {purchaseNumberMutation.isPending ? 'Purchasing...' : 
                         cost.setup === 0 && cost.monthly === 0 ? 'Get Free' : 'Purchase'}
                      </Button>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {availableNumbers.length === 0 && searchAreaCode && !isSearching && (
            <div className="text-center py-8 text-muted-foreground">
              <Phone className="h-12 w-12 mx-auto mb-4 text-gray-400" />
              <p>No numbers found for area code {searchAreaCode}</p>
              <p className="text-sm">Try searching for a different area code</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Instructions */}
      <Card>
        <CardHeader>
          <CardTitle>How It Works</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid md:grid-cols-3 gap-4">
            <div className="space-y-3">
              <h5 className="font-medium text-purple-600">📱 Existing Numbers</h5>
              <ul className="space-y-1 text-sm">
                <li>• Already have a Telnyx number?</li>
                <li>• Add it using "Add Existing Number"</li>
                <li>• Connect it to your AI dispatcher</li>
                <li>• Start handling calls immediately</li>
              </ul>
            </div>
            <div className="space-y-3">
              <h5 className="font-medium text-green-600">🧪 Test Numbers</h5>
              <ul className="space-y-1 text-sm">
                <li>• Free to use ($0 setup and monthly)</li>
                <li>• Perfect for testing the platform</li>
                <li>• Available in area code 437</li>
                <li>• Automatically assigned to your account</li>
              </ul>
            </div>
            <div className="space-y-3">
              <h5 className="font-medium text-blue-600">📞 Real Numbers</h5>
              <ul className="space-y-1 text-sm">
                <li>• Live Telnyx phone numbers</li>
                <li>• $1-2 setup + $1/month typically</li>
                <li>• Ready for production use</li>
                <li>• Full SMS and voice capabilities</li>
              </ul>
            </div>
          </div>

          <div className="bg-purple-50 p-4 rounded-lg">
            <h5 className="font-medium text-purple-800 mb-2">💡 Pro Tip</h5>
            <p className="text-sm text-purple-700">
              If you already bought a Telnyx number (+14375249932), use "Add Existing Number" above to connect it to your account. This will give you full control over your real number with AI dispatcher capabilities.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
