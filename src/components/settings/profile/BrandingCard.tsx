
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Palette, Upload } from "lucide-react";
import { useCallback } from "react";
import { debounce } from "lodash";

interface BrandingCardProps {
  companySettings: any;
  updateCompanySettings: (updates: any) => void;
}

export const BrandingCard = ({ companySettings, updateCompanySettings }: BrandingCardProps) => {
  const debouncedUpdate = useCallback(
    debounce((field: string, value: string) => {
      updateCompanySettings({ [field]: value });
    }, 500),
    [updateCompanySettings]
  );

  const handleChange = (field: string, value: string) => {
    updateCompanySettings({ [field]: value });
    debouncedUpdate(field, value);
  };

  return (
    <Card className="fixlyfy-card">
      <CardHeader className="flex flex-row items-center space-y-0 pb-4">
        <Palette className="h-5 w-5 text-fixlyfy mr-2" />
        <CardTitle className="text-lg">Branding</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-4">
          <div>
            <Label className="text-sm font-medium">Company Logo</Label>
            <div className="mt-2 border-2 border-dashed border-fixlyfy-border rounded-lg p-6 text-center">
              <div className="mx-auto h-16 w-16 rounded-lg bg-gradient-to-br from-fixlyfy to-fixlyfy-light flex items-center justify-center text-white font-bold text-2xl mb-3">
                F
              </div>
              <Button variant="outline" size="sm" className="gap-2">
                <Upload className="h-4 w-4" />
                Upload Logo
              </Button>
              <p className="text-xs text-fixlyfy-text-secondary mt-2">
                Recommended: 512x512px, PNG or SVG
              </p>
            </div>
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="company-tagline">Company Tagline</Label>
            <Input 
              id="company-tagline" 
              value={companySettings.company_tagline || ''}
              onChange={(e) => handleChange('company_tagline', e.target.value)}
              placeholder="Your company's tagline"
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="company-description">Company Description</Label>
            <Textarea 
              id="company-description" 
              className="resize-none" 
              rows={3}
              value={companySettings.company_description || ''}
              onChange={(e) => handleChange('company_description', e.target.value)}
              placeholder="Brief description of your company..."
            />
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
