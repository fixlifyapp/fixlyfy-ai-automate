import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Calendar, Mail, Zap, Clock, Bell, Gift, CheckCircle, AlertTriangle, User, MessageSquare, Phone } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { ActionTypeSelector } from "./ActionTypeSelector";
import { AmazonConnectConfig } from "../connect/AmazonConnectConfig";

interface CreateAutomationDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  initialTemplate?: string | null;
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
  defaultActionType?: string;
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
        icon: Calendar,
        defaultActionType: "sms"
      },
      {
        id: "payment-reminder",
        name: "Payment Reminder",
        description: "Remind clients about upcoming or overdue payments",
        icon: AlertTriangle,
        defaultActionType: "sms"
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
        icon: Gift,
        defaultActionType: "email"
      },
      {
        id: "referral-request",
        name: "Referral Request",
        description: "Ask satisfied customers for referrals",
        icon: User,
        defaultActionType: "email"
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
        icon: CheckCircle,
        defaultActionType: "sms"
      },
      {
        id: "estimate-follow",
        name: "Estimate Follow-up",
        description: "Follow up on sent estimates",
        icon: Clock,
        defaultActionType: "call"
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
        icon: Zap,
        defaultActionType: "notification"
      },
      {
        id: "status-update",
        name: "Status Update",
        description: "Automatically update job status",
        icon: Zap,
        defaultActionType: "notification"
      }
    ]
  }
];

export const CreateAutomationDialog = ({ open, onOpenChange, initialTemplate = null }: CreateAutomationDialogProps) => {
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState("templates");
  const [prompt, setPrompt] = useState("");
  const [selectedTemplate, setSelectedTemplate] = useState<Template | null>(null);
  const [selectedActionType, setSelectedActionType] = useState<string | null>(null);
  const [actionConfig, setActionConfig] = useState<any>({});
  
  useEffect(() => {
    // Find the template if initialTemplate is provided
    if (initialTemplate) {
      for (const category of templateCategories) {
        const template = category.templates.find(t => t.id === initialTemplate);
        if (template) {
          setSelectedTemplate(template);
          setActiveTab("customize");
          break;
        }
      }
    }
  }, [initialTemplate, open]);
  
  const handleCreateFromPrompt = () => {
    // In a real implementation, this would send the prompt to an AI service
    console.log("Creating automation from prompt:", prompt);
    
    toast({
      title: "Automation Created",
      description: "Your automation has been created successfully.",
    });
    
    // For demo purposes, simply close the dialog
    onOpenChange(false);
  };
  
  const handleTemplateSelect = (template: Template) => {
    setSelectedTemplate(template);
    setSelectedActionType(template.defaultActionType || null);
    setActiveTab("customize");
  };
  
  const handleActionTypeSelect = (actionType: string) => {
    setSelectedActionType(actionType);
    setActionConfig({});
  };
  
  const handleActionConfigChange = (config: any) => {
    setActionConfig(config);
  };
  
  const handleSaveTemplate = () => {
    toast({
      title: "Automation Created",
      description: `${selectedTemplate?.name} automation has been created and activated.`,
    });
    onOpenChange(false);
  };
  
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-3xl max-h-[80vh] overflow-y-auto">
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
              Choose a pre-built automation template with email, SMS, or call actions.
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
                        className={`border rounded-md p-4 cursor-pointer transition-colors ${
                          template.id === initialTemplate 
                            ? "border-fixlyfy bg-fixlyfy/5" 
                            : "border-fixlyfy-border hover:border-fixlyfy/60"
                        }`}
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
                            {template.defaultActionType && (
                              <div className="flex items-center mt-2">
                                {template.defaultActionType === 'sms' && <MessageSquare size={12} className="mr-1 text-green-500" />}
                                {template.defaultActionType === 'call' && <Phone size={12} className="mr-1 text-purple-500" />}
                                {template.defaultActionType === 'email' && <Mail size={12} className="mr-1 text-blue-500" />}
                                <span className="text-xs capitalize text-fixlyfy-text-secondary">
                                  {template.defaultActionType}
                                </span>
                              </div>
                            )}
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
                    <Label>Then (Action Type)</Label>
                    <div className="mt-2">
                      <ActionTypeSelector
                        selectedType={selectedActionType}
                        onTypeSelect={handleActionTypeSelect}
                      />
                    </div>
                  </div>

                  {selectedActionType && (selectedActionType === 'sms' || selectedActionType === 'call' || selectedActionType === 'ai-call') && (
                    <div>
                      <Label>Configure {selectedActionType.toUpperCase()} Action</Label>
                      <div className="mt-2 p-4 border border-fixlyfy-border rounded-lg">
                        <AmazonConnectConfig
                          actionType={selectedActionType as "sms" | "call" | "ai-call"}
                          config={actionConfig}
                          onChange={handleActionConfigChange}
                        />
                      </div>
                    </div>
                  )}

                  {selectedActionType && selectedActionType === 'email' && (
                    <div>
                      <Label>Configure Email Action</Label>
                      <div className="mt-1 p-4 border border-fixlyfy-border rounded-lg">
                        <p className="text-sm">Email configuration UI would go here.</p>
                        <p className="text-xs text-fixlyfy-text-secondary mt-2">
                          Subject line, body template, recipient configuration, etc.
                        </p>
                      </div>
                    </div>
                  )}
                </div>
                
                <div className="pt-4 flex justify-end">
                  <Button variant="outline" onClick={() => onOpenChange(false)} className="mr-2">
                    Cancel
                  </Button>
                  <Button 
                    className="bg-fixlyfy hover:bg-fixlyfy/90"
                    onClick={handleSaveTemplate}
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
