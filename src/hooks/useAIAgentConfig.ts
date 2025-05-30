
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
}

export const useAIAgentConfig = () => {
  const { user } = useAuth();
  const [config, setConfig] = useState<AIAgentConfig | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (user) {
      fetchConfig();
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
          is_active: data.is_active
        });
      } else {
        // Set default config if none exists
        setConfig({
          business_niche: 'General Service',
          diagnostic_price: 75.00,
          emergency_surcharge: 50.00,
          custom_prompt_additions: '',
          is_active: true
        });
      }
    } catch (error) {
      console.error('Error fetching AI agent config:', error);
    } finally {
      setLoading(false);
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
    loading,
    saving,
    saveConfig,
    toggleActive,
    refreshConfig: fetchConfig
  };
};
