
import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Bot, MessageSquare, Phone, Save } from 'lucide-react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { PhoneNumberAssignment } from '@/types/phone';
import { toast } from '@/hooks/use-toast';

interface NumberConfigDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  assignment: PhoneNumberAssignment;
}

export const NumberConfigDialog = ({ open, onOpenChange, assignment }: NumberConfigDialogProps) => {
  const [formData, setFormData] = useState({
    assigned_name: assignment.assigned_name || '',
    ai_settings: {
      enabled: assignment.ai_settings?.enabled || false,
      voice: assignment.ai_settings?.voice || 'alloy',
      greeting: assignment.ai_settings?.greeting || '',
      emergency_detection: assignment.ai_settings?.emergency_detection || true,
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

  const queryClient = useQueryClient();

  const updateAssignment = useMutation({
    mutationFn: async (data: typeof formData) => {
      const { error } = await supabase
        .from('phone_number_assignments')
        .update({
          assigned_name: data.assigned_name,
          ai_settings: data.ai_settings,
          sms_settings: data.sms_settings,
          call_settings: data.call_settings,
        })
        .eq('id', assignment.id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['phone-number-assignments'] });
      toast({
        title: "Configuration Updated",
        description: "Phone number configuration has been saved successfully.",
      });
      onOpenChange(false);
    },
    onError: (error) => {
      console.error('Error updating configuration:', error);
      toast({
        title: "Error",
        description: "Failed to update configuration. Please try again.",
        variant: "destructive"
      });
    }
  });

  const handleSave = () => {
    updateAssignment.mutate(formData);
  };

  const formatPhoneNumber = (phone: string) => {
    return phone.replace(/^\+1/, '').replace(/(\d{3})(\d{3})(\d{4})/, '($1) $2-$3');
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Phone className="h-5 w-5" />
            Configure {formatPhoneNumber(assignment.phone_number)}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          <div>
            <Label htmlFor="assigned_name">Number Name (Optional)</Label>
            <Input
              id="assigned_name"
              value={formData.assigned_name}
              onChange={(e) => setFormData(prev => ({ ...prev, assigned_name: e.target.value }))}
              placeholder="e.g., Main Office, Support Line"
            />
          </div>

          <Tabs defaultValue="ai" className="w-full">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="ai" className="flex items-center gap-2">
                <Bot className="h-4 w-4" />
                AI Settings
              </TabsTrigger>
              <TabsTrigger value="sms" className="flex items-center gap-2">
                <MessageSquare className="h-4 w-4" />
                SMS Settings
              </TabsTrigger>
              <TabsTrigger value="calls" className="flex items-center gap-2">
                <Phone className="h-4 w-4" />
                Call Settings
              </TabsTrigger>
            </TabsList>

            <TabsContent value="ai" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">AI Dispatcher Configuration</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <Label>Enable AI Dispatcher</Label>
                      <p className="text-sm text-muted-foreground">
                        Automatically handle incoming calls with AI
                      </p>
                    </div>
                    <Switch
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
                        <Label htmlFor="voice">AI Voice</Label>
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
                        <Label htmlFor="greeting">Custom Greeting</Label>
                        <Textarea
                          id="greeting"
                          value={formData.ai_settings.greeting}
                          onChange={(e) => 
                            setFormData(prev => ({
                              ...prev,
                              ai_settings: { ...prev.ai_settings, greeting: e.target.value }
                            }))
                          }
                          placeholder="Hello, you've reached our AI assistant. How can I help you today?"
                          rows={3}
                        />
                      </div>

                      <div className="flex items-center justify-between">
                        <div>
                          <Label>Emergency Detection</Label>
                          <p className="text-sm text-muted-foreground">
                            Automatically detect and prioritize emergency calls
                          </p>
                        </div>
                        <Switch
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
                  <CardTitle className="text-lg">SMS Configuration</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <Label>Enable SMS</Label>
                      <p className="text-sm text-muted-foreground">
                        Allow sending and receiving SMS messages
                      </p>
                    </div>
                    <Switch
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
                          <Label>Auto-Reply</Label>
                          <p className="text-sm text-muted-foreground">
                            Automatically respond to incoming messages
                          </p>
                        </div>
                        <Switch
                          checked={formData.sms_settings.auto_reply}
                          onCheckedChange={(checked) => 
                            setFormData(prev => ({
                              ...prev,
                              sms_settings: { ...prev.sms_settings, auto_reply: checked }
                            }))
                          }
                        />
                      </div>
                    </>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="calls" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Call Configuration</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <Label>Enable Calls</Label>
                      <p className="text-sm text-muted-foreground">
                        Allow incoming and outgoing calls
                      </p>
                    </div>
                    <Switch
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
                        <Label htmlFor="forwarding_number">Forwarding Number (Optional)</Label>
                        <Input
                          id="forwarding_number"
                          value={formData.call_settings.forwarding_number}
                          onChange={(e) => 
                            setFormData(prev => ({
                              ...prev,
                              call_settings: { ...prev.call_settings, forwarding_number: e.target.value }
                            }))
                          }
                          placeholder="+1234567890"
                        />
                      </div>

                      <div className="flex items-center justify-between">
                        <div>
                          <Label>Voicemail</Label>
                          <p className="text-sm text-muted-foreground">
                            Enable voicemail for missed calls
                          </p>
                        </div>
                        <Switch
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
                          <Label>Call Recording</Label>
                          <p className="text-sm text-muted-foreground">
                            Record all calls for quality and training
                          </p>
                        </div>
                        <Switch
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

          <div className="flex justify-end gap-3">
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
