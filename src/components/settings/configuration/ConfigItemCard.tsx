
import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { DataTable } from "@/components/ui/data-table";
import { ColumnDef } from "@tanstack/react-table";
import { MoreHorizontal, Plus, Pencil, Trash2 } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { ConfigItemDialog } from "./ConfigItemDialog";
import { ConfirmDeleteDialog } from "./ConfirmDeleteDialog";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import * as z from "zod";

interface ConfigItemCardProps<T = any> {
  title: string;
  description: string;
  items: T[];
  isLoading: boolean;
  canManage: boolean;
  onAdd: (item: any) => Promise<any>;
  onUpdate: (id: string, item: any) => Promise<any>;
  onDelete: (id: string) => Promise<boolean>;
  refreshItems: () => void;
  renderCustomColumns?: (item: T) => React.ReactNode;
  schema?: z.ZodSchema;
  itemDialogFields?: (props: { form: any; fieldType?: string }) => React.ReactNode;
  initialValues?: any;
}

export function ConfigItemCard<T extends { id: string; name: string; created_at?: string }>({
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
}: ConfigItemCardProps<T>) {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<T | null>(null);
  const [deletingItem, setDeletingItem] = useState<T | null>(null);

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

  const columns: ColumnDef<T>[] = [
    {
      accessorKey: "name",
      header: "Name",
    },
    ...(renderCustomColumns ? [{
      id: "custom",
      header: "Details",
      cell: ({ row }: { row: { original: T } }) => renderCustomColumns(row.original),
    }] : []),
    {
      id: "actions",
      cell: ({ row }: { row: { original: T } }) => {
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
                Add {title.slice(0, -1)}
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
          setIsDialogOpen(open);
          if (!open) setEditingItem(null);
        }}
        title={editingItem ? `Edit ${title.slice(0, -1)}` : `Add ${title.slice(0, -1)}`}
        onSubmit={editingItem ? handleUpdate : handleAdd}
        initialValues={editingItem || initialValues}
        customFields={itemDialogFields}
        schema={schema}
      />

      <ConfirmDeleteDialog
        open={!!deletingItem}
        onOpenChange={(open) => !open && setDeletingItem(null)}
        onConfirm={handleDelete}
        title={`Delete ${deletingItem?.name}`}
        description={`Are you sure you want to delete "${deletingItem?.name}"? This action cannot be undone.`}
      />
    </>
  );
}
