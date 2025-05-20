
import { useState, useEffect } from "react";
import { useEstimateInfo } from "@/components/jobs/estimates/hooks/useEstimateInfo";
import { EstimateEditor } from "./EstimateEditor";
import { LineItemsTable } from "./LineItemsTable";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { LineItem } from "@/components/jobs/builder/types";

interface EstimateFormProps {
  estimateId: string | null;
  jobId: string;
  onSyncToInvoice?: () => void;
}

export function EstimateForm({ estimateId, jobId, onSyncToInvoice }: EstimateFormProps) {
  const [estimate, setEstimate] = useState<any>(null);
  const [lineItems, setLineItems] = useState<LineItem[]>([]);
  const [notes, setNotes] = useState("");
  const [taxRate, setTaxRate] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [estimateNumber, setEstimateNumber] = useState("");
  const estimateInfo = useEstimateInfo();

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
            .from('estimate_items')
            .select('*')
            .eq('estimate_id', estimateId);
          
          if (itemsError) throw itemsError;
          
          if (estimateData) {
            setEstimate(estimateData);
            setEstimateNumber(estimateData.estimate_number);
            setNotes(estimateData.notes || "");
            setTaxRate(estimateData.tax_amount ? 
              (estimateData.tax_amount / estimateData.subtotal) * 100 : 0);
              
            if (itemsData && itemsData.length > 0) {
              // Transform to LineItem format
              const items: LineItem[] = itemsData.map(item => ({
                id: item.id,
                name: item.name,
                description: item.description || "",
                quantity: item.quantity,
                price: parseFloat(item.unit_price),
                unitPrice: parseFloat(item.unit_price),
                total: parseFloat(item.total),
                taxable: true,
                tax: parseFloat(item.tax_rate) || 0,
                discount: 0
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
        const newEstimateNumber = estimateInfo.generateUniqueNumber('EST');
        setEstimateNumber(newEstimateNumber);
        setEstimate({
          job_id: jobId,
          estimate_number: newEstimateNumber,
          status: 'draft',
          subtotal: 0,
          tax_amount: 0,
          total: 0
        });
        setLineItems([]);
        setNotes("");
        setTaxRate(0);
      }
      
      setIsLoading(false);
    };
    
    fetchEstimateData();
  }, [estimateId, jobId, estimateInfo]);

  // Handler to add empty line item
  const handleAddEmptyLineItem = () => {
    const newItem: LineItem = {
      id: `new-${Date.now()}`,
      name: "New Item",
      description: "",
      price: 0,
      unitPrice: 0,
      quantity: 1,
      taxable: true,
      total: 0,
      tax: 0,
      discount: 0
    };
    
    setLineItems(prev => [...prev, newItem]);
  };

  // Handler to add custom line
  const handleAddCustomLine = (name: string, price: number, quantity: number, taxable: boolean) => {
    const newItem: LineItem = {
      id: `custom-${Date.now()}`,
      name,
      description: name,
      price,
      unitPrice: price,
      quantity,
      taxable,
      total: price * quantity,
      tax: 0,
      discount: 0
    };
    
    setLineItems(prev => [...prev, newItem]);
  };

  // Handler to update line
  const handleUpdateLine = (lineId: string, field: string, value: any) => {
    setLineItems(prev =>
      prev.map(item => {
        if (item.id === lineId) {
          const updatedItem = { ...item, [field]: value };
          
          // Recalculate total if quantity or price changes
          if (field === 'quantity' || field === 'price' || field === 'unitPrice') {
            const price = updatedItem.unitPrice !== undefined ? updatedItem.unitPrice : updatedItem.price;
            updatedItem.total = price * updatedItem.quantity;
          }
          
          return updatedItem;
        }
        return item;
      })
    );
  };

  // Handler to remove line
  const handleRemoveLine = (lineId: string) => {
    setLineItems(prev => prev.filter(item => item.id !== lineId));
  };

  // Calculate subtotal
  const calculateSubtotal = () => {
    return lineItems.reduce((sum, item) => {
      const price = item.unitPrice !== undefined ? item.unitPrice : item.price;
      return sum + (price * item.quantity);
    }, 0);
  };

  // Calculate tax amount
  const calculateTaxAmount = () => {
    const taxableAmount = lineItems
      .filter(item => item.taxable)
      .reduce((sum, item) => {
        const price = item.unitPrice !== undefined ? item.unitPrice : item.price;
        return sum + (price * item.quantity);
      }, 0);
    
    return taxableAmount * (taxRate / 100);
  };

  // Calculate total
  const calculateTotal = () => {
    return calculateSubtotal() + calculateTaxAmount();
  };

  // Handler for note changes
  const handleNotesChange = (notes: string) => {
    setNotes(notes);
  };

  // Handler for tax rate changes
  const handleTaxRateChange = (rate: string) => {
    setTaxRate(parseFloat(rate) || 0);
  };

  // Handler to save estimate
  const handleSave = async () => {
    try {
      const subtotal = calculateSubtotal();
      const taxAmount = calculateTaxAmount();
      const total = calculateTotal();
      
      if (estimateId) {
        // Update existing estimate
        const { error: updateError } = await supabase
          .from('estimates')
          .update({
            notes,
            subtotal,
            tax_amount: taxAmount,
            total
          })
          .eq('id', estimateId);
        
        if (updateError) throw updateError;
        
        // Delete existing line items to replace with updated ones
        const { error: deleteError } = await supabase
          .from('estimate_items')
          .delete()
          .eq('estimate_id', estimateId);
        
        if (deleteError) throw deleteError;
        
        // Insert updated line items
        const itemsToInsert = lineItems.map(item => {
          const price = item.unitPrice !== undefined ? item.unitPrice : item.price;
          const itemTotal = price * item.quantity;
          const taxRate = item.taxable ? taxRate : 0;
          const taxAmount = item.taxable ? itemTotal * (taxRate / 100) : 0;
          
          return {
            estimate_id: estimateId,
            product_id: item.id.startsWith('new-') || item.id.startsWith('custom-') ? null : item.id,
            name: item.name,
            description: item.description,
            quantity: item.quantity,
            unit_price: price,
            tax_rate: taxRate,
            tax_amount: taxAmount,
            total: itemTotal
          };
        });
        
        const { error: insertError } = await supabase
          .from('estimate_items')
          .insert(itemsToInsert);
        
        if (insertError) throw insertError;
        
        toast.success("Estimate updated successfully");
      } else {
        // Create new estimate
        const { data: newEstimate, error: createError } = await supabase
          .from('estimates')
          .insert({
            job_id: jobId,
            estimate_number: estimateNumber,
            notes,
            subtotal,
            tax_amount: taxAmount,
            total,
            status: 'draft'
          })
          .select()
          .single();
        
        if (createError) throw createError;
        
        // Insert line items
        const itemsToInsert = lineItems.map(item => {
          const price = item.unitPrice !== undefined ? item.unitPrice : item.price;
          const itemTotal = price * item.quantity;
          const taxRate = item.taxable ? taxRate : 0;
          const taxAmount = item.taxable ? itemTotal * (taxRate / 100) : 0;
          
          return {
            estimate_id: newEstimate.id,
            product_id: item.id.startsWith('new-') || item.id.startsWith('custom-') ? null : item.id,
            name: item.name,
            description: item.description,
            quantity: item.quantity,
            unit_price: price,
            tax_rate: taxRate,
            tax_amount: taxAmount,
            total: itemTotal
          };
        });
        
        if (itemsToInsert.length > 0) {
          const { error: insertError } = await supabase
            .from('estimate_items')
            .insert(itemsToInsert);
          
          if (insertError) throw insertError;
        }
        
        toast.success("Estimate created successfully");
      }
      
      // Close dialog by triggering onSyncToInvoice
      if (onSyncToInvoice) {
        onSyncToInvoice();
      }
    } catch (error) {
      console.error('Error saving estimate:', error);
      toast.error('Failed to save estimate');
    }
  };

  // Custom product handler (for future implementation)
  const handleAddProduct = (product: any) => {
    const newItem: LineItem = {
      id: product.id || `product-${Date.now()}`,
      name: product.name,
      description: product.description || product.name,
      price: product.price,
      unitPrice: product.price,
      quantity: 1,
      taxable: product.taxable !== undefined ? product.taxable : true,
      total: product.price,
      tax: 0,
      discount: 0
    };
    
    setLineItems(prev => [...prev, newItem]);
  };

  // Helper function to handle the invoice sync
  const handleSyncToInvoice = async () => {
    if (!estimate) return;
    
    try {
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
          subtotal: calculateSubtotal(),
          tax_amount: calculateTaxAmount(),
          total,
          balance: total,
          status: 'unpaid'
        })
        .select()
        .single();
      
      if (error) throw error;
      
      // Convert line items to invoice items
      const invoiceItems = lineItems.map(item => {
        const price = item.unitPrice !== undefined ? item.unitPrice : item.price;
        const itemTotal = price * item.quantity;
        const taxRate = item.taxable ? taxRate : 0;
        const taxAmount = item.taxable ? itemTotal * (taxRate / 100) : 0;
        
        return {
          invoice_id: newInvoice.id,
          product_id: item.id.startsWith('new-') || item.id.startsWith('custom-') ? null : item.id,
          name: item.name,
          description: item.description,
          quantity: item.quantity,
          unit_price: price,
          tax_rate: taxRate,
          tax_amount: taxAmount,
          total: itemTotal
        };
      });
      
      if (invoiceItems.length > 0) {
        const { error: insertError } = await supabase
          .from('invoice_items')
          .insert(invoiceItems);
        
        if (insertError) throw insertError;
      }
      
      // Update estimate status if it exists
      if (estimateId) {
        const { error: updateError } = await supabase
          .from('estimates')
          .update({ status: 'converted' })
          .eq('id', estimateId);
        
        if (updateError) throw updateError;
      }
      
      toast.success("Estimate converted to invoice successfully");
      
      // Notify parent component
      if (onSyncToInvoice) {
        onSyncToInvoice();
      }
    } catch (error) {
      console.error('Error syncing to invoice:', error);
      toast.error('Failed to convert estimate to invoice');
    }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <div>
        <EstimateEditor
          estimateNumber={estimateNumber}
          lineItems={lineItems}
          notes={notes}
          taxRate={taxRate}
          onNotesChange={handleNotesChange}
          onTaxRateChange={handleTaxRateChange}
          onAddProduct={handleAddProduct}
          onRemoveLineItem={handleRemoveLine}
          onUpdateLineItem={handleUpdateLine}
          onEditLineItem={() => false}
          onAddEmptyLineItem={handleAddEmptyLineItem}
          onAddCustomLine={handleAddCustomLine}
          onSyncToInvoice={handleSyncToInvoice}
          calculateSubtotal={calculateSubtotal}
          calculateTotalTax={calculateTaxAmount}
          calculateGrandTotal={calculateTotal}
          calculateTotalMargin={() => 0} // Placeholder for margin calculation
          calculateMarginPercentage={() => 0} // Placeholder for margin percentage
        />
      </div>
      <div>
        <LineItemsTable
          lineItems={lineItems}
          onRemoveLineItem={handleRemoveLine}
          onUpdateLineItem={handleUpdateLine}
          onEditLineItem={() => false}
        />
        <div className="mt-6 flex gap-3">
          <button 
            onClick={handleSave} 
            className="flex-1 bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
          >
            {estimateId ? "Update Estimate" : "Create Estimate"}
          </button>
          {onSyncToInvoice && (
            <button 
              onClick={handleSyncToInvoice} 
              className="flex-1 bg-green-500 hover:bg-green-700 text-white font-bold py-2 px-4 rounded"
            >
              Sync to Invoice
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
