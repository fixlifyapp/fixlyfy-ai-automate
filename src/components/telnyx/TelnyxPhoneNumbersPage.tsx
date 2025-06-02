
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Phone, Search, Plus, Settings, CheckCircle, PhoneCall, AlertCircle } from 'lucide-react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

interface AvailableNumber {
  phone_number: string;
  region_information: any;
  features: string[];
  cost_information: any;
}

interface OwnedNumber {
  id: string;
  phone_number: string;
  status: string;
  country_code: string;
  area_code?: string;
  purchased_at?: string;
  configured_at?: string;
  webhook_url?: string;
  user_id?: string;
}

export function TelnyxPhoneNumbersPage() {
  const [searchAreaCode, setSearchAreaCode] = useState('');
  const [availableNumbers, setAvailableNumbers] = useState<AvailableNumber[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const queryClient = useQueryClient();

  // Get current user
  const { data: user } = useQuery({
    queryKey: ['current-user'],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      return user;
    }
  });

  // Fetch owned numbers
  const { data: ownedNumbers = [], isLoading: isLoadingOwned } = useQuery({
    queryKey: ['telnyx-owned-numbers'],
    queryFn: async () => {
      try {
        console.log('Fetching owned numbers...');
        const { data, error } = await supabase.functions.invoke('telnyx-phone-numbers', {
          body: { action: 'list' }
        });

        if (error) {
          console.error('Error fetching owned numbers:', error);
          throw error;
        }
        console.log('Owned numbers:', data);
        return data.phone_numbers || [];
      } catch (error) {
        console.error('Failed to fetch owned numbers:', error);
        return [];
      }
    }
  });

  // Add existing number mutation - specifically for +14375249932
  const addExistingNumberMutation = useMutation({
    mutationFn: async () => {
      console.log('Adding existing number +14375249932...');
      const { data, error } = await supabase.functions.invoke('telnyx-phone-numbers', {
        body: {
          action: 'add_existing',
          phone_number: '+14375249932',
          country_code: 'US'
        }
      });

      if (error) {
        console.error('Error adding existing number:', error);
        throw error;
      }
      console.log('Add existing number response:', data);
      return data;
    },
    onSuccess: (data) => {
      console.log('Successfully added number:', data);
      toast.success('Your number +1-437-524-9932 has been added successfully!');
      queryClient.invalidateQueries({ queryKey: ['telnyx-owned-numbers'] });
    },
    onError: (error) => {
      console.error('Add existing number error:', error);
      toast.error(`Failed to add existing number: ${error.message}`);
    }
  });

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
      toast.success(`Found ${data.available_numbers?.length || 0} available numbers`);
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
      toast.success(`Successfully ordered ${data.phone_number}`);
      queryClient.invalidateQueries({ queryKey: ['telnyx-owned-numbers'] });
      setAvailableNumbers(prev => prev.filter(num => num.phone_number !== data.phone_number));
    },
    onError: (error) => {
      console.error('Purchase error:', error);
      toast.error(`Failed to purchase number: ${error.message}`);
    }
  });

  // Configure number mutation
  const configureNumberMutation = useMutation({
    mutationFn: async (phoneNumber: string) => {
      console.log('Configuring number:', phoneNumber);
      const { data, error } = await supabase.functions.invoke('telnyx-phone-numbers', {
        body: {
          action: 'configure',
          phone_number: phoneNumber
        }
      });

      if (error) {
        console.error('Configure error:', error);
        throw error;
      }
      console.log('Configure response:', data);
      return data;
    },
    onSuccess: (data) => {
      console.log('Successfully configured:', data);
      toast.success('Number configured for AI calls');
      queryClient.invalidateQueries({ queryKey: ['telnyx-owned-numbers'] });
    },
    onError: (error) => {
      console.error('Configure error:', error);
      toast.error(`Failed to configure number: ${error.message}`);
    }
  });

  // Check if the specific number exists
  const hasExistingNumber = ownedNumbers.some((num: OwnedNumber) => 
    num.phone_number === '+14375249932' || num.phone_number === '14375249932'
  );

  return (
    <div className="space-y-6">
      {/* Add Existing Number Section */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <PhoneCall className="h-5 w-5" />
            Add Your Existing Number
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className={`flex items-center justify-between p-4 rounded-lg ${hasExistingNumber ? 'bg-green-50' : 'bg-blue-50'}`}>
            <div>
              <p className="font-medium">Your Telnyx Number: +1-437-524-9932</p>
              <p className="text-sm text-muted-foreground">
                {hasExistingNumber 
                  ? 'This number is already in your account and ready for AI dispatcher'
                  : 'Add this number to your account to start using AI dispatcher'
                }
              </p>
            </div>
            {hasExistingNumber ? (
              <Badge variant="outline" className="text-green-600">
                <CheckCircle className="h-3 w-3 mr-1" />
                Added
              </Badge>
            ) : (
              <Button
                onClick={() => addExistingNumberMutation.mutate()}
                disabled={addExistingNumberMutation.isPending}
              >
                {addExistingNumberMutation.isPending ? 'Adding...' : 'Add to Account'}
              </Button>
            )}
          </div>
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
                placeholder="e.g., 415, 212, 310"
                value={searchAreaCode}
                onChange={(e) => setSearchAreaCode(e.target.value)}
              />
            </div>
            <div className="flex items-end">
              <Button onClick={searchNumbers} disabled={isSearching}>
                {isSearching ? 'Searching...' : 'Search'}
              </Button>
            </div>
          </div>

          {availableNumbers.length > 0 && (
            <div className="space-y-2">
              <h4 className="font-medium">Available Numbers</h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                {availableNumbers.map((number) => (
                  <div
                    key={number.phone_number}
                    className="flex items-center justify-between p-3 border rounded-lg"
                  >
                    <div>
                      <p className="font-medium">{number.phone_number}</p>
                      <p className="text-sm text-muted-foreground">
                        {number.region_information?.[0]?.region_name}, {number.region_information?.[0]?.rate_center}
                      </p>
                    </div>
                    <Button
                      size="sm"
                      onClick={() => purchaseNumberMutation.mutate(number.phone_number)}
                      disabled={purchaseNumberMutation.isPending}
                    >
                      <Plus className="h-4 w-4 mr-1" />
                      Order
                    </Button>
                  </div>
                ))}
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Owned Numbers */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Phone className="h-5 w-5" />
            Your Telnyx Numbers ({ownedNumbers.length})
          </CardTitle>
        </CardHeader>
        <CardContent>
          {isLoadingOwned ? (
            <div className="text-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 mx-auto"></div>
              <p className="mt-4 text-muted-foreground">Loading your numbers...</p>
            </div>
          ) : ownedNumbers.length === 0 ? (
            <div className="text-center py-8">
              <Phone className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
              <h3 className="text-lg font-medium mb-2">No phone numbers yet</h3>
              <p className="text-muted-foreground mb-4">
                Add your existing number or search and purchase a new Telnyx number to get started
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {ownedNumbers.map((number: OwnedNumber) => (
                <div
                  key={number.id}
                  className="flex items-center justify-between p-4 border rounded-lg"
                >
                  <div className="flex-1">
                    <div className="flex items-center gap-3">
                      <h3 className="font-medium">{number.phone_number}</h3>
                      <Badge variant={number.status === 'active' ? 'default' : 'secondary'}>
                        {number.status}
                      </Badge>
                    </div>
                    <div className="text-sm text-muted-foreground mt-1">
                      {number.purchased_at && (
                        <span>Added: {new Date(number.purchased_at).toLocaleDateString()}</span>
                      )}
                      {number.configured_at && (
                        <span className="ml-4">
                          Configured: {new Date(number.configured_at).toLocaleDateString()}
                        </span>
                      )}
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    {number.configured_at ? (
                      <Badge variant="outline" className="text-green-600">
                        <CheckCircle className="h-3 w-3 mr-1" />
                        AI Ready
                      </Badge>
                    ) : (
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => configureNumberMutation.mutate(number.phone_number)}
                        disabled={configureNumberMutation.isPending}
                      >
                        <Settings className="h-4 w-4 mr-1" />
                        Configure AI
                      </Button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Telnyx Configuration Status */}
      <Card>
        <CardHeader>
          <CardTitle>Telnyx Configuration Status</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              {hasExistingNumber ? (
                <CheckCircle className="h-4 w-4 text-green-600" />
              ) : (
                <AlertCircle className="h-4 w-4 text-yellow-600" />
              )}
              <span className="font-medium">1. Phone Number Added</span>
            </div>
            
            <div className="flex items-center gap-2">
              <AlertCircle className="h-4 w-4 text-yellow-600" />
              <span className="font-medium">2. Webhook Configuration</span>
            </div>
            
            <div className="bg-yellow-50 p-4 rounded-lg">
              <h5 className="font-medium text-yellow-800 mb-2">⚠️ Manual Telnyx Setup Required</h5>
              <p className="text-sm text-yellow-700 mb-3">
                To complete the setup, you need to configure webhooks in your Telnyx dashboard:
              </p>
              <ol className="text-sm text-yellow-700 space-y-1">
                <li>1. Go to your Telnyx Dashboard → Call Control Applications</li>
                <li>2. Create or edit your Call Control App</li>
                <li>3. Set Webhook URL to: <code className="bg-yellow-100 px-1 rounded">https://mqppvcrlvsgrsqelglod.supabase.co/functions/v1/telnyx-voice-webhook</code></li>
                <li>4. Associate your number (+1-437-524-9932) with this app</li>
                <li>5. Test by calling your number</li>
              </ol>
            </div>

            <div className="bg-blue-50 p-4 rounded-lg">
              <h5 className="font-medium text-blue-800 mb-2">🧪 Testing</h5>
              <p className="text-sm text-blue-700">
                Once configured, test your AI dispatcher by calling +1-437-524-9932. 
                Calls should appear in the "Call History" tab.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
