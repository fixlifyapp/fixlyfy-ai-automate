
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Palette, Upload } from "lucide-react";
import { useState, useRef } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { useAuth } from "@/hooks/use-auth";

interface BrandingCardProps {
  companySettings: any;
  updateCompanySettings: (updates: any) => void;
}

export const BrandingCard = ({ companySettings, updateCompanySettings }: BrandingCardProps) => {
  const { user } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFieldChange = async (field: string, value: string) => {
    setIsLoading(true);
    try {
      await updateCompanySettings({ [field]: value });
    } catch (error) {
      console.error('Error updating company settings:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleLogoUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file || !user) return;

    if (!file.type.startsWith('image/')) {
      toast.error('Please select an image file');
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      toast.error('File size must be less than 5MB');
      return;
    }

    setIsUploading(true);
    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `${user.id}/logo.${fileExt}`;

      const { data, error } = await supabase.storage
        .from('company-logos')
        .upload(fileName, file, {
          upsert: true,
          contentType: file.type
        });

      if (error) throw error;

      const { data: publicUrlData } = supabase.storage
        .from('company-logos')
        .getPublicUrl(fileName);

      await updateCompanySettings({
        company_logo_url: publicUrlData.publicUrl
      });

      toast.success('Logo uploaded successfully');
    } catch (error) {
      console.error('Error uploading logo:', error);
      toast.error('Failed to upload logo');
    } finally {
      setIsUploading(false);
    }
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
              {companySettings.company_logo_url ? (
                <div className="mx-auto h-16 w-16 rounded-lg overflow-hidden mb-3">
                  <img 
                    src={companySettings.company_logo_url} 
                    alt="Company Logo" 
                    className="h-full w-full object-cover"
                  />
                </div>
              ) : (
                <div className="mx-auto h-16 w-16 rounded-lg bg-gradient-to-br from-fixlyfy to-fixlyfy-light flex items-center justify-center text-white font-bold text-2xl mb-3">
                  {companySettings.company_name?.[0] || 'F'}
                </div>
              )}
              <input
                type="file"
                ref={fileInputRef}
                onChange={handleLogoUpload}
                accept="image/*"
                className="hidden"
              />
              <Button 
                variant="outline" 
                size="sm" 
                className="gap-2"
                onClick={() => fileInputRef.current?.click()}
                disabled={isUploading}
              >
                <Upload className="h-4 w-4" />
                {isUploading ? 'Uploading...' : 'Upload Logo'}
              </Button>
              <p className="text-xs text-fixlyfy-text-secondary mt-2">
                Recommended: 512x512px, PNG or SVG, Max 5MB
              </p>
            </div>
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="company-tagline">Company Tagline</Label>
            <Input 
              id="company-tagline" 
              value={companySettings.company_tagline || ''}
              onChange={(e) => handleFieldChange('company_tagline', e.target.value)}
              placeholder="Your company's tagline"
              disabled={isLoading}
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="company-description">Company Description</Label>
            <Textarea 
              id="company-description" 
              className="resize-none" 
              rows={3}
              value={companySettings.company_description || ''}
              onChange={(e) => handleFieldChange('company_description', e.target.value)}
              placeholder="Brief description of your company..."
              disabled={isLoading}
            />
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
