// Import toast from the sonner implementation instead of enhancedToast
import { toast } from "@/components/ui/sonner";
import { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableFooter,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Plus, Copy, Loader2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useRBAC } from "@/components/auth/RBACProvider";
import { DeleteConfirmDialog } from "@/components/jobs/dialogs/DeleteConfirmDialog";

interface JobEstimatesTabProps {
  jobId: string;
}

interface EstimateItem {
  id: string;
  description: string;
  quantity: number;
  unit_price: number;
  total: number;
}

export const JobEstimatesTab = ({ jobId }: JobEstimatesTabProps) => {
  const [estimateItems, setEstimateItems] = useState<EstimateItem[]>([]);
  const [newDescription, setNewDescription] = useState("");
  const [newQuantity, setNewQuantity] = useState(1);
  const [newUnitPrice, setNewUnitPrice] = useState(0);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [itemToDelete, setItemToDelete] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isDeleting, setIsDeleting] = useState(false);
  const { hasPermission } = useRBAC();
  const canEdit = hasPermission("estimates.edit");

  useEffect(() => {
    if (jobId) {
      fetchEstimateItems();
    }
  }, [jobId]);

  const fetchEstimateItems = async () => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from('estimate_items')
        .select('*')
        .eq('job_id', jobId);

      if (error) {
        throw error;
      }

      if (data) {
        setEstimateItems(data);
      }
    } catch (error: any) {
      console.error("Error fetching estimate items:", error.message);
      toast.error("Failed to load estimate items");
    } finally {
      setIsLoading(false);
    }
  };

  const addEstimateItem = async () => {
    if (!newDescription || newQuantity <= 0 || newUnitPrice < 0) {
      toast.error("Please fill in all fields with valid values.");
      return;
    }

    try {
      const total = newQuantity * newUnitPrice;
      const { data, error } = await supabase
        .from('estimate_items')
        .insert([{
          job_id: jobId,
          description: newDescription,
          quantity: newQuantity,
          unit_price: newUnitPrice,
          total: total
        }])
        .select('*')
        .single();

      if (error) {
        throw error;
      }

      if (data) {
        setEstimateItems([...estimateItems, data]);
        setNewDescription("");
        setNewQuantity(1);
        setNewUnitPrice(0);
        setIsDialogOpen(false);
        toast.success("Estimate item added successfully!");
      }
    } catch (error: any) {
      console.error("Error adding estimate item:", error.message);
      toast.error("Failed to add estimate item");
    }
  };

  const deleteEstimateItem = async (id: string) => {
    setItemToDelete(id);
    setIsDeleteDialogOpen(true);
  };

  const confirmDeleteItem = async () => {
    if (!itemToDelete) return;

    setIsDeleting(true);

    try {
      const { error } = await supabase
        .from('estimate_items')
        .delete()
        .eq('id', itemToDelete);

      if (error) {
        throw error;
      }

      setEstimateItems(estimateItems.filter(item => item.id !== itemToDelete));
      setItemToDelete(null);
      setIsDeleteDialogOpen(false);
      toast.success("Estimate item deleted successfully!");
    } catch (error: any) {
      console.error("Error deleting estimate item:", error.message);
      toast.error("Failed to delete estimate item");
    } finally {
      setIsDeleting(false);
    }
  };

  const calculateTotal = () => {
    return estimateItems.reduce((sum, item) => sum + item.total, 0);
  };

  const handleCopyEstimate = () => {
    const estimateText = estimateItems.map(item =>
      `${item.description} - ${item.quantity} x $${item.unit_price} = $${item.total}`
    ).join('\n');

    navigator.clipboard.writeText(estimateText)
      .then(() => {
        toast.success("Estimate copied to clipboard!");
      })
      .catch(err => {
        console.error("Failed to copy estimate:", err);
        toast.error("Failed to copy estimate to clipboard");
      });
  };

  return (
    <Card className="border-fixlyfy-border shadow-sm">
      <CardContent className="p-6">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-medium">Estimate Items</h3>
          <div className="flex gap-2">
            <Button variant="outline" onClick={handleCopyEstimate} className="gap-2">
              <Copy size={16} />
              Copy Estimate
            </Button>
            {canEdit && (
              <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                <DialogTrigger asChild>
                  <Button className="gap-2">
                    <Plus size={16} />
                    Add Item
                  </Button>
                </DialogTrigger>
                <DialogContent className="sm:max-w-[425px]">
                  <DialogHeader>
                    <DialogTitle>Add Estimate Item</DialogTitle>
                    <DialogDescription>
                      Add a new item to the estimate for this job.
                    </DialogDescription>
                  </DialogHeader>
                  <div className="grid gap-4 py-4">
                    <div className="grid grid-cols-4 items-center gap-4">
                      <Label htmlFor="description" className="text-right">
                        Description
                      </Label>
                      <div className="col-span-3">
                        <Input
                          type="text"
                          id="description"
                          value={newDescription}
                          onChange={(e) => setNewDescription(e.target.value)}
                        />
                      </div>
                    </div>
                    <div className="grid grid-cols-4 items-center gap-4">
                      <Label htmlFor="quantity" className="text-right">
                        Quantity
                      </Label>
                      <div className="col-span-3">
                        <Input
                          type="number"
                          id="quantity"
                          value={newQuantity.toString()}
                          onChange={(e) => setNewQuantity(Number(e.target.value))}
                        />
                      </div>
                    </div>
                    <div className="grid grid-cols-4 items-center gap-4">
                      <Label htmlFor="unit_price" className="text-right">
                        Unit Price
                      </Label>
                      <div className="col-span-3">
                        <Input
                          type="number"
                          id="unit_price"
                          value={newUnitPrice.toString()}
                          onChange={(e) => setNewUnitPrice(Number(e.target.value))}
                        />
                      </div>
                    </div>
                  </div>
                  <Button type="submit" onClick={addEstimateItem}>Add Item</Button>
                </DialogContent>
              </Dialog>
            )}
          </div>
        </div>

        {isLoading ? (
          <div className="flex justify-center py-8">
            <Loader2 size={24} className="animate-spin text-fixlyfy" />
          </div>
        ) : (
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-[200px]">Description</TableHead>
                  <TableHead>Quantity</TableHead>
                  <TableHead>Unit Price</TableHead>
                  <TableHead>Total</TableHead>
                  {canEdit && <TableHead className="text-right">Actions</TableHead>}
                </TableRow>
              </TableHeader>
              <TableBody>
                {estimateItems.map((item) => (
                  <TableRow key={item.id}>
                    <TableCell>{item.description}</TableCell>
                    <TableCell>{item.quantity}</TableCell>
                    <TableCell>${item.unit_price.toFixed(2)}</TableCell>
                    <TableCell>${item.total.toFixed(2)}</TableCell>
                    {canEdit && (
                      <TableCell className="text-right">
                        <Button variant="ghost" size="sm" onClick={() => deleteEstimateItem(item.id)}>
                          Delete
                        </Button>
                      </TableCell>
                    )}
                  </TableRow>
                ))}
              </TableBody>
              <TableFooter>
                <TableRow>
                  <TableCell colSpan={3}>Total</TableCell>
                  <TableCell>${calculateTotal().toFixed(2)}</TableCell>
                </TableRow>
              </TableFooter>
            </Table>
          </div>
        )}
      </CardContent>

      <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <DeleteConfirmDialog
          title="Delete Estimate Item"
          description="Are you sure you want to delete this estimate item? This action cannot be undone."
          onOpenChange={setIsDeleteDialogOpen}
          onConfirm={confirmDeleteItem}
          isDeleting={isDeleting}
        />
      </Dialog>
    </Card>
  );
};
