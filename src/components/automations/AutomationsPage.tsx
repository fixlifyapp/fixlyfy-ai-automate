
import { useState } from "react";
import { PageLayout } from "@/components/layout/PageLayout";
import { AutomationsList } from "./AutomationsList";
import { AutomationBuilder } from "./AutomationBuilder";
import { AutomationPerformanceDashboard } from "./AutomationPerformanceDashboard";
import { AutomationTemplates } from "./AutomationTemplates";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { 
  Zap, 
  Plus, 
  Settings, 
  BarChart3, 
  Sparkles, 
  Layers3,
  Brain,
  Target
} from "lucide-react";

export const AutomationsPage = () => {
  const [selectedTab, setSelectedTab] = useState("automations");
  const [showBuilder, setShowBuilder] = useState(false);

  return (
    <PageLayout>
      {/* 3D Header with Gradient and Effects */}
      <div className="relative overflow-hidden bg-gradient-to-br from-purple-900/20 via-blue-900/20 to-indigo-900/20 rounded-3xl p-8 mb-8 border border-purple-200/30">
        {/* 3D Background Elements */}
        <div className="absolute inset-0">
          <div className="absolute top-0 left-0 w-64 h-64 bg-gradient-to-br from-purple-500/20 to-blue-500/20 rounded-full blur-3xl transform -translate-x-1/2 -translate-y-1/2"></div>
          <div className="absolute bottom-0 right-0 w-96 h-96 bg-gradient-to-br from-blue-500/20 to-indigo-500/20 rounded-full blur-3xl transform translate-x-1/2 translate-y-1/2"></div>
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(147,51,234,0.1),transparent_70%)]"></div>
        </div>
        
        <div className="relative z-10 flex justify-between items-center">
          <div className="space-y-3">
            <div className="flex items-center gap-4">
              <div className="p-4 bg-gradient-to-br from-purple-600 to-blue-600 rounded-2xl shadow-xl transform rotate-3 hover:rotate-0 transition-all duration-500">
                <Zap className="text-white w-8 h-8" />
              </div>
              <div>
                <h1 className="text-4xl font-bold bg-gradient-to-r from-purple-600 via-blue-600 to-indigo-600 bg-clip-text text-transparent">
                  AI Automations
                </h1>
                <p className="text-gray-600 text-lg">Intelligent workflows powered by AI insights</p>
              </div>
            </div>
            
            {/* Feature Badges */}
            <div className="flex flex-wrap gap-2 mt-4">
              <Badge variant="outline" className="bg-purple-100 text-purple-700 border-purple-200">
                <Brain className="w-3 h-3 mr-1" />
                AI-Powered
              </Badge>
              <Badge variant="outline" className="bg-blue-100 text-blue-700 border-blue-200">
                <Target className="w-3 h-3 mr-1" />
                Smart Triggers
              </Badge>
              <Badge variant="outline" className="bg-indigo-100 text-indigo-700 border-indigo-200">
                <Layers3 className="w-3 h-3 mr-1" />
                Multi-Channel
              </Badge>
            </div>
          </div>
          
          <Button 
            onClick={() => setShowBuilder(true)}
            className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white px-8 py-3 rounded-xl font-semibold shadow-lg transform hover:scale-105 transition-all duration-300"
          >
            <Plus className="mr-2 h-5 w-5" />
            Create Automation
          </Button>
        </div>
      </div>

      {/* Main Content */}
      <Tabs value={selectedTab} onValueChange={setSelectedTab} className="space-y-6">
        <TabsList className="grid w-full grid-cols-4 bg-white/80 backdrop-blur-sm rounded-xl p-1 shadow-lg border border-gray-200/50">
          <TabsTrigger 
            value="automations" 
            className="flex items-center gap-2 data-[state=active]:bg-gradient-to-r data-[state=active]:from-purple-500 data-[state=active]:to-blue-500 data-[state=active]:text-white rounded-lg transition-all duration-300"
          >
            <Zap className="w-4 h-4" />
            Automations
          </TabsTrigger>
          <TabsTrigger 
            value="templates"
            className="flex items-center gap-2 data-[state=active]:bg-gradient-to-r data-[state=active]:from-purple-500 data-[state=active]:to-blue-500 data-[state=active]:text-white rounded-lg transition-all duration-300"
          >
            <Layers3 className="w-4 h-4" />
            Templates
          </TabsTrigger>
          <TabsTrigger 
            value="performance"
            className="flex items-center gap-2 data-[state=active]:bg-gradient-to-r data-[state=active]:from-purple-500 data-[state=active]:to-blue-500 data-[state=active]:text-white rounded-lg transition-all duration-300"
          >
            <BarChart3 className="w-4 h-4" />
            Analytics
          </TabsTrigger>
          <TabsTrigger 
            value="settings"
            className="flex items-center gap-2 data-[state=active]:bg-gradient-to-r data-[state=active]:from-purple-500 data-[state=active]:to-blue-500 data-[state=active]:text-white rounded-lg transition-all duration-300"
          >
            <Settings className="w-4 h-4" />
            Settings
          </TabsTrigger>
        </TabsList>

        <TabsContent value="automations" className="space-y-6">
          <AutomationsList />
        </TabsContent>

        <TabsContent value="templates" className="space-y-6">
          <AutomationTemplates onCreateFromTemplate={() => setShowBuilder(true)} />
        </TabsContent>

        <TabsContent value="performance" className="space-y-6">
          <AutomationPerformanceDashboard />
        </TabsContent>

        <TabsContent value="settings" className="space-y-6">
          <Card className="border-0 shadow-xl bg-gradient-to-br from-white to-gray-50">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Settings className="w-5 h-5" />
                Automation Settings
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600">Global automation settings and configuration options will be available here.</p>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Automation Builder Modal */}
      {showBuilder && (
        <AutomationBuilder 
          onClose={() => setShowBuilder(false)}
          onSave={() => {
            setShowBuilder(false);
            // Refresh automations list
          }}
        />
      )}
    </PageLayout>
  );
};
