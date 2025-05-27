
import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { useAIAgentConfig } from "@/hooks/useAIAgentConfig";
import { Loader2, Phone, MessageSquare, Settings, Brain, DollarSign } from "lucide-react";
import { toast } from "sonner";

const BUSINESS_NICHES = [
  'General Service',
  'HVAC',
  'Plumbing', 
  'Electrical',
  'Appliance Repair',
  'Roofing',
  'Landscaping',
  'Pest Control',
  'Home Security',
  'Cleaning Services'
];

export const AmazonConnectSettings = () => {
  const { config, awsCredentials, loading, saving, saveConfig, saveAWSCredentials, toggleActive } = useAIAgentConfig();
  
  const [formData, setFormData] = useState({
    business_niche: config?.business_niche || 'General Service',
    diagnostic_price: config?.diagnostic_price || 75,
    emergency_surcharge: config?.emergency_surcharge || 50,
    custom_prompt_additions: config?.custom_prompt_additions || '',
    connect_instance_arn: config?.connect_instance_arn || '',
    aws_region: config?.aws_region || 'us-east-1'
  });

  const [awsForm, setAwsForm] = useState({
    aws_access_key_id: '',
    aws_secret_access_key: '',
    aws_region: awsCredentials?.aws_region || 'us-east-1'
  });

  const [showCredentialsForm, setShowCredentialsForm] = useState(false);

  React.useEffect(() => {
    if (config) {
      setFormData({
        business_niche: config.business_niche,
        diagnostic_price: config.diagnostic_price,
        emergency_surcharge: config.emergency_surcharge,
        custom_prompt_additions: config.custom_prompt_additions || '',
        connect_instance_arn: config.connect_instance_arn || '',
        aws_region: config.aws_region
      });
    }
  }, [config]);

  const handleSaveConfig = async () => {
    const success = await saveConfig(formData);
    if (success) {
      toast.success('Configuration saved successfully');
    }
  };

  const handleSaveCredentials = async () => {
    if (!awsForm.aws_access_key_id || !awsForm.aws_secret_access_key) {
      toast.error('Please provide both AWS Access Key ID and Secret Access Key');
      return;
    }

    const success = await saveAWSCredentials(awsForm);
    if (success) {
      setAwsForm({
        aws_access_key_id: '',
        aws_secret_access_key: '',
        aws_region: awsForm.aws_region
      });
      setShowCredentialsForm(false);
    }
  };

  if (loading) {
    return (
      <Card>
        <CardContent className="p-8 flex items-center justify-center">
          <Loader2 className="h-6 w-6 animate-spin mr-2" />
          <span>Loading AI Agent configuration...</span>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <Card className="border-0 shadow-xl bg-gradient-to-br from-white to-gray-50">
        <CardHeader className="pb-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg">
                <Brain className="h-6 w-6 text-white" />
              </div>
              <div>
                <CardTitle className="text-xl">Amazon Connect AI Agent</CardTitle>
                <p className="text-sm text-gray-600 mt-1">
                  Configure your intelligent phone assistant for automated appointment scheduling
                </p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <Badge variant={config?.is_active ? "success" : "secondary"}>
                {config?.is_active ? "Active" : "Inactive"}
              </Badge>
              <Switch
                checked={config?.is_active || false}
                onCheckedChange={toggleActive}
                disabled={saving}
              />
            </div>
          </div>
        </CardHeader>
      </Card>

      {/* AWS Credentials */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Settings className="h-5 w-5" />
            AWS Configuration
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium">AWS Credentials</p>
              <p className="text-sm text-gray-600">
                {awsCredentials ? 'Credentials configured' : 'No credentials configured'}
              </p>
            </div>
            <Button
              variant="outline"
              onClick={() => setShowCredentialsForm(!showCredentialsForm)}
            >
              {awsCredentials ? 'Update Credentials' : 'Add Credentials'}
            </Button>
          </div>

          {showCredentialsForm && (
            <div className="space-y-4 p-4 border rounded-lg bg-gray-50">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="access_key">AWS Access Key ID</Label>
                  <Input
                    id="access_key"
                    type="password"
                    placeholder="AKIA..."
                    value={awsForm.aws_access_key_id}
                    onChange={(e) => setAwsForm(prev => ({ ...prev, aws_access_key_id: e.target.value }))}
                  />
                </div>
                <div>
                  <Label htmlFor="secret_key">AWS Secret Access Key</Label>
                  <Input
                    id="secret_key"
                    type="password"
                    placeholder="Secret key..."
                    value={awsForm.aws_secret_access_key}
                    onChange={(e) => setAwsForm(prev => ({ ...prev, aws_secret_access_key: e.target.value }))}
                  />
                </div>
              </div>
              <div>
                <Label htmlFor="aws_region">AWS Region</Label>
                <Select value={awsForm.aws_region} onValueChange={(value) => setAwsForm(prev => ({ ...prev, aws_region: value }))}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="us-east-1">US East (N. Virginia)</SelectItem>
                    <SelectItem value="us-west-2">US West (Oregon)</SelectItem>
                    <SelectItem value="eu-west-1">Europe (Ireland)</SelectItem>
                    <SelectItem value="ap-southeast-1">Asia Pacific (Singapore)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="flex gap-2">
                <Button onClick={handleSaveCredentials} disabled={saving}>
                  {saving ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
                  Save Credentials
                </Button>
                <Button variant="outline" onClick={() => setShowCredentialsForm(false)}>
                  Cancel
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* AI Agent Configuration */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Brain className="h-5 w-5" />
            AI Agent Configuration
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <div>
                <Label htmlFor="business_niche">Business Niche</Label>
                <Select value={formData.business_niche} onValueChange={(value) => setFormData(prev => ({ ...prev, business_niche: value }))}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {BUSINESS_NICHES.map(niche => (
                      <SelectItem key={niche} value={niche}>{niche}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <p className="text-xs text-gray-600 mt-1">
                  Helps AI customize conversations for your industry
                </p>
              </div>

              <div>
                <Label htmlFor="connect_instance">Amazon Connect Instance ARN</Label>
                <Input
                  id="connect_instance"
                  placeholder="arn:aws:connect:region:account-id:instance/instance-id"
                  value={formData.connect_instance_arn}
                  onChange={(e) => setFormData(prev => ({ ...prev, connect_instance_arn: e.target.value }))}
                />
                <p className="text-xs text-gray-600 mt-1">
                  Your Amazon Connect instance identifier
                </p>
              </div>
            </div>

            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="diagnostic_price" className="flex items-center gap-2">
                    <DollarSign className="h-4 w-4" />
                    Diagnostic Price
                  </Label>
                  <Input
                    id="diagnostic_price"
                    type="number"
                    step="0.01"
                    value={formData.diagnostic_price}
                    onChange={(e) => setFormData(prev => ({ ...prev, diagnostic_price: parseFloat(e.target.value) || 0 }))}
                  />
                </div>
                <div>
                  <Label htmlFor="emergency_surcharge">Emergency Surcharge</Label>
                  <Input
                    id="emergency_surcharge"
                    type="number"
                    step="0.01"
                    value={formData.emergency_surcharge}
                    onChange={(e) => setFormData(prev => ({ ...prev, emergency_surcharge: parseFloat(e.target.value) || 0 }))}
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="aws_region">AWS Region</Label>
                <Select value={formData.aws_region} onValueChange={(value) => setFormData(prev => ({ ...prev, aws_region: value }))}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="us-east-1">US East (N. Virginia)</SelectItem>
                    <SelectItem value="us-west-2">US West (Oregon)</SelectItem>
                    <SelectItem value="eu-west-1">Europe (Ireland)</SelectItem>
                    <SelectItem value="ap-southeast-1">Asia Pacific (Singapore)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>

          <Separator />

          <div>
            <Label htmlFor="custom_prompts">Custom AI Instructions</Label>
            <Textarea
              id="custom_prompts"
              placeholder="Add specific instructions for your AI agent..."
              rows={4}
              value={formData.custom_prompt_additions}
              onChange={(e) => setFormData(prev => ({ ...prev, custom_prompt_additions: e.target.value }))}
            />
            <p className="text-xs text-gray-600 mt-1">
              Additional instructions to customize how the AI agent handles calls for your business
            </p>
          </div>

          <div className="flex gap-3">
            <Button onClick={handleSaveConfig} disabled={saving}>
              {saving ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
              Save Configuration
            </Button>
            <Button variant="outline" onClick={toggleActive} disabled={saving}>
              {config?.is_active ? 'Deactivate' : 'Activate'} AI Agent
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Integration Status */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Phone className="h-5 w-5" />
            Integration Status
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="p-4 border rounded-lg">
              <div className="flex items-center gap-2 mb-2">
                <Phone className="h-4 w-4 text-blue-600" />
                <span className="font-medium">Amazon Connect</span>
              </div>
              <Badge variant={formData.connect_instance_arn ? "success" : "secondary"}>
                {formData.connect_instance_arn ? "Configured" : "Not Configured"}
              </Badge>
            </div>
            <div className="p-4 border rounded-lg">
              <div className="flex items-center gap-2 mb-2">
                <MessageSquare className="h-4 w-4 text-green-600" />
                <span className="font-medium">Amazon SNS</span>
              </div>
              <Badge variant={awsCredentials ? "success" : "secondary"}>
                {awsCredentials ? "Ready" : "Needs Setup"}
              </Badge>
            </div>
            <div className="p-4 border rounded-lg">
              <div className="flex items-center gap-2 mb-2">
                <Brain className="h-4 w-4 text-purple-600" />
                <span className="font-medium">AI Agent</span>
              </div>
              <Badge variant={config?.is_active ? "success" : "secondary"}>
                {config?.is_active ? "Active" : "Inactive"}
              </Badge>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
