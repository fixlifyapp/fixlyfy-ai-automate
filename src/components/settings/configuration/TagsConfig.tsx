
import { ConfigItemCard } from "./ConfigItemCard";
import { useTags } from "@/hooks/useConfigItems";

export function TagsConfig() {
  const {
    items: tags,
    isLoading,
    addItem,
    updateItem,
    deleteItem,
    canManage
  } = useTags();

  return (
    <ConfigItemCard
      title="Tags"
      description="Manage tags used throughout the application"
      items={tags}
      isLoading={isLoading}
      canManage={canManage}
      onAdd={addItem}
      onUpdate={updateItem}
      onDelete={deleteItem}
      renderCustomColumns={(tag) => (
        <div className="flex items-center gap-2">
          <span className="text-sm text-muted-foreground">
            {tag.category || 'General'}
          </span>
        </div>
      )}
      initialValues={{ category: 'General' }}
    />
  );
}
