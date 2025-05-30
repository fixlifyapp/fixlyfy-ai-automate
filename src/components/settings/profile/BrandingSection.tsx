
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Upload } from "lucide-react";

interface BrandingSectionProps {
  companySettings: any;
  updateCompanySettings: (updates: any) => void;
  isEditing?: boolean;
}

export const BrandingSection = ({ companySettings, updateCompanySettings, isEditing = true }: BrandingSectionProps) => {
  return (
    <div className="space-y-4">
      <h3 className="text-lg font-medium">Branding</h3>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-2">
          <Label>Company Logo</Label>
          <div className="border-2 border-dashed rounded-md p-6 flex flex-col items-center">
            <div className="mb-4 h-20 w-20 rounded-md fixlyfy-gradient flex items-center justify-center text-white font-bold text-3xl">
              F
            </div>
            {isEditing && (
              <Button variant="outline" className="gap-2">
                <Upload size={16} />
                Upload Logo
              </Button>
            )}
            <p className="text-xs text-fixlyfy-text-secondary mt-2">
              Recommended size: 512x512px, PNG or SVG
            </p>
          </div>
        </div>
        <div className="space-y-2">
          <Label htmlFor="company-tagline">Company Tagline</Label>
          <Input 
            id="company-tagline" 
            value={companySettings.company_tagline}
            onChange={(e) => updateCompanySettings({ company_tagline: e.target.value })}
            disabled={!isEditing}
          />
          
          <div className="mt-4">
            <Label htmlFor="company-desc">Company Description</Label>
            <Textarea 
              id="company-desc" 
              className="resize-none" 
              rows={4}
              value={companySettings.company_description}
              onChange={(e) => updateCompanySettings({ company_description: e.target.value })}
              disabled={!isEditing}
            />
          </div>
        </div>
      </div>
    </div>
  );
};
