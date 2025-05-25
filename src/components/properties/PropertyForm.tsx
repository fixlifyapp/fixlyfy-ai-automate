
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { ClientProperty, CreatePropertyInput, UpdatePropertyInput } from "@/types/property";

interface PropertyFormProps {
  clientId: string;
  property?: ClientProperty;
  onSubmit: (data: CreatePropertyInput | UpdatePropertyInput) => Promise<void>;
  onCancel: () => void;
  isLoading?: boolean;
}

export const PropertyForm = ({ clientId, property, onSubmit, onCancel, isLoading }: PropertyFormProps) => {
  const [formData, setFormData] = useState({
    property_name: property?.property_name || "",
    address: property?.address || "",
    city: property?.city || "",
    state: property?.state || "",
    zip: property?.zip || "",
    country: property?.country || "USA",
    property_type: property?.property_type || "Residential",
    is_primary: property?.is_primary || false,
    notes: property?.notes || ""
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (property) {
      await onSubmit(formData as UpdatePropertyInput);
    } else {
      await onSubmit({ ...formData, client_id: clientId } as CreatePropertyInput);
    }
  };

  const handleInputChange = (field: string, value: string | boolean) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <Label htmlFor="property_name">Property Name *</Label>
        <Input
          id="property_name"
          value={formData.property_name}
          onChange={(e) => handleInputChange("property_name", e.target.value)}
          placeholder="e.g., Main Office, Home, Warehouse"
          required
        />
      </div>

      <div>
        <Label htmlFor="address">Address</Label>
        <Input
          id="address"
          value={formData.address}
          onChange={(e) => handleInputChange("address", e.target.value)}
          placeholder="Street address"
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label htmlFor="city">City</Label>
          <Input
            id="city"
            value={formData.city}
            onChange={(e) => handleInputChange("city", e.target.value)}
            placeholder="City"
          />
        </div>
        <div>
          <Label htmlFor="state">State</Label>
          <Input
            id="state"
            value={formData.state}
            onChange={(e) => handleInputChange("state", e.target.value)}
            placeholder="State"
          />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label htmlFor="zip">ZIP Code</Label>
          <Input
            id="zip"
            value={formData.zip}
            onChange={(e) => handleInputChange("zip", e.target.value)}
            placeholder="ZIP Code"
          />
        </div>
        <div>
          <Label htmlFor="country">Country</Label>
          <Input
            id="country"
            value={formData.country}
            onChange={(e) => handleInputChange("country", e.target.value)}
            placeholder="Country"
          />
        </div>
      </div>

      <div>
        <Label htmlFor="property_type">Property Type</Label>
        <Select value={formData.property_type} onValueChange={(value) => handleInputChange("property_type", value)}>
          <SelectTrigger>
            <SelectValue placeholder="Select property type" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="Residential">Residential</SelectItem>
            <SelectItem value="Commercial">Commercial</SelectItem>
            <SelectItem value="Industrial">Industrial</SelectItem>
            <SelectItem value="Mixed-Use">Mixed-Use</SelectItem>
            <SelectItem value="Other">Other</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="flex items-center space-x-2">
        <Switch
          id="is_primary"
          checked={formData.is_primary}
          onCheckedChange={(checked) => handleInputChange("is_primary", checked)}
        />
        <Label htmlFor="is_primary">Set as primary property</Label>
      </div>

      <div>
        <Label htmlFor="notes">Notes</Label>
        <Textarea
          id="notes"
          value={formData.notes}
          onChange={(e) => handleInputChange("notes", e.target.value)}
          placeholder="Additional notes about this property"
          rows={3}
        />
      </div>

      <div className="flex justify-end space-x-2 pt-4">
        <Button type="button" variant="outline" onClick={onCancel}>
          Cancel
        </Button>
        <Button type="submit" disabled={isLoading}>
          {property ? "Update Property" : "Add Property"}
        </Button>
      </div>
    </form>
  );
};
