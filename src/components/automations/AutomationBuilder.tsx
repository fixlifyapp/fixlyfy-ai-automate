

import { useState } from "react";
import { useAutomations } from "@/hooks/useAutomations";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { VariableSelector } from "./VariableSelector";
import { 
  Plus, 
  Trash2, 
  Zap, 
  Settings, 
  MessageSquare, 
  Phone, 
  Mail,
  Clock,
  Brain,
  Sparkles
} from "lucide-react";

interface AutomationBuilderProps {
  onClose: () => void;
  onSave: () => void;
}

export const AutomationBuilder = ({ onClose, onSave }: AutomationBuilderProps) => {
  const { createAutomation, variables } = useAutomations();
  const [activeTab, setActiveTab] = useState("basic");
  const [automation, setAutomation] = useState({
    name: "",
    description: "",
    category: "custom",
    status: "draft" as const
  });
  
  const [triggers, setTriggers] = useState([{
    id: Date.now().toString(),
    trigger_type: 'event' as const,
    event_type: '',
    conditions: {}
  }]);
  
  const [actions, setActions] = useState([{
    id: Date.now().toString(),
    action_type: 'send_sms' as const,
    action_config: { message: '', to_number: '' },
    sequence_order: 1,
    delay_minutes: 0
  }]);

  const handleSave = async () => {
    const newAutomation = await createAutomation(automation);
    if (newAutomation) {
      onSave();
    }
  };

  const addTrigger = () => {
    setTriggers([...triggers, {
      id: Date.now().toString(),
      trigger_type: 'event',
      event_type: '',
      conditions: {}
    }]);
  };

  const addAction = () => {
    setActions([...actions, {
      id: Date.now().toString(),
      action_type: 'send_sms',
      action_config: { message: '', to_number: '' },
      sequence_order: actions.length + 1,
      delay_minutes: 0
    }]);
  };

  const updateActionMessage = (actionIndex: number, message: string) => {
    const newActions = [...actions];
    newActions[actionIndex].action_config = {
      ...newActions[actionIndex].action_config,
      message
    };
    setActions(newActions);
  };

  const insertVariableIntoMessage = (actionIndex: number, variable: string) => {
    const currentMessage = actions[actionIndex].action_config.message || '';
    updateActionMessage(actionIndex, currentMessage + variable);
  };

  const triggerOptions = [
    { value: 'job_created', label: 'Job Created', icon: <Plus className="w-4 h-4" /> },
    { value: 'job_completed', label: 'Job Completed', icon: <Zap className="w-4 h-4" /> },
    { value: 'estimate_sent', label: 'Estimate Sent', icon: <Mail className="w-4 h-4" /> },
    { value: 'invoice_overdue', label: 'Invoice Overdue', icon: <Clock className="w-4 h-4" /> },
    { value: 'missed_call', label: 'Missed Call', icon: <Phone className="w-4 h-4" /> }
  ];

  const actionOptions = [
    { value: 'send_sms', label: 'Send SMS', icon: <MessageSquare className="w-4 h-4" /> },
    { value: 'send_email', label: 'Send Email', icon: <Mail className="w-4 h-4" /> },
    { value: 'make_call', label: 'Make Call', icon: <Phone className="w-4 h-4" /> },
    { value: 'create_task', label: 'Create Task', icon: <Plus className="w-4 h-4" /> }
  ];

  // Common variables for quick reference
  const commonVariables = [
    { key: 'CustomerName', label: 'Customer Name' },
    { key: 'CustomerFirstName', label: 'First Name' },
    { key: 'JobDate', label: 'Job Date' },
    { key: 'JobTime', label: 'Job Time' },
    { key: 'InvoiceAmount', label: 'Invoice Amount' },
    { key: 'CompanyName', label: 'Company Name' }
  ];

  return (
    <Dialog open onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-xl">
            <div className="p-2 bg-gradient-to-r from-primary to-primary/80 rounded-lg">
              <Brain className="w-5 h-5 text-white" />
            </div>
            Automation Builder
          </DialogTitle>
        </DialogHeader>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="basic">Basic Info</TabsTrigger>
            <TabsTrigger value="triggers">Triggers</TabsTrigger>
            <TabsTrigger value="actions">Actions</TabsTrigger>
            <TabsTrigger value="review">Review</TabsTrigger>
          </TabsList>

          <TabsContent value="basic" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Settings className="w-5 h-5" />
                  Basic Information
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Automation Name</Label>
                  <Input
                    id="name"
                    value={automation.name}
                    onChange={(e) => setAutomation({ ...automation, name: e.target.value })}
                    placeholder="e.g., Appointment Reminders"
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="description">Description</Label>
                  <Textarea
                    id="description"
                    value={automation.description}
                    onChange={(e) => setAutomation({ ...automation, description: e.target.value })}
                    placeholder="Describe what this automation does..."
                    rows={3}
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="category">Category</Label>
                  <Select 
                    value={automation.category} 
                    onValueChange={(value) => setAutomation({ ...automation, category: value })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="reminders">Reminders</SelectItem>
                      <SelectItem value="marketing">Marketing</SelectItem>
                      <SelectItem value="follow-ups">Follow-ups</SelectItem>
                      <SelectItem value="calls">Calls</SelectItem>
                      <SelectItem value="billing">Billing</SelectItem>
                      <SelectItem value="custom">Custom</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="triggers" className="space-y-6">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle className="flex items-center gap-2">
                  <Zap className="w-5 h-5" />
                  Automation Triggers
                </CardTitle>
                <Button onClick={addTrigger} size="sm">
                  <Plus className="w-4 h-4 mr-2" />
                  Add Trigger
                </Button>
              </CardHeader>
              <CardContent className="space-y-4">
                {triggers.map((trigger, index) => (
                  <Card key={trigger.id} className="border-l-4 border-l-primary">
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between mb-4">
                        <Badge variant="outline">Trigger {index + 1}</Badge>
                        {triggers.length > 1 && (
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => setTriggers(triggers.filter(t => t.id !== trigger.id))}
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        )}
                      </div>
                      
                      <div className="space-y-3">
                        <div>
                          <Label>Trigger Event</Label>
                          <Select>
                            <SelectTrigger>
                              <SelectValue placeholder="Select trigger event" />
                            </SelectTrigger>
                            <SelectContent>
                              {triggerOptions.map((option) => (
                                <SelectItem key={option.value} value={option.value}>
                                  <div className="flex items-center gap-2">
                                    {option.icon}
                                    {option.label}
                                  </div>
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="actions" className="space-y-6">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle className="flex items-center gap-2">
                  <MessageSquare className="w-5 h-5" />
                  Automation Actions
                </CardTitle>
                <Button onClick={addAction} size="sm">
                  <Plus className="w-4 h-4 mr-2" />
                  Add Action
                </Button>
              </CardHeader>
              <CardContent className="space-y-4">
                {actions.map((action, index) => (
                  <Card key={action.id} className="border-l-4 border-l-green-500">
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between mb-4">
                        <Badge variant="outline">Action {index + 1}</Badge>
                        {actions.length > 1 && (
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => setActions(actions.filter(a => a.id !== action.id))}
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        )}
                      </div>
                      
                      <div className="space-y-3">
                        <div>
                          <Label>Action Type</Label>
                          <Select>
                            <SelectTrigger>
                              <SelectValue placeholder="Select action type" />
                            </SelectTrigger>
                            <SelectContent>
                              {actionOptions.map((option) => (
                                <SelectItem key={option.value} value={option.value}>
                                  <div className="flex items-center gap-2">
                                    {option.icon}
                                    {option.label}
                                  </div>
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>
                        
                        <div>
                          <div className="flex items-center justify-between mb-2">
                            <Label>Message Template</Label>
                            <VariableSelector 
                              onSelectVariable={(variable) => insertVariableIntoMessage(index, variable)}
                            />
                          </div>
                          <Textarea
                            value={action.action_config.message || ''}
                            onChange={(e) => updateActionMessage(index, e.target.value)}
                            placeholder="Hi {{CustomerFirstName}}, this is a reminder about your appointment on {{JobDate}} at {{JobTime}}..."
                            rows={3}
                          />
                          <p className="text-xs text-gray-500 mt-1">
                            Use variables like {{CustomerName}} to personalize messages
                          </p>
                        </div>
                        
                        <div>
                          <Label>Delay (minutes)</Label>
                          <Input
                            type="number"
                            value={action.delay_minutes}
                            onChange={(e) => {
                              const newActions = [...actions];
                              newActions[index].delay_minutes = parseInt(e.target.value) || 0;
                              setActions(newActions);
                            }}
                            placeholder="0"
                          />
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
                
                {/* Variable Helper */}
                <Card className="bg-blue-50 border-blue-200">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-sm">
                      <Sparkles className="w-4 h-4" />
                      Available Variables
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                      {commonVariables.map((variable) => (
                        <Badge key={variable.key} variant="outline" className="justify-start">
                          {`{{${variable.key}}}`}
                        </Badge>
                      ))}
                    </div>
                    <p className="text-xs text-gray-600 mt-2">
                      Click the Variables button next to message fields to insert these automatically
                    </p>
                  </CardContent>
                </Card>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="review" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Sparkles className="w-5 h-5" />
                  Review & Save
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="p-4 bg-gray-50 rounded-lg">
                  <h3 className="font-semibold mb-2">{automation.name || 'Untitled Automation'}</h3>
                  <p className="text-sm text-gray-600 mb-3">{automation.description || 'No description'}</p>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <div className="text-sm font-medium text-gray-700">Triggers</div>
                      <div className="text-sm text-gray-600">{triggers.length} configured</div>
                    </div>
                    <div>
                      <div className="text-sm font-medium text-gray-700">Actions</div>
                      <div className="text-sm text-gray-600">{actions.length} configured</div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        <div className="flex justify-between pt-6">
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <div className="flex gap-2">
            <Button variant="outline" onClick={() => setAutomation({ ...automation, status: 'draft' })}>
              Save as Draft
            </Button>
            <Button 
              onClick={handleSave}
              className="bg-gradient-to-r from-primary to-primary/80 hover:from-primary/90 hover:to-primary/70"
            >
              Create Automation
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

