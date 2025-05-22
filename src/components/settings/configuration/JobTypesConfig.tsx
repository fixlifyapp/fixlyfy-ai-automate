
import { ConfigItemCard } from "./ConfigItemCard";
import { useJobTypes } from "@/hooks/useConfigItems";
import { Checkbox } from "@/components/ui/checkbox";
import { FormControl, FormField, FormItem, FormLabel } from "@/components/ui/form";

export function JobTypesConfig() {
  const {
    items: jobTypes,
    isLoading,
    addItem,
    updateItem,
    deleteItem,
    canManage
  } = useJobTypes();

  return (
    <ConfigItemCard
      title="Job Types"
      description="Manage job types used when creating jobs"
      items={jobTypes}
      isLoading={isLoading}
      canManage={canManage}
      onAdd={addItem}
      onUpdate={updateItem}
      onDelete={deleteItem}
      renderCustomColumns={(type) => (
        <span className="text-sm">
          {type.is_default ? 'Default' : ''}
        </span>
      )}
      itemDialogFields={(
        <FormField
          name="is_default"
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
                  Set as default job type
                </FormLabel>
              </div>
            </FormItem>
          )}
        />
      )}
    />
  );
}
