
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
import { supabase } from "@/integrations/supabase/client";

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
  editInvoice?: {
    id: string;
    invoice_number: string;
    total: number;
    status: string;
    notes?: string;
  } | null;
}

export const InvoiceDialog = ({ 
  open, 
  onOpenChange, 
  onInvoiceCreated,
  clientInfo,
  companyInfo,
  editInvoice
}: InvoiceDialogProps) => {
  const [amount, setAmount] = useState(0);
  const [invoiceItems, setInvoiceItems] = useState<any[]>([]);
  const [description, setDescription] = useState("");
  const [invoiceName, setInvoiceName] = useState("Service Invoice");
  const [taxRate] = useState(13); // Fixed 13% tax rate
  const [isLoading, setIsLoading] = useState(false);

  // Reset state when the dialog opens/closes
  useEffect(() => {
    if (open) {
      if (editInvoice) {
        setAmount(editInvoice.total);
        setDescription(editInvoice.notes || "");
        // Fetch invoice line items if editing
        fetchInvoiceLineItems(editInvoice.id);
      } else {
        setAmount(0);
        setInvoiceItems([]);
        setDescription("");
        setInvoiceName("Service Invoice");
      }
    }
  }, [open, editInvoice]);

  // Fetch line items if editing an existing invoice
  const fetchInvoiceLineItems = async (invoiceId: string) => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from("line_items")
        .select("*")
        .eq("parent_id", invoiceId)
        .eq("parent_type", "invoice");
        
      if (error) {
        throw error;
      }
      
      if (data) {
        const formattedItems = data.map(item => ({
          id: item.id,
          name: item.description,
          description: item.description,
          quantity: item.quantity || 1,
          unitPrice: item.unit_price,
          taxable: item.taxable
        }));
        
        setInvoiceItems(formattedItems);
      }
    } catch (error) {
      console.error("Error fetching invoice line items:", error);
      toast.error("Failed to load invoice details");
    } finally {
      setIsLoading(false);
    }
  };

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
  const handleSubmitInvoice = async () => {
    setIsLoading(true);
    
    try {
      // Calculate the total amount including tax
      const totalAmount = calculateTotal();
      
      if (totalAmount <= 0) {
        toast.error("Please enter a valid invoice amount or add products");
        return;
      }
      
      let invoiceId = editInvoice?.id;
      let invoiceNumber = editInvoice?.invoice_number;
      
      if (!editInvoice) {
        // Create new invoice
        invoiceNumber = `INV-${Math.floor(10000 + Math.random() * 90000)}`;
        
        const { data: newInvoice, error } = await supabase
          .from("invoices")
          .insert({
            invoice_number: invoiceNumber,
            total: totalAmount,
            balance: totalAmount,
            amount_paid: 0,
            status: "unpaid",
            notes: description,
            job_id: "JOB-2034" // This should come from props in a real implementation
          })
          .select()
          .single();
          
        if (error) {
          throw error;
        }
        
        invoiceId = newInvoice.id;
      } else {
        // Update existing invoice
        const { error } = await supabase
          .from("invoices")
          .update({
            total: totalAmount,
            balance: totalAmount,
            notes: description,
            updated_at: new Date().toISOString()
          })
          .eq("id", invoiceId);
          
        if (error) {
          throw error;
        }
        
        // Delete existing line items so we can replace them
        const { error: deleteError } = await supabase
          .from("line_items")
          .delete()
          .eq("parent_id", invoiceId)
          .eq("parent_type", "invoice");
          
        if (deleteError) {
          throw deleteError;
        }
      }
      
      // Insert line items if we have any
      if (invoiceItems.length > 0) {
        const lineItemsToInsert = invoiceItems.map(item => ({
          parent_id: invoiceId,
          parent_type: "invoice",
          description: item.name,
          quantity: item.quantity,
          unit_price: item.unitPrice,
          taxable: item.taxable
        }));
        
        const { error: lineItemsError } = await supabase
          .from("line_items")
          .insert(lineItemsToInsert);
          
        if (lineItemsError) {
          throw lineItemsError;
        }
      }
      
      onInvoiceCreated(totalAmount);
      toast.success(`Invoice ${editInvoice ? 'updated' : 'created'} successfully`);
      onOpenChange(false);
    } catch (error) {
      console.error("Error saving invoice:", error);
      toast.error(`Failed to ${editInvoice ? 'update' : 'create'} invoice`);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto p-0">
        <DialogHeader className="p-6 border-b">
          <DialogTitle className="text-xl">
            {editInvoice ? 'Edit Invoice' : 'Create New Invoice'}
          </DialogTitle>
          <DialogDescription>
            {editInvoice 
              ? 'Update the invoice details below.'
              : 'Create an invoice by adding products or entering details below.'
            }
          </DialogDescription>
        </DialogHeader>
        
        {isLoading ? (
          <div className="flex justify-center py-16">
            <div className="animate-spin h-8 w-8 border-4 border-fixlyfy border-t-transparent rounded-full"></div>
          </div>
        ) : (
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
                    value={invoiceName}
                    onChange={(e) => setInvoiceName(e.target.value)}
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
                        {editInvoice ? editInvoice.status : 'Draft'}
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
                    value={invoiceItems.length > 0 ? '' : (amount === 0 ? '' : amount)}
                    onChange={handleAmountChange}
                    disabled={invoiceItems.length > 0}
                  />
                  {invoiceItems.length > 0 && (
                    <p className="text-xs text-muted-foreground mt-1">
                      Using line items for pricing
                    </p>
                  )}
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
        )}
        
        <DialogFooter className="p-6 border-t bg-muted/30">
          <Button variant="outline" onClick={() => onOpenChange(false)} disabled={isLoading}>
            Cancel
          </Button>
          <Button onClick={handleSubmitInvoice} disabled={isLoading}>
            {isLoading ? 'Saving...' : (editInvoice ? 'Update Invoice' : 'Create Invoice')}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
