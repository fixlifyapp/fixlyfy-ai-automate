
import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Calendar, Mail, Zap, Clock, Bell, Gift, CheckCircle, AlertTriangle, User } from "lucide-react";

interface CreateAutomationDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

type TemplateCategory = {
  id: string;
  name: string;
  icon: React.ElementType;
  iconColor: string;
  templates: Template[];
};

type Template = {
  id: string;
  name: string;
  description: string;
  icon: React.ElementType;
};

const templateCategories: TemplateCategory[] = [
  {
    id: "reminders",
    name: "Reminders",
    icon: Bell,
    iconColor: "text-fixlyfy-warning",
    templates: [
      {
        id: "job-reminder",
        name: "Job Reminder",
        description: "Send reminder before scheduled job",
        icon: Calendar
      },
      {
        id: "payment-reminder",
        name: "Payment Reminder",
        description: "Remind clients about upcoming or overdue payments",
        icon: AlertTriangle
      }
    ]
  },
  {
    id: "marketing",
    name: "Marketing",
    icon: Gift,
    iconColor: "text-fixlyfy",
    templates: [
      {
        id: "seasonal-promo",
        name: "Seasonal Promotion",
        description: "Send seasonal promotions to past clients",
        icon: Gift
      },
      {
        id: "referral-request",
        name: "Referral Request",
        description: "Ask satisfied customers for referrals",
        icon: User
      }
    ]
  },
  {
    id: "follow-ups",
    name: "Follow-ups",
    icon: CheckCircle,
    iconColor: "text-fixlyfy-success",
    templates: [
      {
        id: "post-service",
        name: "Post-Service Follow-up",
        description: "Check in after service completion",
        icon: CheckCircle
      },
      {
        id: "estimate-follow",
        name: "Estimate Follow-up",
        description: "Follow up on sent estimates",
        icon: Clock
      }
    ]
  },
  {
    id: "actions",
    name: "Actions",
    icon: Zap,
    iconColor: "text-fixlyfy-info",
    templates: [
      {
        id: "auto-invoice",
        name: "Auto-Generate Invoice",
        description: "Create invoice when job is completed",
        icon: Zap
      },
      {
        id: "status-update",
        name: "Status Update",
        description: "Automatically update job status",
        icon: Zap
      }
    ]
  }
];

