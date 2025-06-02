
import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { Save, Brain, DollarSign, MapPin, Wrench, Clock, Plus, X } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { useAuth } from "@/hooks/use-auth";

const APPLIANCE_TYPES = [
  'HVAC Systems',
  'Plumbing',
  'Electrical',
  'Appliance Repair',
  'Water Heaters',
  'Garbage Disposals',
  'Dishwashers',
  'Washing Machines',
  'Dryers',
  'Refrigerators',
  'Ovens & Stoves'
];

const BUSINESS_HOURS = [
  { day: 'Monday', key: 'monday' },
  { day: 'Tuesday', key: 'tuesday' },
  { day: 'Wednesday', key: 'wednesday' },
  { day: 'Thursday', key: 'thursday' },
  { day: 'Friday', key: 'friday' },
  { day: 'Saturday', key: 'saturday' },
  { day: 'Sunday', key: 'sunday' }
];

// Helper function to safely parse string arrays from JSON
const parseStringArray = (value: any): string[] => {
  if (!value) return [];
  if (Array.isArray(value)) {
    return value.filter(item => typeof item === 'string');
  }
  if (typeof value === 'string') {
    try {
      const parsed = JSON.parse(value);
      if (Array.isArray(parsed)) {
        return parsed.filter(item => typeof item === 'string');
      }
    } catch {
      return [];
    }
  }
  return [];
};

// Helper function to safely parse business hours
const parseBusinessHours = (value: any): Record<string, { open: string; close: string; closed: boolean }> => {
  if (!value) return {};
  
  if (typeof value === 'object' && value !== null && !Array.isArray(value)) {
    return value as Record<string, { open: string; close: string; closed: boolean }>;
  }
  
  if (typeof value === 'string') {
    try {
      const parsed = JSON.parse(value);
      if (typeof parsed === 'object' && parsed !== null && !Array.isArray(parsed)) {
        return parsed;
      }
    } catch {
      return {};
    }
  }
  
  return {};
};

