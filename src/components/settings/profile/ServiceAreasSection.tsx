
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

interface ServiceAreasSectionProps {
  companySettings: any;
  updateCompanySettings: (updates: any) => void;
  isEditing?: boolean;
}

export const ServiceAreasSection = ({ companySettings, updateCompanySettings, isEditing = true }: ServiceAreasSectionProps) => {
  return (
    <div className="space-y-4">
      <h3 className="text-lg font-medium">Service Areas</h3>
      <div className="grid grid-cols-1 gap-6">
        <div className="space-y-2">
          <Label htmlFor="service-radius">Service Radius (miles)</Label>
          <Input 
            id="service-radius" 
            type="number" 
            value={companySettings.service_radius}
            onChange={(e) => updateCompanySettings({ service_radius: parseInt(e.target.value) || 50 })}
            disabled={!isEditing}
          />
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="service-areas">Service ZIP Codes / Areas</Label>
          <Textarea 
            id="service-areas" 
            className="resize-none" 
            rows={4}
            value={companySettings.service_zip_codes}
            onChange={(e) => updateCompanySettings({ service_zip_codes: e.target.value })}
            disabled={!isEditing}
          />
          <p className="text-xs text-fixlyfy-text-secondary mt-1">
            Enter ZIP codes separated by commas
          </p>
        </div>
      </div>
    </div>
  );
};