export const CreateAutomationDialog = ({ open, onOpenChange }: CreateAutomationDialogProps) => {
  const [activeTab, setActiveTab] = useState("templates");
  const [prompt, setPrompt] = useState("");
  const [selectedTemplate, setSelectedTemplate] = useState<Template | null>(null);
  
  const handleCreateFromPrompt = () => {
    // In a real implementation, this would send the prompt to an AI service
    console.log("Creating automation from prompt:", prompt);
    
    // For demo purposes, simply close the dialog
    onOpenChange(false);
  };
  
  const handleTemplateSelect = (template: Template) => {
    setSelectedTemplate(template);
    setActiveTab("customize");
  };
  
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle className="text-xl">Create Automation</DialogTitle>
        </DialogHeader>
        
        <Tabs value={activeTab} onValueChange={setActiveTab} className="mt-4">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="templates">Templates</TabsTrigger>
            <TabsTrigger value="ai">AI Assistant</TabsTrigger>
            <TabsTrigger value="customize" disabled={!selectedTemplate}>Customize</TabsTrigger>
          </TabsList>
          
          <TabsContent value="templates" className="mt-4 space-y-4">
            <p className="text-sm text-fixlyfy-text-secondary">
              Choose a pre-built automation template or customize your own.
            </p>
            
            <div className="space-y-6">
              {templateCategories.map((category) => (
                <div key={category.id}>
                  <div className="flex items-center mb-3">
                    <category.icon className={`mr-2 ${category.iconColor}`} size={18} />
                    <h3 className="font-medium">{category.name}</h3>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {category.templates.map((template) => (
                      <div 
                        key={template.id}
                        className="border border-fixlyfy-border rounded-md p-4 hover:border-fixlyfy/60 cursor-pointer transition-colors"
                        onClick={() => handleTemplateSelect(template)}
                      >
                        <div className="flex items-start">
                          <div className="bg-fixlyfy/10 p-2 rounded">
                            <template.icon size={16} className="text-fixlyfy" />
                          </div>
                          <div className="ml-3">
                            <h4 className="font-medium">{template.name}</h4>
                            <p className="text-xs text-fixlyfy-text-secondary mt-1">
                              {template.description}
                            </p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
            
            <div className="pt-4 flex justify-end">
              <Button variant="outline" onClick={() => onOpenChange(false)} className="mr-2">
                Cancel
              </Button>
              <Button 
                className="bg-fixlyfy hover:bg-fixlyfy/90"
                onClick={() => setActiveTab("customize")}
                disabled={!selectedTemplate}
              >
                Continue
              </Button>
            </div>
          </TabsContent>
          
          <TabsContent value="ai" className="mt-4 space-y-4">
            <div className="bg-fixlyfy/5 rounded-lg p-4 border border-fixlyfy/20">
              <div className="flex items-start">
                <div className="p-2 rounded bg-fixlyfy text-white">
                  <Zap size={16} />
                </div>
                <div className="ml-3">
                  <h3 className="font-medium">AI-Powered Automation Creator</h3>
                  <p className="text-sm text-fixlyfy-text-secondary mt-1">
                    Describe what you want to automate in plain language and our AI will build it for you.
                  </p>
                </div>
              </div>
            </div>
            
            <div className="space-y-3">
              <Label htmlFor="ai-prompt">Describe your automation</Label>
              <Input 
                id="ai-prompt"
                placeholder="e.g., Send a reminder email 24 hours before each appointment"
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                className="h-12"
              />
              <p className="text-xs text-fixlyfy-text-muted">
                Try to include when the automation should trigger and what action it should take.
              </p>
            </div>
            
            <div className="bg-gray-50 p-4 rounded-lg border border-gray-200 mt-4">
              <h4 className="font-medium mb-2 text-sm">Example prompts:</h4>
              <ul className="space-y-2 text-sm text-fixlyfy-text-secondary">
                <li className="cursor-pointer hover:text-fixlyfy" onClick={() => setPrompt("Send a reminder email 24 hours before each appointment")}>
                  • Send a reminder email 24 hours before each appointment
                </li>
                <li className="cursor-pointer hover:text-fixlyfy" onClick={() => setPrompt("Follow up on unpaid invoices after 3 days with an SMS")}>
                  • Follow up on unpaid invoices after 3 days with an SMS
                </li>
                <li className="cursor-pointer hover:text-fixlyfy" onClick={() => setPrompt("Create a task for the manager when a customer complaint is received")}>
                  • Create a task for the manager when a customer complaint is received
                </li>
              </ul>
            </div>
            
            <div className="pt-4 flex justify-end">
              <Button variant="outline" onClick={() => onOpenChange(false)} className="mr-2">
                Cancel
              </Button>
              <Button 
                className="bg-fixlyfy hover:bg-fixlyfy/90"
                onClick={handleCreateFromPrompt}
                disabled={!prompt.trim()}
              >
                Create Automation
              </Button>
            </div>
          </TabsContent>
          
          <TabsContent value="customize" className="mt-4">
            {selectedTemplate && (
              <div className="space-y-6">
                <div className="bg-fixlyfy/5 p-4 rounded-lg border border-fixlyfy/20 flex items-center">
                  <div className="bg-fixlyfy/10 p-2 rounded">
                    <selectedTemplate.icon size={16} className="text-fixlyfy" />
                  </div>
                  <div className="ml-3">
                    <h3 className="font-medium">{selectedTemplate.name}</h3>
                    <p className="text-xs text-fixlyfy-text-secondary">{selectedTemplate.description}</p>
                  </div>
                </div>
                
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="automation-name">Automation Name</Label>
                    <Input 
                      id="automation-name" 
                      defaultValue={selectedTemplate.name}
                      className="mt-1"
                    />
                  </div>
                  
                  <div>
                    <Label>When (Trigger)</Label>
                    <div className="mt-1 p-4 border border-fixlyfy-border rounded-lg">
                      <p className="text-sm">This is a placeholder for the trigger configuration UI.</p>
                      <p className="text-xs text-fixlyfy-text-secondary mt-2">
                        In a complete implementation, this would include options to select events, 
                        conditions, schedules, etc.
                      </p>
                    </div>
                  </div>
                  
                  <div>
                    <Label>Then (Action)</Label>
                    <div className="mt-1 p-4 border border-fixlyfy-border rounded-lg">
                      <p className="text-sm">This is a placeholder for the action configuration UI.</p>
                      <p className="text-xs text-fixlyfy-text-secondary mt-2">
                        In a complete implementation, this would include options to configure 
                        messages, tasks, updates, etc.
                      </p>
                    </div>
                  </div>
                </div>
                
                <div className="pt-4 flex justify-end">
                  <Button variant="outline" onClick={() => onOpenChange(false)} className="mr-2">
                    Cancel
                  </Button>
                  <Button 
                    className="bg-fixlyfy hover:bg-fixlyfy/90"
                    onClick={() => onOpenChange(false)}
                  >
                    Save Automation
                  </Button>
                </div>
              </div>
            )}
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
};
