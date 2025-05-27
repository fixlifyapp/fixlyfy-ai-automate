
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/use-auth";
import { toast } from "sonner";

export interface AIAgentConfig {
  id: string;
  user_id: string;
  business_niche: string;
  diagnostic_price: number;
  emergency_surcharge: number;
  custom_prompt_additions: string | null;
  connect_instance_arn: string | null;
  aws_region: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface AWSCredentials {
  id: string;
  user_id: string;
  aws_access_key_id: string;
  aws_secret_access_key: string;
  aws_region: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export const useAIAgentConfig = () => {
  const [config, setConfig] = useState<AIAgentConfig | null>(null);
  const [awsCredentials, setAwsCredentials] = useState<AWSCredentials | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const { user } = useAuth();

  const fetchConfig = async () => {
    if (!user) return;

    try {
      setLoading(true);

      // Fetch AI Agent config
      const { data: configData, error: configError } = await supabase
        .from('ai_agent_configs')
        .select('*')
        .eq('user_id', user.id)
        .single();

      if (configError && configError.code !== 'PGRST116') {
        console.error('Error fetching AI config:', configError);
        toast.error('Failed to load AI Agent configuration');
        return;
      }

      if (configData) {
        setConfig(configData);
      }

      // Fetch AWS credentials
      const { data: credentialsData, error: credentialsError } = await supabase
        .from('aws_credentials')
        .select('*')
        .eq('user_id', user.id)
        .eq('is_active', true)
        .single();

      if (credentialsError && credentialsError.code !== 'PGRST116') {
        console.error('Error fetching AWS credentials:', credentialsError);
      }

      if (credentialsData) {
        setAwsCredentials(credentialsData);
      }

    } catch (error) {
      console.error('Error fetching AI Agent config:', error);
      toast.error('Failed to load configuration');
    } finally {
      setLoading(false);
    }
  };

  const saveConfig = async (configData: Partial<AIAgentConfig>) => {
    if (!user) return false;

    try {
      setSaving(true);

      if (config?.id) {
        // Update existing config
        const { error } = await supabase
          .from('ai_agent_configs')
          .update({
            ...configData,
            updated_at: new Date().toISOString()
          })
          .eq('id', config.id);

        if (error) throw error;
      } else {
        // Create new config
        const { data, error } = await supabase
          .from('ai_agent_configs')
          .insert({
            user_id: user.id,
            ...configData
          })
          .select()
          .single();

        if (error) throw error;
        setConfig(data);
      }

      toast.success('AI Agent configuration saved successfully');
      await fetchConfig(); // Refresh data
      return true;

    } catch (error) {
      console.error('Error saving AI config:', error);
      toast.error('Failed to save AI Agent configuration');
      return false;
    } finally {
      setSaving(false);
    }
  };

  const saveAWSCredentials = async (credentials: Partial<AWSCredentials>) => {
    if (!user) return false;

    try {
      setSaving(true);

      // Deactivate existing credentials first
      if (awsCredentials?.id) {
        await supabase
          .from('aws_credentials')
          .update({ is_active: false })
          .eq('user_id', user.id);
      }

      // Insert new credentials
      const { data, error } = await supabase
        .from('aws_credentials')
        .insert({
          user_id: user.id,
          ...credentials,
          is_active: true
        })
        .select()
        .single();

      if (error) throw error;

      setAwsCredentials(data);
      toast.success('AWS credentials saved successfully');
      return true;

    } catch (error) {
      console.error('Error saving AWS credentials:', error);
      toast.error('Failed to save AWS credentials');
      return false;
    } finally {
      setSaving(false);
    }
  };

  const toggleActive = async () => {
    if (!config) return false;

    try {
      setSaving(true);

      const { error } = await supabase
        .from('ai_agent_configs')
        .update({
          is_active: !config.is_active,
          updated_at: new Date().toISOString()
        })
        .eq('id', config.id);

      if (error) throw error;

      setConfig(prev => prev ? { ...prev, is_active: !prev.is_active } : null);
      toast.success(`AI Agent ${config.is_active ? 'deactivated' : 'activated'} successfully`);
      return true;

    } catch (error) {
      console.error('Error toggling AI Agent:', error);
      toast.error('Failed to update AI Agent status');
      return false;
    } finally {
      setSaving(false);
    }
  };

  useEffect(() => {
    fetchConfig();
  }, [user]);

  return {
    config,
    awsCredentials,
    loading,
    saving,
    fetchConfig,
    saveConfig,
    saveAWSCredentials,
    toggleActive
  };
};
