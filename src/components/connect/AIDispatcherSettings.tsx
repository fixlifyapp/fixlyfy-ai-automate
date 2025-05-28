
import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Separator } from "@/components/ui/separator";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Loader2, Save, Bot } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/components/ui/use-toast";

interface AIDispatcherSettingsProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  phoneNumberId: string;
  phoneNumber: string;
}

interface AIConfig {
  business_name: string;
  business_type: string;
  business_greeting: string;
  diagnostic_fee: number;
  emergency_surcharge: number;
  hourly_rate: number;
  voice_selection: string;
  emergency_detection_enabled: boolean;
}

const businessTypes = [
  'HVAC',
  'Plumbing',
  'Electrical',
  'General Contractor',
  'Appliance Repair',
  'Handyman',
  'Roofing',
  'Flooring',
  'Painting',
  'General Service'
];

const voiceOptions = [
  { value: 'alloy', label: 'Alloy (Balanced)' },
  { value: 'echo', label: 'Echo (Professional)' },
  { value: 'fable', label: 'Fable (Warm)' },
  { value: 'onyx', label: 'Onyx (Deep)' },
  { value: 'nova', label: 'Nova (Energetic)' },
  { value: 'shimmer', label: 'Shimmer (Friendly)' }
];

export const AIDispatcherSettings = ({ open, onOpenChange, phoneNumberId, phoneNumber }: AIDispatcherSettingsProps) => {
  const [config, setConfig] = useState<AIConfig>({
    business_name: '',
    business_type: 'General Service',
    business_greeting: '',
    diagnostic_fee: 75,
    emergency_surcharge: 50,
    hourly_rate: 100,
    voice_selection: 'alloy',
    emergency_detection_enabled: true
  });
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (open && phoneNumberId) {
      loadConfig();
    }
  }, [open, phoneNumberId]);

  const loadConfig = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('ai_dispatcher_configs')
        .select('*')
        .eq('phone_number_id', phoneNumberId)
        .maybeSingle();

      if (error && error.code !== 'PGRST116') {
        throw error;
      }

      if (data) {
        setConfig({
          business_name: data.business_name || '',
          business_type: data.business_type || 'General Service',
          business_greeting: data.business_greeting || '',
          diagnostic_fee: data.diagnostic_fee || 75,
          emergency_surcharge: data.emergency_surcharge || 50,
          hourly_rate: data.hourly_rate || 100,
          voice_selection: data.voice_selection || 'alloy',
          emergency_detection_enabled: data.emergency_detection_enabled ?? true
        });
      }
    } catch (error) {
      console.error('Error loading AI config:', error);
      toast({
        title: "Error",
        description: "Failed to load AI configuration",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const saveConfig = async () => {
    setSaving(true);
    try {
      const { error } = await supabase
        .from('ai_dispatcher_configs')
        .upsert({
          phone_number_id: phoneNumberId,
          ...config
        });

      if (error) {
        throw error;
      }

      toast({
        title: "Success",
        description: "AI Dispatcher settings saved successfully"
      });

      onOpenChange(false);
    } catch (error) {
      console.error('Error saving AI config:', error);
      toast({
        title: "Error",
        description: "Failed to save AI configuration",
        variant: "destructive"
      });
    } finally {
      setSaving(false);
    }
  };

  const updateConfig = (field: keyof AIConfig, value: any) => {
    setConfig(prev => ({ ...prev, [field]: value }));
  };

  if (loading) {
    return (
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
          <div className="flex items-center justify-center p-8">
            <Loader2 className="h-8 w-8 animate-spin" />
            <span className="ml-2">Loading AI configuration...</span>
          </div>
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Bot className="h-5 w-5 text-blue-600" />
            AI Dispatcher Settings - {phoneNumber}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Business Information */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Business Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="business_name">Business Name</Label>
                  <Input
                    id="business_name"
                    value={config.business_name}
                    onChange={(e) => updateConfig('business_name', e.target.value)}
                    placeholder="Your Business Name"
                  />
                </div>
                <div>
                  <Label htmlFor="business_type">Business Type</Label>
                  <Select value={config.business_type} onValueChange={(value) => updateConfig('business_type', value)}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {businessTypes.map(type => (
                        <SelectItem key={type} value={type}>{type}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div>
                <Label htmlFor="business_greeting">AI Greeting Message</Label>
                <Textarea
                  id="business_greeting"
                  value={config.business_greeting}
                  onChange={(e) => updateConfig('business_greeting', e.target.value)}
                  placeholder="Thank you for calling [Business Name]. How can I help you today?"
                  rows={3}
                />
                <p className="text-sm text-muted-foreground mt-1">
                  Use [Business Name] as a placeholder for your business name
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Pricing Configuration */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Pricing Configuration</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-3 gap-4">
                <div>
                  <Label htmlFor="diagnostic_fee">Diagnostic Fee</Label>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground">$</span>
                    <Input
                      id="diagnostic_fee"
                      type="number"
                      value={config.diagnostic_fee}
                      onChange={(e) => updateConfig('diagnostic_fee', parseFloat(e.target.value) || 0)}
                      className="pl-7"
                      min="0"
                      step="0.01"
                    />
                  </div>
                </div>
                <div>
                  <Label htmlFor="emergency_surcharge">Emergency Surcharge</Label>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground">$</span>
                    <Input
                      id="emergency_surcharge"
                      type="number"
                      value={config.emergency_surcharge}
                      onChange={(e) => updateConfig('emergency_surcharge', parseFloat(e.target.value) || 0)}
                      className="pl-7"
                      min="0"
                      step="0.01"
                    />
                  </div>
                </div>
                <div>
                  <Label htmlFor="hourly_rate">Hourly Rate</Label>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground">$</span>
                    <Input
                      id="hourly_rate"
                      type="number"
                      value={config.hourly_rate}
                      onChange={(e) => updateConfig('hourly_rate', parseFloat(e.target.value) || 0)}
                      className="pl-7"
                      min="0"
                      step="0.01"
                    />
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* AI Behavior */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">AI Behavior</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="voice_selection">Voice Selection</Label>
                <Select value={config.voice_selection} onValueChange={(value) => updateConfig('voice_selection', value)}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {voiceOptions.map(voice => (
                      <SelectItem key={voice.value} value={voice.value}>{voice.label}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <Label htmlFor="emergency_detection">Emergency Detection</Label>
                  <p className="text-sm text-muted-foreground">
                    Automatically detect emergency situations and prioritize calls
                  </p>
                </div>
                <Switch
                  id="emergency_detection"
                  checked={config.emergency_detection_enabled}
                  onCheckedChange={(checked) => updateConfig('emergency_detection_enabled', checked)}
                />
              </div>
            </CardContent>
          </Card>
        </div>

        <Separator />

        <div className="flex justify-end gap-2">
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={saveConfig} disabled={saving}>
            {saving ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin mr-2" />
                Saving...
              </>
            ) : (
              <>
                <Save className="h-4 w-4 mr-2" />
                Save Settings
              </>
            )}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};
