
import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Bot, Phone, Clock, Shield, Save } from 'lucide-react';
import { useMutation } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

interface PhoneNumber {
  id: string;
  phone_number: string;
  status: string;
  ai_dispatcher_enabled?: boolean;
  configured_for_ai?: boolean;
}

interface PhoneConfigDialogProps {
  phoneNumber: PhoneNumber | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSave: () => void;
}

export const PhoneConfigDialog = ({ phoneNumber, open, onOpenChange, onSave }: PhoneConfigDialogProps) => {
  const [config, setConfig] = useState({
    // AI Settings
    voice: 'alloy',
    language: 'en-US',
    greeting: 'Hello, this is an AI assistant. How can I help you today?',
    ai_enabled: true,
    
    // Business Hours
    business_hours: {
      monday: { open: '08:00', close: '17:00', enabled: true },
      tuesday: { open: '08:00', close: '17:00', enabled: true },
      wednesday: { open: '08:00', close: '17:00', enabled: true },
      thursday: { open: '08:00', close: '17:00', enabled: true },
      friday: { open: '08:00', close: '17:00', enabled: true },
      saturday: { open: '09:00', close: '15:00', enabled: false },
      sunday: { open: '10:00', close: '14:00', enabled: false }
    },
    
    // Emergency & Forwarding
    emergency_detection: true,
    emergency_sensitivity: 'medium',
    forwarding_enabled: false,
    forwarding_number: '',
    
    // Recording
    call_recording: false,
    recording_consent: true
  });

  // Save configuration mutation
  const saveConfigMutation = useMutation({
    mutationFn: async (newConfig: typeof config) => {
      if (!phoneNumber) return;
      
      console.log('Saving phone config:', newConfig);
      const { data, error } = await supabase.functions.invoke('telnyx-phone-numbers', {
        body: {
          action: 'update_config',
          phone_number: phoneNumber.phone_number,
          config: newConfig
        }
      });

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      toast.success('Phone configuration saved successfully');
      onSave();
      onOpenChange(false);
    },
    onError: (error) => {
      console.error('Save config error:', error);
      toast.error('Failed to save configuration');
    }
  });

  const handleSave = () => {
    saveConfigMutation.mutate(config);
  };

  if (!phoneNumber) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Phone className="h-5 w-5" />
            Configure {phoneNumber.phone_number}
          </DialogTitle>
        </DialogHeader>

        <Tabs defaultValue="ai-settings" className="space-y-4">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="ai-settings">
              <Bot className="h-4 w-4 mr-2" />
              AI Settings
            </TabsTrigger>
            <TabsTrigger value="business-hours">
              <Clock className="h-4 w-4 mr-2" />
              Hours
            </TabsTrigger>
            <TabsTrigger value="emergency">
              <Shield className="h-4 w-4 mr-2" />
              Emergency
            </TabsTrigger>
            <TabsTrigger value="recording">
              <Phone className="h-4 w-4 mr-2" />
              Recording
            </TabsTrigger>
          </TabsList>

          <TabsContent value="ai-settings" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Voice & Language</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="voice">Voice Type</Label>
                    <Select
                      value={config.voice}
                      onValueChange={(value) => 
                        setConfig(prev => ({ ...prev, voice: value }))
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
                    <Label htmlFor="language">Language</Label>
                    <Select
                      value={config.language}
                      onValueChange={(value) => 
                        setConfig(prev => ({ ...prev, language: value }))
                      }
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="en-US">English (US)</SelectItem>
                        <SelectItem value="en-GB">English (UK)</SelectItem>
                        <SelectItem value="es-ES">Spanish</SelectItem>
                        <SelectItem value="fr-FR">French</SelectItem>
                        <SelectItem value="de-DE">German</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div>
                  <Label htmlFor="greeting">Custom Greeting</Label>
                  <Textarea
                    id="greeting"
                    value={config.greeting}
                    onChange={(e) => 
                      setConfig(prev => ({ ...prev, greeting: e.target.value }))
                    }
                    placeholder="Enter custom greeting message"
                    rows={3}
                  />
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="business-hours" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Business Hours</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {Object.entries(config.business_hours).map(([day, hours]) => (
                    <div key={day} className="flex items-center justify-between">
                      <div className="flex items-center gap-4">
                        <Switch
                          checked={hours.enabled}
                          onCheckedChange={(checked) => 
                            setConfig(prev => ({
                              ...prev,
                              business_hours: {
                                ...prev.business_hours,
                                [day]: { ...hours, enabled: checked }
                              }
                            }))
                          }
                        />
                        <span className="w-20 capitalize">{day}</span>
                      </div>
                      {hours.enabled && (
                        <div className="flex items-center gap-2">
                          <Input
                            type="time"
                            value={hours.open}
                            onChange={(e) => 
                              setConfig(prev => ({
                                ...prev,
                                business_hours: {
                                  ...prev.business_hours,
                                  [day]: { ...hours, open: e.target.value }
                                }
                              }))
                            }
                            className="w-24"
                          />
                          <span>to</span>
                          <Input
                            type="time"
                            value={hours.close}
                            onChange={(e) => 
                              setConfig(prev => ({
                                ...prev,
                                business_hours: {
                                  ...prev.business_hours,
                                  [day]: { ...hours, close: e.target.value }
                                }
                              }))
                            }
                            className="w-24"
                          />
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="emergency" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Emergency Detection & Forwarding</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <Label>Emergency Detection</Label>
                    <p className="text-sm text-muted-foreground">
                      Automatically detect emergency situations
                    </p>
                  </div>
                  <Switch
                    checked={config.emergency_detection}
                    onCheckedChange={(checked) => 
                      setConfig(prev => ({ ...prev, emergency_detection: checked }))
                    }
                  />
                </div>

                {config.emergency_detection && (
                  <div>
                    <Label>Detection Sensitivity</Label>
                    <Select
                      value={config.emergency_sensitivity}
                      onValueChange={(value) => 
                        setConfig(prev => ({ ...prev, emergency_sensitivity: value }))
                      }
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="low">Low</SelectItem>
                        <SelectItem value="medium">Medium</SelectItem>
                        <SelectItem value="high">High</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                )}

                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <Label>Call Forwarding</Label>
                      <p className="text-sm text-muted-foreground">
                        Forward calls when AI can't handle them
                      </p>
                    </div>
                    <Switch
                      checked={config.forwarding_enabled}
                      onCheckedChange={(checked) => 
                        setConfig(prev => ({ ...prev, forwarding_enabled: checked }))
                      }
                    />
                  </div>

                  {config.forwarding_enabled && (
                    <div>
                      <Label htmlFor="forwarding_number">Forwarding Number</Label>
                      <Input
                        id="forwarding_number"
                        value={config.forwarding_number}
                        onChange={(e) => 
                          setConfig(prev => ({ ...prev, forwarding_number: e.target.value }))
                        }
                        placeholder="+1234567890"
                      />
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="recording" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Call Recording</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <Label>Enable Call Recording</Label>
                    <p className="text-sm text-muted-foreground">
                      Record all calls for quality and training
                    </p>
                  </div>
                  <Switch
                    checked={config.call_recording}
                    onCheckedChange={(checked) => 
                      setConfig(prev => ({ ...prev, call_recording: checked }))
                    }
                  />
                </div>

                {config.call_recording && (
                  <div className="flex items-center justify-between">
                    <div>
                      <Label>Recording Consent</Label>
                      <p className="text-sm text-muted-foreground">
                        Announce recording to callers
                      </p>
                    </div>
                    <Switch
                      checked={config.recording_consent}
                      onCheckedChange={(checked) => 
                        setConfig(prev => ({ ...prev, recording_consent: checked }))
                      }
                    />
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        <div className="flex justify-end gap-2 pt-4 border-t">
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={handleSave} disabled={saveConfigMutation.isPending}>
            <Save className="h-4 w-4 mr-2" />
            {saveConfigMutation.isPending ? 'Saving...' : 'Save Configuration'}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};
