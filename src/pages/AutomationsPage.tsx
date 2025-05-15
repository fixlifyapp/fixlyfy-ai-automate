
import { useState } from "react";
import { PageLayout } from "@/components/layout/PageLayout";
import { Button } from "@/components/ui/button";
import { Plus, Zap, ChevronRight, Settings, Calendar, Clock, Mail, User } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { AutomationsList } from "@/components/automations/AutomationsList";
import { CreateAutomationDialog } from "@/components/automations/CreateAutomationDialog";
import { AutomationInsights } from "@/components/automations/AutomationInsights";

const AutomationsPage = () => {
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [activeTab, setActiveTab] = useState("all");
  
  return (
    <PageLayout>
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Automations</h1>
          <p className="text-fixlyfy-text-secondary">
            Create workflows to automate repetitive tasks and notifications.
          </p>
        </div>
        <Button 
          className="bg-fixlyfy hover:bg-fixlyfy/90"
          onClick={() => setCreateDialogOpen(true)}
        >
          <Plus size={18} className="mr-2" /> Create Workflow
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <div className="fixlyfy-card">
            <Tabs defaultValue="all" value={activeTab} onValueChange={setActiveTab} className="w-full">
              <div className="flex justify-between items-center p-4 border-b border-fixlyfy-border">
                <TabsList className="grid grid-cols-5 w-auto">
                  <TabsTrigger value="all">All</TabsTrigger>
                  <TabsTrigger value="reminders">Reminders</TabsTrigger>
                  <TabsTrigger value="marketing">Marketing</TabsTrigger>
                  <TabsTrigger value="follow-ups">Follow-ups</TabsTrigger>
                  <TabsTrigger value="actions">Actions</TabsTrigger>
                </TabsList>
                <div className="flex items-center gap-2">
                  <Button variant="outline" size="sm">
                    <Settings size={16} className="mr-2" /> Manage
                  </Button>
                </div>
              </div>
              
              <TabsContent value="all" className="m-0">
                <AutomationsList category="all" />
              </TabsContent>
              
              <TabsContent value="reminders" className="m-0">
                <AutomationsList category="reminders" />
              </TabsContent>
              
              <TabsContent value="marketing" className="m-0">
                <AutomationsList category="marketing" />
              </TabsContent>
              
              <TabsContent value="follow-ups" className="m-0">
                <AutomationsList category="follow-ups" />
              </TabsContent>
              
              <TabsContent value="actions" className="m-0">
                <AutomationsList category="actions" />
              </TabsContent>
            </Tabs>
          </div>

          <div className="fixlyfy-card p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-medium">Popular Templates</h2>
              <Button variant="link" className="text-fixlyfy">
                Browse All <ChevronRight size={16} className="ml-1" />
              </Button>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {popularTemplates.map((template) => (
                <div 
                  key={template.id}
                  className="border border-fixlyfy-border rounded-lg p-4 hover:border-fixlyfy/60 transition-colors cursor-pointer"
                >
                  <div className="flex items-start">
                    <div className={`p-2 rounded text-white ${template.iconBg}`}>
                      <template.icon size={16} />
                    </div>
                    <div className="ml-3">
                      <h3 className="font-medium">{template.name}</h3>
                      <p className="text-sm text-fixlyfy-text-secondary mt-1">
                        {template.description}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center mt-4 text-xs text-fixlyfy-text-muted">
                    <template.triggerIcon size={14} className="mr-1" />
                    <span>{template.trigger}</span>
                    <ChevronRight size={12} className="mx-2" />
                    <template.actionIcon size={14} className="mr-1" />
                    <span>{template.action}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="space-y-6">
          <AutomationInsights />
          
          <div className="fixlyfy-card p-6">
            <div className="flex items-center mb-4">
              <div className="w-8 h-8 rounded-md fixlyfy-gradient flex items-center justify-center text-white mr-3">
                <Zap size={18} />
              </div>
              <h2 className="text-lg font-medium">Quick Start</h2>
            </div>
            
            <div className="space-y-4">
              <p className="text-sm text-fixlyfy-text-secondary">
                Create powerful automations in just a few steps. Try these popular workflows:
              </p>
              
              <div className="space-y-3">
                {quickStartItems.map((item, index) => (
                  <div 
                    key={index} 
                    className="flex items-center p-3 border border-fixlyfy-border rounded-md hover:bg-fixlyfy/5 cursor-pointer transition-colors"
                  >
                    <div className="bg-fixlyfy/10 p-2 rounded mr-3">
                      <item.icon size={16} className="text-fixlyfy" />
                    </div>
                    <div className="flex-1">
                      <p className="font-medium text-sm">{item.title}</p>
                    </div>
                    <Button variant="ghost" size="icon">
                      <Plus size={16} />
                    </Button>
                  </div>
                ))}
              </div>
              
              <div className="pt-2">
                <Button 
                  variant="outline" 
                  className="w-full justify-center"
                  onClick={() => setCreateDialogOpen(true)}
                >
                  <Zap size={16} className="mr-2" />
                  Create Custom Automation
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      <CreateAutomationDialog open={createDialogOpen} onOpenChange={setCreateDialogOpen} />
    </PageLayout>
  );
};

export default AutomationsPage;

const popularTemplates = [
  {
    id: 1,
    name: "Payment Reminder",
    description: "Send automatic reminder 3 days before payment due date",
    icon: Calendar,
    iconBg: "bg-fixlyfy-warning",
    trigger: "3 days before payment due",
    triggerIcon: Clock,
    action: "Send email to client",
    actionIcon: Mail
  },
  {
    id: 2,
    name: "Appointment Reminder",
    description: "Remind clients 24 hours before scheduled appointment",
    icon: Calendar,
    iconBg: "bg-fixlyfy-info",
    trigger: "24 hours before appointment",
    triggerIcon: Clock,
    action: "Send SMS to client",
    actionIcon: Mail
  },
  {
    id: 3,
    name: "Follow-up After Service",
    description: "Automatically follow-up 2 days after job completion",
    icon: Zap,
    iconBg: "bg-fixlyfy",
    trigger: "Job status changes to completed",
    triggerIcon: Settings,
    action: "Send follow-up email",
    actionIcon: Mail
  },
  {
    id: 4,
    name: "New Client Onboarding",
    description: "Welcome email series for new clients",
    icon: User,
    iconBg: "bg-fixlyfy-success",
    trigger: "New client created",
    triggerIcon: User,
    action: "Send welcome sequence",
    actionIcon: Mail
  }
];

const quickStartItems = [
  {
    title: "Send reminders before appointments",
    icon: Calendar
  },
  {
    title: "Follow up on unpaid invoices",
    icon: Mail
  },
  {
    title: "Request reviews after job completion",
    icon: User
  },
  {
    title: "Alert technician when job is assigned",
    icon: Zap
  }
];
