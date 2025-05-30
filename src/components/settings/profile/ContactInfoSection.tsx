
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

interface ContactInfoSectionProps {
  companySettings: any;
  updateCompanySettings: (updates: any) => void;
  isEditing?: boolean;
}

export const ContactInfoSection = ({ companySettings, updateCompanySettings, isEditing = true }: ContactInfoSectionProps) => {
  return (
    <div className="space-y-4">
      <h3 className="text-lg font-medium">Contact Information</h3>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-2">
          <Label htmlFor="company-phone">Phone</Label>
          <Input 
            id="company-phone" 
            value={companySettings.company_phone}
            onChange={(e) => updateCompanySettings({ company_phone: e.target.value })}
            disabled={!isEditing}
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="company-email">Email</Label>
          <Input 
            id="company-email" 
            value={companySettings.company_email}
            onChange={(e) => updateCompanySettings({ company_email: e.target.value })}
            disabled={!isEditing}
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="company-website">Website</Label>
          <Input 
            id="company-website" 
            value={companySettings.company_website}
            onChange={(e) => updateCompanySettings({ company_website: e.target.value })}
            disabled={!isEditing}
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="tax-id">Tax ID / EIN</Label>
          <Input 
            id="tax-id" 
            value={companySettings.tax_id}
            onChange={(e) => updateCompanySettings({ tax_id: e.target.value })}
            disabled={!isEditing}
          />
        </div>
      </div>
    </div>
  );
};
