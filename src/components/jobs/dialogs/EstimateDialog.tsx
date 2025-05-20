
import { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { useEstimateCreation } from "../estimates/hooks/useEstimateCreation";
import { EstimateProductSelector } from "../estimates/EstimateProductSelector";
import { WarrantySelectionDialog } from "./WarrantySelectionDialog";
import { useProducts } from "@/hooks/useProducts";

interface EstimateDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onEstimateCreated?: (amount: number) => void;
  clientInfo?: any;
  companyInfo?: any;
}

export const EstimateDialog = ({
  open,
  onOpenChange,
  onEstimateCreated,
  clientInfo,
  companyInfo
}: EstimateDialogProps) => {
  const [amount, setAmount] = useState(0);
  const [warningShown, setWarningShown] = useState(false);
  const [isWarrantyDialogOpen, setIsWarrantyDialogOpen] = useState(false);
  const [readyToCreate, setReadyToCreate] = useState(false);
  
  const estimateCreation = useEstimateCreation("", [], []);
  const { products } = useProducts("Warranty");
  const warrantyProducts = products.filter(p => p.category === "Warranty");

  // Reset state when the dialog opens/closes
  useEffect(() => {
    if (open) {
      setAmount(0);
      setWarningShown(false);
      setReadyToCreate(false);
    }
  }, [open]);

  // Function to handle the amount change
  const handleAmountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = parseFloat(e.target.value);
    setAmount(isNaN(value) ? 0 : value);
  };

  // Function to handle the form submission  
  const handleCreateEstimate = () => {
    // Check if we have any warranty products to offer
    if (warrantyProducts.length > 0 && !warningShown) {
      setIsWarrantyDialogOpen(true);
      setWarningShown(true);
    } else {
      proceedWithCreation();
    }
  };

  const proceedWithCreation = () => {
    // Calculate the total amount if using products
    const totalAmount = estimateCreation.actions.calculateEstimateTotal() || amount;
    
    if (totalAmount <= 0) {
      toast.error("Please enter a valid estimate amount or add products");
      return;
    }
    
    if (onEstimateCreated) {
      onEstimateCreated(totalAmount);
      onOpenChange(false);
    }
  };

  const handleWarrantySelection = (selectedWarranty: any, customNote: string) => {
    if (selectedWarranty) {
      // Add the warranty to the estimate
      estimateCreation.actions.addProductToEstimate(selectedWarranty);
      toast.success(`${selectedWarranty.name} added to estimate`);
    }
    
    setReadyToCreate(true);
    setIsWarrantyDialogOpen(false);
  };
  
  // When ready to create after warranty dialog is closed
  useEffect(() => {
    if (readyToCreate && !isWarrantyDialogOpen) {
      proceedWithCreation();
    }
  }, [readyToCreate, isWarrantyDialogOpen]);

  return (
    <>
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Create New Estimate</DialogTitle>
            <DialogDescription>
              Create an estimate by adding products or entering a total amount.
            </DialogDescription>
          </DialogHeader>
          
          {/* Product selection section */}
          <EstimateProductSelector
            selectedProducts={estimateCreation.state.estimateItems}
            onAddProduct={estimateCreation.actions.addProductToEstimate}
            onRemoveProduct={estimateCreation.actions.removeProductFromEstimate}
          />
          
          <div className="flex items-end gap-4">
            <div className="flex-1">
              <Label htmlFor="estimate-amount">Estimate Amount</Label>
              <Input
                id="estimate-amount"
                type="number"
                min="0"
                step="0.01"
                placeholder="0.00"
                className="text-right"
                value={amount === 0 ? '' : amount}
                onChange={handleAmountChange}
              />
            </div>
            <p className="text-sm text-muted-foreground pb-2 italic">
              {estimateCreation.state.estimateItems.length > 0 
                ? "This will be overridden by product total"
                : "Enter the total amount if not using product selection"}
            </p>
          </div>
          
          <DialogFooter>
            <Button variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button onClick={handleCreateEstimate}>
              Create Estimate
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      
      {/* Warranty Recommendation Dialog */}
      <WarrantySelectionDialog
        open={isWarrantyDialogOpen}
        onOpenChange={setIsWarrantyDialogOpen}
        onConfirm={handleWarrantySelection}
      />
    </>
  );
};
