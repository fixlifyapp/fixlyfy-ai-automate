
import React from 'react';
import { TelnyxSettings } from './TelnyxSettings';
import { TelnyxCallsView } from './TelnyxCallsView';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Bot, BarChart3, Settings } from 'lucide-react';

export const TelnyxAIAnalytics = () => {
  return (
    <div className="space-y-6">
      <Tabs defaultValue="ai-settings" className="space-y-4">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="ai-settings" className="flex items-center gap-2">
            <Bot size={16} />
            AI Configuration
          </TabsTrigger>
          <TabsTrigger value="analytics" className="flex items-center gap-2">
            <BarChart3 size={16} />
            Call Analytics
          </TabsTrigger>
        </TabsList>

        <TabsContent value="ai-settings">
          <TelnyxSettings />
        </TabsContent>

        <TabsContent value="analytics">
          <TelnyxCallsView />
        </TabsContent>
      </Tabs>
    </div>
  );
};
