
import { useState, useEffect } from "react";
import { useEstimateInfo } from "@/components/jobs/estimates/hooks/useEstimateInfo";
import { LineItem } from "@/components/jobs/builder/types";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Table, TableHeader, TableRow, TableHead, TableBody, TableCell } from "@/components/ui/table";
import { Plus, Trash2 } from "lucide-react";

interface EstimateFormProps {
  estimateId: string | null;
  jobId: string;
  onSyncToInvoice?: () => void;
}

export function EstimateForm({ estimateId, jobId, onSyncToInvoice }: EstimateFormProps) {
  const [estimateNumber, setEstimateNumber] = useState("");
  const [lineItems, setLineItems] = useState<LineItem[]>([]);
  const [notes, setNotes] = useState("");
  const [taxRate, setTaxRate] = useState<number>(0);
  const [isLoading, setIsLoading] = useState(true);
  
  const { generateUniqueNumber } = useEstimateInfo();

  // Fetch estimate data if editing an existing estimate
  useEffect(() => {
    const fetchEstimateData = async () => {
      setIsLoading(true);
      
      if (estimateId) {
        try {
          // Fetch estimate details
          const { data: estimateData, error: estimateError } = await supabase
            .from('estimates')
            .select('*')
            .eq('id', estimateId)
            .single();
          
          if (estimateError) throw estimateError;
          
          // Fetch estimate line items
          const { data: itemsData, error: itemsError } = await supabase
            .from('line_items')
            .select('*')
            .eq('parent_type', 'estimate')
            .eq('parent_id', estimateId);
          
          if (itemsError) throw itemsError;
          
          if (estimateData) {
            setEstimateNumber(estimateData.estimate_number);
            setNotes(estimateData.notes || "");
            
            if (itemsData && itemsData.length > 0) {
              // Transform to LineItem format
              const items: LineItem[] = itemsData.map(item => ({
                id: item.id,
                description: item.description || "",
                quantity: item.quantity,
                unitPrice: parseFloat(item.unit_price),
                taxable: item.taxable,
                total: item.quantity * parseFloat(item.unit_price)
              }));
              
              setLineItems(items);
            }
          }
        } catch (error) {
          console.error('Error fetching estimate data:', error);
          toast.error('Failed to load estimate data');
        }
      } else {
        // Initialize with default values for a new estimate
        const newEstimateNumber = generateUniqueNumber('EST');
        setEstimateNumber(newEstimateNumber);
        setLineItems([]);
        setNotes("");
      }
      
      setIsLoading(false);
    };
    
    fetchEstimateData();
  }, [estimateId, jobId, generateUniqueNumber]);

  // Handler to add empty line item
  const handleAddEmptyLineItem = () => {
    const newItem: LineItem = {
      id: `new-${Date.now()}`,
      description: "New Item",
      quantity: 1,
      unitPrice: 0,
      taxable: true,
      total: 0
    };
    
    setLineItems(prev => [...prev, newItem]);
  };

  // Handler for line item changes
  const handleLineItemChange = (id: string, field: keyof LineItem, value: any) => {
    setLineItems(prev => 
      prev.map(item => {
        if (item.id === id) {
          const updated = { ...item, [field]: value };
          
          // Recalculate total
          if (field === 'quantity' || field === 'unitPrice') {
            updated.total = updated.quantity * updated.unitPrice;
          }
          
          return updated;
        }
        return item;
      })
    );
  };

  // Handler to remove line
  const handleRemoveLineItem = (id: string) => {
    setLineItems(prev => prev.filter(item => item.id !== id));
  };

  // Calculate subtotal
  const calculateSubtotal = () => {
    return lineItems.reduce((sum, item) => sum + (item.quantity * item.unitPrice), 0);
  };

  // Calculate tax amount
  const calculateTaxAmount = () => {
    return lineItems
      .filter(item => item.taxable)
      .reduce((sum, item) => sum + (item.quantity * item.unitPrice * (taxRate / 100)), 0);
  };

  // Calculate total
  const calculateTotal = () => {
    return calculateSubtotal() + calculateTaxAmount();
  };

  // Handler to save estimate
  const handleSave = async () => {
    try {
      const total = calculateTotal();
      
      if (estimateId) {
        // Update existing estimate
        const { error: updateError } = await supabase
          .from('estimates')
          .update({
            notes,
            total
          })
          .eq('id', estimateId);
        
        if (updateError) throw updateError;
        
        // Handle line items - delete existing ones first
        const { error: deleteError } = await supabase
          .from('line_items')
          .delete()
          .eq('parent_type', 'estimate')
          .eq('parent_id', estimateId);
        
        if (deleteError) throw deleteError;
      } else {
        // Create new estimate
        const { data: newEstimate, error: createError } = await supabase
          .from('estimates')
          .insert({
            job_id: jobId,
            estimate_number: estimateNumber,
            notes,
            total,
            status: 'draft'
          })
          .select()
          .single();
        
        if (createError) throw createError;
        
        // Set estimateId for line items
        if (newEstimate) {
          estimateId = newEstimate.id;
        } else {
          throw new Error("Failed to create estimate - no ID returned");
        }
      }
      
      // Insert line items
      if (estimateId && lineItems.length > 0) {
        const itemsToInsert = lineItems.map(item => ({
          parent_type: 'estimate',
          parent_id: estimateId,
          description: item.description,
          quantity: item.quantity,
          unit_price: item.unitPrice,
          taxable: item.taxable
        }));
        
        const { error: insertError } = await supabase
          .from('line_items')
          .insert(itemsToInsert);
        
        if (insertError) throw insertError;
      }
      
      toast.success(estimateId ? "Estimate updated successfully" : "Estimate created successfully");
      
      // Close dialog
      if (onSyncToInvoice) {
        onSyncToInvoice();
      }
    } catch (error) {
      console.error('Error saving estimate:', error);
      toast.error('Failed to save estimate');
    }
  };

  // Handle converting to invoice
  const handleConvertToInvoice = async () => {
    try {
      if (!estimateId) {
        // Save the estimate first if it's new
        await handleSave();
        return;
      }
      
      // Generate invoice number
      const invoiceNumber = `INV-${Math.floor(Math.random() * 10000).toString().padStart(4, '0')}`;
      const total = calculateTotal();
      
      // Create invoice
      const { data: newInvoice, error } = await supabase
        .from('invoices')
        .insert({
          job_id: jobId,
          estimate_id: estimateId,
          invoice_number: invoiceNumber,
          notes,
          total,
          balance: total,
          status: 'unpaid'
        })
        .select()
        .single();
      
      if (error) throw error;
      
      // Convert estimate line items to invoice line items
      if (newInvoice && lineItems.length > 0) {
        const invoiceItems = lineItems.map(item => ({
          parent_type: 'invoice',
          parent_id: newInvoice.id,
          description: item.description,
          quantity: item.quantity,
          unit_price: item.unitPrice,
          taxable: item.taxable
        }));
        
        const { error: insertError } = await supabase
          .from('line_items')
          .insert(invoiceItems);
          
        if (insertError) throw insertError;
      }
      
      // Update estimate status
      const { error: updateError } = await supabase
        .from('estimates')
        .update({ status: 'converted' })
        .eq('id', estimateId);
        
      if (updateError) throw updateError;
      
      toast.success("Estimate converted to invoice successfully");
      
      // Notify parent component
      if (onSyncToInvoice) {
        onSyncToInvoice();
      }
    } catch (error) {
      console.error('Error converting to invoice:', error);
      toast.error('Failed to convert estimate to invoice');
    }
  };

  if (isLoading) {
    return <div>Loading...</div>;
  }

  return (
    <div className="grid gap-6">
      <div className="flex justify-between items-center">
        <div>
          <Label htmlFor="estimate-number">Estimate Number</Label>
          <Input 
            id="estimate-number" 
            value={estimateNumber} 
            readOnly 
            className="w-40 mt-1"
          />
        </div>
        
        <div className="flex gap-2">
          <Button onClick={handleSave}>
            {estimateId ? "Update Estimate" : "Create Estimate"}
          </Button>
          <Button onClick={handleConvertToInvoice} variant="outline">
            Convert to Invoice
          </Button>
        </div>
      </div>
      
      <Card>
        <CardContent className="p-4">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-medium">Line Items</h3>
            <Button size="sm" variant="outline" onClick={handleAddEmptyLineItem}>
              <Plus className="h-4 w-4 mr-1" /> Add Item
            </Button>
          </div>
          
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Description</TableHead>
                <TableHead className="w-24">Quantity</TableHead>
                <TableHead className="w-32">Unit Price</TableHead>
                <TableHead className="w-20">Taxable</TableHead>
                <TableHead className="w-32">Total</TableHead>
                <TableHead className="w-16"></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {lineItems.map(item => (
                <TableRow key={item.id}>
                  <TableCell>
                    <Input 
                      value={item.description}
                      onChange={(e) => handleLineItemChange(item.id, 'description', e.target.value)}
                    />
                  </TableCell>
                  <TableCell>
                    <Input 
                      type="number"
                      min="1"
                      value={item.quantity}
                      onChange={(e) => handleLineItemChange(item.id, 'quantity', parseInt(e.target.value))}
                    />
                  </TableCell>
                  <TableCell>
                    <Input 
                      type="number"
                      min="0"
                      step="0.01"
                      value={item.unitPrice}
                      onChange={(e) => handleLineItemChange(item.id, 'unitPrice', parseFloat(e.target.value))}
                    />
                  </TableCell>
                  <TableCell>
                    <input 
                      type="checkbox" 
                      checked={item.taxable}
                      onChange={(e) => handleLineItemChange(item.id, 'taxable', e.target.checked)}
                    />
                  </TableCell>
                  <TableCell className="text-right font-medium">
                    ${(item.quantity * item.unitPrice).toFixed(2)}
                  </TableCell>
                  <TableCell>
                    <Button 
                      variant="ghost" 
                      size="icon" 
                      onClick={() => handleRemoveLineItem(item.id)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
              
              {lineItems.length === 0 && (
                <TableRow>
                  <TableCell colSpan={6} className="text-center py-4 text-muted-foreground">
                    No items added yet. Click "Add Item" to get started.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
      
      <div className="grid md:grid-cols-2 gap-6">
        <div>
          <Label htmlFor="notes">Notes</Label>
          <textarea 
            id="notes"
            className="w-full mt-1 p-2 border rounded-md min-h-[100px]"
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="Enter any notes or terms..."
          />
        </div>
        
        <Card>
          <CardContent className="p-4 space-y-4">
            <h3 className="text-lg font-medium">Summary</h3>
            
            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Subtotal:</span>
                <span>${calculateSubtotal().toFixed(2)}</span>
              </div>
              
              <div className="flex items-center justify-between">
                <Label htmlFor="tax-rate" className="text-muted-foreground">Tax Rate (%):</Label>
                <Input
                  id="tax-rate"
                  type="number"
                  min="0"
                  max="100"
                  step="0.01"
                  value={taxRate}
                  onChange={(e) => setTaxRate(parseFloat(e.target.value))}
                  className="w-20 h-8"
                />
              </div>
              
              <div className="flex justify-between">
                <span className="text-muted-foreground">Tax:</span>
                <span>${calculateTaxAmount().toFixed(2)}</span>
              </div>
              
              <div className="h-px bg-muted my-2"></div>
              
              <div className="flex justify-between font-medium">
                <span>Total:</span>
                <span>${calculateTotal().toFixed(2)}</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
