
import { useState } from "react";
import { PageLayout } from "@/components/layout/PageLayout";
import { PageHeader } from "@/components/ui/page-header";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Brain, Bot, MessageSquare, Zap, Settings, Target, TrendingUp, Phone, Mail, Calendar, Users, FileText, BarChart3, Shield, Lightbulb, CheckCircle, AlertTriangle, Clock } from "lucide-react";

const AiCenterPage = () => {
  const [selectedAgent, setSelectedAgent] = useState<string | null>(null);

  // Mock AI agents data
  const aiAgents = [
    {
      id: 'dispatcher',
      name: 'AI Dispatcher',
      description: 'Intelligent call routing and customer service automation',
      status: 'active',
      capabilities: ['Call Routing', 'Customer Support', 'Appointment Scheduling'],
      performance: { accuracy: 95, efficiency: 88, satisfaction: 92 }
    },
    {
      id: 'scheduler',
      name: 'Smart Scheduler',
      description: 'Automated scheduling and calendar management',
      status: 'active',
      capabilities: ['Auto Scheduling', 'Calendar Sync', 'Conflict Resolution'],
      performance: { accuracy: 98, efficiency: 94, satisfaction: 89 }
    },
    {
      id: 'estimator',
      name: 'AI Estimator',
      description: 'Intelligent cost estimation and pricing optimization',
      status: 'training',
      capabilities: ['Cost Analysis', 'Price Optimization', 'Market Intelligence'],
      performance: { accuracy: 87, efficiency: 91, satisfaction: 85 }
    },
    {
      id: 'analytics',
      name: 'Business Intelligence',
      description: 'Advanced analytics and business insights',
      status: 'active',
      capabilities: ['Data Analysis', 'Trend Prediction', 'Performance Metrics'],
      performance: { accuracy: 93, efficiency: 96, satisfaction: 90 }
    }
  ];

  // Mock AI insights
  const aiInsights = [
    {
      type: 'optimization',
      title: 'Schedule Optimization Opportunity',
      description: 'AI detected 15% efficiency gain possible by adjusting morning routes',
      impact: 'high',
      action: 'Review suggested schedule changes'
    },
    {
      type: 'prediction',
      title: 'Demand Forecast',
      description: 'Expected 20% increase in HVAC calls next week due to weather patterns',
      impact: 'medium',
      action: 'Consider additional technician scheduling'
    },
    {
      type: 'anomaly',
      title: 'Cost Anomaly Detected',
      description: 'Parts costs 12% higher than usual for recent jobs',
      impact: 'medium',
      action: 'Review supplier pricing'
    }
  ];

  // Mock automation workflows
  const automationWorkflows = [
    {
      id: 'lead-qualification',
      name: 'Lead Qualification',
      description: 'Automatically qualify and route incoming leads',
      status: 'active',
      triggers: ['New Lead', 'Form Submission'],
      actions: ['Score Lead', 'Assign Technician', 'Send Welcome Email']
    },
    {
      id: 'follow-up',
      name: 'Customer Follow-up',
      description: 'Automated post-service customer follow-up sequence',
      status: 'active',
      triggers: ['Job Completed', '24 Hours Elapsed'],
      actions: ['Send Survey', 'Request Review', 'Schedule Maintenance']
    },
    {
      id: 'inventory-alert',
      name: 'Inventory Alerts',
      description: 'Monitor inventory levels and trigger reorder notifications',
      status: 'paused',
      triggers: ['Low Stock', 'Reorder Point'],
      actions: ['Notify Manager', 'Create Purchase Order', 'Update Forecast']
    }
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-green-100 text-green-800';
      case 'training': return 'bg-yellow-100 text-yellow-800';
      case 'paused': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getImpactColor = (impact: string) => {
    switch (impact) {
      case 'high': return 'text-red-600';
      case 'medium': return 'text-yellow-600';
      case 'low': return 'text-green-600';
      default: return 'text-gray-600';
    }
  };

  const getInsightIcon = (type: string) => {
    switch (type) {
      case 'optimization': return <TrendingUp className="h-5 w-5" />;
      case 'prediction': return <Brain className="h-5 w-5" />;
      case 'anomaly': return <AlertTriangle className="h-5 w-5" />;
      default: return <Lightbulb className="h-5 w-5" />;
    }
  };

  return (
    <PageLayout>
      <PageHeader
        title="AI Center"
        subtitle="Manage AI agents, automation workflows, and intelligent insights"
        icon={Brain}
        badges={[
          { text: "AI-Powered", icon: Bot, variant: "fixlify" },
          { text: "Automation", icon: Zap, variant: "success" },
          { text: "Intelligence", icon: Target, variant: "info" }
        ]}
      />

      <div className="space-y-6">
        <Tabs defaultValue="agents" className="w-full">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="agents">AI Agents</TabsTrigger>
            <TabsTrigger value="insights">AI Insights</TabsTrigger>
            <TabsTrigger value="automation">Automation</TabsTrigger>
            <TabsTrigger value="settings">AI Settings</TabsTrigger>
          </TabsList>
          
          <TabsContent value="agents" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div className="lg:col-span-2">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Bot className="h-5 w-5" />
                      AI Agents Overview
                    </CardTitle>
                    <CardDescription>
                      Monitor and manage your AI agents' performance and capabilities
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {aiAgents.map((agent) => (
                        <div 
                          key={agent.id}
                          className={`p-4 border rounded-lg cursor-pointer transition-colors ${
                            selectedAgent === agent.id 
                              ? 'border-primary bg-primary/5' 
                              : 'border-border hover:border-primary/50'
                          }`}
                          onClick={() => setSelectedAgent(agent.id)}
                        >
                          <div className="flex items-center justify-between mb-2">
                            <h3 className="font-semibold">{agent.name}</h3>
                            <Badge className={getStatusColor(agent.status)}>
                              {agent.status}
                            </Badge>
                          </div>
                          <p className="text-sm text-muted-foreground mb-3">
                            {agent.description}
                          </p>
                          <div className="flex flex-wrap gap-1 mb-3">
                            {agent.capabilities.map((capability) => (
                              <Badge key={capability} variant="outline" className="text-xs">
                                {capability}
                              </Badge>
                            ))}
                          </div>
                          <div className="grid grid-cols-3 gap-4 text-sm">
                            <div>
                              <span className="text-muted-foreground">Accuracy:</span>
                              <span className="ml-1 font-medium">{agent.performance.accuracy}%</span>
                            </div>
                            <div>
                              <span className="text-muted-foreground">Efficiency:</span>
                              <span className="ml-1 font-medium">{agent.performance.efficiency}%</span>
                            </div>
                            <div>
                              <span className="text-muted-foreground">Satisfaction:</span>
                              <span className="ml-1 font-medium">{agent.performance.satisfaction}%</span>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </div>

              <div>
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Settings className="h-5 w-5" />
                      Agent Controls
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    {selectedAgent ? (
                      <div className="space-y-4">
                        <p className="text-sm text-muted-foreground mb-4">
                          Configure settings for the selected AI agent.
                        </p>
                        <Button className="w-full" variant="outline">
                          Configure Agent
                        </Button>
                        <Button className="w-full" variant="outline">
                          View Analytics
                        </Button>
                        <Button className="w-full" variant="outline">
                          Training Data
                        </Button>
                      </div>
                    ) : (
                      <p className="text-sm text-muted-foreground">
                        Select an AI agent to view controls and settings.
                      </p>
                    )}
                  </CardContent>
                </Card>

                <Card className="mt-4">
                  <CardHeader>
                    <CardTitle>Quick Stats</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="flex justify-between">
                      <span className="text-sm">Active Agents</span>
                      <Badge variant="outline">3</Badge>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm">Automation Workflows</span>
                      <Badge variant="outline">12</Badge>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm">Daily AI Actions</span>
                      <Badge variant="outline">147</Badge>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="insights" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Lightbulb className="h-5 w-5" />
                  AI-Generated Insights
                </CardTitle>
                <CardDescription>
                  Intelligent recommendations and predictions based on your business data
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {aiInsights.map((insight, index) => (
                    <div key={index} className="flex items-start gap-4 p-4 border rounded-lg">
                      <div className={`p-2 rounded-full ${getImpactColor(insight.impact)} bg-current/10`}>
                        {getInsightIcon(insight.type)}
                      </div>
                      <div className="flex-1">
                        <h4 className="font-semibold mb-1">{insight.title}</h4>
                        <p className="text-sm text-muted-foreground mb-2">{insight.description}</p>
                        <div className="flex items-center gap-2">
                          <Badge 
                            variant="outline" 
                            className={`${getImpactColor(insight.impact)} border-current`}
                          >
                            {insight.impact} impact
                          </Badge>
                          <Button size="sm" variant="outline">
                            {insight.action}
                          </Button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="automation" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Zap className="h-5 w-5" />
                  Automation Workflows
                </CardTitle>
                <CardDescription>
                  Manage automated workflows and business process automation
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {automationWorkflows.map((workflow) => (
                    <div key={workflow.id} className="p-4 border rounded-lg">
                      <div className="flex items-center justify-between mb-2">
                        <h4 className="font-semibold">{workflow.name}</h4>
                        <Badge className={getStatusColor(workflow.status)}>
                          {workflow.status}
                        </Badge>
                      </div>
                      <p className="text-sm text-muted-foreground mb-3">{workflow.description}</p>
                      
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                        <div>
                          <span className="font-medium text-muted-foreground">Triggers:</span>
                          <div className="flex flex-wrap gap-1 mt-1">
                            {workflow.triggers.map((trigger) => (
                              <Badge key={trigger} variant="outline" className="text-xs">
                                {trigger}
                              </Badge>
                            ))}
                          </div>
                        </div>
                        <div>
                          <span className="font-medium text-muted-foreground">Actions:</span>
                          <div className="flex flex-wrap gap-1 mt-1">
                            {workflow.actions.map((action) => (
                              <Badge key={action} variant="outline" className="text-xs">
                                {action}
                              </Badge>
                            ))}
                          </div>
                        </div>
                      </div>
                      
                      <div className="flex gap-2 mt-4">
                        <Button size="sm" variant="outline">
                          Configure
                        </Button>
                        <Button size="sm" variant="outline">
                          View Logs
                        </Button>
                        <Button size="sm" variant="outline">
                          Test Run
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="settings" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Settings className="h-5 w-5" />
                  AI Configuration
                </CardTitle>
                <CardDescription>
                  Global AI settings and preferences
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  <div>
                    <h4 className="font-medium mb-2">General AI Settings</h4>
                    <div className="space-y-2">
                      <label className="flex items-center space-x-2">
                        <input type="checkbox" className="rounded" defaultChecked />
                        <span className="text-sm">Enable AI recommendations</span>
                      </label>
                      <label className="flex items-center space-x-2">
                        <input type="checkbox" className="rounded" defaultChecked />
                        <span className="text-sm">Auto-generate insights</span>
                      </label>
                      <label className="flex items-center space-x-2">
                        <input type="checkbox" className="rounded" />
                        <span className="text-sm">Advanced analytics mode</span>
                      </label>
                    </div>
                  </div>

                  <div>
                    <h4 className="font-medium mb-2">Automation Preferences</h4>
                    <div className="space-y-2">
                      <label className="flex items-center space-x-2">
                        <input type="checkbox" className="rounded" defaultChecked />
                        <span className="text-sm">Auto-approve low-risk actions</span>
                      </label>
                      <label className="flex items-center space-x-2">
                        <input type="checkbox" className="rounded" defaultChecked />
                        <span className="text-sm">Send automation notifications</span>
                      </label>
                      <label className="flex items-center space-x-2">
                        <input type="checkbox" className="rounded" />
                        <span className="text-sm">Enable predictive scheduling</span>
                      </label>
                    </div>
                  </div>

                  <div className="pt-4 border-t">
                    <Button className="w-full md:w-auto">
                      Save AI Settings
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </PageLayout>
  );
};

export default AiCenterPage;
