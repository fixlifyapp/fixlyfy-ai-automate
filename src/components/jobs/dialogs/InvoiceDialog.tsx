
import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Separator } from "@/components/ui/separator";
import { PlusCircle, Trash2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { formatCurrency } from "@/lib/utils";
import { Invoice } from "@/hooks/useInvoices";
import { LineItem } from "../builder/types";

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
  editInvoice?: Invoice;
}

export const InvoiceDialog = ({
  open,
  onOpenChange,
  onInvoiceCreated,
  clientInfo,
  companyInfo,
  editInvoice
}: InvoiceDialogProps) => {
  const [formData, setFormData] = useState({
    invoiceNumber: "",
    notes: "",
    total: 0
  });
  const [lineItems, setLineItems] = useState<LineItem[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (open) {
      if (editInvoice) {
        // Populate form with existing invoice data
        setFormData({
          invoiceNumber: editInvoice.invoice_number,
          notes: editInvoice.notes || "",
          total: editInvoice.total
        });
        loadLineItems(editInvoice.id);
      } else {
        // Reset form for new invoice
        setFormData({
          invoiceNumber: `INV-${Date.now()}`,
          notes: "",
          total: 0
        });
        setLineItems([{
          id: "1",
          description: "Service",
          quantity: 1,
          unitPrice: 0,
          taxable: true,
          total: 0
        }]);
      }
    }
  }, [open, editInvoice]);

  const loadLineItems = async (invoiceId: string) => {
    try {
      const { data, error } = await supabase
        .from('line_items')
        .select('*')
        .eq('parent_id', invoiceId)
        .eq('parent_type', 'invoice');

      if (error) throw error;

      if (data && data.length > 0) {
        const mappedItems: LineItem[] = data.map(item => ({
          id: item.id,
          description: item.description,
          quantity: Number(item.quantity),
          unitPrice: Number(item.unit_price),
          taxable: item.taxable,
          total: Number(item.quantity) * Number(item.unit_price)
        }));
        setLineItems(mappedItems);
      } else {
        // Fallback to single item if no line items found
        setLineItems([{
          id: "1",
          description: "Service",
          quantity: 1,
          unitPrice: editInvoice?.total || 0,
          taxable: true,
          total: editInvoice?.total || 0
        }]);
      }
    } catch (error) {
      console.error('Error loading line items:', error);
      // Fallback on error
      setLineItems([{
        id: "1",
        description: "Service",
        quantity: 1,
        unitPrice: editInvoice?.total || 0,
        taxable: true,
        total: editInvoice?.total || 0
      }]);
    }
  };

  const addLineItem = () => {
    const newItem: LineItem = {
      id: Date.now().toString(),
      description: "",
      quantity: 1,
      unitPrice: 0,
      taxable: true,
      total: 0
    };
    setLineItems([...lineItems, newItem]);
  };

  const removeLineItem = (id: string) => {
    if (lineItems.length > 1) {
      setLineItems(lineItems.filter(item => item.id !== id));
    }
  };

  const updateLineItem = (id: string, field: keyof LineItem, value: any) => {
    setLineItems(lineItems.map(item => {
      if (item.id === id) {
        const updatedItem = { ...item, [field]: value };
        if (field === 'quantity' || field === 'unitPrice') {
          updatedItem.total = updatedItem.quantity * updatedItem.unitPrice;
        }
        return updatedItem;
      }
      return item;
    }));
  };

  const calculateSubtotal = () => {
    return lineItems.reduce((sum, item) => sum + item.total, 0);
  };

  const calculateTax = () => {
    const taxableAmount = lineItems.reduce((sum, item) => {
      return sum + (item.taxable ? item.total : 0);
    }, 0);
    return taxableAmount * 0.1; // 10% tax rate
  };

  const calculateTotal = () => {
    return calculateSubtotal() + calculateTax();
  };

  const handleSubmit = async () => {
    if (!formData.invoiceNumber.trim()) {
      toast.error("Please enter an invoice number");
      return;
    }

    if (lineItems.some(item => !item.description.trim())) {
      toast.error("Please fill in all item descriptions");
      return;
    }

    setIsSubmitting(true);
    try {
      const total = calculateTotal();
      
      let invoice;
      if (editInvoice) {
        // Update existing invoice
        const { data, error } = await supabase
          .from('invoices')
          .update({
            invoice_number: formData.invoiceNumber,
            total,
            notes: formData.notes
          })
          .eq('id', editInvoice.id)
          .select()
          .single();

        if (error) throw error;
        invoice = data;

        // Delete existing line items
        await supabase
          .from('line_items')
          .delete()
          .eq('parent_id', editInvoice.id)
          .eq('parent_type', 'invoice');
      } else {
        // Create new invoice
        const { data, error } = await supabase
          .from('invoices')
          .insert({
            invoice_number: formData.invoiceNumber,
            total,
            amount_paid: 0,
            status: 'unpaid',
            notes: formData.notes,
            job_id: 'default-job-id' // This should come from props or context
          })
          .select()
          .single();

        if (error) throw error;
        invoice = data;
      }

      // Insert line items
      const lineItemsData = lineItems.map(item => ({
        parent_id: invoice.id,
        parent_type: 'invoice',
        description: item.description,
        quantity: item.quantity,
        unit_price: item.unitPrice,
        taxable: item.taxable
      }));

      const { error: lineItemsError } = await supabase
        .from('line_items')
        .insert(lineItemsData);

      if (lineItemsError) throw lineItemsError;

      toast.success(editInvoice ? "Invoice updated successfully" : "Invoice created successfully");
      onInvoiceCreated(total);
      onOpenChange(false);
    } catch (error) {
      console.error('Error saving invoice:', error);
      toast.error("Failed to save invoice");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {editInvoice ? "Edit Invoice" : "Create New Invoice"}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Basic Info */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="invoiceNumber">Invoice Number</Label>
              <Input
                id="invoiceNumber"
                value={formData.invoiceNumber}
                onChange={(e) => setFormData(prev => ({ ...prev, invoiceNumber: e.target.value }))}
                placeholder="INV-001"
              />
            </div>
          </div>

          <Separator />

          {/* Line Items */}
          <div>
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold">Items & Services</h3>
              <Button onClick={addLineItem} variant="outline" size="sm">
                <PlusCircle className="h-4 w-4 mr-2" />
                Add Item
              </Button>
            </div>

            <div className="space-y-3">
              {lineItems.map((item, index) => (
                <div key={item.id} className="border rounded-lg p-4">
                  <div className="grid grid-cols-12 gap-3 items-center">
                    <div className="col-span-4">
                      <Label className="text-xs">Description</Label>
                      <Input
                        value={item.description}
                        onChange={(e) => updateLineItem(item.id, 'description', e.target.value)}
                        placeholder="Service description"
                      />
                    </div>
                    <div className="col-span-2">
                      <Label className="text-xs">Quantity</Label>
                      <Input
                        type="number"
                        value={item.quantity}
                        onChange={(e) => updateLineItem(item.id, 'quantity', Number(e.target.value) || 0)}
                        min="0"
                        step="0.01"
                      />
                    </div>
                    <div className="col-span-2">
                      <Label className="text-xs">Unit Price</Label>
                      <Input
                        type="number"
                        value={item.unitPrice}
                        onChange={(e) => updateLineItem(item.id, 'unitPrice', Number(e.target.value) || 0)}
                        min="0"
                        step="0.01"
                      />
                    </div>
                    <div className="col-span-2">
                      <Label className="text-xs">Total</Label>
                      <div className="font-medium pt-2">
                        {formatCurrency(item.total)}
                      </div>
                    </div>
                    <div className="col-span-1">
                      <Label className="text-xs">Taxable</Label>
                      <input
                        type="checkbox"
                        checked={item.taxable}
                        onChange={(e) => updateLineItem(item.id, 'taxable', e.target.checked)}
                        className="mt-2"
                      />
                    </div>
                    <div className="col-span-1">
                      {lineItems.length > 1 && (
                        <Button
                          onClick={() => removeLineItem(item.id)}
                          variant="outline"
                          size="sm"
                          className="mt-4"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <Separator />

          {/* Totals */}
          <div className="bg-gray-50 p-4 rounded-lg">
            <div className="space-y-2">
              <div className="flex justify-between">
                <span>Subtotal:</span>
                <span>{formatCurrency(calculateSubtotal())}</span>
              </div>
              <div className="flex justify-between">
                <span>Tax (10%):</span>
                <span>{formatCurrency(calculateTax())}</span>
              </div>
              <Separator />
              <div className="flex justify-between text-lg font-bold">
                <span>Total:</span>
                <span>{formatCurrency(calculateTotal())}</span>
              </div>
            </div>
          </div>

          {/* Notes */}
          <div>
            <Label htmlFor="notes">Notes</Label>
            <Textarea
              id="notes"
              value={formData.notes}
              onChange={(e) => setFormData(prev => ({ ...prev, notes: e.target.value }))}
              placeholder="Additional notes..."
              rows={3}
            />
          </div>

          {/* Action Buttons */}
          <div className="flex gap-2 justify-end">
            <Button variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button onClick={handleSubmit} disabled={isSubmitting}>
              {isSubmitting ? "Saving..." : editInvoice ? "Update Invoice" : "Create Invoice"}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
