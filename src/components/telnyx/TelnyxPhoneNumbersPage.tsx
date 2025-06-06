import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Phone, Settings, CheckCircle, AlertCircle } from 'lucide-react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { PhoneNumberPurchase } from '../connect/PhoneNumberPurchase';
import { TelnyxPhoneConfiguration } from './TelnyxPhoneConfiguration';
import { formatPhoneForDisplay } from '@/utils/phoneUtils';

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
  monthly_cost?: number;
  setup_cost?: number;
  messaging_profile_id?: string;
}

export function TelnyxPhoneNumbersPage() {
  const queryClient = useQueryClient();

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

  // Auto-setup mutation for new numbers
  const autoSetupMutation = useMutation({
    mutationFn: async (phoneNumber: string) => {
      console.log('Auto-setting up configuration for:', phoneNumber);
      const { data, error } = await supabase.functions.invoke('telnyx-messaging-profile', {
        body: {
          action: 'setup_full_configuration',
          phone_number: phoneNumber
        }
      });

      if (error) {
        console.error('Auto-configuration error:', error);
        throw error;
      }
      
      console.log('Auto-configuration response:', data);
      return data;
    },
    onSuccess: (data, phoneNumber) => {
      console.log('Successfully auto-configured:', data);
      toast.success(`Phone number ${phoneNumber} automatically configured for SMS + Voice + AI`);
      queryClient.invalidateQueries({ queryKey: ['telnyx-owned-numbers'] });
    },
    onError: (error, phoneNumber) => {
      console.error('Auto-configuration error:', error);
      toast.error(`Failed to auto-configure ${phoneNumber}: ${error.message}`);
    }
  });

  const isNumberFullyConfigured = (number: OwnedNumber): boolean => {
    return !!(number.configured_at && 
           number.webhook_url && 
           number.webhook_url.includes('sms-receiver') &&
           number.messaging_profile_id);
  };

  // Auto-setup unconfigured numbers
  React.useEffect(() => {
    if (ownedNumbers.length > 0) {
      ownedNumbers.forEach((number: OwnedNumber) => {
        const isConfigured = isNumberFullyConfigured(number);
        if (!isConfigured && !autoSetupMutation.isPending) {
          console.log('Auto-configuring unconfigured number:', number.phone_number);
          autoSetupMutation.mutate(number.phone_number);
        }
      });
    }
  }, [ownedNumbers]);

  return (
    <div className="space-y-6">
      {/* Purchase Numbers Section */}
      <PhoneNumberPurchase />

      {/* Configuration Status */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Settings className="h-5 w-5" />
            Automatic Configuration Status
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid md:grid-cols-2 gap-4">
            <div className="space-y-3">
              <h5 className="font-medium text-blue-600">🤖 Automatic Setup</h5>
              <ul className="space-y-1 text-sm">
                <li>• <strong>SMS Messaging:</strong> Auto-configured for two-way texts</li>
                <li>• <strong>Voice Calls:</strong> Auto-configured for incoming/outgoing</li>
                <li>• <strong>AI Dispatcher:</strong> Auto-enabled to answer calls</li>
                <li>• <strong>Webhooks:</strong> Auto-configured for real-time delivery</li>
              </ul>
            </div>
            <div className="space-y-3">
              <h5 className="font-medium text-green-600">🚀 Ready to Use</h5>
              <ul className="space-y-1 text-sm">
                <li>• No manual setup required</li>
                <li>• Works immediately after purchase</li>
                <li>• AI answers calls automatically 24/7</li>
                <li>• SMS and calls are logged in dashboard</li>
              </ul>
            </div>
          </div>
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
                Search and purchase a phone number above - it will be automatically configured for AI dispatcher
              </p>
            </div>
          ) : (
            <div className="space-y-6">
              {ownedNumbers.map((number: OwnedNumber) => {
                const isConfigured = isNumberFullyConfigured(number);
                
                return (
                  <div key={number.id}>
                    <div className="flex items-center justify-between p-4 border rounded-lg mb-4">
                      <div className="flex-1">
                        <div className="flex items-center gap-3">
                          <h3 className="font-medium text-lg">
                            {formatPhoneForDisplay(number.phone_number)}
                          </h3>
                          <Badge variant={number.status === 'active' ? 'default' : 'secondary'}>
                            {number.status}
                          </Badge>
                          {(number.monthly_cost === 0 && number.setup_cost === 0) && (
                            <Badge variant="outline" className="text-green-600">
                              🧪 Test Number
                            </Badge>
                          )}
                          {isConfigured ? (
                            <Badge variant="outline" className="text-green-600">
                              <CheckCircle className="h-3 w-3 mr-1" />
                              Auto-Configured ✅
                            </Badge>
                          ) : (
                            <Badge variant="outline" className="text-orange-600">
                              <AlertCircle className="h-3 w-3 mr-1" />
                              {autoSetupMutation.isPending ? 'Auto-Configuring...' : 'Configuring...'}
                            </Badge>
                          )}
                        </div>
                        <div className="text-sm text-muted-foreground mt-1 space-y-1">
                          {number.purchased_at && (
                            <div>Added: {new Date(number.purchased_at).toLocaleDateString()}</div>
                          )}
                          {number.configured_at && (
                            <div>Auto-configured: {new Date(number.configured_at).toLocaleDateString()}</div>
                          )}
                          {(number.monthly_cost !== undefined && number.setup_cost !== undefined) && (
                            <div>
                              Cost: ${number.setup_cost} setup + ${number.monthly_cost}/month
                              {number.monthly_cost === 0 && number.setup_cost === 0 && ' (Free!)'}
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                    
                    {/* Configuration Component */}
                    <TelnyxPhoneConfiguration 
                      phoneNumber={number.phone_number}
                      isConfigured={isConfigured}
                    />
                  </div>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Help Section */}
      <Card>
        <CardHeader>
          <CardTitle>Testing Your Auto-Configured System</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="bg-blue-50 p-4 rounded-lg">
            <h5 className="font-medium text-blue-800 mb-2">🧪 How to Test</h5>
            <ol className="text-sm text-blue-700 space-y-1 list-decimal list-inside">
              <li>Your numbers are automatically configured when purchased</li>
              <li><strong>Test SMS:</strong> Send a text message to your number</li>
              <li><strong>Test Voice:</strong> Call your number to test the AI dispatcher</li>
              <li>Check the logs in your Supabase dashboard for debugging</li>
            </ol>
          </div>

          <div className="bg-green-50 p-4 rounded-lg">
            <h5 className="font-medium text-green-800 mb-2">✅ What Should Happen Automatically</h5>
            <ul className="text-sm text-green-700 space-y-1">
              <li>• SMS messages appear in your Connect → Messages tab</li>
              <li>• Incoming calls are answered by AI dispatcher immediately</li>
              <li>• Call transcripts are logged automatically</li>
              <li>• Customer information is captured without manual setup</li>
            </ul>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
