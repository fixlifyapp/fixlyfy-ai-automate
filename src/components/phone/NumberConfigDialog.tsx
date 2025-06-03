
import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Bot, Phone, MessageSquare, Settings, Save, X } from 'lucide-react';
import { PhoneNumberAssignment } from '@/types/phone';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';

interface NumberConfigDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  assignment: PhoneNumberAssignment;
}

interface ConfigFormData {
  assigned_name: string;
  ai_settings: {
    enabled: boolean;
    voice: string;
    greeting: string;
    emergency_detection: boolean;
  };
  sms_settings: {
    enabled: boolean;
    auto_reply: boolean;
    keywords: string[];
  };
  call_settings: {
    enabled: boolean;
    forwarding_number: string;
    voicemail_enabled: boolean;
    call_recording: boolean;
  };
}

export const NumberConfigDialog: React.FC<NumberConfigDialogProps> = ({
  open,
  onOpenChange,
  assignment
}) => {
  const queryClient = useQueryClient();
  
  const [formData, setFormData] = useState<ConfigFormData>({
    assigned_name: assignment.assigned_name || '',
    ai_settings: {
      enabled: assignment.ai_settings?.enabled || false,
      voice: assignment.ai_settings?.voice || 'alloy',
      greeting: assignment.ai_settings?.greeting || 'Hello, how can I help you today?',
      emergency_detection: assignment.ai_settings?.emergency_detection || false,
    },
    sms_settings: {
      enabled: assignment.sms_settings?.enabled || false,
      auto_reply: assignment.sms_settings?.auto_reply || false,
      keywords: assignment.sms_settings?.keywords || [],
    },
    call_settings: {
      enabled: assignment.call_settings?.enabled || true,
      forwarding_number: assignment.call_settings?.forwarding_number || '',
      voicemail_enabled: assignment.call_settings?.voicemail_enabled || true,
      call_recording: assignment.call_settings?.call_recording || false,
    }
  });

  const [keywordInput, setKeywordInput] = useState('');

  useEffect(() => {
    setFormData({
      assigned_name: assignment.assigned_name || '',
      ai_settings: {
        enabled: assignment.ai_settings?.enabled || false,
        voice: assignment.ai_settings?.voice || 'alloy',
        greeting: assignment.ai_settings?.greeting || 'Hello, how can I help you today?',
        emergency_detection: assignment.ai_settings?.emergency_detection || false,
      },
      sms_settings: {
        enabled: assignment.sms_settings?.enabled || false,
        auto_reply: assignment.sms_settings?.auto_reply || false,
        keywords: assignment.sms_settings?.keywords || [],
      },
      call_settings: {
        enabled: assignment.call_settings?.enabled || true,
        forwarding_number: assignment.call_settings?.forwarding_number || '',
        voicemail_enabled: assignment.call_settings?.voicemail_enabled || true,
        call_recording: assignment.call_settings?.call_recording || false,
      }
    });
  }, [assignment]);

  const updateAssignment = useMutation({
    mutationFn: async (data: Partial<PhoneNumberAssignment>) => {
      const { error } = await supabase
        .from('phone_number_assignments')
        .update(data)
        .eq('id', assignment.id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['phone-number-assignments'] });
      toast({
        title: "Configuration Updated",
        description: "Phone number settings have been saved successfully.",
      });
      onOpenChange(false);
    },
    onError: (error) => {
      console.error('Error updating assignment:', error);
      toast({
        title: "Error",
        description: "Failed to update phone number settings. Please try again.",
        variant: "destructive"
      });
    }
  });

  const handleSave = () => {
    updateAssignment.mutate({
      assigned_name: formData.assigned_name,
      ai_settings: formData.ai_settings,
      sms_settings: formData.sms_settings,
      call_settings: formData.call_settings,
    });
  };

  const addKeyword = () => {
    if (keywordInput.trim() && !formData.sms_settings.keywords.includes(keywordInput.trim())) {
      setFormData(prev => ({
        ...prev,
        sms_settings: {
          ...prev.sms_settings,
          keywords: [...prev.sms_settings.keywords, keywordInput.trim()]
        }
      }));
      setKeywordInput('');
    }
  };

  const removeKeyword = (keyword: string) => {
    setFormData(prev => ({
      ...prev,
      sms_settings: {
        ...prev.sms_settings,
        keywords: prev.sms_settings.keywords.filter(k => k !== keyword)
      }
    }));
  };

  const formatPhoneNumber = (phone: string) => {
    return phone.replace(/^\+1/, '').replace(/(\d{3})(\d{3})(\d{4})/, '($1) $2-$3');
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Settings className="h-5 w-5" />
            Configure {formatPhoneNumber(assignment.phone_number)}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Basic Settings</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div>
                  <Label htmlFor="assigned_name">Display Name</Label>
                  <Input
                    id="assigned_name"
                    value={formData.assigned_name}
                    onChange={(e) => setFormData(prev => ({ ...prev, assigned_name: e.target.value }))}
                    placeholder="e.g., Main Business Line, Support Line"
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          <Tabs defaultValue="ai" className="w-full">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="ai">
                <Bot className="h-4 w-4 mr-2" />
                AI Settings
              </TabsTrigger>
              <TabsTrigger value="sms">
                <MessageSquare className="h-4 w-4 mr-2" />
                SMS Settings
              </TabsTrigger>
              <TabsTrigger value="calls">
                <Phone className="h-4 w-4 mr-2" />
                Call Settings
              </TabsTrigger>
            </TabsList>

            <TabsContent value="ai" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Bot className="h-5 w-5" />
                    AI Voice Dispatcher
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <Label htmlFor="ai_enabled">Enable AI Dispatcher</Label>
                      <p className="text-sm text-muted-foreground">
                        AI will handle incoming calls automatically
                      </p>
                    </div>
                    <Switch
                      id="ai_enabled"
                      checked={formData.ai_settings.enabled}
                      onCheckedChange={(checked) => 
                        setFormData(prev => ({
                          ...prev,
                          ai_settings: { ...prev.ai_settings, enabled: checked }
                        }))
                      }
                    />
                  </div>

                  {formData.ai_settings.enabled && (
                    <>
                      <div>
                        <Label htmlFor="voice">Voice Selection</Label>
                        <Select 
                          value={formData.ai_settings.voice} 
                          onValueChange={(value) => 
                            setFormData(prev => ({
                              ...prev,
                              ai_settings: { ...prev.ai_settings, voice: value }
                            }))
                          }
                        >
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="alloy">Alloy (Neutral)</SelectItem>
                            <SelectItem value="echo">Echo (Male)</SelectItem>
                            <SelectItem value="fable">Fable (British)</SelectItem>
                            <SelectItem value="onyx">Onyx (Deep)</SelectItem>
                            <SelectItem value="nova">Nova (Female)</SelectItem>
                            <SelectItem value="shimmer">Shimmer (Soft)</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>

                      <div>
                        <Label htmlFor="greeting">Greeting Message</Label>
                        <Textarea
                          id="greeting"
                          value={formData.ai_settings.greeting}
                          onChange={(e) => 
                            setFormData(prev => ({
                              ...prev,
                              ai_settings: { ...prev.ai_settings, greeting: e.target.value }
                            }))
                          }
                          placeholder="Hello, thank you for calling. How can I help you today?"
                          rows={3}
                        />
                      </div>

                      <div className="flex items-center justify-between">
                        <div>
                          <Label htmlFor="emergency_detection">Emergency Detection</Label>
                          <p className="text-sm text-muted-foreground">
                            Automatically detect and prioritize emergency calls
                          </p>
                        </div>
                        <Switch
                          id="emergency_detection"
                          checked={formData.ai_settings.emergency_detection}
                          onCheckedChange={(checked) => 
                            setFormData(prev => ({
                              ...prev,
                              ai_settings: { ...prev.ai_settings, emergency_detection: checked }
                            }))
                          }
                        />
                      </div>
                    </>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="sms" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <MessageSquare className="h-5 w-5" />
                    SMS Configuration
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <Label htmlFor="sms_enabled">Enable SMS</Label>
                      <p className="text-sm text-muted-foreground">
                        Allow receiving and sending SMS messages
                      </p>
                    </div>
                    <Switch
                      id="sms_enabled"
                      checked={formData.sms_settings.enabled}
                      onCheckedChange={(checked) => 
                        setFormData(prev => ({
                          ...prev,
                          sms_settings: { ...prev.sms_settings, enabled: checked }
                        }))
                      }
                    />
                  </div>

                  {formData.sms_settings.enabled && (
                    <>
                      <div className="flex items-center justify-between">
                        <div>
                          <Label htmlFor="auto_reply">Auto-Reply</Label>
                          <p className="text-sm text-muted-foreground">
                            Automatically respond to incoming SMS
                          </p>
                        </div>
                        <Switch
                          id="auto_reply"
                          checked={formData.sms_settings.auto_reply}
                          onCheckedChange={(checked) => 
                            setFormData(prev => ({
                              ...prev,
                              sms_settings: { ...prev.sms_settings, auto_reply: checked }
                            }))
                          }
                        />
                      </div>

                      <div>
                        <Label htmlFor="keywords">Trigger Keywords</Label>
                        <div className="flex gap-2 mb-2">
                          <Input
                            value={keywordInput}
                            onChange={(e) => setKeywordInput(e.target.value)}
                            placeholder="Add keyword..."
                            onKeyPress={(e) => e.key === 'Enter' && addKeyword()}
                          />
                          <Button onClick={addKeyword} size="sm">Add</Button>
                        </div>
                        <div className="flex flex-wrap gap-2">
                          {formData.sms_settings.keywords.map((keyword) => (
                            <Badge key={keyword} variant="secondary" className="flex items-center gap-1">
                              {keyword}
                              <X 
                                className="h-3 w-3 cursor-pointer" 
                                onClick={() => removeKeyword(keyword)}
                              />
                            </Badge>
                          ))}
                        </div>
                      </div>
                    </>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="calls" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Phone className="h-5 w-5" />
                    Call Configuration
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <Label htmlFor="call_enabled">Enable Calls</Label>
                      <p className="text-sm text-muted-foreground">
                        Allow incoming and outgoing calls
                      </p>
                    </div>
                    <Switch
                      id="call_enabled"
                      checked={formData.call_settings.enabled}
                      onCheckedChange={(checked) => 
                        setFormData(prev => ({
                          ...prev,
                          call_settings: { ...prev.call_settings, enabled: checked }
                        }))
                      }
                    />
                  </div>

                  {formData.call_settings.enabled && (
                    <>
                      <div>
                        <Label htmlFor="forwarding_number">Call Forwarding Number</Label>
                        <Input
                          id="forwarding_number"
                          value={formData.call_settings.forwarding_number}
                          onChange={(e) => 
                            setFormData(prev => ({
                              ...prev,
                              call_settings: { ...prev.call_settings, forwarding_number: e.target.value }
                            }))
                          }
                          placeholder="+1 (555) 123-4567"
                        />
                        <p className="text-sm text-muted-foreground">
                          Forward calls to this number when AI is not handling them
                        </p>
                      </div>

                      <div className="flex items-center justify-between">
                        <div>
                          <Label htmlFor="voicemail_enabled">Enable Voicemail</Label>
                          <p className="text-sm text-muted-foreground">
                            Allow callers to leave voicemail messages
                          </p>
                        </div>
                        <Switch
                          id="voicemail_enabled"
                          checked={formData.call_settings.voicemail_enabled}
                          onCheckedChange={(checked) => 
                            setFormData(prev => ({
                              ...prev,
                              call_settings: { ...prev.call_settings, voicemail_enabled: checked }
                            }))
                          }
                        />
                      </div>

                      <div className="flex items-center justify-between">
                        <div>
                          <Label htmlFor="call_recording">Call Recording</Label>
                          <p className="text-sm text-muted-foreground">
                            Record all incoming and outgoing calls
                          </p>
                        </div>
                        <Switch
                          id="call_recording"
                          checked={formData.call_settings.call_recording}
                          onCheckedChange={(checked) => 
                            setFormData(prev => ({
                              ...prev,
                              call_settings: { ...prev.call_settings, call_recording: checked }
                            }))
                          }
                        />
                      </div>
                    </>
                  )}
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>

          <div className="flex justify-end gap-3 pt-4 border-t">
            <Button variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button onClick={handleSave} disabled={updateAssignment.isPending}>
              <Save className="h-4 w-4 mr-2" />
              {updateAssignment.isPending ? 'Saving...' : 'Save Configuration'}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
