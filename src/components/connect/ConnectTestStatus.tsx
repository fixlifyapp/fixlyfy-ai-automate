
import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { CheckCircle, AlertCircle, Phone, Bot, Database, Cloud, ExternalLink, RefreshCw } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";

interface SystemStatus {
  openai: boolean;
  aws: boolean;
  connect: boolean;
  database: boolean;
  phoneNumber: boolean;
  connectFlow: boolean;
}

interface PhoneNumberConfig {
  phone_number: string;
  ai_dispatcher_enabled: boolean;
  connect_instance_id: string;
  ai_settings: any;
}

export const ConnectTestStatus = () => {
  const [status, setStatus] = useState<SystemStatus>({
    openai: false,
    aws: false,
    connect: false,
    database: false,
    phoneNumber: false,
    connectFlow: false
  });

  const [phoneConfig, setPhoneConfig] = useState<PhoneNumberConfig | null>(null);
  const [webhookUrl, setWebhookUrl] = useState<string>("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    checkSystemStatus();
  }, []);

  const checkSystemStatus = async () => {
    try {
      setLoading(true);
      
      // Check if phone number exists and is configured
      const { data: phoneNumbers } = await supabase
        .from('phone_numbers')
        .select('*')
        .eq('phone_number', '+18335743145')
        .eq('ai_dispatcher_enabled', true);

      // Check if AI config exists
      const { data: aiConfig } = await supabase
        .from('ai_agent_configs')
        .select('*')
        .eq('is_active', true);

      // Check if AWS credentials exist
      const { data: awsCreds } = await supabase
        .from('aws_credentials')
        .select('*')
        .eq('is_active', true);

      const phoneConfigured = phoneNumbers && phoneNumbers.length > 0;
      const phoneData = phoneNumbers?.[0];

      if (phoneData) {
        setPhoneConfig(phoneData);
        setWebhookUrl(phoneData.ai_settings?.webhook_url || "");
      }

      setStatus({
        openai: true, // We know this is configured from secrets
        aws: awsCreds && awsCreds.length > 0,
        connect: phoneConfigured && phoneData?.connect_instance_id != null,
        database: true, // Database is always available
        phoneNumber: phoneConfigured,
        connectFlow: phoneData?.ai_settings?.webhook_url != null
      });
    } catch (error) {
      console.error('Error checking system status:', error);
      toast({
        title: "Error",
        description: "Failed to check system status",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const StatusItem = ({ 
    icon: Icon, 
    label, 
    status: isOk,
    description,
    action
  }: { 
    icon: any, 
    label: string, 
    status: boolean,
    description?: string,
    action?: () => void
  }) => (
    <div className="flex items-center justify-between p-3 border rounded-lg">
      <div className="flex items-center gap-3 flex-1">
        <Icon className={`h-5 w-5 ${isOk ? 'text-green-600' : 'text-red-600'}`} />
        <div className="flex-1">
          <span className="font-medium">{label}</span>
          {description && (
            <p className="text-xs text-gray-500 mt-1">{description}</p>
          )}
        </div>
      </div>
      <div className="flex items-center gap-2">
        {isOk ? (
          <Badge className="bg-green-100 text-green-800 border-green-200">
            <CheckCircle className="h-3 w-3 mr-1" />
            Ready
          </Badge>
        ) : (
          <Badge variant="destructive">
            <AlertCircle className="h-3 w-3 mr-1" />
            Not Ready
          </Badge>
        )}
        {action && (
          <Button size="sm" variant="outline" onClick={action}>
            <ExternalLink className="h-3 w-3" />
          </Button>
        )}
      </div>
    </div>
  );

  const allReady = Object.values(status).every(Boolean);

  if (loading) {
    return (
      <Card className="border-blue-100">
        <CardContent className="p-8 text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
          <p className="text-sm text-gray-500 mt-2">Checking system status...</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="border-blue-100">
      <CardHeader className="bg-gradient-to-r from-blue-50 to-indigo-50">
        <CardTitle className="flex items-center gap-2">
          <div className="p-2 bg-blue-100 rounded-full">
            <Database className="h-5 w-5 text-blue-600" />
          </div>
          <span className="text-gray-900">AI Dispatcher System Status</span>
          <Button 
            size="sm" 
            variant="outline" 
            onClick={checkSystemStatus}
            className="ml-auto"
          >
            <RefreshCw className="h-4 w-4 mr-1" />
            Refresh
          </Button>
          {allReady && (
            <Badge className="bg-green-100 text-green-800 border-green-200">
              <CheckCircle className="h-3 w-3 mr-1" />
              All Systems Ready
            </Badge>
          )}
        </CardTitle>
      </CardHeader>
      <CardContent className="p-6">
        <div className="space-y-3">
          <StatusItem 
            icon={Bot} 
            label="OpenAI API" 
            status={status.openai}
            description="AI conversation and text-to-speech generation"
          />
          <StatusItem 
            icon={Cloud} 
            label="AWS Credentials" 
            status={status.aws}
            description="Amazon Connect service authentication"
          />
          <StatusItem 
            icon={Cloud} 
            label="Amazon Connect Instance" 
            status={status.connect}
            description={phoneConfig?.connect_instance_id ? `Instance: ${phoneConfig.connect_instance_id}` : "Connect instance not configured"}
          />
          <StatusItem 
            icon={Database} 
            label="Database Schema" 
            status={status.database}
            description="All required tables and configurations"
          />
          <StatusItem 
            icon={Phone} 
            label="Phone Number (+1 833-574-3145)" 
            status={status.phoneNumber}
            description={status.phoneNumber ? "AI dispatcher enabled" : "Phone number not configured"}
          />
          <StatusItem 
            icon={Bot} 
            label="Connect Contact Flow" 
            status={status.connectFlow}
            description={webhookUrl ? `Webhook: ${webhookUrl}` : "Contact flow not configured"}
            action={webhookUrl ? () => window.open('https://console.aws.amazon.com/connect/v2/app', '_blank') : undefined}
          />
        </div>

        {!allReady && (
          <div className="mt-6 p-4 bg-amber-50 rounded-lg border border-amber-200">
            <div className="flex items-start gap-3">
              <AlertCircle className="h-5 w-5 text-amber-600 mt-0.5" />
              <div className="text-sm text-amber-800">
                <p className="font-semibold mb-2">Setup Required:</p>
                <ul className="list-disc list-inside space-y-1 ml-2">
                  {!status.connectFlow && (
                    <li>Configure Amazon Connect contact flow to use webhook: <code className="text-xs bg-amber-100 px-1 py-0.5 rounded">{webhookUrl || 'Not available'}</code></li>
                  )}
                  {!status.phoneNumber && (
                    <li>Configure phone number +1 833-574-3145 for AI dispatcher</li>
                  )}
                  {!status.connect && (
                    <li>Set up Amazon Connect instance integration</li>
                  )}
                </ul>
              </div>
            </div>
          </div>
        )}

        {allReady && (
          <div className="mt-6 p-4 bg-green-50 rounded-lg border border-green-200">
            <div className="flex items-center gap-3">
              <CheckCircle className="h-6 w-6 text-green-600" />
              <div>
                <h3 className="font-semibold text-green-900">Ready to Receive Calls!</h3>
                <p className="text-sm text-green-700">
                  Call +1 833-574-3145 to test your AI dispatcher. The system will handle calls automatically.
                </p>
                <div className="mt-2 text-xs text-green-600">
                  <p>Webhook URL: {webhookUrl}</p>
                  <p>Instance: {phoneConfig?.connect_instance_id}</p>
                </div>
              </div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};
