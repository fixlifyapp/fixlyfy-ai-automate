
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Phone, Search, ShoppingCart, Check, MapPin } from 'lucide-react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { PhoneNumberPlan, TelnyxNumber } from '@/types/phone';
import { toast } from '@/hooks/use-toast';

export const PurchaseNumbers = () => {
  const [searchAreaCode, setSearchAreaCode] = useState('');
  const [selectedPlan, setSelectedPlan] = useState<string>('');
  const [availableNumbers, setAvailableNumbers] = useState<TelnyxNumber[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const queryClient = useQueryClient();

  const { data: plans = [] } = useQuery({
    queryKey: ['phone-number-plans'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('phone_number_plans')
        .select('*')
        .eq('is_active', true)
        .order('price_per_number');

      if (error) throw error;
      return data as PhoneNumberPlan[];
    }
  });

  const { data: companySettings } = useQuery({
    queryKey: ['company-settings'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('company_settings')
        .select('phone_number_limit, phone_numbers_used')
        .single();

      if (error) throw error;
      return data;
    }
  });

  const searchNumbers = useMutation({
    mutationFn: async ({ areaCode }: { areaCode: string }) => {
      setIsSearching(true);
      const { data, error } = await supabase.functions.invoke('phone-number-reseller', {
        body: {
          action: 'search',
          area_code: areaCode,
          country_code: 'US'
        }
      });

      if (error) throw error;
      return data.available_numbers || [];
    },
    onSuccess: (data) => {
      setAvailableNumbers(data);
      setIsSearching(false);
    },
    onError: (error) => {
      console.error('Error searching numbers:', error);
      setIsSearching(false);
      toast({
        title: "Search Error",
        description: "Failed to search for available numbers. Please try again.",
        variant: "destructive"
      });
    }
  });

  const purchaseNumber = useMutation({
    mutationFn: async ({ phoneNumber, planId }: { phoneNumber: string; planId: string }) => {
      const { data, error } = await supabase.functions.invoke('phone-number-reseller', {
        body: {
          action: 'purchase',
          phone_number: phoneNumber,
          plan_id: planId
        }
      });

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['phone-number-assignments'] });
      queryClient.invalidateQueries({ queryKey: ['company-settings'] });
      toast({
        title: "Number Purchased!",
        description: "Your phone number has been purchased and assigned to your account.",
      });
      setAvailableNumbers([]);
      setSearchAreaCode('');
    },
    onError: (error) => {
      console.error('Error purchasing number:', error);
      toast({
        title: "Purchase Error",
        description: "Failed to purchase phone number. Please try again.",
        variant: "destructive"
      });
    }
  });

  const handleSearch = () => {
    if (!searchAreaCode || searchAreaCode.length !== 3) {
      toast({
        title: "Invalid Area Code",
        description: "Please enter a valid 3-digit area code.",
        variant: "destructive"
      });
      return;
    }
    searchNumbers.mutate({ areaCode: searchAreaCode });
  };

  const handlePurchase = (phoneNumber: string) => {
    if (!selectedPlan) {
      toast({
        title: "Select a Plan",
        description: "Please select a plan before purchasing.",
        variant: "destructive"
      });
      return;
    }

    const remainingSlots = (companySettings?.phone_number_limit || 10) - (companySettings?.phone_numbers_used || 0);
    if (remainingSlots <= 0) {
      toast({
        title: "Number Limit Reached",
        description: "You have reached your phone number limit. Please upgrade your plan.",
        variant: "destructive"
      });
      return;
    }

    purchaseNumber.mutate({ phoneNumber, planId: selectedPlan });
  };

  const formatPhoneNumber = (phone: string) => {
    return phone.replace(/^\+1/, '').replace(/(\d{3})(\d{3})(\d{4})/, '($1) $2-$3');
  };

  const remainingSlots = (companySettings?.phone_number_limit || 10) - (companySettings?.phone_numbers_used || 0);

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <ShoppingCart className="h-5 w-5" />
            Purchase Phone Numbers
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="bg-blue-50 p-4 rounded-lg">
            <h4 className="font-medium text-blue-800 mb-2">Account Status</h4>
            <p className="text-sm text-blue-700">
              You can purchase up to {remainingSlots} more phone numbers on your current plan.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-4">
            {plans.map((plan) => (
              <Card 
                key={plan.id} 
                className={`cursor-pointer transition-all ${
                  selectedPlan === plan.id ? 'ring-2 ring-blue-500 bg-blue-50' : 'hover:shadow-md'
                }`}
                onClick={() => setSelectedPlan(plan.id)}
              >
                <CardHeader className="pb-2">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-lg">{plan.name}</CardTitle>
                    {selectedPlan === plan.id && <Check className="h-5 w-5 text-blue-600" />}
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    <div className="text-2xl font-bold">
                      ${plan.price_per_number}
                      <span className="text-sm font-normal text-gray-600">/number</span>
                    </div>
                    <div className="text-sm text-gray-600">
                      ${plan.monthly_fee}/month per number
                    </div>
                    {plan.setup_fee > 0 && (
                      <div className="text-sm text-gray-600">
                        ${plan.setup_fee} setup fee
                      </div>
                    )}
                    <p className="text-sm text-gray-700">{plan.description}</p>
                    <div className="space-y-1">
                      {plan.features.sms && <Badge variant="outline" className="text-xs">SMS</Badge>}
                      {plan.features.voice && <Badge variant="outline" className="text-xs">Voice</Badge>}
                      {plan.features.ai_dispatcher && <Badge variant="outline" className="text-xs">AI Dispatcher</Badge>}
                      {plan.features.call_recording && <Badge variant="outline" className="text-xs">Call Recording</Badge>}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          <div className="space-y-4">
            <div className="flex gap-4">
              <div className="flex-1">
                <Label htmlFor="area_code">Area Code</Label>
                <Input
                  id="area_code"
                  value={searchAreaCode}
                  onChange={(e) => setSearchAreaCode(e.target.value.replace(/\D/g, '').slice(0, 3))}
                  placeholder="e.g., 415, 212, 305"
                  maxLength={3}
                />
              </div>
              <div className="flex items-end">
                <Button 
                  onClick={handleSearch}
                  disabled={isSearching || !selectedPlan}
                  className="min-w-[120px]"
                >
                  <Search className="h-4 w-4 mr-2" />
                  {isSearching ? 'Searching...' : 'Search'}
                </Button>
              </div>
            </div>

            {availableNumbers.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Available Numbers ({availableNumbers.length})</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {availableNumbers.map((number) => (
                      <div key={number.phone_number} className="flex items-center justify-between p-3 border rounded-lg">
                        <div className="flex items-center gap-3">
                          <Phone className="h-5 w-5 text-gray-400" />
                          <div>
                            <span className="font-semibold">
                              {formatPhoneNumber(number.phone_number)}
                            </span>
                            {number.region_information?.region_name && (
                              <div className="flex items-center gap-1 text-sm text-gray-600">
                                <MapPin className="h-3 w-3" />
                                <span>{number.region_information.region_name}</span>
                              </div>
                            )}
                          </div>
                        </div>
                        <div className="flex items-center gap-3">
                          {number.cost_information?.monthly_cost && (
                            <span className="text-sm text-gray-600">
                              ${number.cost_information.monthly_cost}/month
                            </span>
                          )}
                          <Button 
                            size="sm"
                            onClick={() => handlePurchase(number.phone_number)}
                            disabled={purchaseNumber.isPending || remainingSlots <= 0}
                          >
                            <ShoppingCart className="h-4 w-4 mr-2" />
                            Purchase
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
