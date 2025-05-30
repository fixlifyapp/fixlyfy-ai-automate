
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/use-auth';
import { toast } from 'sonner';

interface AIAgentConfig {
  id?: string;
  business_niche: string;
  diagnostic_price: number;
  emergency_surcharge: number;
  custom_prompt_additions: string;
  is_active: boolean;
  connect_instance_arn?: string;
  aws_region?: string;
}

interface AWSCredentials {
  id?: string;
  aws_access_key_id: string;
  aws_secret_access_key: string;
  aws_region: string;
  is_active: boolean;
}

export const useAIAgentConfig = () => {
  const { user } = useAuth();
  const [config, setConfig] = useState<AIAgentConfig | null>(null);
  const [awsCredentials, setAwsCredentials] = useState<AWSCredentials | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (user) {
      fetchConfig();
      fetchAWSCredentials();
    }
  }, [user]);

  const fetchConfig = async () => {
    if (!user) return;
    
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('ai_agent_configs')
        .select('*')
        .eq('user_id', user.id)
        .maybeSingle();

      if (error && error.code !== 'PGRST116') {
        console.error('Error fetching AI agent config:', error);
        return;
      }

      if (data) {
        setConfig({
          id: data.id,
          business_niche: data.business_niche,
          diagnostic_price: data.diagnostic_price,
          emergency_surcharge: data.emergency_surcharge,
          custom_prompt_additions: data.custom_prompt_additions || '',
          is_active: data.is_active,
          connect_instance_arn: data.connect_instance_arn || '',
          aws_region: data.aws_region || 'us-east-1'
        });
      } else {
        // Set default config if none exists
        setConfig({
          business_niche: 'General Service',
          diagnostic_price: 75.00,
          emergency_surcharge: 50.00,
          custom_prompt_additions: '',
          is_active: true,
          connect_instance_arn: '',
          aws_region: 'us-east-1'
        });
      }
    } catch (error) {
      console.error('Error fetching AI agent config:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchAWSCredentials = async () => {
    if (!user) return;
    
    try {
      const { data, error } = await supabase
        .from('aws_credentials')
        .select('*')
        .eq('user_id', user.id)
        .eq('is_active', true)
        .maybeSingle();

      if (error && error.code !== 'PGRST116') {
        console.error('Error fetching AWS credentials:', error);
        return;
      }

      if (data) {
        setAwsCredentials(data);
      }
    } catch (error) {
      console.error('Error fetching AWS credentials:', error);
    }
  };

  const saveConfig = async (configData: Omit<AIAgentConfig, 'id'>) => {
    if (!user) {
      toast.error('User not authenticated');
      return false;
    }

    setSaving(true);
    
    try {
      const dataToSave = {
        user_id: user.id,
        business_niche: configData.business_niche,
        diagnostic_price: configData.diagnostic_price,
        emergency_surcharge: configData.emergency_surcharge,
        custom_prompt_additions: configData.custom_prompt_additions || null,
        is_active: configData.is_active,
        connect_instance_arn: configData.connect_instance_arn || null,
        aws_region: configData.aws_region || 'us-east-1',
        updated_at: new Date().toISOString()
      };

      if (config?.id) {
        // Update existing config
        const { error } = await supabase
          .from('ai_agent_configs')
          .update(dataToSave)
          .eq('id', config.id)
          .eq('user_id', user.id);

        if (error) throw error;
      } else {
        // Create new config
        const { data, error } = await supabase
          .from('ai_agent_configs')
          .insert(dataToSave)
          .select()
          .single();

        if (error) throw error;
        
        setConfig(prev => ({ ...configData, id: data.id }));
      }

      // Refresh the config
      await fetchConfig();
      return true;
      
    } catch (error) {
      console.error('Error saving AI agent config:', error);
      toast.error(`Failed to save configuration: ${error.message}`);
      return false;
    } finally {
      setSaving(false);
    }
  };

  const saveAWSCredentials = async (credentialsData: Omit<AWSCredentials, 'id' | 'is_active'>) => {
    if (!user) {
      toast.error('User not authenticated');
      return false;
    }

    setSaving(true);
    
    try {
      // Deactivate existing credentials first
      await supabase
        .from('aws_credentials')
        .update({ is_active: false })
        .eq('user_id', user.id);

      // Insert new credentials
      const { error } = await supabase
        .from('aws_credentials')
        .insert({
          user_id: user.id,
          aws_access_key_id: credentialsData.aws_access_key_id,
          aws_secret_access_key: credentialsData.aws_secret_access_key,
          aws_region: credentialsData.aws_region,
          is_active: true
        });

      if (error) throw error;

      await fetchAWSCredentials();
      toast.success('AWS credentials saved successfully');
      return true;
      
    } catch (error) {
      console.error('Error saving AWS credentials:', error);
      toast.error(`Failed to save AWS credentials: ${error.message}`);
      return false;
    } finally {
      setSaving(false);
    }
  };

  const toggleActive = async () => {
    if (!config || !user) return;

    setSaving(true);
    
    try {
      const newActiveState = !config.is_active;
      
      if (config.id) {
        const { error } = await supabase
          .from('ai_agent_configs')
          .update({ 
            is_active: newActiveState,
            updated_at: new Date().toISOString()
          })
          .eq('id', config.id)
          .eq('user_id', user.id);

        if (error) throw error;
      }

      setConfig(prev => prev ? { ...prev, is_active: newActiveState } : null);
      toast.success(`AI Agent ${newActiveState ? 'activated' : 'deactivated'}`);
      
    } catch (error) {
      console.error('Error toggling AI agent status:', error);
      toast.error('Failed to update AI agent status');
    } finally {
      setSaving(false);
    }
  };

  return {
    config,
    awsCredentials,
    loading,
    saving,
    saveConfig,
    saveAWSCredentials,
    toggleActive,
    refreshConfig: fetchConfig
  };
};
