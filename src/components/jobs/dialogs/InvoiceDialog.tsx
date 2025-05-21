
import { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "@/components/ui/sonner";
import { Calculator, Plus } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { Sheet, SheetContent } from "@/components/ui/sheet";

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
  const [activeTab, setActiveTab] = useState<"form" | "preview">("form");
  const [invoiceNumber, setInvoiceNumber] = useState("");

  // Reset state when the dialog opens/closes
  useEffect(() => {
    if (open) {
      if (editInvoice) {
        setAmount(editInvoice.total);
        setDescription(editInvoice.notes || "");
        setInvoiceNumber(editInvoice.invoice_number);
        // Fetch invoice line items if editing
        fetchInvoiceLineItems(editInvoice.id);
      } else {
        // Generate random invoice number for new invoices
        setInvoiceNumber(`INV-${Math.floor(900000 + Math.random() * 100000)}`);
        setAmount(0);
        setInvoiceItems([]);
        setDescription("");
        setInvoiceName("Service Invoice");
        setActiveTab("form");
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
          description: item.description,
          quantity: item.quantity || 1,
          price: item.unit_price,
          discount: 0
        }));
        
        setInvoiceItems(formattedItems);
      }
    } catch (error) {
      console.error("Error fetching invoice line items:", error);
    } finally {
      setIsLoading(false);
    }
  };

  // Calculate total 
  const calculateSubtotal = () => {
    if (invoiceItems.length > 0) {
      return invoiceItems.reduce((total, item) => {
        const price = parseFloat(item.price || 0);
        const quantity = parseInt(item.quantity || 1);
        const discount = parseFloat(item.discount || 0);
        const lineTotal = (price * quantity) - discount;
        return total + lineTotal;
      }, 0);
    }
    return amount;
  };

  // Calculate tax
  const calculateTax = () => {
    const subtotal = calculateSubtotal();
    return (subtotal * taxRate) / 100;
  };

  // Calculate total with tax
  const calculateTotal = () => {
    return calculateSubtotal() + calculateTax();
  };

  // Add a new empty line item
  const addLineItem = () => {
    setInvoiceItems([...invoiceItems, {
      description: "",
      quantity: 1,
      price: 0,
      discount: 0
    }]);
  };

  // Update a line item
  const updateLineItem = (index: number, field: string, value: any) => {
    const updatedItems = [...invoiceItems];
    updatedItems[index] = {
      ...updatedItems[index],
      [field]: value
    };
    setInvoiceItems(updatedItems);
  };

  // Remove a line item
  const removeLineItem = (index: number) => {
    const updatedItems = [...invoiceItems];
    updatedItems.splice(index, 1);
    setInvoiceItems(updatedItems);
  };

  // Handle submit invoice
  const handleSubmit = async () => {
    setIsLoading(true);
    try {
      const total = calculateTotal();
      
      let invoiceId = editInvoice?.id;
      
      if (!editInvoice) {
        // Create new invoice
        const { data: newInvoice, error } = await supabase
          .from("invoices")
          .insert({
            invoice_number: invoiceNumber,
            total: total,
            balance: total,
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
            total: total,
            balance: total,
            notes: description,
            updated_at: new Date().toISOString()
          })
          .eq("id", invoiceId);
          
        if (error) {
          throw error;
        }
        
        // Delete existing line items to replace them
        await supabase
          .from("line_items")
          .delete()
          .eq("parent_id", invoiceId)
          .eq("parent_type", "invoice");
      }
      
      // Insert line items
      if (invoiceItems.length > 0 && invoiceId) {
        const lineItemsToInsert = invoiceItems.map(item => ({
          parent_id: invoiceId,
          parent_type: "invoice",
          description: item.description,
          quantity: item.quantity,
          unit_price: item.price,
          taxable: true
        }));
        
        await supabase
          .from("line_items")
          .insert(lineItemsToInsert);
      }
      
      onInvoiceCreated(total);
      onOpenChange(false);
    } catch (error) {
      console.error("Error saving invoice:", error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl p-0 overflow-hidden">
        <div className="flex h-[90vh]">
          {/* Sidebar */}
          <div className="w-16 bg-gray-50 border-r flex flex-col items-center py-6">
            <div 
              className={`cursor-pointer p-3 rounded-lg mb-4 ${activeTab === "form" ? "bg-primary/10" : ""}`}
              onClick={() => setActiveTab("form")}
            >
              <Calculator className={`h-6 w-6 ${activeTab === "form" ? "text-primary" : "text-gray-500"}`} />
              <span className="text-xs mt-1 block text-center">Form</span>
            </div>
            <div 
              className={`cursor-pointer p-3 rounded-lg ${activeTab === "preview" ? "bg-primary/10" : ""}`}
              onClick={() => setActiveTab("preview")}
            >
              <svg 
                xmlns="http://www.w3.org/2000/svg" 
                width="24" 
                height="24" 
                viewBox="0 0 24 24" 
                fill="none" 
                stroke="currentColor" 
                strokeWidth="2" 
                strokeLinecap="round" 
                strokeLinejoin="round" 
                className={`h-6 w-6 ${activeTab === "preview" ? "text-primary" : "text-gray-500"}`}
              >
                <path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z" />
                <polyline points="14 2 14 8 20 8" />
              </svg>
              <span className="text-xs mt-1 block text-center">Preview</span>
            </div>
          </div>
          
          {/* Main content */}
          <div className="flex-1 overflow-y-auto">
            {activeTab === "form" ? (
              <div className="p-6">
                <div className="mb-6 border-b pb-4">
                  <h2 className="text-2xl font-semibold">Invoice #{invoiceNumber}</h2>
                  <p className="text-gray-500">Add items to your invoice below</p>
                </div>
                
                <div className="mb-6">
                  {/* Invoice items table */}
                  <div className="w-full">
                    <div className="grid grid-cols-12 gap-4 mb-2 font-medium border-b pb-2">
                      <div className="col-span-5">Description</div>
                      <div className="col-span-2 text-center">Qty</div>
                      <div className="col-span-2 text-center">Customer Price ($)</div>
                      <div className="col-span-2 text-center">Discount</div>
                      <div className="col-span-1 text-center">Total</div>
                    </div>
                    
                    {invoiceItems.length === 0 ? (
                      <div className="text-center py-8 text-gray-500">
                        No items added yet. Add items from the catalog or create a custom line item.
                      </div>
                    ) : (
                      invoiceItems.map((item, index) => (
                        <div key={index} className="grid grid-cols-12 gap-4 mb-3 items-center">
                          <div className="col-span-5">
                            <Input
                              value={item.description}
                              onChange={(e) => updateLineItem(index, 'description', e.target.value)}
                              placeholder="Enter item description"
                            />
                          </div>
                          <div className="col-span-2">
                            <Input
                              type="number"
                              min="1"
                              value={item.quantity}
                              onChange={(e) => updateLineItem(index, 'quantity', parseInt(e.target.value))}
                              className="text-center"
                            />
                          </div>
                          <div className="col-span-2">
                            <Input
                              type="number"
                              min="0"
                              step="0.01"
                              value={item.price}
                              onChange={(e) => updateLineItem(index, 'price', parseFloat(e.target.value))}
                              className="text-center"
                            />
                          </div>
                          <div className="col-span-2">
                            <Input
                              type="number"
                              min="0"
                              step="0.01"
                              value={item.discount}
                              onChange={(e) => updateLineItem(index, 'discount', parseFloat(e.target.value))}
                              className="text-center"
                            />
                          </div>
                          <div className="col-span-1 text-right">
                            ${((item.price * item.quantity) - (item.discount || 0)).toFixed(2)}
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                  
                  <div className="mt-4">
                    <Button onClick={addLineItem} variant="outline" size="sm" className="flex items-center gap-1">
                      <Plus size={16} />
                      Add Product
                    </Button>
                    <Button onClick={() => {}} variant="outline" size="sm" className="ml-2">
                      Custom Line
                    </Button>
                  </div>
                </div>
                
                <div className="border-t pt-4">
                  <div className="flex justify-end">
                    <div className="w-64">
                      <div className="flex justify-between mb-2">
                        <span>Subtotal:</span>
                        <span>${calculateSubtotal().toFixed(2)}</span>
                      </div>
                      <div className="flex justify-between mb-2">
                        <span>Tax ({taxRate}%):</span>
                        <span>${calculateTax().toFixed(2)}</span>
                      </div>
                      <div className="flex justify-between font-semibold text-lg border-t pt-2">
                        <span>Total:</span>
                        <span>${calculateTotal().toFixed(2)}</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              <div className="p-6">
                <div className="border rounded-lg p-6">
                  <div className="flex justify-between mb-6">
                    <div>
                      <h2 className="text-2xl font-bold">INVOICE</h2>
                      <p>#{invoiceNumber}</p>
                    </div>
                    <div className="text-right">
                      <h3 className="font-bold">{companyInfo.name}</h3>
                      <p className="text-sm">{companyInfo.address}</p>
                      <p className="text-sm">{companyInfo.phone}</p>
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-6 mb-6">
                    <div>
                      <h4 className="font-medium mb-1">Bill To:</h4>
                      <p>{clientInfo.name}</p>
                      <p className="text-sm">{clientInfo.address}</p>
                      <p className="text-sm">{clientInfo.phone}</p>
                    </div>
                    <div className="text-right">
                      <p className="mb-1"><span className="font-medium">Date:</span> {new Date().toLocaleDateString()}</p>
                      <p><span className="font-medium">Due Date:</span> {new Date(Date.now() + 30*24*60*60*1000).toLocaleDateString()}</p>
                    </div>
                  </div>
                  
                  <table className="w-full mb-6">
                    <thead>
                      <tr className="border-b">
                        <th className="text-left py-2">Description</th>
                        <th className="text-center py-2">Qty</th>
                        <th className="text-right py-2">Price</th>
                        <th className="text-right py-2">Discount</th>
                        <th className="text-right py-2">Amount</th>
                      </tr>
                    </thead>
                    <tbody>
                      {invoiceItems.length === 0 ? (
                        <tr>
                          <td colSpan={5} className="text-center py-4 text-gray-500">No items added yet</td>
                        </tr>
                      ) : (
                        invoiceItems.map((item, index) => (
                          <tr key={index} className="border-b">
                            <td className="py-2">{item.description || "Unnamed item"}</td>
                            <td className="text-center py-2">{item.quantity}</td>
                            <td className="text-right py-2">${parseFloat(item.price).toFixed(2)}</td>
                            <td className="text-right py-2">${parseFloat(item.discount || 0).toFixed(2)}</td>
                            <td className="text-right py-2">${((item.price * item.quantity) - (item.discount || 0)).toFixed(2)}</td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                  
                  <div className="flex justify-end">
                    <div className="w-64">
                      <div className="flex justify-between mb-1">
                        <span>Subtotal:</span>
                        <span>${calculateSubtotal().toFixed(2)}</span>
                      </div>
                      <div className="flex justify-between mb-1">
                        <span>Tax ({taxRate}%):</span>
                        <span>${calculateTax().toFixed(2)}</span>
                      </div>
                      <div className="flex justify-between font-bold text-lg pt-2 border-t">
                        <span>Total:</span>
                        <span>${calculateTotal().toFixed(2)}</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}
            
            <div className="p-4 border-t flex justify-end">
              <Button variant="outline" onClick={() => onOpenChange(false)} className="mr-2">
                Cancel
              </Button>
              <Button onClick={handleSubmit} className="bg-purple-600 hover:bg-purple-700">
                Send to Client
              </Button>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
