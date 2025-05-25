
import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { DataTable } from "@/components/ui/data-table";
import { MoreHorizontal, Plus, Pencil, Trash2 } from "lucide-react";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { ConfigItemDialog } from "./ConfigItemDialog";
import { ConfirmDeleteDialog } from "./ConfirmDeleteDialog";
import { toast } from "sonner";

interface ConfigItem {
  id: string;
  name: string;
  [key: string]: any;
}

interface ConfigItemCardProps {
  title: string;
  description: string;
  items: ConfigItem[];
  isLoading: boolean;
  canManage: boolean;
  onAdd: (values: any) => Promise<any>;
  onUpdate: (id: string, values: any) => Promise<any>;
  onDelete: (id: string) => Promise<boolean>;
  refreshItems: () => void;
  renderCustomColumns?: (item: ConfigItem) => React.ReactNode;
  schema?: any;
  itemDialogFields?: React.ComponentType<any> | ((props: { form: any; fieldType?: string }) => React.ReactNode);
  initialValues?: Record<string, any>;
}

export function ConfigItemCard({
  title,
  description,
  items,
  isLoading,
  canManage,
  onAdd,
  onUpdate,
  onDelete,
  refreshItems,
  renderCustomColumns,
  schema,
  itemDialogFields,
  initialValues = {}
}: ConfigItemCardProps) {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<ConfigItem | null>(null);
  const [deletingItem, setDeletingItem] = useState<ConfigItem | null>(null);

  const handleAdd = async (values: any) => {
    try {
      await onAdd(values);
      setIsDialogOpen(false);
      refreshItems();
    } catch (error) {
      console.error("Error adding item:", error);
      toast.error("Failed to add item");
    }
  };

  const handleUpdate = async (values: any) => {
    if (!editingItem) return;
    try {
      await onUpdate(editingItem.id, values);
      setEditingItem(null);
      refreshItems();
    } catch (error) {
      console.error("Error updating item:", error);
      toast.error("Failed to update item");
    }
  };

  const handleDelete = async () => {
    if (!deletingItem) return;
    try {
      const success = await onDelete(deletingItem.id);
      if (success) {
        setDeletingItem(null);
        refreshItems();
      }
    } catch (error) {
      console.error("Error deleting item:", error);
      toast.error("Failed to delete item");
    }
  };

  const columns = [
    {
      accessorKey: "name",
      header: "Name",
    },
    ...(renderCustomColumns ? [
      {
        id: "custom",
        header: "Details",
        cell: ({ row }: any) => renderCustomColumns(row.original),
      }
    ] : []),
    {
      id: "actions",
      cell: ({ row }: any) => {
        const item = row.original;
        return canManage ? (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="h-8 w-8 p-0">
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={() => setEditingItem(item)}>
                <Pencil className="mr-2 h-4 w-4" />
                Edit
              </DropdownMenuItem>
              <DropdownMenuItem 
                onClick={() => setDeletingItem(item)}
                className="text-red-600"
              >
                <Trash2 className="mr-2 h-4 w-4" />
                Delete
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        ) : null;
      },
    },
  ];

  return (
    <>
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>{title}</CardTitle>
              <CardDescription>{description}</CardDescription>
            </div>
            {canManage && (
              <Button onClick={() => setIsDialogOpen(true)}>
                <Plus className="mr-2 h-4 w-4" />
                Add
              </Button>
            )}
          </div>
        </CardHeader>
        <CardContent>
          <DataTable 
            columns={columns} 
            data={items} 
            isLoading={isLoading}
          />
        </CardContent>
      </Card>

      <ConfigItemDialog
        open={isDialogOpen || !!editingItem}
        onOpenChange={(open) => {
          if (!open) {
            setIsDialogOpen(false);
            setEditingItem(null);
          }
        }}
        title={editingItem ? `Edit ${title.slice(0, -1)}` : `Add ${title.slice(0, -1)}`}
        initialValues={editingItem || initialValues}
        onSubmit={editingItem ? handleUpdate : handleAdd}
        schema={schema}
        customFields={itemDialogFields}
      />

      <ConfirmDeleteDialog
        open={!!deletingItem}
        onOpenChange={(open) => !open && setDeletingItem(null)}
        title={`Delete ${deletingItem?.name}`}
        description="Are you sure you want to delete this item? This action cannot be undone."
        onConfirm={handleDelete}
      />
    </>
  );
}
