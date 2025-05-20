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
import { Send, Save, Trash, Search, Pencil, Plus, Info, RefreshCw } from "lucide-react";
import { ProductCatalog } from "@/components/jobs/builder/ProductCatalog";
import { LineItem, Product } from "@/components/jobs/builder/types";
import { toast } from "sonner";
import { WarrantySelectionDialog } from "./WarrantySelectionDialog";
import { ProductEditDialog } from "./ProductEditDialog";
import { ProductSearch } from "@/components/jobs/builder/ProductSearch";
import { cn } from "@/lib/utils";
import { supabase } from "@/integrations/supabase/client";

interface EstimateBuilderDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  estimateId: string | null;
  jobId: string;
  onSyncToInvoice?: (estimate: any) => void;
}

export const EstimateBuilderDialog = ({
  open,
  onOpenChange,
  estimateId,
  jobId,
  onSyncToInvoice
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
  const [taxRate, setTaxRate] = useState(10); // Default tax rate of 10%
  const [showUpsellOptions, setShowUpsellOptions] = useState(false);
  const [showSyncOptions, setShowSyncOptions] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  // Load estimate data when editing an existing estimate
  useEffect(() => {
    const fetchEstimateData = async () => {
      if (!estimateId || !open) return;
      
      setIsLoading(true);
      console.log("Fetching estimate data for ID:", estimateId);
      
      try {
        // Fetch estimate details
        const { data: estimateData, error: estimateError } = await supabase
          .from('estimates')
          .select('*')
          .eq('id', estimateId)
          .single();
          
        if (estimateError) {
          console.error("Error fetching estimate:", estimateError);
          toast.error("Failed to load estimate data");
          return;
        }
        
        if (estimateData) {
          console.log("Loaded estimate data:", estimateData);
          setEstimateNumber(estimateData.number);
          
          // Fetch estimate items
          const { data: itemsData, error: itemsError } = await supabase
            .from('estimate_items')
            .select('*')
            .eq('estimate_id', estimateId);
            
          if (itemsError) {
            console.error("Error fetching estimate items:", itemsError);
            toast.error("Failed to load estimate items");
            return;
          }
          
          if (itemsData && itemsData.length > 0) {
            // Map the items to LineItem format
            const mappedItems: LineItem[] = itemsData.map(item => ({
              id: item.id,
              description: item.name,
              quantity: item.quantity || 1,
              unitPrice: Number(item.price) || 0,
              discount: 0, // Default discount if not in DB
              tax: item.taxable ? taxRate : 0,
              total: Number(item.price) * (item.quantity || 1),
              ourPrice: 0, // Set default
              taxable: item.taxable
            }));
            
            console.log("Loaded estimate items:", mappedItems);
            setLineItems(mappedItems);
          } else {
            setLineItems([]);
          }
        }
      } catch (error) {
        console.error("Error in fetchEstimateData:", error);
        toast.error("An error occurred while loading the estimate");
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchEstimateData();
  }, [estimateId, open, taxRate]);

  const handleAddProduct = (product: Product) => {
    const newLineItem: LineItem = {
      id: `line-${Date.now()}`,
      description: product.name,
      quantity: 1,
      unitPrice: product.price,
      discount: 0,
      tax: product.taxable ? taxRate : 0, // Default tax rate or 0 if not taxable
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
    setIsProductSearchOpen(true);
  };

  const handleAddCustomLine = () => {
    const newLineItem: LineItem = {
      id: `line-${Date.now()}`,
      description: "",
      quantity: 1,
      unitPrice: 0,
      discount: 0,
      tax: taxRate,
      total: 0,
      ourPrice: 0,
      taxable: true
    };
    
    setLineItems([...lineItems, newLineItem]);
  };

  const calculateLineTotal = (item: LineItem): number => {
    const subtotal = item.quantity * item.unitPrice;
    const discountAmount = subtotal * (item.discount / 100);
    const afterDiscount = subtotal - discountAmount;
    return afterDiscount;
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
      const taxAmount = afterDiscount * (taxRate / 100);
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
    // Validate estimate before sending
    if (lineItems.length === 0) {
      toast.error("Please add at least one item to the estimate");
      return;
    }
    
    setIsWarrantyDialogOpen(true);
  };

  const handleSyncToInvoice = () => {
    if (onSyncToInvoice) {
      const estimate = {
        id: estimateId || `est-${Date.now()}`,
        number: estimateNumber,
        items: lineItems,
        total: calculateGrandTotal(),
        subtotal: calculateSubtotal(),
        tax: calculateTotalTax(),
        notes,
        date: new Date().toISOString()
      };
      
      onSyncToInvoice(estimate);
      toast.success("Estimate synced to invoice");
    }
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
    setIsProductSearchOpen(false);
  };
  
  const handleTaxRateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newRate = parseFloat(e.target.value) || 0;
    setTaxRate(newRate);
  };

  const handleAddUpsell = () => {
    setShowUpsellOptions(!showUpsellOptions);
  };

  const handleAddWarranty = () => {
    setIsWarrantyDialogOpen(true);
  };

  const handleAddMaintenancePlan = () => {
    // Sample maintenance plan product
    const maintenancePlan: Product = {
      id: `prod-maint-${Date.now()}`,
      name: "Annual Maintenance Plan",
      description: "One year of scheduled maintenance including filters, inspections and priority service",
      price: 249,
      ourPrice: 149,
      category: "Services",
      tags: ["maintenance", "service"],
      taxable: true
    };
    
    handleAddProduct(maintenancePlan);
    setShowUpsellOptions(false);
  };

  const handleDisplaySyncOptions = () => {
    setShowSyncOptions(!showSyncOptions);
  };

  const handleSyncFromInvoice = () => {
    toast.success("Line items imported from invoice");
    // In a real app, this would fetch line items from an existing invoice
    setShowSyncOptions(false);
  };

  const handleSyncFromPrevious = () => {
    toast.success("Line items imported from previous estimate");
    // In a real app, this would fetch line items from a previous estimate
    setShowSyncOptions(false);
  };

  // Check if estimate can be sent
  const canSendEstimate = lineItems.length > 0 && calculateGrandTotal() > 0;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-5xl max-h-[90vh] overflow-y-auto p-0">
        {/* Sticky Header */}
        <div className="bg-background sticky top-0 z-10 border-b p-4 flex flex-col gap-4">
          <div className="flex items-center justify-between">
            <DialogHeader className="mb-0">
              <DialogTitle className="text-xl font-semibold">{estimateId ? "Edit Estimate" : "Create Estimate"}</DialogTitle>
            </DialogHeader>
            
            <Badge variant="outline" className="bg-fixlyfy-warning/10 text-fixlyfy-warning border-fixlyfy-warning/20">
              {isLoading ? "Loading..." : "Draft"}
            </Badge>
          </div>
          
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="editor">Editor</TabsTrigger>
              <TabsTrigger value="preview">Preview</TabsTrigger>
            </TabsList>
          </Tabs>
        </div>
        
        {/* Show loading indicator if data is still loading */}
        {isLoading && (
          <div className="flex items-center justify-center p-12">
            <div className="flex flex-col items-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-fixlyfy mb-4"></div>
              <p className="text-fixlyfy-text-secondary">Loading estimate data...</p>
            </div>
          </div>
        )}
          
        {!isLoading && (
          <div className="px-6 pt-2 pb-6">
            <TabsContent value="editor" className="mt-2">
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Left Section - Estimate Builder */}
                <div className="lg:col-span-2 space-y-6">
                  {/* Estimate Header Section */}
                  <div className="flex flex-wrap gap-4 items-center">
                    <div className="space-y-2">
                      <Label htmlFor="estimate-number">Estimate #</Label>
                      <Input
                        id="estimate-number"
                        value={estimateNumber}
                        readOnly
                        className="w-40 bg-muted/50"
                      />
                    </div>
                    
                    <div className="space-y-2 flex-1">
                      <Label htmlFor="client-name">Client</Label>
                      <Input
                        id="client-name"
                        value="Michael Johnson"
                        readOnly
                        className="bg-muted/50"
                      />
                    </div>

                    <div className="ml-auto space-x-2">
                      {/* Sync Options Button */}
                      <div className="relative inline-block">
                        <Button 
                          onClick={handleDisplaySyncOptions} 
                          variant="outline"
                          className="gap-2"
                        >
                          <RefreshCw size={16} />
                          Sync Options
                        </Button>
                        
                        {showSyncOptions && (
                          <div className="absolute right-0 mt-2 w-56 bg-background border rounded-md shadow-lg z-10">
                            <div className="py-1">
                              <Button 
                                variant="ghost" 
                                className="w-full justify-start px-4 py-2 text-sm" 
                                onClick={handleSyncToInvoice}
                              >
                                Sync to Invoice
                              </Button>
                              <Button 
                                variant="ghost" 
                                className="w-full justify-start px-4 py-2 text-sm" 
                                onClick={handleSyncFromInvoice}
                              >
                                Import from Invoice
                              </Button>
                              <Button 
                                variant="ghost" 
                                className="w-full justify-start px-4 py-2 text-sm" 
                                onClick={handleSyncFromPrevious}
                              >
                                Import from Prior Estimate
                              </Button>
                            </div>
                          </div>
                        )}
                      </div>
                      
                      {/* Upsell Options Button */}
                      <div className="relative inline-block">
                        <Button 
                          onClick={handleAddUpsell} 
                          variant="outline"
                          className="gap-2"
                        >
                          <Plus size={16} />
                          Add Upsell
                        </Button>
                        
                        {showUpsellOptions && (
                          <div className="absolute right-0 mt-2 w-56 bg-background border rounded-md shadow-lg z-10">
                            <div className="py-1">
                              <Button 
                                variant="ghost" 
                                className="w-full justify-start px-4 py-2 text-sm" 
                                onClick={handleAddWarranty}
                              >
                                Add Warranty
                              </Button>
                              <Button 
                                variant="ghost" 
                                className="w-full justify-start px-4 py-2 text-sm" 
                                onClick={handleAddMaintenancePlan}
                              >
                                Add Maintenance Plan
                              </Button>
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                  
                  {/* Line Items Section */}
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <h3 className="text-lg font-medium">Line Items</h3>
                    </div>
                    
                    <div className="border rounded-md overflow-hidden bg-white">
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead className="w-[50%]">Description</TableHead>
                            <TableHead className="w-[80px]">Qty</TableHead>
                            <TableHead className="w-[120px]">Unit Price</TableHead>
                            <TableHead className="w-[80px]">Discount %</TableHead>
                            <TableHead className="w-[120px] text-right">Total</TableHead>
                            <TableHead className="w-[80px]"></TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {lineItems.map((item) => (
                            <TableRow key={item.id} className="hover:bg-muted/20 group">
                              <TableCell>
                                <Input
                                  value={item.description}
                                  onChange={(e) => handleUpdateLineItem(item.id, "description", e.target.value)}
                                  className="border-transparent focus:border-input bg-transparent"
                                />
                              </TableCell>
                              <TableCell>
                                <Input
                                  type="number"
                                  value={item.quantity}
                                  min={1}
                                  onChange={(e) => handleUpdateLineItem(item.id, "quantity", parseInt(e.target.value) || 1)}
                                  className="border-transparent focus:border-input bg-transparent w-16"
                                />
                              </TableCell>
                              <TableCell>
                                <div className="relative">
                                  <span className="absolute left-2 top-1/2 transform -translate-y-1/2 text-muted-foreground">$</span>
                                  <Input
                                    type="number"
                                    value={item.unitPrice}
                                    min={0}
                                    step={0.01}
                                    onChange={(e) => handleUpdateLineItem(item.id, "unitPrice", parseFloat(e.target.value) || 0)}
                                    className="border-transparent focus:border-input bg-transparent pl-6"
                                  />
                                </div>
                              </TableCell>
                              <TableCell>
                                <div className="relative">
                                  <Input
                                    type="number"
                                    value={item.discount}
                                    min={0}
                                    max={100}
                                    onChange={(e) => handleUpdateLineItem(item.id, "discount", parseFloat(e.target.value) || 0)}
                                    className="border-transparent focus:border-input bg-transparent pr-6 w-16"
                                  />
                                  <span className="absolute right-2 top-1/2 transform -translate-y-1/2 text-muted-foreground">%</span>
                                </div>
                              </TableCell>
                              <TableCell className="text-right font-medium">
                                ${calculateLineTotal(item).toFixed(2)}
                              </TableCell>
                              <TableCell>
                                <div className="flex items-center justify-end space-x-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                  <Button
                                    variant="ghost"
                                    size="icon"
                                    onClick={() => handleEditLineItem(item.id)}
                                    title="Edit product details"
                                    className="h-8 w-8"
                                  >
                                    <Pencil size={16} />
                                  </Button>
                                  <Button
                                    variant="ghost"
                                    size="icon"
                                    onClick={() => handleRemoveLineItem(item.id)}
                                    title="Remove item"
                                    className="h-8 w-8 text-destructive"
                                  >
                                    <Trash size={16} />
                                  </Button>
                                </div>
                              </TableCell>
                            </TableRow>
                          ))}
                          {lineItems.length === 0 && (
                            <TableRow>
                              <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
                                No items added yet. Add items from the catalog or create a custom line item.
                              </TableCell>
                            </TableRow>
                          )}
                        </TableBody>
                      </Table>
                    </div>
                    
                    <div className="flex flex-wrap gap-3">
                      <Button 
                        variant="outline" 
                        size="sm" 
                        className="gap-2"
                        onClick={handleAddEmptyLineItem}
                      >
                        <Search size={16} />
                        Add from Catalog
                      </Button>
                      <Button 
                        variant="outline" 
                        size="sm" 
                        className="gap-2"
                        onClick={handleAddCustomLine}
                      >
                        <Plus size={16} />
                        Add Custom Line
                      </Button>
                    </div>
                  </div>
                  
                  {/* Notes Section */}
                  <div className="space-y-2">
                    <Label htmlFor="notes">Notes & Terms</Label>
                    <textarea
                      id="notes"
                      value={notes}
                      onChange={(e) => setNotes(e.target.value)}
                      className="w-full min-h-[100px] p-2 border rounded-md resize-y"
                      placeholder="Add notes or terms and conditions..."
                    />
                  </div>
                </div>
                
                {/* Right Section - Catalog & Summary */}
                <div className="lg:col-span-1">
                  {/* Fixed position on desktop, scrollable on mobile */}
                  <div className="space-y-6">
                    {/* Summary Card */}
                    <div className="border rounded-md p-6 bg-card">
                      <h3 className="font-semibold text-lg mb-4">Summary</h3>
                      <div className="space-y-3">
                        <div className="flex justify-between">
                          <span>Subtotal:</span>
                          <span>${calculateSubtotal().toFixed(2)}</span>
                        </div>
                        
                        <div className="flex justify-between items-center">
                          <div className="flex items-center gap-2">
                            <span>Tax:</span>
                            <div className="relative w-16">
                              <Input
                                type="number"
                                min={0}
                                max={100}
                                value={taxRate}
                                onChange={handleTaxRateChange}
                                className="h-7 px-2 py-1 text-right pr-5"
                              />
                              <span className="absolute right-2 top-1/2 transform -translate-y-1/2 text-muted-foreground text-xs">%</span>
                            </div>
                          </div>
                          <span>${calculateTotalTax().toFixed(2)}</span>
                        </div>
                        
                        <div className="pt-3 border-t">
                          <div className="flex justify-between font-semibold text-lg">
                            <span>Total:</span>
                            <span>${calculateGrandTotal().toFixed(2)}</span>
                          </div>
                        </div>
                        
                        {/* Profit margin - visible only to staff */}
                        <div className="mt-4 pt-4 border-t border-dashed">
                          <div className="flex justify-between items-center">
                            <div className="flex items-center gap-1 text-green-600">
                              <span className="font-medium">Profit Margin</span>
                              <span className="tooltip-container">
                                <Info size={14} className="text-muted-foreground" />
                                <span className="tooltip-text text-xs bg-background border p-2 rounded shadow-md absolute -top-10 left-0 hidden group-hover:block w-48">
                                  This information is for internal use only
                                </span>
                              </span>
                            </div>
                            <span className="text-green-600 font-medium">
                              ${calculateTotalMargin().toFixed(2)}
                            </span>
                          </div>
                          <div className="flex justify-between items-center mt-1">
                            <span className="text-sm text-muted-foreground">Percentage:</span>
                            <span className="text-sm text-green-600">
                              {calculateMarginPercentage().toFixed(0)}%
                            </span>
                          </div>
                          <p className="text-xs text-muted-foreground mt-2">
                            This information is for internal use only
                          </p>
                        </div>
                      </div>
                    </div>
                    
                    {/* Product Catalog */}
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
                        <td className="text-right py-2">${calculateLineTotal(item).toFixed(2)}</td>
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
                      <td className="text-right py-2 font-medium">Tax ({taxRate}%):</td>
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
          </div>
        )}
        
        {/* Sticky Footer */}
        <DialogFooter className="sticky bottom-0 border-t bg-background px-6 py-4 mt-0">
          <div className="w-full flex flex-col sm:flex-row justify-between gap-2">
            <Button variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <div className="flex gap-2">
              <Button variant="outline" onClick={handleSaveDraft} className="gap-2">
                <Save size={16} />
                Save Draft
              </Button>
              <Button 
                onClick={handleSendEstimate} 
                className="gap-2 bg-indigo-600 hover:bg-indigo-700"
                disabled={!canSendEstimate}
              >
                <Send size={16} />
                Send to Customer
              </Button>
            </div>
          </div>
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