export const SimplifiedAISettings = () => {
  const { user } = useAuth();
  const [config, setConfig] = useState({
    is_active: true,
    diagnostic_price: 75.00,
    emergency_surcharge: 50.00,
    service_areas: [] as string[],
    appliance_types: [] as string[],
    business_hours: {} as Record<string, { open: string; close: string; closed: boolean }>,
    custom_instructions: '',
    company_name: 'Your Company',
    agent_name: 'AI Assistant'
  });
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [newServiceArea, setNewServiceArea] = useState('');

  useEffect(() => {
    fetchConfig();
  }, [user]);

  const fetchConfig = async () => {
    if (!user) return;
    
    try {
      setIsLoading(true);
      const { data, error } = await supabase
        .from('ai_agent_configs')
        .select('*')
        .eq('user_id', user.id)
        .maybeSingle();

      if (error && error.code !== 'PGRST116') {
        console.error('Error fetching AI config:', error);
        return;
      }

      if (data) {
        setConfig({
          is_active: data.is_active ?? true,
          diagnostic_price: data.diagnostic_price || 75.00,
          emergency_surcharge: data.emergency_surcharge || 50.00,
          service_areas: parseStringArray(data.service_areas),
          appliance_types: parseStringArray(data.service_types),
          business_hours: parseBusinessHours(data.business_hours),
          custom_instructions: data.custom_prompt_additions || '',
          company_name: data.company_name || 'Your Company',
          agent_name: data.agent_name || 'AI Assistant'
        });
      }
    } catch (error) {
      console.error('Error fetching config:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const saveConfig = async () => {
    if (!user) return;

    setIsSaving(true);
    try {
      const configData = {
        user_id: user.id,
        is_active: config.is_active,
        diagnostic_price: config.diagnostic_price,
        emergency_surcharge: config.emergency_surcharge,
        service_areas: config.service_areas,
        service_types: config.appliance_types,
        business_hours: config.business_hours,
        custom_prompt_additions: config.custom_instructions,
        company_name: config.company_name,
        agent_name: config.agent_name,
        business_niche: 'Service Business',
        voice_id: 'alloy',
        greeting_template: `Hello! My name is ${config.agent_name}. I'm an AI assistant for ${config.company_name}. How can I help you today?`,
        updated_at: new Date().toISOString()
      };

      const { error } = await supabase
        .from('ai_agent_configs')
        .upsert(configData, { onConflict: 'user_id' });

      if (error) throw error;

      toast.success('AI settings saved successfully');
    } catch (error) {
      console.error('Error saving config:', error);
      toast.error('Failed to save AI settings');
    } finally {
      setIsSaving(false);
    }
  };

  const addServiceArea = () => {
    if (newServiceArea.trim() && !config.service_areas.includes(newServiceArea.trim())) {
      setConfig(prev => ({
        ...prev,
        service_areas: [...prev.service_areas, newServiceArea.trim()]
      }));
      setNewServiceArea('');
    }
  };

  const removeServiceArea = (area: string) => {
    setConfig(prev => ({
      ...prev,
      service_areas: prev.service_areas.filter(a => a !== area)
    }));
  };

  const toggleApplianceType = (type: string) => {
    setConfig(prev => ({
      ...prev,
      appliance_types: prev.appliance_types.includes(type)
        ? prev.appliance_types.filter(t => t !== type)
        : [...prev.appliance_types, type]
    }));
  };

  const updateBusinessHours = (day: string, field: string, value: string | boolean) => {
    setConfig(prev => ({
      ...prev,
      business_hours: {
        ...prev.business_hours,
        [day]: {
          ...prev.business_hours[day],
          [field]: value
        }
      }
    }));
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* AI Status */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <Brain className="h-5 w-5 text-blue-600" />
              AI Dispatcher Status
            </CardTitle>
            <div className="flex items-center gap-3">
              <Badge variant={config.is_active ? "success" : "secondary"}>
                {config.is_active ? "Active" : "Inactive"}
              </Badge>
              <Switch
                checked={config.is_active}
                onCheckedChange={(checked) => setConfig(prev => ({ ...prev, is_active: checked }))}
              />
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">
            Your AI dispatcher is {config.is_active ? 'active and will' : 'inactive. When active, it will'} automatically 
            answer calls, understand customer needs, and schedule appointments.
          </p>
        </CardContent>
      </Card>

      {/* Business Info */}
      <Card>
        <CardHeader>
          <CardTitle>Business Information</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="company_name">Company Name</Label>
              <Input
                id="company_name"
                value={config.company_name}
                onChange={(e) => setConfig(prev => ({ ...prev, company_name: e.target.value }))}
              />
            </div>
            <div>
              <Label htmlFor="agent_name">AI Agent Name</Label>
              <Input
                id="agent_name"
                value={config.agent_name}
                onChange={(e) => setConfig(prev => ({ ...prev, agent_name: e.target.value }))}
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Pricing */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <DollarSign className="h-5 w-5" />
            Service Pricing
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="diagnostic_price">Diagnostic Fee ($)</Label>
              <Input
                id="diagnostic_price"
                type="number"
                step="0.01"
                value={config.diagnostic_price}
                onChange={(e) => setConfig(prev => ({ 
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
                value={config.emergency_surcharge}
                onChange={(e) => setConfig(prev => ({ 
                  ...prev, 
                  emergency_surcharge: parseFloat(e.target.value) || 0 
                }))}
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Service Areas */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <MapPin className="h-5 w-5" />
            Service Areas
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex gap-2">
            <Input
              value={newServiceArea}
              onChange={(e) => setNewServiceArea(e.target.value)}
              placeholder="Enter zip code or city name"
              onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addServiceArea())}
            />
            <Button onClick={addServiceArea}>
              <Plus className="h-4 w-4" />
            </Button>
          </div>
          <div className="flex flex-wrap gap-2">
            {config.service_areas.map((area) => (
              <Badge
                key={area}
                variant="secondary"
                className="cursor-pointer flex items-center gap-1"
                onClick={() => removeServiceArea(area)}
              >
                {area}
                <X className="h-3 w-3" />
              </Badge>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Appliance Types */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Wrench className="h-5 w-5" />
            Services We Provide
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
            {APPLIANCE_TYPES.map((type) => (
              <div
                key={type}
                className={`p-3 border rounded-lg cursor-pointer transition-colors ${
                  config.appliance_types.includes(type)
                    ? 'bg-blue-50 border-blue-200 text-blue-800'
                    : 'bg-gray-50 border-gray-200 hover:bg-gray-100'
                }`}
                onClick={() => toggleApplianceType(type)}
              >
                <div className="font-medium text-sm">{type}</div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Business Hours */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Clock className="h-5 w-5" />
            Business Hours
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {BUSINESS_HOURS.map(({ day, key }) => (
            <div key={key} className="flex items-center gap-4">
              <div className="w-20 font-medium">{day}</div>
              <Switch
                checked={!config.business_hours[key]?.closed}
                onCheckedChange={(checked) => updateBusinessHours(key, 'closed', !checked)}
              />
              {!config.business_hours[key]?.closed && (
                <>
                  <Input
                    type="time"
                    value={config.business_hours[key]?.open || '09:00'}
                    onChange={(e) => updateBusinessHours(key, 'open', e.target.value)}
                    className="w-32"
                  />
                  <span>to</span>
                  <Input
                    type="time"
                    value={config.business_hours[key]?.close || '17:00'}
                    onChange={(e) => updateBusinessHours(key, 'close', e.target.value)}
                    className="w-32"
                  />
                </>
              )}
              {config.business_hours[key]?.closed && (
                <span className="text-muted-foreground">Closed</span>
              )}
            </div>
          ))}
        </CardContent>
      </Card>

      {/* Custom Instructions */}
      <Card>
        <CardHeader>
          <CardTitle>Custom AI Instructions</CardTitle>
        </CardHeader>
        <CardContent>
          <Textarea
            value={config.custom_instructions}
            onChange={(e) => setConfig(prev => ({ ...prev, custom_instructions: e.target.value }))}
            placeholder="Add specific instructions for how your AI should handle calls..."
            rows={4}
          />
          <p className="text-xs text-muted-foreground mt-2">
            Example: "Always ask about warranty status", "Mention our 24/7 emergency service"
          </p>
        </CardContent>
      </Card>

      {/* Save Button */}
      <div className="flex justify-end">
        <Button onClick={saveConfig} disabled={isSaving} className="gap-2">
          <Save className="h-4 w-4" />
          {isSaving ? 'Saving...' : 'Save AI Settings'}
        </Button>
      </div>
    </div>
  );
};
