
import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Edit2, Save, X } from "lucide-react";
import { useJobCustomFields } from "@/hooks/useJobCustomFields";
import { CustomFieldRenderer } from "./CustomFieldRenderer";
import { toast } from "sonner";

interface JobCustomFieldsDisplayProps {
  jobId: string;
}

export const JobCustomFieldsDisplay = ({ jobId }: JobCustomFieldsDisplayProps) => {
  const { customFieldValues, availableFields, updateCustomFieldValue, isLoading } = useJobCustomFields(jobId);
  const [isEditing, setIsEditing] = useState(false);
  const [editValues, setEditValues] = useState<Record<string, string>>({});
  const [isSaving, setIsSaving] = useState(false);

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Additional Information</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-sm text-muted-foreground">Loading custom fields...</div>
        </CardContent>
      </Card>
    );
  }

  const allFieldsWithValues = availableFields.map(field => {
    const existingValue = customFieldValues.find(cv => cv.custom_field_id === field.id);
    return {
      ...field,
      value: existingValue?.value || ''
    };
  });

  const handleEdit = () => {
    const currentValues = allFieldsWithValues.reduce((acc, field) => {
      acc[field.id] = field.value;
      return acc;
    }, {} as Record<string, string>);
    
    setEditValues(currentValues);
    setIsEditing(true);
  };

  const handleSave = async () => {
    setIsSaving(true);
    try {
      const promises = Object.entries(editValues).map(async ([fieldId, value]) => {
        const currentValue = allFieldsWithValues.find(f => f.id === fieldId)?.value || '';
        if (value !== currentValue) {
          return updateCustomFieldValue(jobId, fieldId, value);
        }
        return Promise.resolve(true);
      });

      await Promise.all(promises);
      setIsEditing(false);
      toast.success('Custom fields updated successfully');
    } catch (error) {
      console.error('Error saving custom fields:', error);
      toast.error('Failed to update custom fields');
    } finally {
      setIsSaving(false);
    }
  };

  const handleCancel = () => {
    setIsEditing(false);
    setEditValues({});
  };

  if (allFieldsWithValues.length === 0) {
    return null;
  }

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle>Additional Information</CardTitle>
        <div className="flex items-center gap-2">
          {isEditing ? (
            <>
              <Button
                variant="outline"
                size="sm"
                onClick={handleCancel}
                disabled={isSaving}
              >
                <X className="w-4 h-4 mr-1" />
                Cancel
              </Button>
              <Button
                size="sm"
                onClick={handleSave}
                disabled={isSaving}
              >
                <Save className="w-4 h-4 mr-1" />
                {isSaving ? 'Saving...' : 'Save'}
              </Button>
            </>
          ) : (
            <Button
              variant="outline"
              size="sm"
              onClick={handleEdit}
            >
              <Edit2 className="w-4 h-4 mr-1" />
              Edit
            </Button>
          )}
        </div>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {allFieldsWithValues.map((field) => (
            <div key={field.id}>
              {isEditing ? (
                <CustomFieldRenderer
                  field={field}
                  value={editValues[field.id] || ''}
                  onChange={(value) => 
                    setEditValues(prev => ({
                      ...prev,
                      [field.id]: value
                    }))
                  }
                />
              ) : (
                <div className="space-y-1">
                  <div className="text-sm font-medium text-muted-foreground">
                    {field.name}
                  </div>
                  <div className="text-sm">
                    {field.value || <span className="text-muted-foreground italic">Not set</span>}
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};
