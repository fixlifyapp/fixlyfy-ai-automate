
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
import { Send, Save, FileText, PlusCircle, Trash, Search, Pencil } from "lucide-react";
import { ProductCatalog } from "@/components/jobs/builder/ProductCatalog";
import { LineItem, Product } from "@/components/jobs/builder/types";
import { toast } from "sonner";
import { WarrantySelectionDialog } from "./WarrantySelectionDialog";
import { ProductEditDialog } from "./ProductEditDialog";
import { ProductSearch } from "@/components/jobs/builder/ProductSearch";

interface EstimateBuilderDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  estimateId: string | null;
  jobId: string;
}

export const EstimateBuilderDialog = ({
  open,
  onOpenChange,
  estimateId,
  jobId
}: EstimateBuilderDialogProps) => {
  const [activeTab, setActiveTab] = useState("editor");
  const [estimateNumber, setEstimateNumber] = useState("");
  const [lineItems, setLineItems] = useState<LineItem[]>([]);
  const [notes, setNotes] = useState("");
  const [isWarrantyDialogOpen, setIsWarrantyDialogOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [isProductEditDialogOpen, setIsProductEditDialogOpen] = useState(false);
  const [selectedLineItemId, setSelectedLineItemId] = useState<string | null>(null);
  const [recommendedWarranty, setRecommendedWarranty] = useState<Product | null>(null);
  const [techniciansNote, setTechniciansNote] = useState("");
  const [isProductSearchOpen, setIsProductSearchOpen] = useState(false);

  // Mock data for selected estimate
  useEffect(() => {
    if (estimateId) {
      // In a real app, this would fetch the estimate data from an API
      setEstimateNumber(`EST-${Math.floor(10000 + Math.random() * 90000)}`);
      setLineItems([
        {
          id: "line-1",
          description: "HVAC Repair Service",
          quantity: 1,
          unitPrice: 220,
          discount: 0,
          tax: 10,
          total: 220,
          ourPrice: 150,
          taxable: true
        },
        {
          id: "line-2",
          description: "Defrost System Replacement",
          quantity: 1,
          unitPrice: 149,
          discount: 0,
          tax: 10,
          total: 149,
          ourPrice: 85,
          taxable: true
        }
      ]);
      setNotes("Customer requested service on weekends. Parts may need to be ordered.");
    } else {
      // New estimate
      setEstimateNumber(`EST-${Math.floor(10000 + Math.random() * 90000)}`);
      setLineItems([]);
      setNotes("");
    }
  }, [estimateId, open]);

  const handleAddProduct = (product: Product) => {
    const newLineItem: LineItem = {
      id: `line-${Date.now()}`,
      description: product.name,
      quantity: 1,
      unitPrice: product.price,
      discount: 0,
      tax: product.taxable ? 10 : 0, // Default tax rate or 0 if not taxable
      total: product.price,
      ourPrice: product.ourPrice,
      taxable: product.taxable
    };
    
    setLineItems([...lineItems, newLineItem]);
    toast.success(`${product.name} added to estimate`);
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

  const handleAddEmptyLineItem = () => {
    // Instead of adding an empty line item, open the product search dialog
    setIsProductSearchOpen(true);
  };

  const calculateLineTotal = (item: LineItem): number => {
    const subtotal = item.quantity * item.unitPrice;
    const discountAmount = subtotal * (item.discount / 100);
    const afterDiscount = subtotal - discountAmount;
    const taxAmount = item.taxable ? afterDiscount * (item.tax / 100) : 0;
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
      if (!item.taxable) return total;
      
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

  const calculateTotalMargin = (): number => {
    return lineItems.reduce((margin, item) => {
      const revenue = item.quantity * item.unitPrice * (1 - item.discount / 100);
      const cost = item.quantity * (item.ourPrice || 0);
      return margin + (revenue - cost);
    }, 0);
  };

  const calculateMarginPercentage = (): number => {
    const totalRevenue = calculateSubtotal();
    const margin = calculateTotalMargin();
    return totalRevenue > 0 ? (margin / totalRevenue) * 100 : 0;
  };

  const handleSaveDraft = () => {
    // In a real app, this would save the estimate to an API
    toast.success(`Estimate ${estimateNumber} saved as draft`);
    onOpenChange(false);
  };

  const handleSendEstimate = () => {
    setIsWarrantyDialogOpen(true);
  };

  const handleWarrantyConfirmed = (selectedWarranty: Product | null, note: string) => {
    setIsWarrantyDialogOpen(false);
    
    // If a warranty was selected, store it for the customer upsell
    if (selectedWarranty) {
      setRecommendedWarranty(selectedWarranty);
      setTechniciansNote(note);
    }
    
    // In a real app, this would send the estimate to the API with warranty settings
    toast.success(`Estimate ${estimateNumber} sent to customer${selectedWarranty ? ' with warranty recommendation' : ''}`);
    onOpenChange(false);
  };

  const handleEditLineItem = (lineItemId: string) => {
    const lineItem = lineItems.find(item => item.id === lineItemId);
    if (lineItem) {
      // Create a temporary product from the line item for editing
      setSelectedProduct({
        id: lineItem.id,
        name: lineItem.description,
        description: lineItem.description,
        category: "Custom",
        price: lineItem.unitPrice,
        ourPrice: lineItem.ourPrice || 0,
        taxable: lineItem.taxable !== undefined ? lineItem.taxable : true,
        tags: []
      });
      setSelectedLineItemId(lineItemId);
      setIsProductEditDialogOpen(true);
    }
  };

  const handleProductSaved = (product: Product) => {
    if (selectedLineItemId) {
      // Update the line item with the edited product details
      setLineItems(lineItems.map(item => {
        if (item.id === selectedLineItemId) {
          return {
            ...item,
            description: product.name,
            unitPrice: product.price,
            ourPrice: product.ourPrice,
            taxable: product.taxable,
            total: calculateLineTotal({
              ...item,
              unitPrice: product.price,
              taxable: product.taxable,
            })
          };
        }
        return item;
      }));
    }
    setIsProductEditDialogOpen(false);
    setSelectedProduct(null);
    setSelectedLineItemId(null);
  };

  const handleProductSelected = (product: Product) => {
    handleAddProduct(product);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{estimateId ? "Edit Estimate" : "Create Estimate"}</DialogTitle>
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
                    <Label htmlFor="estimate-number">Estimate #</Label>
                    <Input
                      id="estimate-number"
                      value={estimateNumber}
                      onChange={(e) => setEstimateNumber(e.target.value)}
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
                        <TableHead className="w-[80px]"></TableHead>
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
                              disabled={!item.taxable}
                            />
                          </TableCell>
                          <TableCell className="text-right font-medium">
                            ${item.total.toFixed(2)}
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center space-x-1">
                              <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => handleEditLineItem(item.id)}
                                title="Edit product details"
                              >
                                <Pencil size={16} />
                              </Button>
                              <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => handleRemoveLineItem(item.id)}
                                title="Remove item"
                              >
                                <Trash size={16} className="text-destructive" />
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))}
                      {lineItems.length === 0 && (
                        <TableRow>
                          <TableCell colSpan={7} className="text-center py-4 text-muted-foreground">
                            No items added yet. Add items from the catalog or search for products.
                          </TableCell>
                        </TableRow>
                      )}
                    </TableBody>
                  </Table>
                </div>
                
                <div className="mt-4">
                  <Button 
                    variant="outline" 
                    size="sm" 
                    className="gap-2"
                    onClick={handleAddEmptyLineItem}
                  >
                    <Search size={16} />
                    Search & Add Products
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
                      
                      {/* Profit margin - visible only to staff */}
                      <div className="border-t border-dashed mt-4 pt-4">
                        <div className="flex justify-between text-sm">
                          <span className="text-green-600">Margin:</span>
                          <span className="text-green-600">
                            ${calculateTotalMargin().toFixed(2)} ({calculateMarginPercentage().toFixed(0)}%)
                          </span>
                        </div>
                        <p className="text-xs text-muted-foreground mt-1">
                          This information is for internal use only and will not be visible to customers.
                        </p>
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
                  <h2 className="text-2xl font-bold mb-1">ESTIMATE</h2>
                  <p className="text-lg font-medium">{estimateNumber}</p>
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
                      <h3 className="text-sm font-medium uppercase text-muted-foreground mb-2">Estimate Date:</h3>
                      <p>{new Date().toLocaleDateString()}</p>
                    </div>
                    <div>
                      <h3 className="text-sm font-medium uppercase text-muted-foreground mb-2">Valid Until:</h3>
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
                    <td className="text-right py-2 font-medium">Total:</td>
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
                <p>All services are subject to our terms and conditions. Estimate valid for 30 days.</p>
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
          <Button onClick={handleSendEstimate} className="gap-2">
            <Send size={16} />
            Send to Customer
          </Button>
        </DialogFooter>
      </DialogContent>

      <WarrantySelectionDialog
        open={isWarrantyDialogOpen}
        onOpenChange={setIsWarrantyDialogOpen}
        onConfirm={handleWarrantyConfirmed}
      />

      <ProductEditDialog
        open={isProductEditDialogOpen}
        onOpenChange={setIsProductEditDialogOpen}
        product={selectedProduct}
        onSave={handleProductSaved}
        categories={["Custom"]}
      />

      <ProductSearch
        open={isProductSearchOpen}
        onOpenChange={setIsProductSearchOpen}
        onProductSelect={handleProductSelected}
      />
    </Dialog>
  );
};
