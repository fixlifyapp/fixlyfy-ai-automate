
import { Card } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Building, Phone, Mail, MapPin, Loader } from "lucide-react";

interface FormData {
  firstName: string;
  lastName: string;
  company: string;
  email: string;
  phone: string;
  street: string;
  city: string;
  state: string;
  zip: string;
  status: string;
}

interface ClientDetailsTabProps {
  formData: FormData;
  handleInputChange: (field: string, value: string) => void;
  onSaveChanges?: () => void;
  isSaving?: boolean;
}

export const ClientDetailsTab = ({ 
  formData, 
  handleInputChange, 
  onSaveChanges, 
  isSaving 
}: ClientDetailsTabProps) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      <Card className="p-6">
        <h3 className="text-lg font-medium mb-4">Personal Information</h3>
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="firstName">First Name</Label>
              <Input 
                id="firstName" 
                value={formData.firstName}
                onChange={(e) => handleInputChange('firstName', e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="lastName">Last Name</Label>
              <Input 
                id="lastName" 
                value={formData.lastName}
                onChange={(e) => handleInputChange('lastName', e.target.value)}
              />
            </div>
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="company">Company</Label>
            <div className="flex items-center">
              <Building size={16} className="mr-2 text-fixlyfy-text-secondary" />
              <Input 
                id="company" 
                value={formData.company}
                onChange={(e) => handleInputChange('company', e.target.value)}
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="status">Status</Label>
            <Select value={formData.status} onValueChange={(value) => handleInputChange('status', value)}>
              <SelectTrigger>
                <SelectValue placeholder="Select status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="active">Active</SelectItem>
                <SelectItem value="inactive">Inactive</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </Card>
      
      <Card className="p-6">
        <h3 className="text-lg font-medium mb-4">Contact Information</h3>
        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="phone">Phone</Label>
            <div className="flex items-center">
              <Phone size={16} className="mr-2 text-fixlyfy-text-secondary" />
              <Input 
                id="phone" 
                value={formData.phone}
                onChange={(e) => handleInputChange('phone', e.target.value)}
              />
            </div>
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <div className="flex items-center">
              <Mail size={16} className="mr-2 text-fixlyfy-text-secondary" />
              <Input 
                id="email" 
                value={formData.email}
                onChange={(e) => handleInputChange('email', e.target.value)}
              />
            </div>
          </div>
        </div>
      </Card>
      
      <Card className="p-6 md:col-span-2">
        <h3 className="text-lg font-medium mb-4">Address</h3>
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-1 gap-4">
            <div className="space-y-2">
              <Label htmlFor="street">Street Address</Label>
              <div className="flex items-center">
                <MapPin size={16} className="mr-2 text-fixlyfy-text-secondary" />
                <Input 
                  id="street" 
                  value={formData.street}
                  onChange={(e) => handleInputChange('street', e.target.value)}
                />
              </div>
            </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label htmlFor="city">City</Label>
              <Input 
                id="city" 
                value={formData.city}
                onChange={(e) => handleInputChange('city', e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="state">State</Label>
              <Input 
                id="state" 
                value={formData.state}
                onChange={(e) => handleInputChange('state', e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="zip">ZIP Code</Label>
              <Input 
                id="zip"
                value={formData.zip}
                onChange={(e) => handleInputChange('zip', e.target.value)}
              />
            </div>
          </div>
          
          {onSaveChanges && (
            <div className="pt-4 border-t">
              <Button 
                className="bg-fixlyfy hover:bg-fixlyfy/90" 
                onClick={onSaveChanges}
                disabled={isSaving}
              >
                {isSaving && <Loader size={18} className="mr-2 animate-spin" />}
                Save Changes
              </Button>
            </div>
          )}
        </div>
      </Card>
    </div>
  );
};
