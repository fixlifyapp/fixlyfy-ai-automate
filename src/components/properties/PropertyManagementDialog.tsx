
import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { PropertyForm } from "./PropertyForm";
import { PropertyCard } from "./PropertyCard";
import { useClientProperties } from "@/hooks/useClientProperties";
import { ClientProperty } from "@/types/property";

interface PropertyManagementDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  clientId: string;
}

export const PropertyManagementDialog = ({ open, onOpenChange, clientId }: PropertyManagementDialogProps) => {
  const [showForm, setShowForm] = useState(false);
  const [editingProperty, setEditingProperty] = useState<ClientProperty | undefined>();
  
  const { 
    properties, 
    isLoading, 
    addProperty, 
    updateProperty, 
    deleteProperty, 
    setPrimaryProperty 
  } = useClientProperties(clientId);

  const handleAddProperty = () => {
    setEditingProperty(undefined);
    setShowForm(true);
  };

  const handleEditProperty = (property: ClientProperty) => {
    setEditingProperty(property);
    setShowForm(true);
  };

  const handleSubmit = async (data: any) => {
    try {
      if (editingProperty) {
        await updateProperty(editingProperty.id, data);
      } else {
        await addProperty(data);
      }
      setShowForm(false);
      setEditingProperty(undefined);
    } catch (error) {
      // Error is handled in the hook
    }
  };

  const handleCancel = () => {
    setShowForm(false);
    setEditingProperty(undefined);
  };

  const handleDelete = async (propertyId: string) => {
    if (window.confirm("Are you sure you want to delete this property?")) {
      await deleteProperty(propertyId);
    }
  };

  const handleSetPrimary = async (propertyId: string) => {
    await setPrimaryProperty(propertyId);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Manage Properties</DialogTitle>
        </DialogHeader>
        
        {showForm ? (
          <PropertyForm
            clientId={clientId}
            property={editingProperty}
            onSubmit={handleSubmit}
            onCancel={handleCancel}
            isLoading={isLoading}
          />
        ) : (
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <h3 className="text-lg font-medium">Client Properties</h3>
              <Button onClick={handleAddProperty}>
                <Plus className="h-4 w-4 mr-2" />
                Add Property
              </Button>
            </div>
            
            {isLoading ? (
              <div className="text-center py-8">Loading properties...</div>
            ) : properties.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                <p>No properties found.</p>
                <Button onClick={handleAddProperty} className="mt-2">
                  <Plus className="h-4 w-4 mr-2" />
                  Add First Property
                </Button>
              </div>
            ) : (
              <div className="grid gap-4 md:grid-cols-2">
                {properties.map((property) => (
                  <PropertyCard
                    key={property.id}
                    property={property}
                    onEdit={handleEditProperty}
                    onDelete={handleDelete}
                    onSetPrimary={handleSetPrimary}
                  />
                ))}
              </div>
            )}
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
};
