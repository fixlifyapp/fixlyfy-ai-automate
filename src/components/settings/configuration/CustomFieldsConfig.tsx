
import { ConfigItemCard } from "./ConfigItemCard";
import { useCustomFields } from "@/hooks/useConfigItems";
import { Input } from "@/components/ui/input";
import { FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";

export function CustomFieldsConfig() {
  const {
    items: customFields,
    isLoading,
    addItem,
    updateItem,
    deleteItem,
    canManage
  } = useCustomFields();

  return (
    <ConfigItemCard
      title="Custom Fields"
      description="Create custom fields for jobs and other entities"
      items={customFields}
      isLoading={isLoading}
      canManage={canManage}
      onAdd={addItem}
      onUpdate={updateItem}
      onDelete={deleteItem}
      renderCustomColumns={(field) => (
        <div className="flex flex-col gap-1">
          <div className="flex items-center gap-2">
            <Badge variant="outline" className="text-xs">
              {field.field_type}
            </Badge>
            <Badge variant="outline" className="text-xs">
              {field.entity_type}
            </Badge>
          </div>
          {field.required && (
            <span className="text-xs text-red-600">Required</span>
          )}
        </div>
      )}
      itemDialogFields={(
        <>
          <FormField
            name="field_type"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Field Type</FormLabel>
                <Select 
                  onValueChange={field.onChange} 
                  defaultValue={field.value || "text"}
                >
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Select field type" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value="text">Text</SelectItem>
                    <SelectItem value="number">Number</SelectItem>
                    <SelectItem value="date">Date</SelectItem>
                    <SelectItem value="select">Select (Dropdown)</SelectItem>
                    <SelectItem value="checkbox">Checkbox</SelectItem>
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            name="entity_type"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Apply To</FormLabel>
                <Select 
                  onValueChange={field.onChange} 
                  defaultValue={field.value || "job"}
                >
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Select entity type" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value="job">Job</SelectItem>
                    <SelectItem value="client">Client</SelectItem>
                    <SelectItem value="invoice">Invoice</SelectItem>
                    <SelectItem value="estimate">Estimate</SelectItem>
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            name="placeholder"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Placeholder Text</FormLabel>
                <FormControl>
                  <Input {...field} placeholder="Enter placeholder text" />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            name="default_value"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Default Value</FormLabel>
                <FormControl>
                  <Input {...field} placeholder="Enter default value" />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            name="required"
            render={({ field }) => (
              <FormItem className="flex flex-row items-start space-x-3 space-y-0 pt-2">
                <FormControl>
                  <Checkbox
                    checked={field.value}
                    onCheckedChange={field.onChange}
                  />
                </FormControl>
                <div className="space-y-1 leading-none">
                  <FormLabel>
                    Field is required
                  </FormLabel>
                </div>
              </FormItem>
            )}
          />
        </>
      )}
      initialValues={{ field_type: "text", entity_type: "job", required: false }}
    />
  );
}
