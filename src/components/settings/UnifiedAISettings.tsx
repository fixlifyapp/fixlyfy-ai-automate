
import { useState } from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Brain, Bot, Phone, Settings, Zap, MessageSquare, Clock } from "lucide-react";
import { AISettings } from "./AISettings";
import { EnhancedAIAgentSettings } from "../connect/EnhancedAIAgentSettings";
import { VoiceDispatchInterface } from "../voice/VoiceDispatchInterface";
import { AmazonConnectSettings } from "./AmazonConnectSettings";
import { ConnectTestStatus } from "../connect/ConnectTestStatus";
import { SetupAIDispatcher } from "../connect/SetupAIDispatcher";

export const UnifiedAISettings = () => {
  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold">AI Settings</h1>
        <p className="text-muted-foreground mt-2">
          Configure all AI features, voice agents, and automation settings in one place
        </p>
      </div>

      {/* Status Overview */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <Brain className="h-8 w-8 text-blue-600" />
              <div>
                <p className="font-medium">AI Dispatcher</p>
                <Badge variant="success">Active</Badge>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <Phone className="h-8 w-8 text-green-600" />
              <div>
                <p className="font-medium">Voice AI</p>
                <Badge variant="info">Ready</Badge>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <MessageSquare className="h-8 w-8 text-purple-600" />
              <div>
                <p className="font-medium">Connect Integration</p>
                <Badge variant="fixlyfy">Configured</Badge>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Settings Tabs */}
      <Tabs defaultValue="general" className="w-full">
        <TabsList className="grid w-full grid-cols-6">
          <TabsTrigger value="general" className="flex items-center gap-2">
            <Brain className="h-4 w-4" />
            <span className="hidden sm:inline">General</span>
          </TabsTrigger>
          <TabsTrigger value="voice-agent" className="flex items-center gap-2">
            <Bot className="h-4 w-4" />
            <span className="hidden sm:inline">Voice Agent</span>
          </TabsTrigger>
          <TabsTrigger value="voice-dispatch" className="flex items-center gap-2">
            <Phone className="h-4 w-4" />
            <span className="hidden sm:inline">Voice Dispatch</span>
          </TabsTrigger>
          <TabsTrigger value="amazon-connect" className="flex items-center gap-2">
            <Settings className="h-4 w-4" />
            <span className="hidden sm:inline">Amazon Connect</span>
          </TabsTrigger>
          <TabsTrigger value="setup" className="flex items-center gap-2">
            <Zap className="h-4 w-4" />
            <span className="hidden sm:inline">Setup</span>
          </TabsTrigger>
          <TabsTrigger value="status" className="flex items-center gap-2">
            <Clock className="h-4 w-4" />
            <span className="hidden sm:inline">Status</span>
          </TabsTrigger>
        </TabsList>

        <TabsContent value="general" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Brain className="h-5 w-5" />
                General AI Dispatcher Settings
              </CardTitle>
            </CardHeader>
            <CardContent>
              <AISettings />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="voice-agent" className="space-y-6">
          <EnhancedAIAgentSettings />
        </TabsContent>

        <TabsContent value="voice-dispatch" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Phone className="h-5 w-5" />
                Voice Dispatch Interface
              </CardTitle>
            </CardHeader>
            <CardContent>
              <VoiceDispatchInterface />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="amazon-connect" className="space-y-6">
          <AmazonConnectSettings />
        </TabsContent>

        <TabsContent value="setup" className="space-y-6">
          <SetupAIDispatcher />
        </TabsContent>

        <TabsContent value="status" className="space-y-6">
          <ConnectTestStatus />
        </TabsContent>
      </Tabs>
    </div>
  );
};
