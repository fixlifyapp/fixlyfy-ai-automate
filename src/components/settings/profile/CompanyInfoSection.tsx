
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

interface CompanyInfoSectionProps {
  companySettings: any;
  updateCompanySettings: (updates: any) => void;
  isEditing?: boolean;
}

export const CompanyInfoSection = ({ companySettings, updateCompanySettings, isEditing = true }: CompanyInfoSectionProps) => {
  return (
    <div className="space-y-4">
      <h3 className="text-lg font-medium">Company Information</h3>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-2">
          <Label htmlFor="company-name">Company Name</Label>
          <Input 
            id="company-name" 
            value={companySettings.company_name}
            onChange={(e) => updateCompanySettings({ company_name: e.target.value })}
            disabled={!isEditing}
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="business-type">Business Type</Label>
          <Input 
            id="business-type" 
            value={companySettings.business_type}
            onChange={(e) => updateCompanySettings({ business_type: e.target.value })}
            disabled={!isEditing}
          />
        </div>
        <div className="space-y-2 md:col-span-2">
          <Label htmlFor="company-address">Address</Label>
          <Input 
            id="company-address" 
            value={companySettings.company_address}
            onChange={(e) => updateCompanySettings({ company_address: e.target.value })}
            disabled={!isEditing}
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="company-city">City</Label>
          <Input 
            id="company-city" 
            value={companySettings.company_city}
            onChange={(e) => updateCompanySettings({ company_city: e.target.value })}
            disabled={!isEditing}
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="company-state">State</Label>
          <Input 
            id="company-state" 
            value={companySettings.company_state}
            onChange={(e) => updateCompanySettings({ company_state: e.target.value })}
            disabled={!isEditing}
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="company-zip">ZIP Code</Label>
          <Input 
            id="company-zip" 
            value={companySettings.company_zip}
            onChange={(e) => updateCompanySettings({ company_zip: e.target.value })}
            disabled={!isEditing}
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="company-country">Country</Label>
          <Input 
            id="company-country" 
            value={companySettings.company_country}
            onChange={(e) => updateCompanySettings({ company_country: e.target.value })}
            disabled={!isEditing}
          />
        </div>
      </div>
    </div>
  );
};
