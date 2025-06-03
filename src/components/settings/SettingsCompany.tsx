import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Upload, Building, Mail, MapPin, Clock } from "lucide-react";
import { EmailConfiguration } from "./EmailConfiguration";
import { useCompanySettings } from "@/hooks/useCompanySettings";

export const SettingsCompany = () => {
  const { settings, loading, saving, updateSettings } = useCompanySettings();

  const handleInputChange = (field: string, value: string | number) => {
    console.log(`SettingsCompany - updating field: ${field} with value:`, value);
    updateSettings({ [field]: value });
  };

  if (loading) {
    return <div>Loading company settings...</div>;
  }

  return (
    <Tabs defaultValue="company" className="w-full">
      <TabsList className="grid grid-cols-4 mb-8">
        <TabsTrigger value="company" className="flex items-center gap-2">
          <Building size={16} />
          Company Info
        </TabsTrigger>
        <TabsTrigger value="email" className="flex items-center gap-2">
          <Mail size={16} />
          Email Settings
        </TabsTrigger>
        <TabsTrigger value="locations" className="flex items-center gap-2">
          <MapPin size={16} />
          Service Areas
        </TabsTrigger>
        <TabsTrigger value="hours" className="flex items-center gap-2">
          <Clock size={16} />
          Business Hours
        </TabsTrigger>
      </TabsList>

      <TabsContent value="company" className="space-y-8">
        <div>
          <h3 className="text-lg font-medium mb-4">Company Information</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <Label htmlFor="company-name">Company Name</Label>
              <Input 
                id="company-name" 
                value={settings.company_name}
                onChange={(e) => handleInputChange('company_name', e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="business-type">Business Type</Label>
              <Input 
                id="business-type" 
                value={settings.business_type}
                onChange={(e) => handleInputChange('business_type', e.target.value)}
              />
            </div>
            
            {/* Custom Email Domain Section */}
            <div className="space-y-2 md:col-span-2">
              <Label htmlFor="custom-domain-name">Email Domain Name</Label>
              <div className="flex gap-2 items-center">
                <Input 
                  id="custom-domain-name" 
                  value={settings.custom_domain_name || ''}
                  onChange={(e) => {
                    const cleanValue = e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, '');
                    console.log('Settings - custom domain name changed to:', cleanValue);
                    handleInputChange('custom_domain_name', cleanValue);
                  }}
                  placeholder="yourcompany"
                  className="max-w-xs"
                />
                <span className="text-muted-foreground">@fixlyfy.app</span>
              </div>
              <p className="text-xs text-muted-foreground">
                This will be your FROM address when sending emails (e.g., yourcompany@fixlyfy.app)
              </p>
            </div>

            <div className="space-y-2 md:col-span-2">
              <Label htmlFor="company-address">Address</Label>
              <Input 
                id="company-address" 
                value={settings.company_address}
                onChange={(e) => handleInputChange('company_address', e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="company-city">City</Label>
              <Input 
                id="company-city" 
                value={settings.company_city}
                onChange={(e) => handleInputChange('company_city', e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="company-state">State</Label>
              <Input 
                id="company-state" 
                value={settings.company_state}
                onChange={(e) => handleInputChange('company_state', e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="company-zip">ZIP / Postal Code</Label>
              <Input 
                id="company-zip" 
                value={settings.company_zip}
                onChange={(e) => handleInputChange('company_zip', e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="company-country">Country</Label>
              <Input 
                id="company-country" 
                value={settings.company_country}
                onChange={(e) => handleInputChange('company_country', e.target.value)}
              />
            </div>
          </div>
        </div>
        
        <Separator />
        
        <div>
          <h3 className="text-lg font-medium mb-4">Contact Information</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <Label htmlFor="company-phone">Phone</Label>
              <Input 
                id="company-phone" 
                value={settings.company_phone}
                onChange={(e) => handleInputChange('company_phone', e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="company-email">Email</Label>
              <Input 
                id="company-email" 
                value={settings.company_email}
                onChange={(e) => handleInputChange('company_email', e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="company-website">Website</Label>
              <Input 
                id="company-website" 
                value={settings.company_website}
                onChange={(e) => handleInputChange('company_website', e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="tax-id">Tax ID / EIN</Label>
              <Input 
                id="tax-id" 
                value={settings.tax_id}
                onChange={(e) => handleInputChange('tax_id', e.target.value)}
              />
            </div>
          </div>
        </div>
        
        <Separator />
        
        <div>
          <h3 className="text-lg font-medium mb-4">Branding</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <Label>Company Logo</Label>
              <div className="border-2 border-dashed rounded-md p-6 flex flex-col items-center">
                <div className="mb-4 h-20 w-20 rounded-md fixlyfy-gradient flex items-center justify-center text-white font-bold text-3xl">
                  F
                </div>
                <Button variant="outline" className="gap-2">
                  <Upload size={16} />
                  Upload Logo
                </Button>
                <p className="text-xs text-fixlyfy-text-secondary mt-2">
                  Recommended size: 512x512px, PNG or SVG
                </p>
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="company-motto">Company Tagline</Label>
              <Input 
                id="company-motto" 
                value={settings.company_tagline}
                onChange={(e) => handleInputChange('company_tagline', e.target.value)}
              />
              
              <div className="mt-4">
                <Label htmlFor="company-desc">Company Description</Label>
                <Textarea 
                  id="company-desc" 
                  className="resize-none" 
                  rows={4}
                  value={settings.company_description}
                  onChange={(e) => handleInputChange('company_description', e.target.value)}
                />
              </div>
            </div>
          </div>
        </div>
        
        <div className="flex justify-end gap-3">
          <Button variant="outline">Cancel</Button>
          <Button className="bg-fixlyfy hover:bg-fixlyfy/90" disabled={saving}>
            {saving ? 'Saving...' : 'Save Changes'}
          </Button>
        </div>
      </TabsContent>

      <TabsContent value="email">
        <EmailConfiguration />
      </TabsContent>

      <TabsContent value="locations">
        <div className="space-y-6">
          <div>
            <h3 className="text-lg font-medium mb-4">Service Areas</h3>
            <div className="grid grid-cols-1 gap-6">
              <div className="space-y-2">
                <Label htmlFor="service-radius">Service Radius (miles)</Label>
                <Input 
                  id="service-radius" 
                  type="number" 
                  value={settings.service_radius}
                  onChange={(e) => handleInputChange('service_radius', parseInt(e.target.value))}
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="service-areas">Service ZIP Codes / Areas</Label>
                <Textarea 
                  id="service-areas" 
                  className="resize-none" 
                  rows={4}
                  value={settings.service_zip_codes}
                  onChange={(e) => handleInputChange('service_zip_codes', e.target.value)}
                />
                <p className="text-xs text-fixlyfy-text-secondary mt-1">
                  Enter ZIP codes separated by commas
                </p>
              </div>
            </div>
          </div>
          
          <div className="flex justify-end gap-3">
            <Button variant="outline">Cancel</Button>
            <Button className="bg-fixlyfy hover:bg-fixlyfy/90" disabled={saving}>
              {saving ? 'Saving...' : 'Save Changes'}
            </Button>
          </div>
        </div>
      </TabsContent>

      <TabsContent value="hours">
        <div className="space-y-6">
          <div>
            <h3 className="text-lg font-medium mb-4">Business Hours</h3>
            <p className="text-muted-foreground">
              Business hours management will be implemented in the next update.
            </p>
          </div>
        </div>
      </TabsContent>
    </Tabs>
  );
};
