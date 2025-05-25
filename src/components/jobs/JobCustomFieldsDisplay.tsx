
import { useJobCustomFields } from "@/hooks/useJobCustomFields";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { CustomFieldRenderer } from "./CustomFieldRenderer";
import { Button } from "@/components/ui/button";
import { useState } from "react";
import { Loader2, Edit2, Save, X } from "lucide-react";
import { toast } from "sonner";

interface JobCustomFieldsDisplayProps {
  jobId: string;
}

export const JobCustomFieldsDisplay = ({ jobId }: JobCustomFieldsDisplayProps) => {
  const { 
    customFieldValues, 
    availableFields, 
    isLoading, 
    saveCustomFieldValues,
    refreshFields 
  } = useJobCustomFields(jobId);
  
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [editValues, setEditValues] = useState<Record<string, string>>({});

  if (isLoading) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center py-8">
          <Loader2 className="h-6 w-6 animate-spin" />
          <span className="ml-2">Loading custom fields...</span>
        </CardContent>
      </Card>
    );
  }

  if (availableFields.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Additional Information</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">No custom fields configured for jobs.</p>
        </CardContent>
      </Card>
    );
  }

  const handleEdit = () => {
    // Initialize edit values with current values
    const currentValues: Record<string, string> = {};
    availableFields.forEach(field => {
      const existingValue = customFieldValues.find(cfv => cfv.custom_field_id === field.id);
      currentValues[field.id] = existingValue?.value || field.default_value || '';
    });
    setEditValues(currentValues);
    setIsEditing(true);
  };

  const handleSave = async () => {
    setIsSaving(true);
    try {
      const success = await saveCustomFieldValues(jobId, editValues);
      if (success) {
        setIsEditing(false);
        refreshFields();
        toast.success("Custom fields updated successfully");
      }
    } catch (error) {
      console.error("Error saving custom fields:", error);
      toast.error("Failed to save custom fields");
    } finally {
      setIsSaving(false);
    }
  };

  const handleCancel = () => {
    setIsEditing(false);
    setEditValues({});
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg">Additional Information</CardTitle>
          {!isEditing ? (
            <Button variant="outline" size="sm" onClick={handleEdit}>
              <Edit2 className="h-4 w-4 mr-2" />
              Edit
            </Button>
          ) : (
            <div className="flex gap-2">
              <Button variant="outline" size="sm" onClick={handleCancel} disabled={isSaving}>
                <X className="h-4 w-4 mr-2" />
                Cancel
              </Button>
              <Button size="sm" onClick={handleSave} disabled={isSaving}>
                {isSaving ? (
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                ) : (
                  <Save className="h-4 w-4 mr-2" />
                )}
                Save
              </Button>
            </div>
          )}
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {availableFields.map((field) => {
          const existingValue = customFieldValues.find(cfv => cfv.custom_field_id === field.id);
          const displayValue = isEditing 
            ? editValues[field.id] || ''
            : existingValue?.value || field.default_value || '';

          if (isEditing) {
            return (
              <CustomFieldRenderer
                key={field.id}
                field={field}
                value={displayValue}
                onChange={(value) => setEditValues(prev => ({ ...prev, [field.id]: value }))}
              />
            );
          }

          // Display mode
          return (
            <div key={field.id} className="space-y-1">
              <div className="text-sm font-medium text-gray-700">
                {field.name}
                {field.required && <span className="text-red-500 ml-1">*</span>}
              </div>
              <div className="text-sm text-gray-900">
                {displayValue || <span className="text-gray-400 italic">Not set</span>}
              </div>
            </div>
          );
        })}
      </CardContent>
    </Card>
  );
};
