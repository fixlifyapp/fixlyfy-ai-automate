import { useUserSettings, UserSettings } from './useUserSettings';

export interface TaxConfiguration {
  rate: number;
  region: string;
  label: string;
  displayText: string;
}

export const useTaxSettings = () => {
  const { settings, loading, updateSettings } = useUserSettings();

  const taxConfig: TaxConfiguration = {
    rate: settings.default_tax_rate || 13.00,
    region: settings.tax_region || 'Ontario',
    label: settings.tax_label || 'HST',
    displayText: `${settings.tax_label || 'HST'} (${settings.default_tax_rate || 13}%)`
  };

  const updateTaxSettings = async (updates: Partial<Pick<UserSettings, 'default_tax_rate' | 'tax_region' | 'tax_label'>>) => {
    return updateSettings(updates);
  };

  return {
    taxConfig,
    loading,
    updateTaxSettings
  };
};
