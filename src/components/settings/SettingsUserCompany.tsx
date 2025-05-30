
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Textarea } from "@/components/ui/textarea";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useRBAC, PermissionRequired } from "@/components/auth/RBACProvider";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { useState } from "react";
import { UserRole } from "@/components/auth/types";
import { Upload } from "lucide-react";
import { useCompanySettings } from "@/hooks/useCompanySettings";
import { useUserSettings } from "@/hooks/useUserSettings";
import { Skeleton } from "@/components/ui/skeleton";
import { useAuth } from "@/hooks/use-auth";

export const SettingsUserCompany = () => {
  const { currentUser, setCurrentUser } = useRBAC();
  const { user } = useAuth();
  const { settings: companySettings, loading: companyLoading, saving: companySaving, updateSettings: updateCompanySettings } = useCompanySettings();
  const { settings: userSettings, loading: userLoading, saving: userSaving, updateSettings: updateUserSettings } = useUserSettings();
  const [selectedRole, setSelectedRole] = useState<UserRole>(currentUser?.role || 'technician');
  
  const handleRoleChange = (value: UserRole) => {
    setSelectedRole(value);
    
    // In a real app, this would make an API call to update the user's role
    if (currentUser) {
      setCurrentUser({
        ...currentUser,
        role: value
      });
    }
  };

  if (companyLoading || userLoading) {
    return (
      <div className="space-y-8">
        <div className="space-y-4">
          <Skeleton className="h-6 w-48" />
          <div className="grid grid-cols-1 md:grid-cols-[200px_1fr] gap-8">
            <Skeleton className="h-32 w-32 rounded-full" />
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {Array.from({ length: 6 }).map((_, i) => (
                <Skeleton key={i} className="h-10 w-full" />
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }
  
  return (
    <div className="space-y-8">
      <div>
        <h3 className="text-lg font-medium mb-4">Profile Details</h3>
        <div className="grid grid-cols-1 md:grid-cols-[200px_1fr] gap-8">
          <div className="flex flex-col items-center text-center space-y-3">
            <Avatar className="h-32 w-32">
              <AvatarImage src="https://github.com/shadcn.png" />
              <AvatarFallback>TC</AvatarFallback>
            </Avatar>
            <Button variant="outline" size="sm">Change Avatar</Button>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <Label htmlFor="first-name">First Name</Label>
              <Input id="first-name" defaultValue="Tom" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="last-name">Last Name</Label>
              <Input id="last-name" defaultValue="Cook" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input 
                id="email" 
                type="email" 
                value={user?.email || "tom.cook@example.com"}
                disabled
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="phone">Phone</Label>
              <Input id="phone" defaultValue="(555) 987-6543" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="role">Role</Label>
              <Select 
                defaultValue={currentUser?.role || "technician"}
                onValueChange={(value) => handleRoleChange(value as UserRole)}
              >
                <SelectTrigger id="role">
                  <SelectValue placeholder="Select role" />
                </SelectTrigger>
                <SelectContent>
                  <PermissionRequired permission="users.roles.assign">
                    <SelectItem value="admin">Administrator</SelectItem>
                    <SelectItem value="manager">Manager</SelectItem>
                    <SelectItem value="dispatcher">Dispatcher</SelectItem>
                  </PermissionRequired>
                  <SelectItem value="technician">Technician</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="notification-email">Notification Email</Label>
              <Input 
                id="notification-email" 
                type="email" 
                value={userSettings.notification_email || user?.email || ""}
                onChange={(e) => updateUserSettings({ notification_email: e.target.value })}
              />
            </div>
          </div>
        </div>
      </div>
      
      <Separator />
      
      <div>
        <h3 className="text-lg font-medium mb-4">Company Information</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-2">
            <Label htmlFor="company-name">Company Name</Label>
            <Input 
              id="company-name" 
              value={companySettings.company_name}
              onChange={(e) => updateCompanySettings({ company_name: e.target.value })}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="business-type">Business Type</Label>
            <Input 
              id="business-type" 
              value={companySettings.business_type}
              onChange={(e) => updateCompanySettings({ business_type: e.target.value })}
            />
          </div>
          <div className="space-y-2 md:col-span-2">
            <Label htmlFor="company-address">Address</Label>
            <Input 
              id="company-address" 
              value={companySettings.company_address}
              onChange={(e) => updateCompanySettings({ company_address: e.target.value })}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="company-city">City</Label>
            <Input 
              id="company-city" 
              value={companySettings.company_city}
              onChange={(e) => updateCompanySettings({ company_city: e.target.value })}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="company-state">State</Label>
            <Input 
              id="company-state" 
              value={companySettings.company_state}
              onChange={(e) => updateCompanySettings({ company_state: e.target.value })}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="company-zip">ZIP / Postal Code</Label>
            <Input 
              id="company-zip" 
              value={companySettings.company_zip}
              onChange={(e) => updateCompanySettings({ company_zip: e.target.value })}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="company-country">Country</Label>
            <Input 
              id="company-country" 
              value={companySettings.company_country}
              onChange={(e) => updateCompanySettings({ company_country: e.target.value })}
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
              value={companySettings.company_phone}
              onChange={(e) => updateCompanySettings({ company_phone: e.target.value })}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="company-email">Email</Label>
            <Input 
              id="company-email" 
              value={companySettings.company_email}
              onChange={(e) => updateCompanySettings({ company_email: e.target.value })}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="company-website">Website</Label>
            <Input 
              id="company-website" 
              value={companySettings.company_website}
              onChange={(e) => updateCompanySettings({ company_website: e.target.value })}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="tax-id">Tax ID / EIN</Label>
            <Input 
              id="tax-id" 
              value={companySettings.tax_id}
              onChange={(e) => updateCompanySettings({ tax_id: e.target.value })}
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
              value={companySettings.company_tagline}
              onChange={(e) => updateCompanySettings({ company_tagline: e.target.value })}
            />
            
            <div className="mt-4">
              <Label htmlFor="company-desc">Company Description</Label>
              <Textarea 
                id="company-desc" 
                className="resize-none" 
                rows={4}
                value={companySettings.company_description}
                onChange={(e) => updateCompanySettings({ company_description: e.target.value })}
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
            <Input 
              id="service-radius" 
              type="number" 
              value={companySettings.service_radius}
              onChange={(e) => updateCompanySettings({ service_radius: parseInt(e.target.value) || 50 })}
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
            />
            <p className="text-xs text-fixlyfy-text-secondary mt-1">
              Enter ZIP codes separated by commas
            </p>
          </div>
        </div>
      </div>
      
      <Separator />
      
      <PermissionRequired permission="settings.view">
        <div>
          <h3 className="text-lg font-medium mb-4">Personal Preferences</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <Label htmlFor="calendar-sync">Calendar Integration</Label>
              <Select 
                value={userSettings.calendar_integration} 
                onValueChange={(value) => updateUserSettings({ calendar_integration: value })}
              >
                <SelectTrigger id="calendar-sync">
                  <SelectValue placeholder="Select calendar" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="google">Google Calendar</SelectItem>
                  <SelectItem value="outlook">Outlook Calendar</SelectItem>
                  <SelectItem value="apple">Apple Calendar</SelectItem>
                  <SelectItem value="none">None</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>
      </PermissionRequired>
      
      <div className="md:col-span-2 space-y-4">
        <h3 className="text-lg font-medium">Role Preview</h3>
        <p className="text-muted-foreground text-sm">
          Test how the application looks with different roles. This only affects your current session.
        </p>
        
        <div className="bg-fixlyfy/5 p-4 rounded-lg">
          <RadioGroup 
            defaultValue={currentUser?.role}
            onValueChange={(value) => handleRoleChange(value as UserRole)}
            className="flex flex-col space-y-2 md:flex-row md:space-y-0 md:space-x-6"
          >
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="admin" id="r-admin" />
              <Label htmlFor="r-admin">Administrator</Label>
            </div>
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="manager" id="r-manager" />
              <Label htmlFor="r-manager">Manager</Label>
            </div>
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="dispatcher" id="r-dispatcher" />
              <Label htmlFor="r-dispatcher">Dispatcher</Label>
            </div>
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="technician" id="r-technician" />
              <Label htmlFor="r-technician">Technician</Label>
            </div>
          </RadioGroup>
        </div>
      </div>
      
      <div className="flex justify-end gap-3">
        <Button variant="outline">Cancel</Button>
        <Button 
          className="bg-fixlyfy hover:bg-fixlyfy/90"
          disabled={companySaving || userSaving}
        >
          {(companySaving || userSaving) ? 'Saving...' : 'Save Changes'}
        </Button>
      </div>
    </div>
  );
};
