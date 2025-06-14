
import { useState, useCallback, useEffect } from "react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { Estimate } from "@/hooks/useEstimates";
import { Invoice } from "@/hooks/useInvoices";
import { Product, LineItem } from "@/components/jobs/builder/types";
import { generateNextId } from "@/utils/idGeneration";

interface InvoiceFormData {
  invoiceId?: string;
  invoiceNumber: string;
  items: Array<{
    description: string;
    quantity: number;
    unitPrice: number;
    taxable: boolean;
  }>;
  notes: string;
  status: string;
  total: number;
}

export const useInvoiceBuilder = (jobId: string) => {
  const [formData, setFormData] = useState<InvoiceFormData>({
    invoiceNumber: "",
    items: [],
    notes: "",
    status: "draft",
    total: 0
  });
  
  const [lineItems, setLineItems] = useState<LineItem[]>([]);
  const [taxRate, setTaxRate] = useState<number>(13);
  const [notes, setNotes] = useState<string>("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Generate invoice number on component mount
  useEffect(() => {
    const generateInvoiceNumber = async () => {
      try {
        const invoiceNumber = await generateNextId('invoice');
        setFormData(prev => ({
          ...prev,
          invoiceNumber
        }));
      } catch (error) {
        console.error('Error generating invoice number:', error);
        // Fallback to timestamp-based number
        const timestamp = Date.now();
        const shortNumber = timestamp.toString().slice(-4);
        setFormData(prev => ({
          ...prev,
          invoiceNumber: `I-${shortNumber}`
        }));
      }
    };

    generateInvoiceNumber();
  }, []);

  const handleAddProduct = useCallback((product: Product) => {
    const newLineItem: LineItem = {
      id: `item-${Date.now()}`,
      description: product.description || product.name,
      quantity: product.quantity || 1,
      unitPrice: product.price,
      taxable: product.taxable || true,
      discount: 0,
      ourPrice: product.ourPrice || product.ourprice || product.cost || 0,
      name: product.name,
      price: product.price,
      total: (product.quantity || 1) * product.price
    };
    
    setLineItems(prev => [...prev, newLineItem]);
  }, []);

  const handleRemoveLineItem = useCallback((id: string) => {
    setLineItems(prev => prev.filter(item => item.id !== id));
  }, []);

  const handleUpdateLineItem = useCallback((id: string, updates: Partial<LineItem>) => {
    setLineItems(prev => prev.map(item => 
      item.id === id 
        ? { ...item, ...updates, total: (updates.quantity || item.quantity) * (updates.unitPrice || item.unitPrice) }
        : item
    ));
  }, []);

  const calculateSubtotal = useCallback(() => {
    return lineItems.reduce((sum, item) => sum + (item.quantity * item.unitPrice), 0);
  }, [lineItems]);

  const calculateTotalTax = useCallback(() => {
    const subtotal = calculateSubtotal();
    return subtotal * (taxRate / 100);
  }, [calculateSubtotal, taxRate]);

  const calculateGrandTotal = useCallback(() => {
    return calculateSubtotal() + calculateTotalTax();
  }, [calculateSubtotal, calculateTotalTax]);

  const initializeFromEstimate = useCallback((estimate: Estimate) => {
    const getEstimateItems = async () => {
      try {
        const { data: lineItemsData, error } = await supabase
          .from('line_items')
          .select('*')
          .eq('parent_id', estimate.id)
          .eq('parent_type', 'estimate');
          
        if (error) throw error;
        
        const items = lineItemsData?.map((item, index) => ({
          id: item.id || `item-${index}`,
          description: item.description || "",
          quantity: item.quantity || 1,
          unitPrice: item.unit_price || 0,
          taxable: item.taxable || true,
          discount: 0,
          ourPrice: 0,
          name: item.description || "",
          price: item.unit_price || 0,
          total: (item.quantity || 1) * (item.unit_price || 0)
        })) || [];
        
        setLineItems(items);
        setNotes(estimate.notes || "");
      } catch (error) {
        console.error("Error loading estimate items:", error);
        toast.error("Failed to load estimate items");
      }
    };
    
    getEstimateItems();
  }, []);

  const initializeFromInvoice = useCallback((invoice: Invoice) => {
    const getInvoiceItems = async () => {
      try {
        const { data: lineItemsData, error } = await supabase
          .from('line_items')
          .select('*')
          .eq('parent_id', invoice.id)
          .eq('parent_type', 'invoice');
          
        if (error) throw error;
        
        const items = lineItemsData?.map((item, index) => ({
          id: item.id || `item-${index}`,
          description: item.description || "",
          quantity: item.quantity || 1,
          unitPrice: item.unit_price || 0,
          taxable: item.taxable || true,
          discount: 0,
          ourPrice: 0,
          name: item.description || "",
          price: item.unit_price || 0,
          total: (item.quantity || 1) * (item.unit_price || 0)
        })) || [];
        
        setLineItems(items);
        setNotes(invoice.notes || "");
        setFormData(prev => ({
          ...prev,
          invoiceId: invoice.id,
          invoiceNumber: invoice.number,
          status: invoice.status,
          total: invoice.total
        }));
      } catch (error) {
        console.error("Error loading invoice items:", error);
        toast.error("Failed to load invoice items");
      }
    };
    
    getInvoiceItems();
  }, []);

  const resetForm = useCallback(async () => {
    try {
      const invoiceNumber = await generateNextId('invoice');
      setFormData({
        invoiceNumber,
        items: [],
        notes: "",
        status: "draft",
        total: 0
      });
      setLineItems([]);
      setNotes("");
    } catch (error) {
      console.error('Error resetting form:', error);
      const timestamp = Date.now();
      const shortNumber = timestamp.toString().slice(-4);
      setFormData({
        invoiceNumber: `I-${shortNumber}`,
        items: [],
        notes: "",
        status: "draft",
        total: 0
      });
      setLineItems([]);
      setNotes("");
    }
  }, []);

  const saveInvoiceChanges = useCallback(async (): Promise<Invoice | null> => {
    if (isSubmitting) {
      console.log('Already submitting, skipping duplicate call');
      return null;
    }
    
    setIsSubmitting(true);
    
    try {
      console.log('💾 Starting invoice save process...');
      console.log('Job ID:', jobId);
      console.log('Form data:', formData);
      console.log('Line items:', lineItems);
      console.log('Notes:', notes);
      
      const subtotal = calculateSubtotal();
      const taxAmount = calculateTotalTax();
      const total = calculateGrandTotal();
      
      // Create invoice data object with correct column names matching the invoices table
      const invoiceData = {
        job_id: jobId,
        invoice_number: formData.invoiceNumber,
        total: total,
        subtotal: subtotal,
        tax_rate: taxRate,
        tax_amount: taxAmount,
        amount_paid: 0, // Set initial amount_paid to 0
        status: formData.status,
        notes: notes || null,
        issue_date: new Date().toISOString().split('T')[0], // Today's date in YYYY-MM-DD format
        due_date: null, // Can be set later
        items: lineItems.map(item => ({
          description: item.description,
          quantity: item.quantity,
          unitPrice: item.unitPrice,
          taxable: item.taxable,
          total: item.quantity * item.unitPrice
        }))
      };

      console.log('Invoice data to save:', invoiceData);

      let invoice;
      if (formData.invoiceId) {
        console.log('Updating existing invoice:', formData.invoiceId);
        // Update existing invoice
        const { data, error } = await supabase
          .from('invoices')
          .update(invoiceData)
          .eq('id', formData.invoiceId)
          .select()
          .single();
          
        if (error) {
          console.error('Error updating invoice:', error);
          throw error;
        }
        invoice = data;
        console.log('Invoice updated successfully:', invoice);
      } else {
        console.log('Creating new invoice...');
        // Create new invoice
        const { data, error } = await supabase
          .from('invoices')
          .insert(invoiceData)
          .select()
          .single();
          
        if (error) {
          console.error('Error creating invoice:', error);
          throw error;
        }
        invoice = data;
        console.log('Invoice created successfully:', invoice);
        
        // Update form data with the new invoice ID
        setFormData(prev => ({
          ...prev,
          invoiceId: invoice.id
        }));
      }
      
      // Handle line items - delete existing and create new ones
      if (invoice) {
        console.log('Managing line items for invoice:', invoice.id);
        
        // Delete existing line items
        const { error: deleteError } = await supabase
          .from('line_items')
          .delete()
          .eq('parent_id', invoice.id)
          .eq('parent_type', 'invoice');
          
        if (deleteError) {
          console.error('Error deleting existing line items:', deleteError);
        }
        
        // Create new line items
        if (lineItems.length > 0) {
          const lineItemsData = lineItems.map(item => ({
            parent_id: invoice.id,
            parent_type: 'invoice',
            description: item.description,
            quantity: item.quantity,
            unit_price: item.unitPrice,
            taxable: item.taxable
          }));
          
          console.log('Creating line items:', lineItemsData);
          
          const { error: insertError } = await supabase
            .from('line_items')
            .insert(lineItemsData);
            
          if (insertError) {
            console.error('Error creating line items:', insertError);
            throw insertError;
          }
          
          console.log('Line items created successfully');
        }
      }
      
      const successMessage = formData.invoiceId ? "Invoice updated successfully" : "Invoice created successfully";
      toast.success(successMessage);
      
      // Return standardized invoice object
      const standardizedInvoice: Invoice = {
        id: invoice.id,
        job_id: invoice.job_id,
        invoice_number: invoice.invoice_number,
        number: invoice.invoice_number, // Add alias for compatibility
        date: invoice.issue_date || invoice.created_at,
        issue_date: invoice.issue_date,
        due_date: invoice.due_date,
        total: invoice.total,
        subtotal: invoice.subtotal,
        tax_rate: invoice.tax_rate,
        tax_amount: invoice.tax_amount,
        amount_paid: invoice.amount_paid || 0,
        balance: (invoice.total || 0) - (invoice.amount_paid || 0),
        status: invoice.status,
        notes: invoice.notes,
        items: invoice.items || [],
        created_at: invoice.created_at,
        updated_at: invoice.updated_at
      };
      
      console.log('✅ Invoice save process completed successfully');
      return standardizedInvoice;
    } catch (error: any) {
      console.error("❌ Error saving invoice:", error);
      toast.error("Failed to save invoice: " + (error.message || "Unknown error"));
      return null;
    } finally {
      setIsSubmitting(false);
    }
  }, [jobId, formData, lineItems, notes, taxRate, calculateSubtotal, calculateTotalTax, calculateGrandTotal, isSubmitting]);

  return {
    formData,
    lineItems,
    taxRate,
    notes,
    invoiceNumber: formData.invoiceNumber,
    isSubmitting,
    setLineItems,
    setTaxRate,
    setNotes,
    handleAddProduct,
    handleRemoveLineItem,
    handleUpdateLineItem,
    calculateSubtotal,
    calculateTotalTax,
    calculateGrandTotal,
    saveInvoiceChanges,
    resetForm,
    initializeFromEstimate,
    initializeFromInvoice
  };
};
