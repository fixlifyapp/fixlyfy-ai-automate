
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";

export const SettingsIntegrations = () => {
  const integrations = [
    {
      id: "payment",
      name: "Stripe Payments",
      description: "Process credit card payments and manage subscriptions.",
      logo: "https://cdn.worldvectorlogo.com/logos/stripe-2.svg",
      connected: true
    },
    {
      id: "sms",
      name: "Twilio SMS",
      description: "Send automated SMS notifications to clients and technicians.",
      logo: "https://upload.wikimedia.org/wikipedia/commons/thumb/7/72/Twilio-logo-red.svg/2560px-Twilio-logo-red.svg.png",
      connected: true
    },
    {
      id: "calendar",
      name: "Google Calendar",
      description: "Sync job schedules with Google Calendar.",
      logo: "https://upload.wikimedia.org/wikipedia/commons/thumb/a/a5/Google_Calendar_icon_%282020%29.svg/2048px-Google_Calendar_icon_%282020%29.svg.png",
      connected: true
    },
    {
      id: "email",
      name: "Mailchimp",
      description: "Send marketing emails and manage email campaigns.",
      logo: "https://upload.wikimedia.org/wikipedia/commons/thumb/7/72/Mailchimp_Freddie_Camapaign.png/600px-Mailchimp_Freddie_Camapaign.png",
      connected: false
    },
    {
      id: "accounting",
      name: "QuickBooks",
      description: "Sync invoices, payments, and customer data with QuickBooks.",
      logo: "https://logos-world.net/wp-content/uploads/2021/02/QuickBooks-Logo-2006-2015.png",
      connected: false
    },
    {
      id: "zapier",
      name: "Zapier",
      description: "Connect Fixlyfy to thousands of other apps and services.",
      logo: "https://cdn.worldvectorlogo.com/logos/zapier-1.svg",
      connected: false
    }
  ];
  
  return (
    <div className="space-y-8">
      <div>
        <h3 className="text-lg font-medium mb-4">Connected Applications</h3>
        <div className="space-y-6">
          {integrations.map((integration) => (
            <div 
              key={integration.id} 
              className="flex items-center justify-between p-4 border rounded-lg"
            >
              <div className="flex items-center">
                <div className="h-12 w-12 flex-shrink-0 flex items-center justify-center mr-4">
                  <img 
                    src={integration.logo} 
                    alt={integration.name} 
                    className="max-h-10 max-w-10 object-contain" 
                  />
                </div>
                <div>
                  <div className="flex items-center">
                    <h4 className="font-medium">{integration.name}</h4>
                    {integration.connected ? (
                      <Badge className="ml-2 bg-fixlyfy-success/10 text-fixlyfy-success">Connected</Badge>
                    ) : (
                      <Badge className="ml-2 bg-fixlyfy-text-secondary/10 text-fixlyfy-text-secondary">Not Connected</Badge>
                    )}
                  </div>
                  <p className="text-sm text-fixlyfy-text-secondary">{integration.description}</p>
                </div>
              </div>
              <div>
                {integration.connected ? (
                  <div className="flex gap-2">
                    <Button variant="outline" size="sm">Configure</Button>
                    <Button variant="outline" size="sm" className="text-fixlyfy-error">Disconnect</Button>
                  </div>
                ) : (
                  <Button className="bg-fixlyfy hover:bg-fixlyfy/90" size="sm">Connect</Button>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
      
      <Separator />
      
      <div>
        <h3 className="text-lg font-medium mb-4">API Access</h3>
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <Label htmlFor="api-access">Enable API Access</Label>
              <p className="text-sm text-fixlyfy-text-secondary">Allow external applications to access your Fixlyfy data</p>
            </div>
            <Switch id="api-access" />
          </div>
          
          <div className="p-4 bg-fixlyfy-bg-interface rounded-lg">
            <div className="flex items-center justify-between mb-2">
              <h4 className="font-medium">API Key</h4>
              <Badge className="bg-fixlyfy-warning/10 text-fixlyfy-warning">Read/Write</Badge>
            </div>
            <div className="flex items-center gap-2">
              <div className="bg-white rounded p-2 text-xs font-mono flex-1 border">
                •••••••••••••••••••••••••••••••••••••••••••••••••••••
              </div>
              <Button variant="outline" size="sm">Show</Button>
              <Button variant="outline" size="sm">Refresh</Button>
            </div>
            <p className="text-xs text-fixlyfy-text-secondary mt-2">
              This key has full access to your Fixlyfy account. Keep it secure!
            </p>
          </div>
        </div>
      </div>
      
      <Separator />
      
      <div>
        <h3 className="text-lg font-medium mb-4">Webhooks</h3>
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <Label htmlFor="webhooks">Enable Webhooks</Label>
              <p className="text-sm text-fixlyfy-text-secondary">Send event notifications to external URLs</p>
            </div>
            <Switch id="webhooks" />
          </div>
          
          <div className="p-4 bg-fixlyfy-bg-interface rounded-lg">
            <p className="text-sm text-fixlyfy-text-secondary mb-4">
              Configure webhooks to trigger on specific events like job creation, status changes, and more.
            </p>
            <Button variant="outline">Add Webhook</Button>
          </div>
        </div>
      </div>
      
      <div className="flex justify-end">
        <Button className="bg-fixlyfy hover:bg-fixlyfy/90">Save Changes</Button>
      </div>
    </div>
  );
};
