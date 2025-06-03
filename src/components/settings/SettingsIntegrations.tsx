
import React from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Phone, MessageSquare, Mail, Zap, ExternalLink, Bot, Settings } from 'lucide-react';
import { CompanyEmailSettings } from './CompanyEmailSettings';

export const SettingsIntegrations = () => {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold mb-2">Integrations</h2>
        <p className="text-muted-foreground">
          Manage your integrations and external services
        </p>
      </div>

      <Tabs defaultValue="email" className="space-y-6">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="email" className="flex items-center gap-2">
            <Mail className="h-4 w-4" />
            Email
          </TabsTrigger>
          
          <TabsTrigger value="messaging" className="flex items-center gap-2">
            <MessageSquare className="h-4 w-4" />
            Messaging
          </TabsTrigger>
        </TabsList>

        <TabsContent value="email" className="space-y-6">
          <CompanyEmailSettings />
        </TabsContent>

        <TabsContent value="messaging" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <MessageSquare className="h-5 w-5" />
                SMS & Messaging
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center justify-between p-4 border rounded-lg">
                  <div>
                    <h4 className="font-medium">Phone System Integration</h4>
                    <p className="text-sm text-muted-foreground">
                      SMS and voice messaging are now managed through the Phone Settings
                    </p>
                  </div>
                  <Button asChild variant="outline">
                    <a href="/settings/phone" className="flex items-center gap-2">
                      <Settings className="h-4 w-4" />
                      Phone Settings
                      <ExternalLink className="h-3 w-3" />
                    </a>
                  </Button>
                </div>
                
                <div className="bg-blue-50 p-4 rounded-lg">
                  <h5 className="font-medium mb-2">Available Features</h5>
                  <ul className="text-sm space-y-1">
                    <li>• Two-way SMS conversations</li>
                    <li>• AI-powered call handling</li>
                    <li>• Automated appointment reminders</li>
                    <li>• Customer notifications</li>
                    <li>• Integration with your CRM</li>
                  </ul>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};
