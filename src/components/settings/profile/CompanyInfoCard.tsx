
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Building2 } from "lucide-react";

interface CompanyInfoCardProps {
  companySettings: any;
  updateCompanySettings: (updates: any) => void;
}

export const CompanyInfoCard = ({ companySettings, updateCompanySettings }: CompanyInfoCardProps) => {
  const handleFieldChange = (field: string, value: string) => {
    updateCompanySettings({ [field]: value });
  };

  return (
    <Card className="fixlyfy-card">
      <CardHeader className="flex flex-row items-center space-y-0 pb-4">
        <Building2 className="h-5 w-5 text-fixlyfy mr-2" />
        <CardTitle className="text-lg">Company Information</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="company-name">Company Name</Label>
            <Input 
              id="company-name" 
              value={companySettings.company_name || ''}
              onChange={(e) => handleFieldChange('company_name', e.target.value)}
              placeholder="Your Company Name"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="business-type">Business Type</Label>
            <Input 
              id="business-type" 
              value={companySettings.business_type || ''}
              onChange={(e) => handleFieldChange('business_type', e.target.value)}
              placeholder="HVAC, Plumbing, etc."
            />
          </div>
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="company-address">Address</Label>
          <Input 
            id="company-address" 
            value={companySettings.company_address || ''}
            onChange={(e) => handleFieldChange('company_address', e.target.value)}
            placeholder="123 Business Street, Suite 100"
          />
        </div>
        
        <div className="grid grid-cols-3 gap-4">
          <div className="space-y-2">
            <Label htmlFor="company-city">City</Label>
            <Input 
              id="company-city" 
              value={companySettings.company_city || ''}
              onChange={(e) => handleFieldChange('company_city', e.target.value)}
              placeholder="City"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="company-state">State</Label>
            <Input 
              id="company-state" 
              value={companySettings.company_state || ''}
              onChange={(e) => handleFieldChange('company_state', e.target.value)}
              placeholder="State"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="company-zip">ZIP Code</Label>
            <Input 
              id="company-zip" 
              value={companySettings.company_zip || ''}
              onChange={(e) => handleFieldChange('company_zip', e.target.value)}
              placeholder="12345"
            />
          </div>
        </div>
        
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="company-phone">Business Phone</Label>
            <Input 
              id="company-phone" 
              value={companySettings.company_phone || ''}
              onChange={(e) => handleFieldChange('company_phone', e.target.value)}
              placeholder="(555) 123-4567"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="company-email">Business Email</Label>
            <Input 
              id="company-email" 
              type="email"
              value={companySettings.company_email || ''}
              onChange={(e) => handleFieldChange('company_email', e.target.value)}
              placeholder="contact@company.com"
            />
          </div>
        </div>
        
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="company-website">Website</Label>
            <Input 
              id="company-website" 
              value={companySettings.company_website || ''}
              onChange={(e) => handleFieldChange('company_website', e.target.value)}
              placeholder="https://www.company.com"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="tax-id">Tax ID / EIN</Label>
            <Input 
              id="tax-id" 
              value={companySettings.tax_id || ''}
              onChange={(e) => handleFieldChange('tax_id', e.target.value)}
              placeholder="XX-XXXXXXX"
            />
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
