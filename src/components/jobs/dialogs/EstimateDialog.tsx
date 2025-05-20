
import { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { useEstimateCreation } from "../estimates/hooks/useEstimateCreation";
import { EstimateProductSelector } from "../estimates/EstimateProductSelector";
import { WarrantySelectionDialog } from "./WarrantySelectionDialog";
import { useProducts } from "@/hooks/useProducts";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Calculator, Info } from "lucide-react";

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
  const [description, setDescription] = useState("");
  const [taxRate] = useState(13); // Fixed 13% tax rate
  
  // Fix: Pass proper parameters to useEstimateCreation
  const estimateCreation = useEstimateCreation("", [], (estimates) => {});
  const { products } = useProducts("Warranty");
  const warrantyProducts = products.filter(p => p.category === "Warranty");

  // Reset state when the dialog opens/closes
  useEffect(() => {
    if (open) {
      setAmount(0);
      setWarningShown(false);
      setReadyToCreate(false);
      setDescription("");
    }
  }, [open]);

  // Function to handle the amount change
  const handleAmountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = parseFloat(e.target.value);
    setAmount(isNaN(value) ? 0 : value);
  };

  // Calculate tax amount
  const calculateTax = () => {
    const subtotal = estimateCreation.state.estimateItems.length > 0 
      ? estimateCreation.actions.calculateEstimateTotal() 
      : amount;
    return subtotal * (taxRate / 100);
  };

  // Calculate total with tax
  const calculateTotal = () => {
    const subtotal = estimateCreation.state.estimateItems.length > 0 
      ? estimateCreation.actions.calculateEstimateTotal() 
      : amount;
    return subtotal + calculateTax();
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
    // Calculate the total amount including tax
    const totalAmount = calculateTotal();
    
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
      estimateCreation.actions.addProductToEstimate({
        ...selectedWarranty,
        ourPrice: 0, // Ensure ourPrice is 0 for warranties
      });
      toast.success(`${selectedWarranty.name} added to estimate`);
    }
    
    setReadyToCreate(true);
    setIsWarrantyDialogOpen(false);
  };
  
  // Handle updating a product in the estimate
  const handleUpdateProduct = (productId: string, updatedProduct: any) => {
    // Get current products
    const currentProducts = [...estimateCreation.state.estimateItems];
    
    // Find and update the product
    const productIndex = currentProducts.findIndex(p => p.id === productId);
    if (productIndex !== -1) {
      // Ensure ourPrice is set to 0
      currentProducts[productIndex] = {
        ...updatedProduct,
        ourPrice: 0
      };
      
      // Update the state with the modified products array
      estimateCreation.actions.setEstimateItems(currentProducts);
    }
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
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto p-0">
          <DialogHeader className="p-6 border-b">
            <DialogTitle className="text-xl">Create New Estimate</DialogTitle>
            <DialogDescription>
              Create an estimate by adding products or entering details below.
            </DialogDescription>
          </DialogHeader>
          
          <div className="p-6 space-y-6">
            {/* Main Form Layout - Responsive Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Left column - Core details */}
              <div className="space-y-4">
                <div>
                  <Label htmlFor="estimate-name" className="text-sm font-medium">Estimate Name</Label>
                  <Input
                    id="estimate-name"
                    placeholder="Service Estimate"
                    className="mt-1"
                  />
                </div>
                
                <div>
                  <Label htmlFor="estimate-description" className="text-sm font-medium">Description</Label>
                  <Textarea
                    id="estimate-description"
                    placeholder="Describe the estimate details..."
                    className="mt-1 min-h-[80px]"
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                  />
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="estimate-category" className="text-sm font-medium">Category</Label>
                    <select 
                      id="estimate-category"
                      className="w-full mt-1 border border-input bg-background px-3 py-2 rounded-md text-sm"
                    >
                      <option value="repair">Repair</option>
                      <option value="maintenance">Maintenance</option>
                      <option value="installation">Installation</option>
                      <option value="other">Other</option>
                    </select>
                  </div>
                  <div>
                    <Label htmlFor="estimate-status" className="text-sm font-medium">Status</Label>
                    <div className="mt-2">
                      <Badge variant="outline" className="bg-yellow-50 text-yellow-700 border-yellow-200">
                        Draft
                      </Badge>
                    </div>
                  </div>
                </div>
              </div>
              
              {/* Right column - Pricing */}
              <div className="space-y-4">
                <div>
                  <Label htmlFor="estimate-amount" className="flex items-center gap-2 text-sm font-medium">
                    Customer Price ($)
                    <span className="text-xs text-muted-foreground">(before tax)</span>
                  </Label>
                  <Input
                    id="estimate-amount"
                    type="number"
                    min="0"
                    step="0.01"
                    placeholder="0.00"
                    className="mt-1"
                    value={amount === 0 ? '' : amount}
                    onChange={handleAmountChange}
                  />
                </div>
                
                {/* Removed Our Price input field */}
                
                <div className="bg-muted/30 border rounded-md p-4 space-y-3">
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Subtotal:</span>
                    <span>
                      ${estimateCreation.state.estimateItems.length > 0 
                        ? estimateCreation.actions.calculateEstimateTotal().toFixed(2) 
                        : amount.toFixed(2)}
                    </span>
                  </div>
                  
                  <div className="flex justify-between text-sm">
                    <span className="flex items-center gap-1 text-muted-foreground">
                      Tax ({taxRate}%):
                    </span>
                    <span>${calculateTax().toFixed(2)}</span>
                  </div>
                  
                  <div className="flex justify-between font-medium pt-2 border-t border-border">
                    <span>Total:</span>
                    <span>${calculateTotal().toFixed(2)}</span>
                  </div>
                  
                  {/* Removed margin calculation display */}
                </div>
              </div>
            </div>
            
            {/* Taxable checkbox */}
            <div className="flex items-center space-x-2">
              <input
                type="checkbox"
                id="taxable"
                className="rounded border-gray-300"
                checked={true}
                readOnly
              />
              <Label htmlFor="taxable" className="text-sm cursor-pointer">Taxable Item (13% tax will be applied)</Label>
            </div>
            
            {/* Product Selector Section */}
            <div className="pt-4 border-t">
              <h3 className="text-base font-medium mb-3 flex items-center gap-2">
                <Calculator size={18} />
                Product Selection
              </h3>
              
              <EstimateProductSelector
                selectedProducts={estimateCreation.state.estimateItems}
                onAddProduct={(product) => {
                  // Ensure ourPrice is 0 for any product added to estimates
                  estimateCreation.actions.addProductToEstimate({...product, ourPrice: 0});
                }}
                onRemoveProduct={estimateCreation.actions.removeProductFromEstimate}
                onUpdateProduct={handleUpdateProduct}
              />
            </div>
          </div>
          
          <DialogFooter className="p-6 border-t bg-muted/30">
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
