
import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  MessageSquare, 
  Phone, 
  Mail, 
  CreditCard, 
  Brain,
  Settings,
  Zap,
  Cloud
} from "lucide-react";
import { AmazonConnectSettings } from "./AmazonConnectSettings";

interface IntegrationCard {
  id: string;
  name: string;
  description: string;
  icon: React.ReactNode;
  status: 'connected' | 'available' | 'coming-soon';
  category: 'communication' | 'payment' | 'ai' | 'automation';
}

const integrations: IntegrationCard[] = [
  {
    id: 'amazon-connect',
    name: 'Amazon Connect AI',
    description: 'AI-powered phone assistant for automatic appointment scheduling',
    icon: <Brain className="h-5 w-5" />,
    status: 'connected',
    category: 'ai'
  },
  {
    id: 'twilio',
    name: 'Twilio (Legacy)',
    description: 'SMS and voice communications (being replaced by Amazon SNS)',
    icon: <MessageSquare className="h-5 w-5" />,
    status: 'connected',
    category: 'communication'
  },
  {
    id: 'amazon-sns',
    name: 'Amazon SNS',
    description: 'Next-generation SMS notifications and alerts',
    icon: <Cloud className="h-5 w-5" />,
    status: 'connected',
    category: 'communication'
  },
  {
    id: 'stripe',
    name: 'Stripe',
    description: 'Payment processing and invoicing',
    icon: <CreditCard className="h-5 w-5" />,
    status: 'available',
    category: 'payment'
  },
  {
    id: 'sendgrid',
    name: 'SendGrid',
    description: 'Email marketing and transactional emails',
    icon: <Mail className="h-5 w-5" />,
    status: 'available',
    category: 'communication'
  },
  {
    id: 'zapier',
    name: 'Zapier',
    description: 'Connect with 5000+ apps and automate workflows',
    icon: <Zap className="h-5 w-5" />,
    status: 'coming-soon',
    category: 'automation'
  }
];

const getStatusColor = (status: string) => {
  switch (status) {
    case 'connected':
      return 'success';
    case 'available':
      return 'secondary';
    case 'coming-soon':
      return 'outline';
    default:
      return 'secondary';
  }
};

const getStatusText = (status: string) => {
  switch (status) {
    case 'connected':
      return 'Connected';
    case 'available':
      return 'Available';
    case 'coming-soon':
      return 'Coming Soon';
    default:
      return 'Unknown';
  }
};

export const SettingsIntegrations = () => {
  const [selectedIntegration, setSelectedIntegration] = useState<string | null>(null);

  const categories = {
    ai: { name: 'AI & Automation', icon: <Brain className="h-4 w-4" /> },
    communication: { name: 'Communication', icon: <MessageSquare className="h-4 w-4" /> },
    payment: { name: 'Payments', icon: <CreditCard className="h-4 w-4" /> },
    automation: { name: 'Workflow', icon: <Zap className="h-4 w-4" /> }
  };

  const renderIntegrationDetails = () => {
    switch (selectedIntegration) {
      case 'amazon-connect':
        return <AmazonConnectSettings />;
      default:
        return (
          <Card>
            <CardContent className="p-8 text-center">
              <Settings className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium mb-2">Integration Settings</h3>
              <p className="text-gray-600">
                Select an integration from the list to configure its settings.
              </p>
            </CardContent>
          </Card>
        );
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold mb-2">Integrations</h2>
        <p className="text-gray-600">
          Connect your favorite tools and services to enhance your workflow.
        </p>
      </div>

      <Tabs defaultValue="overview" className="space-y-6">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="overview">All Integrations</TabsTrigger>
          <TabsTrigger value="configure">Configure</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          {Object.entries(categories).map(([categoryId, category]) => {
            const categoryIntegrations = integrations.filter(integration => integration.category === categoryId);
            
            if (categoryIntegrations.length === 0) return null;

            return (
              <div key={categoryId}>
                <div className="flex items-center gap-2 mb-4">
                  {category.icon}
                  <h3 className="text-lg font-semibold">{category.name}</h3>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {categoryIntegrations.map((integration) => (
                    <Card 
                      key={integration.id} 
                      className={`cursor-pointer transition-all hover:shadow-md ${
                        selectedIntegration === integration.id ? 'ring-2 ring-primary' : ''
                      }`}
                      onClick={() => setSelectedIntegration(integration.id)}
                    >
                      <CardHeader className="pb-3">
                        <div className="flex items-start justify-between">
                          <div className="flex items-center gap-3">
                            <div className="p-2 bg-gray-100 rounded-lg">
                              {integration.icon}
                            </div>
                            <div>
                              <CardTitle className="text-base">{integration.name}</CardTitle>
                            </div>
                          </div>
                          <Badge variant={getStatusColor(integration.status) as any}>
                            {getStatusText(integration.status)}
                          </Badge>
                        </div>
                      </CardHeader>
                      <CardContent className="pt-0">
                        <p className="text-sm text-gray-600">{integration.description}</p>
                        <div className="mt-3">
                          <Button 
                            variant="outline" 
                            size="sm" 
                            className="w-full"
                            disabled={integration.status === 'coming-soon'}
                          >
                            {integration.status === 'connected' ? 'Configure' : 
                             integration.status === 'available' ? 'Connect' : 'Coming Soon'}
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>
            );
          })}
        </TabsContent>

        <TabsContent value="configure" className="space-y-6">
          {renderIntegrationDetails()}
        </TabsContent>
      </Tabs>
    </div>
  );
};
