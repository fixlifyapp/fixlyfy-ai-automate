
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Phone, Search, Plus, Settings, CheckCircle } from 'lucide-react';
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
}

export function TelnyxPhoneNumbersPage() {
  const [searchAreaCode, setSearchAreaCode] = useState('');
  const [availableNumbers, setAvailableNumbers] = useState<AvailableNumber[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const queryClient = useQueryClient();

  // Fetch owned numbers
  const { data: ownedNumbers = [], isLoading: isLoadingOwned } = useQuery({
    queryKey: ['telnyx-owned-numbers'],
    queryFn: async () => {
      const { data, error } = await supabase.functions.invoke('telnyx-phone-numbers', {
        body: { action: 'list' }
      });

      if (error) throw error;
      return data.phone_numbers || [];
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
      const { data, error } = await supabase.functions.invoke('telnyx-phone-numbers', {
        body: {
          action: 'search',
          area_code: searchAreaCode,
          country_code: 'US'
        }
      });

      if (error) throw error;
      setAvailableNumbers(data.available_numbers || []);
      toast.success(`Found ${data.available_numbers?.length || 0} available numbers`);
    } catch (error) {
      console.error('Search error:', error);
      toast.error('Failed to search for numbers');
    } finally {
      setIsSearching(false);
    }
  };

  // Purchase number mutation
  const purchaseNumberMutation = useMutation({
    mutationFn: async (phoneNumber: string) => {
      const { data, error } = await supabase.functions.invoke('telnyx-phone-numbers', {
        body: {
          action: 'purchase',
          phone_number: phoneNumber,
          country_code: 'US'
        }
      });

      if (error) throw error;
      return data;
    },
    onSuccess: (data) => {
      toast.success(`Successfully ordered ${data.phone_number}`);
      queryClient.invalidateQueries({ queryKey: ['telnyx-owned-numbers'] });
      setAvailableNumbers(prev => prev.filter(num => num.phone_number !== data.phone_number));
    },
    onError: (error) => {
      console.error('Purchase error:', error);
      toast.error('Failed to purchase number');
    }
  });

  // Configure number mutation
  const configureNumberMutation = useMutation({
    mutationFn: async (phoneNumber: string) => {
      const { data, error } = await supabase.functions.invoke('telnyx-phone-numbers', {
        body: {
          action: 'configure',
          phone_number: phoneNumber
        }
      });

      if (error) throw error;
      return data;
    },
    onSuccess: (data) => {
      toast.success('Number configured for AI calls');
      queryClient.invalidateQueries({ queryKey: ['telnyx-owned-numbers'] });
    },
    onError: (error) => {
      console.error('Configure error:', error);
      toast.error('Failed to configure number');
    }
  });

  return (
    <div className="space-y-6">
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
            Your Telnyx Numbers
          </CardTitle>
        </CardHeader>
        <CardContent>
          {isLoadingOwned ? (
            <p>Loading your numbers...</p>
          ) : ownedNumbers.length === 0 ? (
            <div className="text-center py-8">
              <Phone className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
              <h3 className="text-lg font-medium mb-2">No phone numbers yet</h3>
              <p className="text-muted-foreground mb-4">
                Search and purchase a Telnyx number to get started with AI calls
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
                        <span>Purchased: {new Date(number.purchased_at).toLocaleDateString()}</span>
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

      {/* Instructions */}
      <Card>
        <CardHeader>
          <CardTitle>Setup Instructions</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <h4 className="font-medium">1. Search & Purchase</h4>
            <p className="text-sm text-muted-foreground">
              Enter an area code to search for available Telnyx phone numbers and purchase one.
            </p>
          </div>
          
          <div className="space-y-2">
            <h4 className="font-medium">2. Configure for AI</h4>
            <p className="text-sm text-muted-foreground">
              After purchasing, click "Configure AI" to set up the number for incoming calls with AI dispatcher.
            </p>
          </div>
          
          <div className="space-y-2">
            <h4 className="font-medium">3. Test Your Setup</h4>
            <p className="text-sm text-muted-foreground">
              Once configured, you can call your Telnyx number to test the AI dispatcher system.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
