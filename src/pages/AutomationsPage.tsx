
import { useState } from "react";
import { PageLayout } from "@/components/layout/PageLayout";
import { Button } from "@/components/ui/button";
import { Plus, Zap, ChevronRight, Settings, Calendar, Clock, Mail, User } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { AutomationsList } from "@/components/automations/AutomationsList";
import { CreateAutomationDialog } from "@/components/automations/CreateAutomationDialog";
import { AutomationInsights } from "@/components/automations/AutomationInsights";
import { QuickStartItemDialog } from "@/components/automations/QuickStartItemDialog";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Separator } from "@/components/ui/separator";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";

const AutomationsPage = () => {
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [activeTab, setActiveTab] = useState("all");
  const [quickStartItemOpen, setQuickStartItemOpen] = useState(false);
  const [selectedQuickStartItem, setSelectedQuickStartItem] = useState<typeof quickStartItems[0] | null>(null);
  const [managingSettings, setManagingSettings] = useState(false);
  const [viewDetailOpen, setViewDetailOpen] = useState(false);
  const [selectedAutomation, setSelectedAutomation] = useState<any>(null);
  
  const handleQuickStartItemClick = (item: typeof quickStartItems[0]) => {
    setSelectedQuickStartItem(item);
    setQuickStartItemOpen(true);
  };
  
  const handleManageClick = () => {
    setManagingSettings(true);
  };
  
  const handleViewAutomationDetails = (automation: any) => {
    setSelectedAutomation(automation);
    setViewDetailOpen(true);
  };
  
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
                  <Button variant="outline" size="sm" onClick={handleManageClick}>
                    <Settings size={16} className="mr-2" /> Manage
                  </Button>
                </div>
              </div>
              
              <TabsContent value="all" className="m-0">
                <AutomationsList category="all" onViewDetails={handleViewAutomationDetails} />
              </TabsContent>
              
              <TabsContent value="reminders" className="m-0">
                <AutomationsList category="reminders" onViewDetails={handleViewAutomationDetails} />
              </TabsContent>
              
              <TabsContent value="marketing" className="m-0">
                <AutomationsList category="marketing" onViewDetails={handleViewAutomationDetails} />
              </TabsContent>
              
              <TabsContent value="follow-ups" className="m-0">
                <AutomationsList category="follow-ups" onViewDetails={handleViewAutomationDetails} />
              </TabsContent>
              
              <TabsContent value="actions" className="m-0">
                <AutomationsList category="actions" onViewDetails={handleViewAutomationDetails} />
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
                    onClick={() => handleQuickStartItemClick(item)}
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
          
          <AutomationInsights />
        </div>
      </div>
      
      <CreateAutomationDialog open={createDialogOpen} onOpenChange={setCreateDialogOpen} />
      {selectedQuickStartItem && (
        <QuickStartItemDialog 
          open={quickStartItemOpen}
          onOpenChange={setQuickStartItemOpen}
          item={selectedQuickStartItem}
        />
      )}

      {/* Automation Management Dialog */}
      <Dialog open={managingSettings} onOpenChange={setManagingSettings}>
        <DialogContent className="sm:max-w-[550px]">
          <h2 className="text-xl font-semibold mb-4">Automation Settings</h2>
          <div className="space-y-4">
            <div className="space-y-2">
              <h3 className="font-medium">Notification Settings</h3>
              <div className="flex items-center justify-between">
                <label className="text-sm text-fixlyfy-text-secondary">
                  Email notifications for failed automations
                </label>
                <Switch defaultChecked />
              </div>
              <div className="flex items-center justify-between">
                <label className="text-sm text-fixlyfy-text-secondary">
                  Daily automation summary report
                </label>
                <Switch />
              </div>
            </div>
            <Separator />
            <div className="space-y-2">
              <h3 className="font-medium">Performance Settings</h3>
              <div className="flex items-center justify-between">
                <label className="text-sm text-fixlyfy-text-secondary">
                  AI optimization suggestions
                </label>
                <Switch defaultChecked />
              </div>
              <div className="flex items-center justify-between">
                <label className="text-sm text-fixlyfy-text-secondary">
                  Auto-disable failing automations
                </label>
                <Switch />
              </div>
            </div>
          </div>
          <div className="flex justify-end gap-3 mt-6">
            <Button variant="outline" onClick={() => setManagingSettings(false)}>
              Cancel
            </Button>
            <Button onClick={() => setManagingSettings(false)}>
              Save Settings
            </Button>
          </div>
        </DialogContent>
      </Dialog>
      
      {/* Automation Details Dialog */}
      <Dialog open={viewDetailOpen} onOpenChange={setViewDetailOpen}>
        <DialogContent className="sm:max-w-[700px] max-h-[80vh] overflow-y-auto">
          {selectedAutomation && (
            <div>
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center">
                  <div className="bg-fixlyfy/10 p-2 rounded mr-3">
                    <selectedAutomation.icon size={20} className="text-fixlyfy" />
                  </div>
                  <div>
                    <h2 className="text-xl font-semibold">{selectedAutomation.name}</h2>
                    <p className="text-sm text-fixlyfy-text-secondary">{selectedAutomation.description}</p>
                  </div>
                </div>
                <Badge className={
                  selectedAutomation.status === "active" ? "bg-fixlyfy-success" : 
                  selectedAutomation.status === "disabled" ? "bg-fixlyfy-text-secondary" : 
                  "bg-amber-500"
                }>
                  {selectedAutomation.status === "active" ? "Active" : 
                   selectedAutomation.status === "disabled" ? "Disabled" : 
                   "Draft"}
                </Badge>
              </div>
              
              <div className="space-y-6">
                <div className="space-y-2">
                  <h3 className="text-sm font-semibold text-fixlyfy-text-secondary">TRIGGER</h3>
                  <div className="bg-fixlyfy/5 p-3 rounded-md">
                    <div className="flex items-center">
                      <Clock size={16} className="text-fixlyfy mr-2" />
                      <p>{selectedAutomation.trigger}</p>
                    </div>
                  </div>
                </div>
                
                <div className="space-y-2">
                  <h3 className="text-sm font-semibold text-fixlyfy-text-secondary">ACTION</h3>
                  <div className="bg-fixlyfy/5 p-3 rounded-md">
                    <div className="flex items-center">
                      <Mail size={16} className="text-fixlyfy mr-2" />
                      <p>{selectedAutomation.action}</p>
                    </div>
                  </div>
                </div>
                
                <div className="space-y-2">
                  <h3 className="text-sm font-semibold text-fixlyfy-text-secondary">MESSAGE CONTENT</h3>
                  <div className="bg-white border border-fixlyfy-border p-3 rounded-md">
                    <p className="text-sm">Hello {`{ClientFirstName}`},</p>
                    <p className="text-sm mt-2">This is a reminder about your upcoming appointment on {`{JobDate}`} at {`{JobTime}`}.</p>
                    <p className="text-sm mt-2">If you need to reschedule, please call us at (123) 456-7890.</p>
                    <p className="text-sm mt-4">Thank you,<br/>{`{CompanyName}`}</p>
                  </div>
                </div>
                
                <div className="space-y-2">
                  <h3 className="text-sm font-semibold text-fixlyfy-text-secondary">PERFORMANCE</h3>
                  <div className="grid grid-cols-3 gap-4">
                    <div className="border border-fixlyfy-border p-3 rounded-md text-center">
                      <p className="text-xs text-fixlyfy-text-secondary">Total Runs</p>
                      <p className="text-xl font-semibold">{selectedAutomation.runCount}</p>
                    </div>
                    <div className="border border-fixlyfy-border p-3 rounded-md text-center">
                      <p className="text-xs text-fixlyfy-text-secondary">Success Rate</p>
                      <p className="text-xl font-semibold text-fixlyfy-success">{selectedAutomation.successRate}%</p>
                    </div>
                    <div className="border border-fixlyfy-border p-3 rounded-md text-center">
                      <p className="text-xs text-fixlyfy-text-secondary">Last Run</p>
                      <p className="text-sm font-medium">{selectedAutomation.lastRun || "Never"}</p>
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="flex justify-end gap-3 mt-6">
                <Button variant="outline">
                  <Settings size={16} className="mr-2" /> Edit
                </Button>
                <Button className="bg-fixlyfy hover:bg-fixlyfy/90">
                  Run Now
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
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
