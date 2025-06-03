import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Phone, Plus, Settings, Trash2, Zap, Bot, ExternalLink } from 'lucide-react';
import { toast } from 'sonner';
import { PhoneNumberPurchase } from './PhoneNumberPurchase';
import { SetupAIDispatcher } from './SetupAIDispatcher';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';

export const PhoneNumbersList = () => {
  const [showPurchase, setShowPurchase] = useState(false);
  const [selectedNumber, setSelectedNumber] = useState<any>(null);
  const [showAISetup, setShowAISetup] = useState(false);
  const queryClient = useQueryClient();

  const { data: allNumbers = [], isLoading } = useQuery({
    queryKey: ['phone-numbers'],
    queryFn: async () => {
      const { data, error } = await supabase.functions.invoke('telnyx-phone-numbers', {
        body: { action: 'list' }
      });

      if (error) throw error;
      return data.phone_numbers || [];
    }
  });

  const { data: telnyxConfig } = useQuery({
    queryKey: ['telnyx-config'],
    queryFn: async () => {
      const { data, error } = await supabase.functions.invoke('telnyx-phone-numbers', {
        body: { action: 'get_config' }
      });

      if (error) throw error;
      return data.config;
    }
  });

  const removeNumber = useMutation(
    async (phoneNumber: string) => {
      const { data, error } = await supabase.functions.invoke('telnyx-phone-numbers', {
        body: { action: 'remove', phone_number: phoneNumber }
      });

      if (error) throw error;
      return data;
    },
    {
      onSuccess: () => {
        toast.success('Phone number removed successfully');
        queryClient.invalidateQueries({ queryKey: ['phone-numbers'] });
      },
      onError: (error: any) => {
        toast.error('Failed to remove phone number: ' + error.message);
      },
    }
  );

  const handleConfigureAI = (number: any) => {
    setSelectedNumber(number);
    setShowAISetup(true);
  };

  const handleRemoveTestNumbers = async () => {
    try {
      const { data, error } = await supabase.functions.invoke('telnyx-phone-numbers', {
        body: { action: 'remove_test_numbers' }
      });

      if (error) throw error;

      if (data?.success) {
        toast.success('Test numbers removed from your account');
        queryClient.invalidateQueries({ queryKey: ['phone-numbers'] });
      }
    } catch (error) {
      console.error('Error removing test numbers:', error);
      toast.error('Failed to remove test numbers');
    }
  };

  const formatPhoneNumber = (phone: string) => {
    return phone.replace(/^\+1/, '').replace(/(\d{3})(\d{3})(\d{4})/, '($1) $2-$3');
  };

  if (showPurchase) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-medium">Purchase Phone Number</h3>
          <Button variant="outline" onClick={() => setShowPurchase(false)}>
            Back to Numbers
          </Button>
        </div>
        <PhoneNumberPurchase onClose={() => setShowPurchase(false)} />
      </div>
    );
  }

  if (showAISetup && selectedNumber) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-medium">Setup AI Dispatcher</h3>
          <Button variant="outline" onClick={() => setShowAISetup(false)}>
            Back to Numbers
          </Button>
        </div>
        <SetupAIDispatcher 
          phoneNumber={selectedNumber.phone_number}
          onClose={() => setShowAISetup(false)}
        />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-medium">Phone Numbers</h3>
          <p className="text-sm text-muted-foreground">
            Manage your Telnyx phone numbers and AI dispatcher settings
          </p>
        </div>
        <div className="flex gap-2">
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button variant="outline" size="sm">
                <Trash2 className="h-4 w-4 mr-2" />
                Remove Test Numbers
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Remove Test Numbers</AlertDialogTitle>
                <AlertDialogDescription>
                  This will remove all test phone numbers from your account. This action cannot be undone.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Cancel</AlertDialogCancel>
                <AlertDialogAction onClick={handleRemoveTestNumbers}>
                  Remove Test Numbers
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
          <Button onClick={() => setShowPurchase(true)}>
            <Plus className="h-4 w-4 mr-2" />
            Get Phone Number
          </Button>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Phone className="h-5 w-5" />
            Your Phone Numbers
          </CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div>Loading your phone numbers...</div>
          ) : allNumbers.length === 0 ? (
            <div className="text-center py-8">
              <Phone className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
              <h4 className="text-lg font-medium mb-2">No phone numbers yet</h4>
              <p className="text-muted-foreground mb-4">
                Purchase or add your first Telnyx phone number to enable AI dispatcher
              </p>
              <Button onClick={() => setShowPurchase(true)}>
                Get Your First Number
              </Button>
            </div>
          ) : (
            <div className="space-y-4">
              {allNumbers.map((number: any) => (
                <div
                  key={number.id}
                  className="flex items-center justify-between p-4 border rounded-lg"
                >
                  <div>
                    <div className="flex items-center gap-3">
                      <span className="font-medium">
                        {formatPhoneNumber(number.phone_number)}
                      </span>
                      <Badge variant={number.status === 'active' ? 'default' : 'secondary'}>
                        {number.status}
                      </Badge>
                      {(number.ai_dispatcher_enabled || number.configured_for_ai || number.configured_at) && (
                        <Badge variant="outline" className="text-green-600">
                          <Bot className="h-3 w-3 mr-1" />
                          AI Ready
                        </Badge>
                      )}
                      {number.source === 'telnyx_table' && (
                        <Badge variant="outline" className="text-blue-600">
                          <Zap className="h-3 w-3 mr-1" />
                          Telnyx
                        </Badge>
                      )}
                    </div>
                    <div className="text-sm text-muted-foreground mt-1">
                      {number.purchased_at && (
                        <span>Added: {new Date(number.purchased_at).toLocaleDateString()}</span>
                      )}
                      {number.configured_at && (
                        <span className="ml-4">
                          AI Configured: {new Date(number.configured_at).toLocaleDateString()}
                        </span>
                      )}
                    </div>
                    {number.capabilities && (
                      <div className="flex gap-2 mt-2">
                        {number.capabilities.voice && (
                          <Badge variant="outline" size="sm">Voice</Badge>
                        )}
                        {number.capabilities.sms && (
                          <Badge variant="outline" size="sm">SMS</Badge>
                        )}
                        {number.capabilities.mms && (
                          <Badge variant="outline" size="sm">MMS</Badge>
                        )}
                      </div>
                    )}
                  </div>
                  
                  <div className="flex gap-2">
                    {!(number.configured_for_ai || number.ai_dispatcher_enabled || number.configured_at) ? (
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => handleConfigureAI(number)}
                      >
                        <Settings className="h-4 w-4 mr-2" />
                        Setup AI
                      </Button>
                    ) : (
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => handleConfigureAI(number)}
                      >
                        <Settings className="h-4 w-4 mr-2" />
                        Configure
                      </Button>
                    )}
                    <Button
                      variant="destructive"
                      size="sm"
                      onClick={() => removeNumber.mutate(number.phone_number)}
                      disabled={removeNumber.isPending}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Zap className="h-5 w-5" />
            Telnyx Integration Status
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h4 className="font-medium">API Configuration</h4>
              <p className="text-sm text-muted-foreground">
                {telnyxConfig?.api_key_configured ? 
                  'Telnyx API key is configured and ready' : 
                  'Telnyx API key needs to be configured'
                }
              </p>
            </div>
            <Badge variant={telnyxConfig?.api_key_configured ? 'default' : 'destructive'}>
              {telnyxConfig?.api_key_configured ? 'Connected' : 'Not Connected'}
            </Badge>
          </div>

          <div className="grid md:grid-cols-2 gap-4">
            <div className="space-y-3">
              <h4 className="font-medium text-green-600">✅ Telnyx Benefits</h4>
              <ul className="space-y-1 text-sm">
                <li>• Simple API integration</li>
                <li>• Real-time webhooks</li>
                <li>• Global phone numbers</li>
                <li>• High-quality voice calls</li>
                <li>• Built-in SMS support</li>
                <li>• Competitive pricing</li>
              </ul>
            </div>
            <div className="space-y-3">
              <h4 className="font-medium">🚀 AI Dispatcher Features</h4>
              <ul className="space-y-1 text-sm">
                <li>• 24/7 call answering</li>
                <li>• Appointment scheduling</li>
                <li>• Customer information capture</li>
                <li>• Emergency detection</li>
                <li>• Call transcription</li>
                <li>• CRM integration</li>
              </ul>
            </div>
          </div>

          <div className="bg-blue-50 p-4 rounded-lg">
            <h5 className="font-medium text-blue-800 mb-2">📞 Your Telnyx Number</h5>
            <p className="text-sm text-blue-700">
              You have the Telnyx number +14375249932. Use "Add Existing Number" in the Phone Numbers section to connect it to your account for full AI dispatcher capabilities.
            </p>
          </div>

          <div className="flex gap-2">
            <Button variant="outline" asChild>
              <a href="https://portal.telnyx.com/" target="_blank" rel="noopener noreferrer">
                <ExternalLink className="w-4 h-4 mr-2" />
                Telnyx Portal
              </a>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
