
import { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Send, Save, FileText, PlusCircle, Trash } from "lucide-react";
import { ProductCatalog } from "@/components/jobs/builder/ProductCatalog";
import { LineItem, Product } from "@/components/jobs/builder/types";

interface InvoiceBuilderDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  invoiceId: string | null;
  jobId: string;
}

export const InvoiceBuilderDialog = ({
  open,
  onOpenChange,
  invoiceId,
  jobId
}: InvoiceBuilderDialogProps) => {
  const [activeTab, setActiveTab] = useState("editor");
  const [invoiceNumber, setInvoiceNumber] = useState("");
  const [lineItems, setLineItems] = useState<LineItem[]>([]);
  const [notes, setNotes] = useState("");

  // Mock data for selected invoice
  useEffect(() => {
    if (invoiceId) {
      // In a real app, this would fetch the invoice data from an API
      setInvoiceNumber(`INV-${Math.floor(10000 + Math.random() * 90000)}`);
      setLineItems([
        {
          id: "line-1",
          description: "HVAC Repair Service",
          quantity: 1,
          unitPrice: 220,
          discount: 0,
          tax: 10,
          total: 220
        },
        {
          id: "line-2",
          description: "Defrost System Replacement",
          quantity: 1,
          unitPrice: 149,
          discount: 0,
          tax: 10,
          total: 149
        },
        {
          id: "line-3",
          description: "6-Month Extended Warranty",
          quantity: 1,
          unitPrice: 49,
          discount: 0,
          tax: 10,
          total: 49
        }
      ]);
      setNotes("Service completed on weekend as requested. All parts and labor covered under 30-day warranty.");
    } else {
      // New invoice
      setInvoiceNumber(`INV-${Math.floor(10000 + Math.random() * 90000)}`);
      setLineItems([]);
      setNotes("");
    }
  }, [invoiceId, open]);

  const handleAddProduct = (product: Product) => {
    const newLineItem: LineItem = {
      id: `line-${Date.now()}`,
      description: product.name,
      quantity: 1,
      unitPrice: product.price,
      discount: 0,
      tax: 10, // Default tax rate
      total: product.price
    };
    
    setLineItems([...lineItems, newLineItem]);
  };

  const handleRemoveLineItem = (lineItemId: string) => {
    setLineItems(lineItems.filter(item => item.id !== lineItemId));
  };

  const handleUpdateLineItem = (lineItemId: string, field: keyof LineItem, value: any) => {
    setLineItems(lineItems.map(item => {
      if (item.id === lineItemId) {
        const updatedItem = { ...item, [field]: value };
        // Recalculate total
        updatedItem.total = calculateLineTotal(updatedItem);
        return updatedItem;
      }
      return item;
    }));
  };

  const calculateLineTotal = (item: LineItem): number => {
    const subtotal = item.quantity * item.unitPrice;
    const discountAmount = subtotal * (item.discount / 100);
    const afterDiscount = subtotal - discountAmount;
    const taxAmount = afterDiscount * (item.tax / 100);
    return afterDiscount + taxAmount;
  };

  const calculateSubtotal = (): number => {
    return lineItems.reduce((total, item) => {
      const subtotal = item.quantity * item.unitPrice;
      const discountAmount = subtotal * (item.discount / 100);
      return total + (subtotal - discountAmount);
    }, 0);
  };

  const calculateTotalTax = (): number => {
    return lineItems.reduce((total, item) => {
      const subtotal = item.quantity * item.unitPrice;
      const discountAmount = subtotal * (item.discount / 100);
      const afterDiscount = subtotal - discountAmount;
      const taxAmount = afterDiscount * (item.tax / 100);
      return total + taxAmount;
    }, 0);
  };

  const calculateGrandTotal = (): number => {
    return calculateSubtotal() + calculateTotalTax();
  };

  const handleSaveDraft = () => {
    // In a real app, this would save the invoice to an API
    onOpenChange(false);
  };

  const handleSendInvoice = () => {
    // In a real app, this would send the invoice to the customer
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{invoiceId ? "Edit Invoice" : "Create Invoice"}</DialogTitle>
        </DialogHeader>
          
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full mt-4">
          <TabsList className="grid w-full grid-cols-2 mb-4">
            <TabsTrigger value="editor">Editor</TabsTrigger>
            <TabsTrigger value="preview">Preview</TabsTrigger>
          </TabsList>
          
          <TabsContent value="editor" className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="md:col-span-2">
                <div className="flex items-center mb-4 space-x-4">
                  <div className="space-y-2">
                    <Label htmlFor="invoice-number">Invoice #</Label>
                    <Input
                      id="invoice-number"
                      value={invoiceNumber}
                      onChange={(e) => setInvoiceNumber(e.target.value)}
                      className="w-40"
                    />
                  </div>
                  
                  <div className="ml-auto">
                    <Badge variant="outline" className="bg-fixlyfy-warning/10 text-fixlyfy-warning border-fixlyfy-warning/20">
                      Draft
                    </Badge>
                  </div>
                </div>
                
                <div className="border rounded-md overflow-hidden">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Description</TableHead>
                        <TableHead className="w-[100px]">Qty</TableHead>
                        <TableHead className="w-[120px]">Unit Price</TableHead>
                        <TableHead className="w-[100px]">Discount %</TableHead>
                        <TableHead className="w-[80px]">Tax %</TableHead>
                        <TableHead className="w-[120px] text-right">Total</TableHead>
                        <TableHead className="w-[50px]"></TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {lineItems.map((item) => (
                        <TableRow key={item.id}>
                          <TableCell>
                            <Input
                              value={item.description}
                              onChange={(e) => handleUpdateLineItem(item.id, "description", e.target.value)}
                            />
                          </TableCell>
                          <TableCell>
                            <Input
                              type="number"
                              value={item.quantity}
                              min={1}
                              onChange={(e) => handleUpdateLineItem(item.id, "quantity", parseInt(e.target.value) || 1)}
                            />
                          </TableCell>
                          <TableCell>
                            <Input
                              type="number"
                              value={item.unitPrice}
                              min={0}
                              step={0.01}
                              onChange={(e) => handleUpdateLineItem(item.id, "unitPrice", parseFloat(e.target.value) || 0)}
                              className="text-right"
                            />
                          </TableCell>
                          <TableCell>
                            <Input
                              type="number"
                              value={item.discount}
                              min={0}
                              max={100}
                              onChange={(e) => handleUpdateLineItem(item.id, "discount", parseFloat(e.target.value) || 0)}
                              className="text-right"
                            />
                          </TableCell>
                          <TableCell>
                            <Input
                              type="number"
                              value={item.tax}
                              min={0}
                              max={100}
                              onChange={(e) => handleUpdateLineItem(item.id, "tax", parseFloat(e.target.value) || 0)}
                              className="text-right"
                            />
                          </TableCell>
                          <TableCell className="text-right font-medium">
                            ${item.total.toFixed(2)}
                          </TableCell>
                          <TableCell>
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => handleRemoveLineItem(item.id)}
                            >
                              <Trash size={16} className="text-destructive" />
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))}
                      {lineItems.length === 0 && (
                        <TableRow>
                          <TableCell colSpan={7} className="text-center py-4 text-muted-foreground">
                            No items added yet. Add items from the catalog or manually.
                          </TableCell>
                        </TableRow>
                      )}
                    </TableBody>
                  </Table>
                </div>
                
                <div className="mt-4">
                  <Button variant="outline" size="sm" className="gap-2">
                    <PlusCircle size={16} />
                    Add Line Item
                  </Button>
                </div>
                
                <div className="mt-6 space-y-2">
                  <Label htmlFor="notes">Notes & Terms</Label>
                  <textarea
                    id="notes"
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    className="w-full min-h-[100px] p-2 border rounded-md"
                    placeholder="Add notes or terms and conditions..."
                  />
                </div>
              </div>
              
              <div className="md:col-span-1">
                <div className="sticky top-0">
                  <div className="border rounded-md p-4 mb-4 bg-muted/30">
                    <h4 className="font-medium mb-4">Summary</h4>
                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <span>Subtotal:</span>
                        <span>${calculateSubtotal().toFixed(2)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Tax:</span>
                        <span>${calculateTotalTax().toFixed(2)}</span>
                      </div>
                      <div className="border-t pt-2 mt-2 flex justify-between font-medium">
                        <span>Grand Total:</span>
                        <span>${calculateGrandTotal().toFixed(2)}</span>
                      </div>
                    </div>
                  </div>
                  
                  <ProductCatalog onAddProduct={handleAddProduct} />
                </div>
              </div>
            </div>
          </TabsContent>
          
          <TabsContent value="preview">
            <div className="border rounded-md p-6 bg-white">
              <div className="flex justify-between items-start mb-8">
                <div>
                  <h2 className="text-2xl font-bold mb-1">INVOICE</h2>
                  <p className="text-lg font-medium">{invoiceNumber}</p>
                </div>
                <div className="text-right">
                  <img src="/placeholder.svg" alt="Company Logo" className="h-12 mb-2" />
                  <p className="font-medium">Fixlyfy Services</p>
                  <p className="text-sm text-muted-foreground">456 Business Ave, Suite 789</p>
                  <p className="text-sm text-muted-foreground">(555) 987-6543</p>
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-8 mb-8">
                <div>
                  <h3 className="text-sm font-medium uppercase text-muted-foreground mb-2">Bill To:</h3>
                  <p className="font-medium">Michael Johnson</p>
                  <p className="text-sm text-muted-foreground">123 Main St, Apt 45</p>
                  <p className="text-sm text-muted-foreground">(555) 123-4567</p>
                  <p className="text-sm text-muted-foreground">michael.johnson@example.com</p>
                </div>
                <div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <h3 className="text-sm font-medium uppercase text-muted-foreground mb-2">Invoice Date:</h3>
                      <p>{new Date().toLocaleDateString()}</p>
                    </div>
                    <div>
                      <h3 className="text-sm font-medium uppercase text-muted-foreground mb-2">Due Date:</h3>
                      <p>{new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toLocaleDateString()}</p>
                    </div>
                  </div>
                </div>
              </div>
              
              <table className="w-full mb-8">
                <thead className="border-b">
                  <tr>
                    <th className="text-left py-2">Description</th>
                    <th className="text-right py-2">Qty</th>
                    <th className="text-right py-2">Unit Price</th>
                    <th className="text-right py-2">Discount</th>
                    <th className="text-right py-2">Amount</th>
                  </tr>
                </thead>
                <tbody>
                  {lineItems.map((item) => (
                    <tr key={item.id} className="border-b">
                      <td className="py-2">{item.description}</td>
                      <td className="text-right py-2">{item.quantity}</td>
                      <td className="text-right py-2">${item.unitPrice.toFixed(2)}</td>
                      <td className="text-right py-2">{item.discount > 0 ? `${item.discount}%` : '-'}</td>
                      <td className="text-right py-2">${item.total.toFixed(2)}</td>
                    </tr>
                  ))}
                </tbody>
                <tfoot>
                  <tr>
                    <td colSpan={3}></td>
                    <td className="text-right py-2 font-medium">Subtotal:</td>
                    <td className="text-right py-2">${calculateSubtotal().toFixed(2)}</td>
                  </tr>
                  <tr>
                    <td colSpan={3}></td>
                    <td className="text-right py-2 font-medium">Tax:</td>
                    <td className="text-right py-2">${calculateTotalTax().toFixed(2)}</td>
                  </tr>
                  <tr>
                    <td colSpan={3}></td>
                    <td className="text-right py-2 font-medium">Total Due:</td>
                    <td className="text-right py-2 font-bold">${calculateGrandTotal().toFixed(2)}</td>
                  </tr>
                </tfoot>
              </table>
              
              {notes && (
                <div className="mb-8">
                  <h3 className="text-sm font-medium uppercase text-muted-foreground mb-2">Notes:</h3>
                  <p className="text-sm whitespace-pre-line">{notes}</p>
                </div>
              )}
              
              <div className="text-sm text-muted-foreground border-t pt-4">
                <p>All services are subject to our terms and conditions. Payment due within 30 days.</p>
              </div>
            </div>
          </TabsContent>
        </Tabs>
        
        <DialogFooter className="gap-2">
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button variant="outline" onClick={handleSaveDraft} className="gap-2">
            <Save size={16} />
            Save Draft
          </Button>
          <Button onClick={handleSendInvoice} className="gap-2">
            <Send size={16} />
            Send to Customer
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
