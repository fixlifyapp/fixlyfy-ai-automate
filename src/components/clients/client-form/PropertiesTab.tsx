
import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useClientProperties } from "./hooks/useClientProperties";
import { EmptyTabContent } from "./EmptyTabContent";
import { PropertyCard } from "@/components/properties/PropertyCard";
import { PropertyManagementDialog } from "@/components/properties/PropertyManagementDialog";
import { Loader, Plus } from "lucide-react";

interface PropertiesTabProps {
  clientId?: string;
}

export const PropertiesTab = ({ clientId }: PropertiesTabProps) => {
  const [showManagementDialog, setShowManagementDialog] = useState(false);
  const { properties, isLoading, deleteProperty, setPrimaryProperty } = useClientProperties(clientId);

  if (isLoading) {
    return (
      <div className="flex justify-center items-center py-12">
        <Loader size={32} className="animate-spin text-fixlyfy mr-2" />
        <span>Loading properties...</span>
      </div>
    );
  }

  if (properties.length === 0) {
    return (
      <EmptyTabContent 
        message="No properties found for this client."
        actionLabel="Add Property"
        onAction={() => setShowManagementDialog(true)}
      />
    );
  }

  const handleEdit = () => {
    setShowManagementDialog(true);
  };

  const handleDelete = async (propertyId: string) => {
    if (window.confirm("Are you sure you want to delete this property?")) {
      await deleteProperty(propertyId);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-medium">Properties</h3>
        <Button onClick={() => setShowManagementDialog(true)}>
          <Plus className="h-4 w-4 mr-2" />
          Manage Properties
        </Button>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {properties.map(property => (
          <PropertyCard
            key={property.id}
            property={property}
            onEdit={handleEdit}
            onDelete={handleDelete}
            onSetPrimary={setPrimaryProperty}
          />
        ))}
      </div>

      {clientId && (
        <PropertyManagementDialog
          open={showManagementDialog}
          onOpenChange={setShowManagementDialog}
          clientId={clientId}
        />
      )}
    </div>
  );
};
