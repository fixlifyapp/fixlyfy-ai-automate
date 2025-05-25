
import { useState, useEffect } from "react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { useClientProperties } from "@/hooks/useClientProperties";
import { PropertyManagementDialog } from "@/components/properties/PropertyManagementDialog";

interface PropertySelectorProps {
  clientId: string;
  selectedPropertyId?: string;
  onPropertySelect: (propertyId: string) => void;
  className?: string;
}

export const PropertySelector = ({ 
  clientId, 
  selectedPropertyId, 
  onPropertySelect, 
  className 
}: PropertySelectorProps) => {
  const [showPropertyDialog, setShowPropertyDialog] = useState(false);
  const { properties, isLoading, getPrimaryProperty } = useClientProperties(clientId);

  // Auto-select primary property if none selected
  useEffect(() => {
    if (!selectedPropertyId && properties.length > 0) {
      const primaryProperty = getPrimaryProperty();
      if (primaryProperty) {
        onPropertySelect(primaryProperty.id);
      } else if (properties.length === 1) {
        onPropertySelect(properties[0].id);
      }
    }
  }, [properties, selectedPropertyId, onPropertySelect, getPrimaryProperty]);

  const formatPropertyDisplay = (property: any) => {
    const parts = [property.property_name];
    if (property.address) {
      parts.push(property.address);
    }
    return parts.join(' - ');
  };

  return (
    <div className={className}>
      <div className="flex items-center justify-between mb-2">
        <Label htmlFor="property">Service Location</Label>
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={() => setShowPropertyDialog(true)}
        >
          <Plus className="h-3 w-3 mr-1" />
          Manage
        </Button>
      </div>
      
      <Select
        value={selectedPropertyId || ""}
        onValueChange={onPropertySelect}
        disabled={isLoading}
      >
        <SelectTrigger>
          <SelectValue placeholder="Select service location" />
        </SelectTrigger>
        <SelectContent>
          {properties.map((property) => (
            <SelectItem key={property.id} value={property.id}>
              <div className="flex items-center">
                {formatPropertyDisplay(property)}
                {property.is_primary && (
                  <span className="ml-2 text-xs bg-yellow-100 text-yellow-800 px-1 py-0.5 rounded">
                    Primary
                  </span>
                )}
              </div>
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      <PropertyManagementDialog
        open={showPropertyDialog}
        onOpenChange={setShowPropertyDialog}
        clientId={clientId}
      />
    </div>
  );
};
