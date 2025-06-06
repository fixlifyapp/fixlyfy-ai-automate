
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

  const isNumberFullyConfigured = (number: OwnedNumber) => {
    return number.configured_at && 
           number.webhook_url && 
           number.webhook_url.includes('sms-receiver') &&
           number.messaging_profile_id;
  };

  return (
    <div className="space-y-6">
      {/* Purchase Numbers Section */}
      <PhoneNumberPurchase />

      {/* Configuration Status */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Settings className="h-5 w-5" />
            Configuration Overview
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid md:grid-cols-2 gap-4">
            <div className="space-y-3">
              <h5 className="font-medium text-blue-600">📞 What Gets Configured</h5>
              <ul className="space-y-1 text-sm">
                <li>• <strong>SMS Messaging:</strong> Two-way text messaging</li>
                <li>• <strong>Voice Calls:</strong> Incoming and outgoing calls</li>
                <li>• <strong>AI Dispatcher:</strong> AI agent answers calls</li>
                <li>• <strong>Webhooks:</strong> Real-time message delivery</li>
              </ul>
            </div>
            <div className="space-y-3">
              <h5 className="font-medium text-green-600">🚀 After Configuration</h5>
              <ul className="space-y-1 text-sm">
                <li>• Customers can text your number</li>
                <li>• You receive SMS in your dashboard</li>
                <li>• AI answers incoming calls 24/7</li>
                <li>• Call transcripts and recordings</li>
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
                Search and purchase a phone number above to get started with AI dispatcher
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
                              Fully Configured
                            </Badge>
                          ) : (
                            <Badge variant="outline" className="text-orange-600">
                              <AlertCircle className="h-3 w-3 mr-1" />
                              Needs Configuration
                            </Badge>
                          )}
                        </div>
                        <div className="text-sm text-muted-foreground mt-1 space-y-1">
                          {number.purchased_at && (
                            <div>Added: {new Date(number.purchased_at).toLocaleDateString()}</div>
                          )}
                          {number.configured_at && (
                            <div>Last configured: {new Date(number.configured_at).toLocaleDateString()}</div>
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
          <CardTitle>Testing Your Setup</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="bg-blue-50 p-4 rounded-lg">
            <h5 className="font-medium text-blue-800 mb-2">🧪 How to Test</h5>
            <ol className="text-sm text-blue-700 space-y-1 list-decimal list-inside">
              <li>Configure your number using the "Setup Full Configuration" button above</li>
              <li><strong>Test SMS:</strong> Send a text message to your configured number</li>
              <li><strong>Test Voice:</strong> Call your number to test the AI dispatcher</li>
              <li>Check the logs in your Supabase dashboard for debugging</li>
            </ol>
          </div>

          <div className="bg-green-50 p-4 rounded-lg">
            <h5 className="font-medium text-green-800 mb-2">✅ What Should Happen</h5>
            <ul className="text-sm text-green-700 space-y-1">
              <li>• SMS messages appear in your Connect → Messages tab</li>
              <li>• Incoming calls are answered by AI dispatcher</li>
              <li>• Call transcripts are logged in the system</li>
              <li>• Customer information is captured automatically</li>
            </ul>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
