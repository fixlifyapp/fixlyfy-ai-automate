
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";

interface CompanyInfoSectionProps {
  companySettings: any;
  updateCompanySettings: (updates: any) => void;
  isEditing?: boolean;
}

export const CompanyInfoSection = ({ companySettings, updateCompanySettings, isEditing = true }: CompanyInfoSectionProps) => {
  const handleFieldChange = (field: string, value: string) => {
    updateCompanySettings({ [field]: value });
  };

  const handleCustomDomainNameChange = (value: string) => {
    // Clean the input to only allow letters, numbers, and hyphens
    const cleanValue = value.toLowerCase().replace(/[^a-z0-9-]/g, '');
    handleFieldChange('custom_domain_name', cleanValue);
  };

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-medium">Company Information</h3>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-2">
          <Label htmlFor="company-name">Company Name</Label>
          <Input 
            id="company-name" 
            value={companySettings.company_name || ''}
            onChange={(e) => handleFieldChange('company_name', e.target.value)}
            disabled={!isEditing}
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="business-type">Business Type</Label>
          <Input 
            id="business-type" 
            value={companySettings.business_type || ''}
            onChange={(e) => handleFieldChange('business_type', e.target.value)}
            disabled={!isEditing}
          />
        </div>
        
        {/* Custom Email Domain Section */}
        <div className="space-y-2 md:col-span-2">
          <Label htmlFor="custom-domain-name">Email Domain Name</Label>
          <div className="flex gap-2 items-center">
            <Input 
              id="custom-domain-name" 
              value={companySettings.custom_domain_name || ''}
              onChange={(e) => handleCustomDomainNameChange(e.target.value)}
              placeholder="yourcompany"
              disabled={!isEditing}
              className="max-w-xs"
            />
            <span className="text-muted-foreground">@fixlyfy.app</span>
          </div>
          {companySettings.custom_domain_name && (
            <div className="flex items-center gap-2 mt-2">
              <span className="text-sm text-muted-foreground">Your email address:</span>
              <Badge variant="secondary" className="bg-green-50 text-green-700">
                {companySettings.custom_domain_name}@fixlyfy.app
              </Badge>
            </div>
          )}
          <p className="text-xs text-muted-foreground">
            This will be used as your FROM address when sending emails to clients
          </p>
        </div>

        <div className="space-y-2 md:col-span-2">
          <Label htmlFor="company-address">Address</Label>
          <Input 
            id="company-address" 
            value={companySettings.company_address || ''}
            onChange={(e) => handleFieldChange('company_address', e.target.value)}
            disabled={!isEditing}
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="company-city">City</Label>
          <Input 
            id="company-city" 
            value={companySettings.company_city || ''}
            onChange={(e) => handleFieldChange('company_city', e.target.value)}
            disabled={!isEditing}
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="company-state">State</Label>
          <Input 
            id="company-state" 
            value={companySettings.company_state || ''}
            onChange={(e) => handleFieldChange('company_state', e.target.value)}
            disabled={!isEditing}
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="company-zip">ZIP Code</Label>
          <Input 
            id="company-zip" 
            value={companySettings.company_zip || ''}
            onChange={(e) => handleFieldChange('company_zip', e.target.value)}
            disabled={!isEditing}
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="company-country">Country</Label>
          <Input 
            id="company-country" 
            value={companySettings.company_country || ''}
            onChange={(e) => handleFieldChange('company_country', e.target.value)}
            disabled={!isEditing}
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="company-website">Website</Label>
          <Input 
            id="company-website" 
            value={companySettings.company_website || ''}
            onChange={(e) => handleFieldChange('company_website', e.target.value)}
            disabled={!isEditing}
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="company-email">Main Business Email</Label>
          <Input 
            id="company-email" 
            type="email"
            value={companySettings.company_email || ''}
            onChange={(e) => handleFieldChange('company_email', e.target.value)}
            disabled={!isEditing}
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="tax-id">Tax ID / EIN</Label>
          <Input 
            id="tax-id" 
            value={companySettings.tax_id || ''}
            onChange={(e) => handleFieldChange('tax_id', e.target.value)}
            disabled={!isEditing}
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="company-phone">Business Phone Number</Label>
          <Input 
            id="company-phone" 
            value={companySettings.company_phone || ''}
            onChange={(e) => handleFieldChange('company_phone', e.target.value)}
            disabled={!isEditing}
          />
        </div>
      </div>
    </div>
  );
};
