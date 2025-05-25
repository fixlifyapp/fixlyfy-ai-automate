
import { useState } from "react";
import { Loader2, PlusCircle } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ConfigItem } from "@/hooks/useConfigItems";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { ConfigItemDialog } from "./ConfigItemDialog";
import { ConfirmDeleteDialog } from "./ConfirmDeleteDialog";
import { useRealtimeSync } from "@/hooks/useRealtimeSync";
import * as z from "zod";

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
  refreshItems?: () => void;
  schema?: z.ZodSchema;
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
  initialValues,
  refreshItems,
  schema
}: ConfigItemCardProps<T>) {
  const [addDialogOpen, setAddDialogOpen] = useState(false);
  const [editItem, setEditItem] = useState<T | null>(null);
  const [deleteItem, setDeleteItem] = useState<T | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  
  // Set up real-time sync for the table
  useRealtimeSync({
    tables: [title.toLowerCase().replace(/\s+/g, '_')],
    onUpdate: () => {
      if (refreshItems) refreshItems();
    },
    enabled: true
  });

  const handleDelete = async () => {
    if (!deleteItem) return false;
    
    setIsDeleting(true);
    const success = await onDelete(deleteItem.id);
    setIsDeleting(false);
    
    if (success) {
      setDeleteItem(null);
    }
    
    return success;
  };
  
  return (
    <>
      <Card>
        <CardHeader className="flex flex-row items-start justify-between">
          <div>
            <CardTitle className="text-xl">{title}</CardTitle>
            <CardDescription>{description}</CardDescription>
          </div>
          {canManage && (
            <Button 
              onClick={() => setAddDialogOpen(true)}
              variant="outline" 
              className="flex items-center gap-1"
            >
              <PlusCircle className="h-4 w-4" />
              <span>Add</span>
            </Button>
          )}
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex items-center justify-center py-10">
              <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
            </div>
          ) : items.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-10 text-muted-foreground">
              <p>No {title.toLowerCase()} found</p>
              {canManage && (
                <Button 
                  onClick={() => setAddDialogOpen(true)} 
                  variant="ghost" 
                  className="mt-2"
                >
                  Add your first {title.toLowerCase().slice(0, -1)}
                </Button>
              )}
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Description</TableHead>
                  {renderCustomColumns && <TableHead>Details</TableHead>}
                  {canManage && <TableHead className="text-right">Actions</TableHead>}
                </TableRow>
              </TableHeader>
              <TableBody>
                {items.map((item) => (
                  <TableRow key={item.id}>
                    <TableCell className="font-medium">
                      {item.color ? (
                        <div className="flex items-center gap-2">
                          <div className="h-3 w-3 rounded-full" style={{ backgroundColor: item.color }} />
                          <span>{item.name}</span>
                        </div>
                      ) : (
                        <span>{item.name}</span>
                      )}
                    </TableCell>
                    <TableCell>{item.description || <span className="text-muted-foreground text-sm italic">No description</span>}</TableCell>
                    {renderCustomColumns && (
                      <TableCell>
                        {renderCustomColumns(item)}
                      </TableCell>
                    )}
                    {canManage && (
                      <TableCell className="text-right">
                        <div className="flex items-center justify-end gap-2">
                          <Button 
                            variant="ghost" 
                            size="sm"
                            onClick={() => setEditItem(item)}
                          >
                            Edit
                          </Button>
                          <Button 
                            variant="ghost" 
                            size="sm"
                            onClick={() => setDeleteItem(item)}
                            className="text-destructive"
                          >
                            Delete
                          </Button>
                        </div>
                      </TableCell>
                    )}
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
      
      <ConfigItemDialog 
        open={addDialogOpen} 
        onOpenChange={setAddDialogOpen}
        title={`Add ${title.slice(0, -1)}`}
        onSubmit={onAdd}
        customFields={itemDialogFields}
        initialValues={initialValues || {}}
        schema={schema}
      />
      
      <ConfigItemDialog 
        open={!!editItem} 
        onOpenChange={() => setEditItem(null)}
        title={`Edit ${title.slice(0, -1)}`}
        onSubmit={(values) => {
          if (!editItem) return Promise.resolve(null);
          return onUpdate(editItem.id, values);
        }}
        customFields={itemDialogFields}
        initialValues={editItem || {}}
        schema={schema}
      />
      
      <ConfirmDeleteDialog
        open={!!deleteItem}
        onOpenChange={() => setDeleteItem(null)}
        isLoading={isDeleting}
        itemName={deleteItem?.name || ''}
        itemType={title.slice(0, -1).toLowerCase()}
        onConfirm={handleDelete}
      />
    </>
  );
}
