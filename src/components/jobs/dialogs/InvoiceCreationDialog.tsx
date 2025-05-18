
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Product } from "../builder/types";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Trash, Plus, Search, Sync } from "lucide-react";
import { Switch } from "@/components/ui/switch";
import { toast } from "sonner";

interface InvoiceItem extends Product {
  quantity: number;
  taxable: boolean;
}

interface InvoiceCreationDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  jobId: string;
  onSave?: (invoice: any) => void;
  hasEstimate?: boolean;
  estimateItems?: InvoiceItem[];
  estimateTotal?: number;
  onSyncFromEstimate?: () => void;
}

export const InvoiceCreationDialog = ({
  open,
  onOpenChange,
  jobId,
  onSave,
  hasEstimate = false,
  estimateItems = [],
  estimateTotal = 0,
  onSyncFromEstimate
}: InvoiceCreationDialogProps) => {
  const [invoiceItems, setInvoiceItems] = useState<InvoiceItem[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [invoiceNumber, setInvoiceNumber] = useState(`INV-${Date.now().toString().substring(6)}`);
  const [invoiceDate, setInvoiceDate] = useState(new Date().toISOString().split("T")[0]);
  const [dueDate, setDueDate] = useState(
    new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split("T")[0]
  );
  const [notes, setNotes] = useState("");
  const [showProductSearch, setShowProductSearch] = useState(false);
  const TAX_RATE = 0.13; // 13% tax rate

  // If there's an estimate, provide option to sync from estimate on dialog open
  useEffect(() => {
    if (open && hasEstimate && estimateItems.length > 0) {
      // Offering the option to sync, but not auto-syncing
      // If you want to auto-sync, you can uncomment the next line:
      // setInvoiceItems(estimateItems);
    }
  }, [open, hasEstimate, estimateItems]);

  // Function to sync items from estimate
  const handleSyncFromEstimate = () => {
    if (hasEstimate && estimateItems.length > 0) {
      setInvoiceItems(estimateItems);
      toast.success("Items synced from estimate");
      if (onSyncFromEstimate) {
        onSyncFromEstimate();
      }
    }
  };

  // Sample products - in a real app, this would come from your database
  const availableProducts: Product[] = [
    {
      id: "prod-1",
      name: "Labor - Standard Rate",
      description: "Standard labor rate per hour",
      price: 95,
      category: "Labor",
      tags: ["service", "labor"],
    },
    {
      id: "prod-2",
      name: "HVAC Filter Replacement",
      description: "High-quality air filter replacement",
      price: 45,
      category: "Parts",
      tags: ["part", "hvac", "filter"],
    },
    {
      id: "prod-3",
      name: "Service Call Fee",
      description: "Standard service call fee",
      price: 75,
      category: "Fees",
      tags: ["fee", "service"],
    },
    {
      id: "prod-4",
      name: "Diagnostic Fee",
      description: "Comprehensive system diagnostic",
      price: 120,
      category: "Services",
      tags: ["diagnostic", "service"],
    },
    {
      id: "prod-5",
      name: "1-Year Warranty",
      description: "Extended warranty coverage",
      price: 199,
      category: "Warranty",
      tags: ["warranty", "protection"],
    },
  ];
  
  const filteredProducts = availableProducts.filter(product => 
    product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    product.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
    product.category.toLowerCase().includes(searchQuery.toLowerCase()) ||
    product.tags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  const addProduct = (product: Product) => {
    setInvoiceItems([
      ...invoiceItems,
      { ...product, quantity: 1, taxable: true },
    ]);
    setShowProductSearch(false);
    setSearchQuery("");
  };

  const updateItemQuantity = (index: number, quantity: number) => {
    const newItems = [...invoiceItems];
    newItems[index].quantity = quantity;
    setInvoiceItems(newItems);
  };

  const toggleItemTaxable = (index: number) => {
    const newItems = [...invoiceItems];
    newItems[index].taxable = !newItems[index].taxable;
    setInvoiceItems(newItems);
  };

  const removeItem = (index: number) => {
    setInvoiceItems(invoiceItems.filter((_, i) => i !== index));
  };

  const calculateSubtotal = () => {
    return invoiceItems.reduce((sum, item) => sum + item.price * item.quantity, 0);
  };

  const calculateTax = () => {
    return invoiceItems
      .filter(item => item.taxable)
      .reduce((sum, item) => sum + item.price * item.quantity * TAX_RATE, 0);
  };

  const calculateTotal = () => {
    const subtotal = calculateSubtotal();
    const tax = calculateTax();
    return subtotal + tax;
  };

  const handleSave = () => {
    if (invoiceItems.length === 0) {
      toast.error("Please add at least one item to the invoice");
      return;
    }

    const invoice = {
      id: `inv-${Date.now()}`,
      invoiceNumber,
      date: invoiceDate,
      dueDate,
      items: invoiceItems,
      subtotal: calculateSubtotal(),
      tax: calculateTax(),
      total: calculateTotal(),
      notes,
      status: "draft",
      jobId,
    };

    if (onSave) {
      onSave(invoice);
    }
    
    toast.success("Invoice created successfully");
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-xl">Create New Invoice</DialogTitle>
          <DialogDescription>
            Create an invoice with products, services, and applicable taxes.
          </DialogDescription>
        </DialogHeader>
        
        <div className="grid grid-cols-3 gap-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="invoice-number">Invoice #</Label>
            <Input
              id="invoice-number"
              value={invoiceNumber}
              onChange={(e) => setInvoiceNumber(e.target.value)}
              placeholder="INV-12345"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="invoice-date">Date</Label>
            <Input
              id="invoice-date"
              type="date"
              value={invoiceDate}
              onChange={(e) => setInvoiceDate(e.target.value)}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="due-date">Due Date</Label>
            <Input
              id="due-date"
              type="date"
              value={dueDate}
              onChange={(e) => setDueDate(e.target.value)}
            />
          </div>
        </div>
        
        {!showProductSearch ? (
          <>
            <div className="flex justify-between items-center my-4">
              <h3 className="font-medium">Invoice Items</h3>
              <div className="flex gap-2">
                {hasEstimate && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleSyncFromEstimate}
                    className="flex items-center gap-1"
                  >
                    <Sync size={16} />
                    Sync from Estimate
                  </Button>
                )}
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setShowProductSearch(true)}
                  className="flex items-center gap-1"
                >
                  <Plus size={16} />
                  Add Item
                </Button>
              </div>
            </div>
            
            {invoiceItems.length > 0 ? (
              <div className="border rounded-md overflow-hidden">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="w-[40%]">Item</TableHead>
                      <TableHead>Quantity</TableHead>
                      <TableHead>Price</TableHead>
                      <TableHead>Taxable</TableHead>
                      <TableHead className="text-right">Total</TableHead>
                      <TableHead className="w-[50px]"></TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {invoiceItems.map((item, index) => (
                      <TableRow key={index}>
                        <TableCell>
                          <div>
                            <p className="font-medium">{item.name}</p>
                            <p className="text-sm text-muted-foreground line-clamp-1">
                              {item.description}
                            </p>
                          </div>
                        </TableCell>
                        <TableCell>
                          <Input
                            type="number"
                            min="1"
                            value={item.quantity}
                            onChange={(e) =>
                              updateItemQuantity(index, parseInt(e.target.value) || 1)
                            }
                            className="w-16"
                          />
                        </TableCell>
                        <TableCell>${item.price.toFixed(2)}</TableCell>
                        <TableCell>
                          <Switch
                            checked={item.taxable}
                            onCheckedChange={() => toggleItemTaxable(index)}
                          />
                        </TableCell>
                        <TableCell className="text-right">
                          ${(item.price * item.quantity).toFixed(2)}
                        </TableCell>
                        <TableCell>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => removeItem(index)}
                          >
                            <Trash size={16} />
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            ) : (
              <div className="border rounded-md p-8 text-center text-muted-foreground">
                <p>No items added yet. Click "Add Item" to add products to this invoice.</p>
                {hasEstimate && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleSyncFromEstimate}
                    className="mt-4 flex items-center gap-1 mx-auto"
                  >
                    <Sync size={16} />
                    Sync from Estimate
                  </Button>
                )}
              </div>
            )}
            
            <div className="space-y-6 mt-6">
              <div className="space-y-2">
                <Label htmlFor="notes">Notes</Label>
                <Input
                  id="notes"
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="Additional notes or payment instructions..."
                />
              </div>
              
              <div className="space-y-2 border-t pt-4">
                <div className="flex justify-between">
                  <span>Subtotal:</span>
                  <span>${calculateSubtotal().toFixed(2)}</span>
                </div>
                <div className="flex justify-between">
                  <span>Tax (13%):</span>
                  <span>${calculateTax().toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-lg font-bold">
                  <span>Total:</span>
                  <span>${calculateTotal().toFixed(2)}</span>
                </div>
              </div>
            </div>
          </>
        ) : (
          <div className="space-y-4 mt-4">
            <div className="flex items-center space-x-2">
              <Search className="w-4 h-4 text-muted-foreground" />
              <Input
                placeholder="Search products..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="flex-1"
                autoFocus
              />
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowProductSearch(false)}
              >
                Cancel
              </Button>
            </div>
            
            <div className="border rounded-md overflow-hidden">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Product</TableHead>
                    <TableHead>Category</TableHead>
                    <TableHead className="text-right">Price</TableHead>
                    <TableHead className="w-[80px]"></TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredProducts.length > 0 ? (
                    filteredProducts.map((product) => (
                      <TableRow key={product.id} className="cursor-pointer hover:bg-muted/50">
                        <TableCell>
                          <div>
                            <p className="font-medium">{product.name}</p>
                            <p className="text-sm text-muted-foreground line-clamp-1">
                              {product.description}
                            </p>
                          </div>
                        </TableCell>
                        <TableCell>{product.category}</TableCell>
                        <TableCell className="text-right">${product.price.toFixed(2)}</TableCell>
                        <TableCell>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => addProduct(product)}
                          >
                            <Plus size={16} />
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))
                  ) : (
                    <TableRow>
                      <TableCell colSpan={4} className="h-24 text-center">
                        No products found matching your search.
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </div>
          </div>
        )}
        
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={handleSave}>Create Invoice</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
