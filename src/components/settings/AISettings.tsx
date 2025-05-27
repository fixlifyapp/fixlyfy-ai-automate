
import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { Brain, Settings, Save, AlertCircle } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface AIConfig {
  id?: string;
  business_niche: string;
  diagnostic_price: number;
  emergency_surcharge: number;
  connect_instance_arn: string;
  aws_region: string;
  custom_prompt_additions: string;
  is_active: boolean;
}

export const AISettings = () => {
  const [config, setConfig] = useState<AIConfig>({
    business_niche: 'General Service',
    diagnostic_price: 75.00,
    emergency_surcharge: 50.00,
    connect_instance_arn: '',
    aws_region: 'us-east-1',
    custom_prompt_additions: '',
    is_active: true
  });
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    fetchAIConfig();
  }, []);

  const fetchAIConfig = async () => {
    try {
      const { data, error } = await supabase
        .from('ai_agent_configs')
        .select('*')
        .limit(1)
        .single();

      if (error && error.code !== 'PGRST116') {
        throw error;
      }

      if (data) {
        setConfig({
          id: data.id,
          business_niche: data.business_niche || 'General Service',
          diagnostic_price: data.diagnostic_price || 75.00,
          emergency_surcharge: data.emergency_surcharge || 50.00,
          connect_instance_arn: data.connect_instance_arn || '',
          aws_region: data.aws_region || 'us-east-1',
          custom_prompt_additions: data.custom_prompt_additions || '',
          is_active: data.is_active ?? true
        });
      }
    } catch (error) {
      console.error('Error fetching AI config:', error);
      toast.error('Failed to load AI configuration');
    } finally {
      setIsLoading(false);
    }
  };

  const saveAIConfig = async () => {
    setIsSaving(true);
    try {
      const configData = {
        business_niche: config.business_niche,
        diagnostic_price: config.diagnostic_price,
        emergency_surcharge: config.emergency_surcharge,
        connect_instance_arn: config.connect_instance_arn,
        aws_region: config.aws_region,
        custom_prompt_additions: config.custom_prompt_additions,
        is_active: config.is_active
      };

      if (config.id) {
        const { error } = await supabase
          .from('ai_agent_configs')
          .update(configData)
          .eq('id', config.id);

        if (error) throw error;
      } else {
        const { data, error } = await supabase
          .from('ai_agent_configs')
          .insert(configData)
          .select()
          .single();

        if (error) throw error;
        setConfig(prev => ({ ...prev, id: data.id }));
      }

      toast.success('AI configuration saved successfully');
    } catch (error) {
      console.error('Error saving AI config:', error);
      toast.error('Failed to save AI configuration');
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-fixlyfy"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold mb-2">AI Settings</h2>
        <p className="text-gray-600">
          Configure your AI agent for automated calling and appointment scheduling.
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Brain className="h-5 w-5 text-fixlyfy" />
            AI Agent Configuration
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Agent Status */}
          <div className="flex items-center justify-between">
            <div>
              <Label className="text-base font-medium">AI Agent Status</Label>
              <p className="text-sm text-muted-foreground">
                Enable or disable the AI calling agent
              </p>
            </div>
            <div className="flex items-center gap-2">
              <Switch
                checked={config.is_active}
                onCheckedChange={(checked) => setConfig(prev => ({ ...prev, is_active: checked }))}
              />
              <Badge variant={config.is_active ? 'success' : 'secondary'}>
                {config.is_active ? 'Active' : 'Inactive'}
              </Badge>
            </div>
          </div>

          {/* Business Configuration */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="business_niche">Business Niche</Label>
              <Input
                id="business_niche"
                value={config.business_niche}
                onChange={(e) => setConfig(prev => ({ ...prev, business_niche: e.target.value }))}
                placeholder="e.g., HVAC, Plumbing, Electrical"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="aws_region">AWS Region</Label>
              <Input
                id="aws_region"
                value={config.aws_region}
                onChange={(e) => setConfig(prev => ({ ...prev, aws_region: e.target.value }))}
                placeholder="us-east-1"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="diagnostic_price">Diagnostic Price ($)</Label>
              <Input
                id="diagnostic_price"
                type="number"
                step="0.01"
                value={config.diagnostic_price}
                onChange={(e) => setConfig(prev => ({ ...prev, diagnostic_price: parseFloat(e.target.value) || 0 }))}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="emergency_surcharge">Emergency Surcharge ($)</Label>
              <Input
                id="emergency_surcharge"
                type="number"
                step="0.01"
                value={config.emergency_surcharge}
                onChange={(e) => setConfig(prev => ({ ...prev, emergency_surcharge: parseFloat(e.target.value) || 0 }))}
              />
            </div>
          </div>

          {/* Amazon Connect Configuration */}
          <div className="space-y-2">
            <Label htmlFor="connect_instance_arn">Amazon Connect Instance ARN</Label>
            <Input
              id="connect_instance_arn"
              value={config.connect_instance_arn}
              onChange={(e) => setConfig(prev => ({ ...prev, connect_instance_arn: e.target.value }))}
              placeholder="arn:aws:connect:region:account:instance/instance-id"
            />
            <p className="text-xs text-muted-foreground">
              The ARN of your Amazon Connect instance for AI calling
            </p>
          </div>

          {/* Custom Prompt Additions */}
          <div className="space-y-2">
            <Label htmlFor="custom_prompt">Custom Prompt Additions</Label>
            <Textarea
              id="custom_prompt"
              value={config.custom_prompt_additions}
              onChange={(e) => setConfig(prev => ({ ...prev, custom_prompt_additions: e.target.value }))}
              placeholder="Add custom instructions for your AI agent..."
              rows={4}
            />
            <p className="text-xs text-muted-foreground">
              Additional instructions to customize how your AI agent handles calls
            </p>
          </div>

          {/* Warning Message */}
          <div className="flex items-start gap-2 p-4 bg-amber-50 border border-amber-200 rounded-lg">
            <AlertCircle className="h-5 w-5 text-amber-600 mt-0.5" />
            <div className="text-sm">
              <p className="font-medium text-amber-800">Important Configuration Notes:</p>
              <ul className="mt-1 text-amber-700 list-disc list-inside space-y-1">
                <li>Ensure your AWS credentials are properly configured</li>
                <li>Amazon Connect instance must be properly set up</li>
                <li>Test configuration in a development environment first</li>
              </ul>
            </div>
          </div>

          {/* Save Button */}
          <div className="flex justify-end">
            <Button 
              onClick={saveAIConfig} 
              disabled={isSaving}
              className="gap-2"
            >
              <Save className="h-4 w-4" />
              {isSaving ? 'Saving...' : 'Save Configuration'}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
