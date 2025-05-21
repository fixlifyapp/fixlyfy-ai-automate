
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Textarea } from "@/components/ui/textarea";
import { Upload } from "lucide-react";

export const SettingsCompany = () => {
  return (
    <div className="space-y-8">
      <div>
        <h3 className="text-lg font-medium mb-4">Company Information</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-2">
            <Label htmlFor="company-name">Company Name</Label>
            <Input id="company-name" defaultValue="Fixlyfy Services Inc." />
          </div>
          <div className="space-y-2">
            <Label htmlFor="business-type">Business Type</Label>
            <Input id="business-type" defaultValue="HVAC & Plumbing Services" />
          </div>
          <div className="space-y-2 md:col-span-2">
            <Label htmlFor="company-address">Address</Label>
            <Input id="company-address" defaultValue="123 Business Park, Suite 456" />
          </div>
          <div className="space-y-2">
            <Label htmlFor="company-city">City</Label>
            <Input id="company-city" defaultValue="San Francisco" />
          </div>
          <div className="space-y-2">
            <Label htmlFor="company-state">State</Label>
            <Input id="company-state" defaultValue="California" />
          </div>
          <div className="space-y-2">
            <Label htmlFor="company-zip">ZIP / Postal Code</Label>
            <Input id="company-zip" defaultValue="94103" />
          </div>
          <div className="space-y-2">
            <Label htmlFor="company-country">Country</Label>
            <Input id="company-country" defaultValue="United States" />
          </div>
        </div>
      </div>
      
      <Separator />
      
      <div>
        <h3 className="text-lg font-medium mb-4">Contact Information</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-2">
            <Label htmlFor="company-phone">Phone</Label>
            <Input id="company-phone" defaultValue="(555) 123-4567" />
          </div>
          <div className="space-y-2">
            <Label htmlFor="company-email">Email</Label>
            <Input id="company-email" defaultValue="contact@fixlyfy.com" />
          </div>
          <div className="space-y-2">
            <Label htmlFor="company-website">Website</Label>
            <Input id="company-website" defaultValue="https://www.fixlyfy.com" />
          </div>
          <div className="space-y-2">
            <Label htmlFor="tax-id">Tax ID / EIN</Label>
            <Input id="tax-id" defaultValue="XX-XXXXXXX" />
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
            <Input id="company-motto" defaultValue="Smart Solutions for Field Service Businesses" />
            
            <div className="mt-4">
              <Label htmlFor="company-desc">Company Description</Label>
              <Textarea 
                id="company-desc" 
                className="resize-none" 
                rows={4}
                defaultValue="Fixlyfy Services provides professional HVAC, plumbing and electrical services to residential and commercial customers throughout the Bay Area. Our team of skilled technicians is available 24/7 for all your service needs."
              />
            </div>
          </div>
        </div>
      </div>
      
      <Separator />
      
      <div>
        <h3 className="text-lg font-medium mb-4">Service Areas</h3>
        <div className="grid grid-cols-1 gap-6">
          <div className="space-y-2">
            <Label htmlFor="service-radius">Service Radius (miles)</Label>
            <Input id="service-radius" type="number" defaultValue="50" />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="service-areas">Service ZIP Codes / Areas</Label>
            <Textarea 
              id="service-areas" 
              className="resize-none" 
              rows={4}
              defaultValue="94103, 94104, 94105, 94107, 94108, 94109, 94110, 94111, 94112, 94114, 94115, 94116, 94117, 94118, 94121, 94122, 94123, 94124, 94127, 94129, 94130, 94131, 94132, 94133, 94134, 94158"
            />
            <p className="text-xs text-fixlyfy-text-secondary mt-1">
              Enter ZIP codes separated by commas
            </p>
          </div>
        </div>
      </div>
      
      <div className="flex justify-end gap-3">
        <Button variant="outline">Cancel</Button>
        <Button className="bg-fixlyfy hover:bg-fixlyfy/90">Save Changes</Button>
      </div>
    </div>
  );
};
