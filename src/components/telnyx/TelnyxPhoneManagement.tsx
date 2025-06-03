
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Phone, Settings, Bot, Plus, CheckCircle, Star, Zap } from 'lucide-react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { formatPhoneForDisplay } from '@/utils/phoneUtils';
import { PhoneNumberPurchase } from '@/components/connect/PhoneNumberPurchase';
import { PhoneConfigDialog } from './PhoneConfigDialog';

interface PhoneNumber {
  id: string;
  phone_number: string;
  status: string;
  user_id?: string;
  ai_dispatcher_enabled?: boolean;
  configured_for_ai?: boolean;
  configured_at?: string;
  monthly_price?: number;
  setup_cost?: number;
  source?: string;
  purchased_at?: string;
  monthly_cost?: number;
}

export const TelnyxPhoneManagement = () => {
  const [selectedNumber, setSelectedNumber] = useState<PhoneNumber | null>(null);
  const [configDialogOpen, setConfigDialogOpen] = useState(false);
  const queryClient = useQueryClient();

  // Fetch phone numbers
  const { data: phoneNumbers = [], isLoading, refetch } = useQuery({
    queryKey: ['telnyx-phone-management'],
    queryFn: async () => {
      console.log('Fetching phone numbers for management...');
      const { data, error } = await supabase.functions.invoke('telnyx-phone-numbers', {
        body: { action: 'list' }
      });

      if (error) {
        console.error('Error fetching phone numbers:', error);
        throw error;
      }
      console.log('Phone numbers for management:', data);
      return data.phone_numbers || [];
    }
  });

  // Toggle AI dispatcher mutation
  const toggleAIMutation = useMutation({
    mutationFn: async ({ phoneNumber, enabled }: { phoneNumber: PhoneNumber; enabled: boolean }) => {
      console.log(`Toggling AI for ${phoneNumber.phone_number} to ${enabled}`);
      
      if (enabled) {
        // Enable AI - configure the number
        const { data, error } = await supabase.functions.invoke('telnyx-phone-numbers', {
          body: {
            action: 'configure',
            phone_number: phoneNumber.phone_number
          }
        });
        if (error) {
          console.error('Configure error:', error);
          throw new Error(error.message || 'Failed to configure AI');
        }
        return data;
      } else {
        // Disable AI - call the manage-ai-dispatcher function
        const { data, error } = await supabase.functions.invoke('manage-ai-dispatcher', {
          body: {
            action: 'disable',
            phoneNumberId: phoneNumber.id
          }
        });
        if (error) {
          console.error('Disable AI error:', error);
          throw new Error(error.message || 'Failed to disable AI');
        }
        return data;
      }
    },
    onSuccess: (data, variables) => {
      const { phoneNumber, enabled } = variables;
      toast.success(
        enabled 
          ? `🤖 AI enabled for ${formatPhoneForDisplay(phoneNumber.phone_number)}` 
          : `🔇 AI disabled for ${formatPhoneForDisplay(phoneNumber.phone_number)}`
      );
      // Refresh the data
      queryClient.invalidateQueries({ queryKey: ['telnyx-phone-management'] });
      refetch();
    },
    onError: (error: any) => {
      console.error('Toggle AI error:', error);
      toast.error(`Failed to update AI settings: ${error.message || 'Unknown error'}`);
    }
  });

  const openConfigDialog = (number: PhoneNumber) => {
    setSelectedNumber(number);
    setConfigDialogOpen(true);
  };

  const formatPhoneNumber = (phone: string) => {
    return formatPhoneForDisplay(phone);
  };

  const isAIEnabled = (number: PhoneNumber) => {
    return number.ai_dispatcher_enabled || number.configured_for_ai || !!number.configured_at;
  };

  const getCostDisplay = (number: PhoneNumber) => {
    const monthlyCost = number.monthly_price || number.monthly_cost || 0;
    const setupCost = number.setup_cost || 0;
    return { monthly: monthlyCost, setup: setupCost };
  };

  return (
    <div className="space-y-6">
      {/* Phone Numbers List */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Phone className="h-5 w-5" />
            Your Phone Numbers ({phoneNumbers.length})
          </CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="text-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 mx-auto"></div>
              <p className="mt-4 text-muted-foreground">Loading your numbers...</p>
            </div>
          ) : phoneNumbers.length === 0 ? (
            <div className="text-center py-8">
              <Phone className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
              <h3 className="text-lg font-medium mb-2">No phone numbers yet</h3>
              <p className="text-muted-foreground mb-4">
                Purchase or add a phone number below to get started
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {phoneNumbers.map((number: PhoneNumber) => {
                const aiEnabled = isAIEnabled(number);
                const isSpecialNumber = number.phone_number === '+14375249932';
                const costs = getCostDisplay(number);
                
                return (
                  <div
                    key={number.id}
                    className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50"
                  >
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <h3 className="font-medium text-lg">
                          {formatPhoneNumber(number.phone_number)}
                        </h3>
                        <Badge variant={number.status === 'active' ? 'default' : 'secondary'}>
                          {number.status}
                        </Badge>
                        {isSpecialNumber && (
                          <Badge className="bg-green-100 text-green-800">
                            <Star className="h-3 w-3 mr-1" />
                            Your Telnyx Number
                          </Badge>
                        )}
                        {number.source === 'telnyx_table' && (
                          <Badge variant="outline" className="text-blue-600">
                            <Zap className="h-3 w-3 mr-1" />
                            Telnyx
                          </Badge>
                        )}
                        {aiEnabled && (
                          <Badge variant="outline" className="text-green-600">
                            <Bot className="h-3 w-3 mr-1" />
                            AI Active
                          </Badge>
                        )}
                      </div>
                      <div className="text-sm text-muted-foreground space-y-1">
                        {number.purchased_at && (
                          <div>Added: {new Date(number.purchased_at).toLocaleDateString()}</div>
                        )}
                        {number.configured_at && (
                          <div>AI Configured: {new Date(number.configured_at).toLocaleDateString()}</div>
                        )}
                        <div>
                          Cost: ${costs.setup.toFixed(2)} setup + ${costs.monthly.toFixed(2)}/month
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-4">
                      {/* AI Toggle */}
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-medium">AI Agent</span>
                        <Switch
                          checked={aiEnabled}
                          onCheckedChange={(checked) => 
                            toggleAIMutation.mutate({ phoneNumber: number, enabled: checked })
                          }
                          disabled={toggleAIMutation.isPending}
                        />
                      </div>
                      
                      {/* Configure Button */}
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => openConfigDialog(number)}
                        className="gap-2"
                      >
                        <Settings className="h-4 w-4" />
                        Configure
                      </Button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Purchase Section */}
      <PhoneNumberPurchase />

      {/* Configuration Dialog */}
      <PhoneConfigDialog
        phoneNumber={selectedNumber}
        open={configDialogOpen}
        onOpenChange={setConfigDialogOpen}
        onSave={() => {
          queryClient.invalidateQueries({ queryKey: ['telnyx-phone-management'] });
          refetch();
        }}
      />
    </div>
  );
};
