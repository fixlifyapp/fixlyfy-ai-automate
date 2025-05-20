
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
import { InvoiceForm } from "../forms/InvoiceForm";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Calculator, Info } from "lucide-react";
import { InvoiceProductSelector } from "../invoices/InvoiceProductSelector";
import { Product } from "../builder/types";

interface InvoiceDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onInvoiceCreated: (amount: number) => void;
  clientInfo: {
    name: string;
    address: string;
    phone: string;
    email: string;
  };
  companyInfo: {
    name: string;
    logo: string;
    address: string;
    phone: string;
    email: string;
    legalText: string;
  };
}

export const InvoiceDialog = ({ 
  open, 
  onOpenChange, 
  onInvoiceCreated,
  clientInfo,
  companyInfo
}: InvoiceDialogProps) => {
  const [amount, setAmount] = useState(0);
  const [invoiceItems, setInvoiceItems] = useState<any[]>([]);
  const [description, setDescription] = useState("");
  const [taxRate] = useState(13); // Fixed 13% tax rate

  // Reset state when the dialog opens/closes
  useEffect(() => {
    if (open) {
      setAmount(0);
      setInvoiceItems([]);
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
    const subtotal = invoiceItems.length > 0 
      ? invoiceItems.reduce((sum, item) => sum + (item.unitPrice * item.quantity), 0) 
      : amount;
    return subtotal * (taxRate / 100);
  };

  // Calculate total with tax
  const calculateTotal = () => {
    const subtotal = invoiceItems.length > 0 
      ? invoiceItems.reduce((sum, item) => sum + (item.unitPrice * item.quantity), 0) 
      : amount;
    return subtotal + calculateTax();
  };

  // Function to add product to invoice
  const handleAddProduct = (product: Product) => {
    setInvoiceItems(prev => [...prev, {
      id: `item-${Date.now()}`,
      name: product.name,
      description: product.description || product.name,
      quantity: product.quantity || 1,
      unitPrice: product.price,
      ourPrice: product.ourPrice || product.cost || 0,
      taxable: product.taxable || true
    }]);
  };
  
  // Function to remove product from invoice
  const handleRemoveProduct = (id: string) => {
    setInvoiceItems(prev => prev.filter(item => item.id !== id));
  };

  // Handle updating a product in the invoice
  const handleUpdateProduct = (productId: string, updatedProduct: any) => {
    setInvoiceItems(prev => 
      prev.map(item => item.id === productId ? {
        ...item,
        ...updatedProduct,
        ourPrice: 0 // Ensure ourPrice is 0 for any product added to invoices
      } : item)
    );
  };

  // Function to handle the form submission  
  const handleCreateInvoice = () => {
    // Calculate the total amount including tax
    const totalAmount = calculateTotal();
    
    if (totalAmount <= 0) {
      toast.error("Please enter a valid invoice amount or add products");
      return;
    }
    
    const invoiceData = {
      invoiceNumber: `INV-${Math.floor(10000 + Math.random() * 90000)}`,
      items: invoiceItems.map(item => ({
        description: item.name,
        quantity: item.quantity,
        unitPrice: item.unitPrice,
        taxable: item.taxable
      })),
      notes: description
    };
    
    onInvoiceCreated(totalAmount);
    toast.success(`Invoice created successfully`);
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto p-0">
        <DialogHeader className="p-6 border-b">
          <DialogTitle className="text-xl">Create New Invoice</DialogTitle>
          <DialogDescription>
            Create an invoice by adding products or entering details below.
          </DialogDescription>
        </DialogHeader>
        
        <div className="p-6 space-y-6">
          {/* Main Form Layout - Responsive Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Left column - Core details */}
            <div className="space-y-4">
              <div>
                <Label htmlFor="invoice-name" className="text-sm font-medium">Invoice Name</Label>
                <Input
                  id="invoice-name"
                  placeholder="Service Invoice"
                  className="mt-1"
                />
              </div>
              
              <div>
                <Label htmlFor="invoice-description" className="text-sm font-medium">Description</Label>
                <Textarea
                  id="invoice-description"
                  placeholder="Describe the invoice details..."
                  className="mt-1 min-h-[80px]"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                />
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="invoice-category" className="text-sm font-medium">Category</Label>
                  <select 
                    id="invoice-category"
                    className="w-full mt-1 border border-input bg-background px-3 py-2 rounded-md text-sm"
                  >
                    <option value="repair">Repair</option>
                    <option value="maintenance">Maintenance</option>
                    <option value="installation">Installation</option>
                    <option value="other">Other</option>
                  </select>
                </div>
                <div>
                  <Label htmlFor="invoice-status" className="text-sm font-medium">Status</Label>
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
                <Label htmlFor="invoice-amount" className="flex items-center gap-2 text-sm font-medium">
                  Customer Price ($)
                  <span className="text-xs text-muted-foreground">(before tax)</span>
                </Label>
                <Input
                  id="invoice-amount"
                  type="number"
                  min="0"
                  step="0.01"
                  placeholder="0.00"
                  className="mt-1"
                  value={amount === 0 ? '' : amount}
                  onChange={handleAmountChange}
                />
              </div>
              
              <div className="bg-muted/30 border rounded-md p-4 space-y-3">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Subtotal:</span>
                  <span>
                    ${invoiceItems.length > 0 
                      ? invoiceItems.reduce((sum, item) => sum + (item.unitPrice * item.quantity), 0).toFixed(2) 
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
            
            <InvoiceProductSelector
              selectedProducts={invoiceItems}
              onAddProduct={handleAddProduct}
              onRemoveProduct={handleRemoveProduct}
              onUpdateProduct={handleUpdateProduct}
            />
          </div>
        </div>
        
        <DialogFooter className="p-6 border-t bg-muted/30">
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={handleCreateInvoice}>
            Create Invoice
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
