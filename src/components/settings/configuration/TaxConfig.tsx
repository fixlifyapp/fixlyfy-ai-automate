
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { useTaxSettings } from "@/hooks/useTaxSettings";
import { useState, useEffect } from "react";
import { toast } from "sonner";
import { Receipt, Save, Info } from "lucide-react";

const TAX_REGIONS = [
  { value: 'Alberta', label: 'Alberta (5% GST)', rate: 5.00 },
  { value: 'British Columbia', label: 'British Columbia (12% GST+PST)', rate: 12.00 },
  { value: 'Manitoba', label: 'Manitoba (12% GST+PST)', rate: 12.00 },
  { value: 'New Brunswick', label: 'New Brunswick (15% HST)', rate: 15.00 },
  { value: 'Newfoundland and Labrador', label: 'Newfoundland and Labrador (15% HST)', rate: 15.00 },
  { value: 'Northwest Territories', label: 'Northwest Territories (5% GST)', rate: 5.00 },
  { value: 'Nova Scotia', label: 'Nova Scotia (15% HST)', rate: 15.00 },
  { value: 'Nunavut', label: 'Nunavut (5% GST)', rate: 5.00 },
  { value: 'Ontario', label: 'Ontario (13% HST)', rate: 13.00 },
  { value: 'Prince Edward Island', label: 'Prince Edward Island (15% HST)', rate: 15.00 },
  { value: 'Quebec', label: 'Quebec (14.975% GST+QST)', rate: 14.975 },
  { value: 'Saskatchewan', label: 'Saskatchewan (11% GST+PST)', rate: 11.00 },
  { value: 'Yukon', label: 'Yukon (5% GST)', rate: 5.00 },
  { value: 'United States', label: 'United States (Variable Sales Tax)', rate: 8.25 },
  { value: 'Custom', label: 'Custom/Other', rate: 0.00 }
];

const TAX_LABELS = [
  { value: 'HST', label: 'HST (Harmonized Sales Tax)' },
  { value: 'GST', label: 'GST (Goods and Services Tax)' },
  { value: 'PST', label: 'PST (Provincial Sales Tax)' },
  { value: 'GST+PST', label: 'GST + PST' },
  { value: 'GST+QST', label: 'GST + QST (Quebec)' },
  { value: 'Sales Tax', label: 'Sales Tax' },
  { value: 'VAT', label: 'VAT (Value Added Tax)' },
  { value: 'Tax', label: 'Tax' }
];

export const TaxConfig = () => {
  const { taxConfig, loading, updateTaxSettings } = useTaxSettings();
  const [isUpdating, setIsUpdating] = useState(false);

  const [formData, setFormData] = useState({
    default_tax_rate: taxConfig.rate,
    tax_label: taxConfig.label,
    tax_region: taxConfig.region
  });

  // Update form data when taxConfig changes
  useEffect(() => {
    setFormData({
      default_tax_rate: taxConfig.rate,
      tax_label: taxConfig.label,
      tax_region: taxConfig.region
    });
  }, [taxConfig]);

  const handleRegionChange = (selectedRegion: string) => {
    const region = TAX_REGIONS.find(r => r.value === selectedRegion);
    if (region) {
      setFormData(prev => ({
        ...prev,
        tax_region: selectedRegion,
        default_tax_rate: region.rate
      }));
    }
  };

  const handleSave = async () => {
    setIsUpdating(true);
    try {
      await updateTaxSettings(formData);
      toast.success('Tax settings updated successfully');
    } catch (error) {
      toast.error('Failed to update tax settings');
    } finally {
      setIsUpdating(false);
    }
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-1/4 mb-2"></div>
          <div className="h-4 bg-gray-200 rounded w-1/2"></div>
        </div>
      </div>
    );
  }

  const isCustomRegion = formData.tax_region === 'Custom';

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <Receipt className="h-6 w-6 text-primary" />
        <div>
          <h3 className="text-lg font-medium">Tax Configuration</h3>
          <p className="text-sm text-muted-foreground">
            Configure your default tax settings for estimates, invoices, and products
          </p>
        </div>
      </div>

      <Separator />

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Receipt className="h-5 w-5" />
            Default Tax Settings
          </CardTitle>
          <CardDescription>
            These settings will be applied to all new estimates and invoices by default
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="tax-region">Tax Region/Jurisdiction</Label>
            <Select
              value={formData.tax_region}
              onValueChange={handleRegionChange}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select tax region" />
              </SelectTrigger>
              <SelectContent>
                {TAX_REGIONS.map((region) => (
                  <SelectItem key={region.value} value={region.value}>
                    {region.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <Label htmlFor="tax-rate">Default Tax Rate (%)</Label>
              <Input
                id="tax-rate"
                type="number"
                step="0.001"
                min="0"
                max="100"
                value={formData.default_tax_rate}
                onChange={(e) => setFormData(prev => ({ 
                  ...prev, 
                  default_tax_rate: parseFloat(e.target.value) || 0 
                }))}
                placeholder="13.00"
                disabled={!isCustomRegion}
              />
              {!isCustomRegion && (
                <p className="text-xs text-muted-foreground">
                  Tax rate is automatically set based on selected region. Select "Custom/Other" to set manually.
                </p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="tax-label">Tax Label</Label>
              <Select
                value={formData.tax_label}
                onValueChange={(value) => setFormData(prev => ({ ...prev, tax_label: value }))}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select tax label" />
                </SelectTrigger>
                <SelectContent>
                  {TAX_LABELS.map((label) => (
                    <SelectItem key={label.value} value={label.value}>
                      {label.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <div className="flex items-start gap-3">
              <Info className="h-5 w-5 text-blue-600 mt-0.5" />
              <div>
                <h4 className="font-medium text-blue-900 mb-1">Preview</h4>
                <p className="text-sm text-blue-700">
                  Items will show "{formData.tax_label} ({formData.default_tax_rate}%)" 
                  for taxable items in {formData.tax_region}.
                </p>
              </div>
            </div>
          </div>

          <div className="flex justify-end pt-4">
            <Button 
              onClick={handleSave} 
              disabled={isUpdating}
              className="gap-2"
            >
              <Save className="h-4 w-4" />
              {isUpdating ? 'Saving...' : 'Save Tax Settings'}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
