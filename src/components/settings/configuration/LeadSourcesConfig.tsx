
import { ConfigItemCard } from "./ConfigItemCard";
import { useLeadSources } from "@/hooks/useConfigItems";
import { FormControl, FormField, FormItem, FormLabel } from "@/components/ui/form";
import { Checkbox } from "@/components/ui/checkbox";

export function LeadSourcesConfig() {
  const {
    items: leadSources,
    isLoading,
    addItem,
    updateItem,
    deleteItem,
    canManage
  } = useLeadSources();

  return (
    <ConfigItemCard
      title="Lead Sources"
      description="Manage lead sources for tracking where clients come from"
      items={leadSources}
      isLoading={isLoading}
      canManage={canManage}
      onAdd={addItem}
      onUpdate={updateItem}
      onDelete={deleteItem}
      renderCustomColumns={(source) => (
        <div className="flex items-center">
          <span className={`text-sm ${source.is_active ? 'text-green-600' : 'text-red-600'}`}>
            {source.is_active ? 'Active' : 'Inactive'}
          </span>
        </div>
      )}
      itemDialogFields={(
        <FormField
          name="is_active"
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
                  Lead source is active
                </FormLabel>
              </div>
            </FormItem>
          )}
        />
      )}
      initialValues={{ is_active: true }}
    />
  );
}
