
import React, { useState, useEffect } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Phone, Settings, Zap, MessageSquare, CheckCircle } from 'lucide-react';
import { toast } from 'sonner';

interface TelnyxConfig {
  voice_enabled: boolean;
  sms_enabled: boolean;
  ai_assistant_enabled: boolean;
  greeting_message: string;
  business_hours: any;
  emergency_detection: boolean;
}

export const TelnyxSettings = () => {
  const [config, setConfig] = useState<TelnyxConfig>({
    voice_enabled: true,
    sms_enabled: true,
    ai_assistant_enabled: true,
    greeting_message: 'Hello! My name is AI Assistant. How can I help you today?',
    business_hours: {},
    emergency_detection: true
  });
  const [saving, setSaving] = useState(false);

  const saveConfig = async () => {
    setSaving(true);
    try {
      // Here will be saving to database
      await new Promise(resolve => setTimeout(resolve, 1000)); // Simulation
      toast.success('Telnyx settings saved!');
    } catch (error) {
      toast.error('Error saving settings');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Telnyx Settings</h2>
          <p className="text-muted-foreground">
            Simple AI assistant setup for calls and SMS
          </p>
        </div>
        <Badge variant="fixlyfy" className="flex items-center gap-1">
          <CheckCircle size={14} />
          Telnyx Connected
        </Badge>
      </div>

      {/* Main Settings */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Settings className="h-5 w-5" />
            Core Features
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <Label className="flex items-center gap-2">
                <Phone size={16} />
                Voice Calls
              </Label>
              <p className="text-sm text-muted-foreground">
                AI answers incoming calls
              </p>
            </div>
            <Switch
              checked={config.voice_enabled}
              onCheckedChange={(checked) => 
                setConfig(prev => ({ ...prev, voice_enabled: checked }))
              }
            />
          </div>

          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <Label className="flex items-center gap-2">
                <MessageSquare size={16} />
                SMS Messages
              </Label>
              <p className="text-sm text-muted-foreground">
                Receive and send SMS through AI
              </p>
            </div>
            <Switch
              checked={config.sms_enabled}
              onCheckedChange={(checked) => 
                setConfig(prev => ({ ...prev, sms_enabled: checked }))
              }
            />
          </div>

          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <Label className="flex items-center gap-2">
                <Zap size={16} />
                Emergency Detection
              </Label>
              <p className="text-sm text-muted-foreground">
                AI automatically identifies urgent requests
              </p>
            </div>
            <Switch
              checked={config.emergency_detection}
              onCheckedChange={(checked) => 
                setConfig(prev => ({ ...prev, emergency_detection: checked }))
              }
            />
          </div>
        </CardContent>
      </Card>

      {/* Greeting Setup */}
      <Card>
        <CardHeader>
          <CardTitle>AI Assistant Greeting</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="greeting">Greeting Text</Label>
            <Input
              id="greeting"
              value={config.greeting_message}
              onChange={(e) => 
                setConfig(prev => ({ ...prev, greeting_message: e.target.value }))
              }
              placeholder="Enter greeting for customers"
            />
            <p className="text-xs text-muted-foreground">
              Available variables: {'{agent_name}'}, {'{company_name}'}, {'{time_of_day}'}
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Telnyx Benefits */}
      <Card>
        <CardHeader>
          <CardTitle>Why Telnyx is Better Than Amazon Connect?</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid md:grid-cols-2 gap-4">
            <div className="space-y-3">
              <h4 className="font-medium text-green-600">✅ Telnyx (Simplicity)</h4>
              <ul className="space-y-1 text-sm">
                <li>• Single API key</li>
                <li>• Simple webhooks</li>
                <li>• Number purchase via API</li>
                <li>• Built-in SMS support</li>
                <li>• High-quality audio</li>
                <li>• No Instance IDs</li>
              </ul>
            </div>
            <div className="space-y-3">
              <h4 className="font-medium text-red-600">❌ Amazon Connect (Complexity)</h4>
              <ul className="space-y-1 text-sm">
                <li>• Multiple IAM settings</li>
                <li>• Complex Contact Flows</li>
                <li>• Lambda functions</li>
                <li>• Media Streaming setup</li>
                <li>• Instance management</li>
                <li>• ARNs and IDs everywhere</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="flex justify-end">
        <Button onClick={saveConfig} disabled={saving}>
          {saving ? 'Saving...' : 'Save Settings'}
        </Button>
      </div>
    </div>
  );
};
