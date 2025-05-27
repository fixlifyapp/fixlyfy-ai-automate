
import { useState, useEffect } from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Settings, Save, Bot, Shield, Key } from "lucide-react";
import { useAIAgentConfig } from "@/hooks/useAIAgentConfig";
import { toast } from "sonner";

const BUSINESS_NICHES = [
  'General Service',
  'HVAC',
  'Plumbing',
  'Electrical',
  'Appliance Repair',
  'Landscaping',
  'Cleaning Services',
  'Home Maintenance'
];

const AWS_REGIONS = [
  'us-east-1',
  'us-west-2',
  'eu-west-1',
  'ap-southeast-2'
];

export const AIAgentSettings = () => {
  const { 
    config, 
    awsCredentials, 
    loading, 
    saving, 
    saveConfig, 
    saveAWSCredentials 
  } = useAIAgentConfig();

  const [agentForm, setAgentForm] = useState({
    business_niche: 'General Service',
    diagnostic_price: 75.00,
    emergency_surcharge: 50.00,
    custom_prompt_additions: '',
    connect_instance_arn: '',
    aws_region: 'us-east-1',
    is_active: true
  });

  const [awsForm, setAwsForm] = useState({
    aws_access_key_id: '',
    aws_secret_access_key: '',
    aws_region: 'us-east-1'
  });

  const [showAWSForm, setShowAWSForm] = useState(false);

  useEffect(() => {
    if (config) {
      setAgentForm({
        business_niche: config.business_niche,
        diagnostic_price: config.diagnostic_price,
        emergency_surcharge: config.emergency_surcharge,
        custom_prompt_additions: config.custom_prompt_additions || '',
        connect_instance_arn: config.connect_instance_arn || '',
        aws_region: config.aws_region,
        is_active: config.is_active
      });
    }
  }, [config]);

  const handleAgentSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const success = await saveConfig(agentForm);
    if (success) {
      toast.success('AI Agent configuration saved successfully');
    }
  };

  const handleAWSSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const success = await saveAWSCredentials(awsForm);
    if (success) {
      toast.success('AWS credentials saved successfully');
      setShowAWSForm(false);
      setAwsForm({
        aws_access_key_id: '',
        aws_secret_access_key: '',
        aws_region: 'us-east-1'
      });
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* AI Agent Configuration */}
      <Card className="border-fixlyfy-border">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Bot className="h-5 w-5 text-blue-600" />
            AI Agent Configuration
          </CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleAgentSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="business_niche">Business Niche</Label>
                <Select 
                  value={agentForm.business_niche} 
                  onValueChange={(value) => setAgentForm(prev => ({ ...prev, business_niche: value }))}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {BUSINESS_NICHES.map(niche => (
                      <SelectItem key={niche} value={niche}>{niche}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="aws_region">AWS Region</Label>
                <Select 
                  value={agentForm.aws_region} 
                  onValueChange={(value) => setAgentForm(prev => ({ ...prev, aws_region: value }))}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {AWS_REGIONS.map(region => (
                      <SelectItem key={region} value={region}>{region}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="diagnostic_price">Diagnostic Price ($)</Label>
                <Input
                  id="diagnostic_price"
                  type="number"
                  step="0.01"
                  value={agentForm.diagnostic_price}
                  onChange={(e) => setAgentForm(prev => ({ 
                    ...prev, 
                    diagnostic_price: parseFloat(e.target.value) || 0 
                  }))}
                />
              </div>

              <div>
                <Label htmlFor="emergency_surcharge">Emergency Surcharge ($)</Label>
                <Input
                  id="emergency_surcharge"
                  type="number"
                  step="0.01"
                  value={agentForm.emergency_surcharge}
                  onChange={(e) => setAgentForm(prev => ({ 
                    ...prev, 
                    emergency_surcharge: parseFloat(e.target.value) || 0 
                  }))}
                />
              </div>
            </div>

            <div>
              <Label htmlFor="connect_instance_arn">Amazon Connect Instance ARN</Label>
              <Input
                id="connect_instance_arn"
                value={agentForm.connect_instance_arn}
                onChange={(e) => setAgentForm(prev => ({ 
                  ...prev, 
                  connect_instance_arn: e.target.value 
                }))}
                placeholder="arn:aws:connect:region:account:instance/instance-id"
              />
              <p className="text-xs text-gray-500 mt-1">
                Your Amazon Connect instance ARN from AWS Console
              </p>
            </div>

            <div>
              <Label htmlFor="custom_prompt_additions">Custom Prompt Additions</Label>
              <Textarea
                id="custom_prompt_additions"
                value={agentForm.custom_prompt_additions}
                onChange={(e) => setAgentForm(prev => ({ 
                  ...prev, 
                  custom_prompt_additions: e.target.value 
                }))}
                placeholder="Additional instructions for the AI agent..."
                rows={4}
              />
              <p className="text-xs text-gray-500 mt-1">
                Custom instructions to personalize your AI agent's behavior
              </p>
            </div>

            <Button type="submit" disabled={saving} className="w-full">
              <Save className="h-4 w-4 mr-2" />
              {saving ? 'Saving...' : 'Save AI Agent Configuration'}
            </Button>
          </form>
        </CardContent>
      </Card>

      {/* AWS Credentials */}
      <Card className="border-fixlyfy-border">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <Shield className="h-5 w-5 text-green-600" />
              AWS Credentials
            </CardTitle>
            <div className="flex items-center gap-2">
              {awsCredentials && (
                <span className="text-sm text-green-600 flex items-center gap-1">
                  <Key className="h-3 w-3" />
                  Configured
                </span>
              )}
              <Button 
                variant="outline" 
                size="sm"
                onClick={() => setShowAWSForm(!showAWSForm)}
              >
                {showAWSForm ? 'Cancel' : awsCredentials ? 'Update' : 'Configure'} AWS
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {!awsCredentials && !showAWSForm && (
            <div className="text-center py-8 text-gray-500">
              <Shield className="h-12 w-12 mx-auto mb-4 text-gray-400" />
              <h3 className="text-lg font-medium mb-2">AWS Credentials Required</h3>
              <p className="text-sm mb-4">
                Configure your AWS credentials to enable Amazon Connect integration
              </p>
              <Button onClick={() => setShowAWSForm(true)}>
                <Key className="h-4 w-4 mr-2" />
                Configure AWS Credentials
              </Button>
            </div>
          )}

          {awsCredentials && !showAWSForm && (
            <div className="space-y-3">
              <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
                <div>
                  <p className="font-medium text-green-800">AWS Credentials Configured</p>
                  <p className="text-sm text-green-600">
                    Access Key: {awsCredentials.aws_access_key_id.substring(0, 8)}...
                  </p>
                  <p className="text-sm text-green-600">
                    Region: {awsCredentials.aws_region}
                  </p>
                </div>
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={() => setShowAWSForm(true)}
                >
                  Update
                </Button>
              </div>
            </div>
          )}

          {showAWSForm && (
            <form onSubmit={handleAWSSubmit} className="space-y-4">
              <div>
                <Label htmlFor="aws_access_key_id">AWS Access Key ID</Label>
                <Input
                  id="aws_access_key_id"
                  type="password"
                  value={awsForm.aws_access_key_id}
                  onChange={(e) => setAwsForm(prev => ({ 
                    ...prev, 
                    aws_access_key_id: e.target.value 
                  }))}
                  placeholder="AKIAIOSFODNN7EXAMPLE"
                  required
                />
              </div>

              <div>
                <Label htmlFor="aws_secret_access_key">AWS Secret Access Key</Label>
                <Input
                  id="aws_secret_access_key"
                  type="password"
                  value={awsForm.aws_secret_access_key}
                  onChange={(e) => setAwsForm(prev => ({ 
                    ...prev, 
                    aws_secret_access_key: e.target.value 
                  }))}
                  placeholder="wJalrXUtnFEMI/K7MDENG/bPxRfiCYEXAMPLEKEY"
                  required
                />
              </div>

              <div>
                <Label htmlFor="aws_region_form">AWS Region</Label>
                <Select 
                  value={awsForm.aws_region} 
                  onValueChange={(value) => setAwsForm(prev => ({ ...prev, aws_region: value }))}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {AWS_REGIONS.map(region => (
                      <SelectItem key={region} value={region}>{region}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="flex gap-2">
                <Button type="submit" disabled={saving} className="flex-1">
                  <Save className="h-4 w-4 mr-2" />
                  {saving ? 'Saving...' : 'Save AWS Credentials'}
                </Button>
                <Button 
                  type="button" 
                  variant="outline" 
                  onClick={() => setShowAWSForm(false)}
                >
                  Cancel
                </Button>
              </div>
            </form>
          )}
        </CardContent>
      </Card>
    </div>
  );
};
