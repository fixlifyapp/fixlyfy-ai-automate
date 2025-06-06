
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Phone, MessageSquare, Bot, Settings, CheckCircle, AlertCircle } from 'lucide-react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

interface TelnyxPhoneConfigurationProps {
  phoneNumber: string;
  isConfigured?: boolean;
}

export function TelnyxPhoneConfiguration({ phoneNumber, isConfigured = false }: TelnyxPhoneConfigurationProps) {
  const queryClient = useQueryClient();

  const setupFullConfigMutation = useMutation({
    mutationFn: async () => {
      console.log('Setting up full SMS + Voice configuration for:', phoneNumber);
      const { data, error } = await supabase.functions.invoke('telnyx-messaging-profile', {
        body: {
          action: 'setup_full_configuration',
          phone_number: phoneNumber
        }
      });

      if (error) {
        console.error('Configuration error:', error);
        throw error;
      }
      
      console.log('Configuration response:', data);
      return data;
    },
    onSuccess: (data) => {
      console.log('Successfully configured:', data);
      toast.success('Phone number fully configured for SMS + Voice + AI');
      queryClient.invalidateQueries({ queryKey: ['telnyx-owned-numbers'] });
    },
    onError: (error) => {
      console.error('Configuration error:', error);
      toast.error(`Failed to configure: ${error.message}`);
    }
  });

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Phone className="h-5 w-5" />
          Full Configuration: {phoneNumber}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid md:grid-cols-3 gap-4">
          <div className="text-center p-4 border rounded-lg">
            <MessageSquare className="h-8 w-8 mx-auto mb-2 text-blue-500" />
            <h4 className="font-medium">Two-Way SMS</h4>
            <p className="text-sm text-muted-foreground">Send & receive text messages</p>
            <Badge variant={isConfigured ? "default" : "secondary"} className="mt-2">
              {isConfigured ? <CheckCircle className="h-3 w-3 mr-1" /> : <AlertCircle className="h-3 w-3 mr-1" />}
              {isConfigured ? 'Ready' : 'Needs Setup'}
            </Badge>
          </div>

          <div className="text-center p-4 border rounded-lg">
            <Phone className="h-8 w-8 mx-auto mb-2 text-green-500" />
            <h4 className="font-medium">Two-Way Voice</h4>
            <p className="text-sm text-muted-foreground">Make & receive calls</p>
            <Badge variant={isConfigured ? "default" : "secondary"} className="mt-2">
              {isConfigured ? <CheckCircle className="h-3 w-3 mr-1" /> : <AlertCircle className="h-3 w-3 mr-1" />}
              {isConfigured ? 'Ready' : 'Needs Setup'}
            </Badge>
          </div>

          <div className="text-center p-4 border rounded-lg">
            <Bot className="h-8 w-8 mx-auto mb-2 text-purple-500" />
            <h4 className="font-medium">AI Dispatcher</h4>
            <p className="text-sm text-muted-foreground">AI answers incoming calls</p>
            <Badge variant={isConfigured ? "default" : "secondary"} className="mt-2">
              {isConfigured ? <CheckCircle className="h-3 w-3 mr-1" /> : <AlertCircle className="h-3 w-3 mr-1" />}
              {isConfigured ? 'Ready' : 'Needs Setup'}
            </Badge>
          </div>
        </div>

        <div className="bg-blue-50 p-4 rounded-lg">
          <h5 className="font-medium text-blue-800 mb-2">🔧 Full Configuration Setup</h5>
          <p className="text-sm text-blue-700 mb-3">
            This will configure your Telnyx number for:
          </p>
          <ul className="text-sm text-blue-700 space-y-1 mb-4">
            <li>• Two-way SMS messaging with webhook integration</li>
            <li>• Two-way voice calls with AI dispatcher</li>
            <li>• Proper Telnyx Messaging Profile setup</li>
            <li>• Voice Application webhook configuration</li>
          </ul>
          
          {!isConfigured ? (
            <Button
              onClick={() => setupFullConfigMutation.mutate()}
              disabled={setupFullConfigMutation.isPending}
              className="w-full"
            >
              <Settings className="h-4 w-4 mr-2" />
              {setupFullConfigMutation.isPending ? 'Configuring...' : 'Setup Full Configuration'}
            </Button>
          ) : (
            <div className="flex items-center justify-center gap-2 text-green-600">
              <CheckCircle className="h-5 w-5" />
              <span className="font-medium">Configuration Complete!</span>
            </div>
          )}
        </div>

        <div className="text-xs text-muted-foreground space-y-1">
          <p><strong>SMS Webhook:</strong> /functions/v1/sms-receiver</p>
          <p><strong>Voice Webhook:</strong> /functions/v1/telnyx-voice-webhook</p>
          <p><strong>Number:</strong> {phoneNumber}</p>
        </div>
      </CardContent>
    </Card>
  );
}
