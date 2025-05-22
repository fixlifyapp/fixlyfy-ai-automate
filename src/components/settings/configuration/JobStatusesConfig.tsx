
import { ConfigItemCard } from "./ConfigItemCard";
import { useJobStatuses } from "@/hooks/useConfigItems";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { FormControl, FormField, FormItem, FormLabel } from "@/components/ui/form";

export function JobStatusesConfig() {
  const {
    items: jobStatuses,
    isLoading,
    addItem,
    updateItem,
    deleteItem,
    canManage
  } = useJobStatuses();

  return (
    <ConfigItemCard
      title="Job Statuses"
      description="Manage job statuses for the job workflow"
      items={jobStatuses.sort((a, b) => (a.sequence || 0) - (b.sequence || 0))}
      isLoading={isLoading}
      canManage={canManage}
      onAdd={addItem}
      onUpdate={updateItem}
      onDelete={deleteItem}
      renderCustomColumns={(status) => (
        <div className="flex flex-col">
          <span className="text-sm">Sequence: {status.sequence || 0}</span>
          {status.is_default && <span className="text-sm text-green-600">Default</span>}
        </div>
      )}
      itemDialogFields={(
        <>
          <FormField
            name="sequence"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Sequence Order</FormLabel>
                <FormControl>
                  <Input 
                    type="number" 
                    {...field} 
                    value={field.value || 0} 
                    onChange={e => field.onChange(parseInt(e.target.value) || 0)}
                  />
                </FormControl>
              </FormItem>
            )}
          />
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
                    Set as default status
                  </FormLabel>
                </div>
              </FormItem>
            )}
          />
        </>
      )}
      initialValues={{ sequence: 1 }}
    />
  );
}
