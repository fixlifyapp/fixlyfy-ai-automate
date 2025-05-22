
import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ConfigItem } from "@/hooks/useConfigItems";
import { Plus, Edit, Trash2 } from "lucide-react";
import { ConfigItemDialog } from "./ConfigItemDialog";
import { ConfirmDeleteDialog } from "./ConfirmDeleteDialog";

interface ConfigItemCardProps<T extends ConfigItem> {
  title: string;
  description: string;
  items: T[];
  isLoading: boolean;
  canManage: boolean;
  onAdd: (item: Omit<T, 'id' | 'created_at'>) => Promise<T | null>;
  onUpdate: (id: string, item: Partial<T>) => Promise<T | null>;
  onDelete: (id: string) => Promise<boolean>;
  renderCustomColumns?: (item: T) => React.ReactNode;
  itemDialogFields?: React.ReactNode;
  initialValues?: Partial<T>;
}

export function ConfigItemCard<T extends ConfigItem>({
  title,
  description,
  items,
  isLoading,
  canManage,
  onAdd,
  onUpdate,
  onDelete,
  renderCustomColumns,
  itemDialogFields,
  initialValues = {}
}: ConfigItemCardProps<T>) {
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [currentItem, setCurrentItem] = useState<T | null>(null);

  const handleEdit = (item: T) => {
    setCurrentItem(item);
    setIsEditDialogOpen(true);
  };

  const handleDelete = (item: T) => {
    setCurrentItem(item);
    setIsDeleteDialogOpen(true);
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <div className="flex justify-between items-center">
          <div>
            <CardTitle>{title}</CardTitle>
            <CardDescription>{description}</CardDescription>
          </div>
          {canManage && (
            <Button 
              onClick={() => setIsAddDialogOpen(true)} 
              size="sm"
              className="flex items-center gap-1"
            >
              <Plus className="h-4 w-4" />
              <span>Add</span>
            </Button>
          )}
        </div>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="text-center py-4">Loading...</div>
        ) : items.length === 0 ? (
          <div className="text-center py-4 text-muted-foreground">
            No {title.toLowerCase()} found. Click "Add" to create one.
          </div>
        ) : (
          <div className="border rounded-md">
            <table className="w-full">
              <thead>
                <tr className="border-b bg-muted/50">
                  <th className="text-left p-2 font-medium">Name</th>
                  {renderCustomColumns && <th className="text-left p-2 font-medium">Details</th>}
                  {canManage && <th className="text-right p-2 font-medium">Actions</th>}
                </tr>
              </thead>
              <tbody>
                {items.map((item) => (
                  <tr key={item.id} className="border-b last:border-0">
                    <td className="p-2">
                      <div className="flex items-center gap-2">
                        {item.color && (
                          <div
                            className="h-3 w-3 rounded-full"
                            style={{ backgroundColor: item.color }}
                          />
                        )}
                        <span>{item.name}</span>
                      </div>
                      {item.description && (
                        <p className="text-sm text-muted-foreground">
                          {item.description}
                        </p>
                      )}
                    </td>
                    {renderCustomColumns && (
                      <td className="p-2">{renderCustomColumns(item)}</td>
                    )}
                    {canManage && (
                      <td className="p-2 text-right">
                        <div className="flex justify-end gap-2">
                          <Button
                            variant="outline"
                            size="icon"
                            onClick={() => handleEdit(item)}
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="outline"
                            size="icon"
                            className="text-red-600 hover:text-red-600"
                            onClick={() => handleDelete(item)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </td>
                    )}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </CardContent>

      {/* Add Dialog */}
      <ConfigItemDialog
        open={isAddDialogOpen}
        onOpenChange={setIsAddDialogOpen}
        title={`Add ${title.replace(/s$/, '')}`}
        onSubmit={onAdd}
        initialValues={initialValues}
      >
        {itemDialogFields}
      </ConfigItemDialog>

      {/* Edit Dialog */}
      {currentItem && (
        <ConfigItemDialog
          open={isEditDialogOpen}
          onOpenChange={setIsEditDialogOpen}
          title={`Edit ${title.replace(/s$/, '')}`}
          onSubmit={(values) => onUpdate(currentItem.id, values)}
          initialValues={currentItem}
        >
          {itemDialogFields}
        </ConfigItemDialog>
      )}

      {/* Delete Dialog */}
      {currentItem && (
        <ConfirmDeleteDialog
          open={isDeleteDialogOpen}
          onOpenChange={setIsDeleteDialogOpen}
          title={`Delete ${title.replace(/s$/, '')}`}
          description={`Are you sure you want to delete the ${title.toLowerCase().replace(/s$/, '')} "${currentItem.name}"? This action cannot be undone.`}
          onConfirm={() => onDelete(currentItem.id)}
        />
      )}
    </Card>
  );
}
