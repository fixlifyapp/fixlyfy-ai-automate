
import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Phone, Search, Plus, CheckCircle, Trash2, Star } from "lucide-react";
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
  source: 'telnyx';
}

interface ClaimableNumber {
  phone_number: string;
  status: string;
  user_id: string | null;
  source: 'claimable';
}

export function PhoneNumberPurchase() {
  const [searchAreaCode, setSearchAreaCode] = useState('437');
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

  // Remove test numbers on component mount - only once
  useEffect(() => {
    const hasRemovedTestNumbers = sessionStorage.getItem('test_numbers_removed');
    if (!hasRemovedTestNumbers) {
      removeTestNumbers();
      sessionStorage.setItem('test_numbers_removed', 'true');
    }
  }, []);

  // Remove test numbers mutation
  const removeTestNumbersMutation = useMutation({
    mutationFn: async () => {
      console.log('Removing test numbers from account');
      const { data, error } = await supabase.functions.invoke('telnyx-phone-numbers', {
        body: {
          action: 'remove_test_numbers'
        }
      });

      if (error) {
        console.error('Remove test numbers error:', error);
        throw error;
      }
      return data;
    },
    onSuccess: () => {
      console.log('Test numbers removed successfully');
      queryClient.invalidateQueries({ queryKey: ['telnyx-owned-numbers'] });
      queryClient.invalidateQueries({ queryKey: ['user-telnyx-numbers'] });
      queryClient.invalidateQueries({ queryKey: ['phone-numbers-management'] });
    },
    onError: (error) => {
      console.error('Remove test numbers error:', error);
    }
  });

  const removeTestNumbers = () => {
    removeTestNumbersMutation.mutate();
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

  // Search for available numbers (real Telnyx numbers only)
  const searchNumbers = async () => {
    if (!searchAreaCode) {
      toast.error('Please enter an area code');
      return;
    }

    setIsSearching(true);
    try {
      console.log('Searching for real Telnyx numbers in area code:', searchAreaCode);
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
        toast.info('No numbers found for this area code. Try a different area code.');
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

  return (
    <div className="space-y-6">
      {/* Claim Your Telnyx Number Section */}
      {claimableNumber && (
        <Card className="border-green-200 bg-green-50">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-green-800">
              <Star className="h-5 w-5" />
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
                  <Star className="h-4 w-4" />
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
            If you have other Telnyx numbers, you can add them to your account here.
          </p>
          <AddExistingNumberDialog />
        </CardContent>
      </Card>

      {/* Manual Test Number Removal */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Trash2 className="h-5 w-5" />
            Clean Up Test Numbers
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-muted-foreground">
            Remove any test numbers from your account to keep your phone numbers list clean.
          </p>
          <Button 
            variant="outline" 
            onClick={removeTestNumbers} 
            disabled={removeTestNumbersMutation.isPending}
          >
            <Trash2 className="h-4 w-4 mr-2" />
            {removeTestNumbersMutation.isPending ? 'Removing...' : 'Remove Test Numbers'}
          </Button>
        </CardContent>
      </Card>

      {/* Search Section */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Search className="h-5 w-5" />
            Search & Purchase Telnyx Numbers
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex gap-4">
            <div className="flex-1">
              <Label htmlFor="area-code">Area Code</Label>
              <Input
                id="area-code"
                placeholder="e.g., 437, 212, 310, 555"
                value={searchAreaCode}
                onChange={(e) => setSearchAreaCode(e.target.value)}
              />
              <p className="text-sm text-muted-foreground mt-1">
                Search for real Telnyx phone numbers available for purchase
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
              <h4 className="font-medium">Available Real Numbers ({availableNumbers.length})</h4>
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
                            📞 Real Telnyx Number
                          </Badge>
                        </div>
                        <div className="text-sm text-muted-foreground">
                          <div>
                            {number.region_information?.[0]?.region_name || 'United States'}, {' '}
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

          {availableNumbers.length === 0 && searchAreaCode && !isSearching && (
            <div className="text-center py-8 text-muted-foreground">
              <Phone className="h-12 w-12 mx-auto mb-4 text-gray-400" />
              <p>No numbers found for area code {searchAreaCode}</p>
              <p className="text-sm">Try searching for a different area code (e.g., 212, 310, 555)</p>
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
              <h5 className="font-medium text-green-600">🎁 Claim Your Number</h5>
              <ul className="space-y-1 text-sm">
                <li>• FREE: Claim +14375249932</li>
                <li>• Already under your Telnyx account</li>
                <li>• Automatically set as default</li>
                <li>• Full AI dispatcher ready</li>
              </ul>
            </div>
            <div className="space-y-3">
              <h5 className="font-medium text-purple-600">📱 Add Existing Numbers</h5>
              <ul className="space-y-1 text-sm">
                <li>• Already have other Telnyx numbers?</li>
                <li>• Add them using "Add Existing Number"</li>
                <li>• Connect them to your AI dispatcher</li>
                <li>• Start handling calls immediately</li>
              </ul>
            </div>
            <div className="space-y-3">
              <h5 className="font-medium text-blue-600">📞 Purchase New Numbers</h5>
              <ul className="space-y-1 text-sm">
                <li>• Search real Telnyx phone numbers</li>
                <li>• Purchase directly through Telnyx</li>
                <li>• Automatically added to your account</li>
                <li>• Full SMS, voice, and AI capabilities</li>
              </ul>
            </div>
          </div>

          <div className="bg-blue-50 p-4 rounded-lg">
            <h5 className="font-medium text-blue-800 mb-2">💡 Pro Tip</h5>
            <p className="text-sm text-blue-700">
              Start by claiming your existing Telnyx number (+14375249932) for FREE! 
              This will give you immediate access to the AI dispatcher with your real number.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
