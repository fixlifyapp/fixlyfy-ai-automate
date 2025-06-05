
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Phone, CheckCircle, AlertCircle, Settings, RefreshCw } from "lucide-react";
import { toast } from "sonner";

interface PhoneNumber {
  id: string;
  phone_number: string;
  status: string;
  created_at: string;
  telnyx_number_id?: string;
}

export const PhoneNumbersManagement = () => {
  const [phoneNumbers, setPhoneNumbers] = useState<PhoneNumber[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [configuringWebhooks, setConfiguringWebhooks] = useState<string | null>(null);

  const fetchPhoneNumbers = async () => {
    try {
      const { data, error } = await supabase
        .from('telnyx_phone_numbers')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setPhoneNumbers(data || []);
    } catch (error) {
      console.error('Error fetching phone numbers:', error);
      toast.error('Failed to load phone numbers');
    } finally {
      setIsLoading(false);
    }
  };

  const configureWebhooks = async (phoneNumberId: string, phoneNumber: string) => {
    setConfiguringWebhooks(phoneNumberId);
    
    try {
      const { data, error } = await supabase.functions.invoke('manage-phone-numbers', {
        body: {
          action: 'configure_webhooks',
          phone_number_id: phoneNumberId,
          phone_number: phoneNumber
        }
      });

      if (error) throw error;

      if (data?.success) {
        toast.success('Webhooks configured successfully');
        await fetchPhoneNumbers();
      } else {
        throw new Error(data?.error || 'Failed to configure webhooks');
      }
    } catch (error) {
      console.error('Error configuring webhooks:', error);
      toast.error('Failed to configure webhooks: ' + error.message);
    } finally {
      setConfiguringWebhooks(null);
    }
  };

  const testWebhook = async (phoneNumber: string) => {
    try {
      const { data, error } = await supabase.functions.invoke('manage-phone-numbers', {
        body: {
          action: 'test_webhook',
          phone_number: phoneNumber
        }
      });

      if (error) throw error;

      if (data?.success) {
        toast.success('Webhook test successful! Check your logs.');
      } else {
        toast.warning('Webhook test may have issues: ' + (data?.error || 'Unknown issue'));
      }
    } catch (error) {
      console.error('Error testing webhook:', error);
      toast.error('Webhook test failed: ' + error.message);
    }
  };

  useEffect(() => {
    fetchPhoneNumbers();
  }, []);

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Phone className="h-5 w-5" />
            Phone Numbers Management
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center py-8">
            <RefreshCw className="h-6 w-6 animate-spin text-fixlyfy" />
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Phone className="h-5 w-5" />
          Phone Numbers Management
        </CardTitle>
      </CardHeader>
      <CardContent>
        {phoneNumbers.length === 0 ? (
          <div className="text-center py-8">
            <Phone className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <p className="text-muted-foreground">No phone numbers found.</p>
            <p className="text-sm text-muted-foreground mt-2">
              Purchase phone numbers to start receiving calls and messages.
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {phoneNumbers.map((phone) => (
              <div
                key={phone.id}
                className="border rounded-lg p-4 flex items-center justify-between"
              >
                <div className="flex items-center gap-4">
                  <Phone className="h-5 w-5 text-fixlyfy" />
                  <div>
                    <p className="font-medium">{phone.phone_number}</p>
                    <p className="text-sm text-muted-foreground">
                      Created: {new Date(phone.created_at).toLocaleDateString()}
                    </p>
                  </div>
                  <Badge
                    variant={phone.status === 'active' ? 'default' : 'secondary'}
                    className="ml-2"
                  >
                    {phone.status === 'active' ? (
                      <CheckCircle className="h-3 w-3 mr-1" />
                    ) : (
                      <AlertCircle className="h-3 w-3 mr-1" />
                    )}
                    {phone.status}
                  </Badge>
                </div>
                
                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => testWebhook(phone.phone_number)}
                    className="gap-2"
                  >
                    <RefreshCw className="h-4 w-4" />
                    Test Webhook
                  </Button>
                  
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => configureWebhooks(phone.id, phone.phone_number)}
                    disabled={configuringWebhooks === phone.id}
                    className="gap-2"
                  >
                    {configuringWebhooks === phone.id ? (
                      <RefreshCw className="h-4 w-4 animate-spin" />
                    ) : (
                      <Settings className="h-4 w-4" />
                    )}
                    Configure Webhooks
                  </Button>
                </div>
              </div>
            ))}
            
            <div className="mt-6 p-4 bg-muted rounded-lg">
              <h4 className="font-medium mb-2">Webhook Configuration</h4>
              <p className="text-sm text-muted-foreground mb-2">
                Your webhook URLs should be configured as:
              </p>
              <div className="space-y-1 text-sm font-mono bg-background p-2 rounded border">
                <p><strong>SMS Webhook:</strong> https://mqppvcrlvsgrsqelglod.supabase.co/functions/v1/telnyx-sms-webhook</p>
                <p><strong>Voice Webhook:</strong> https://mqppvcrlvsgrsqelglod.supabase.co/functions/v1/telnyx-voice-webhook</p>
              </div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};
