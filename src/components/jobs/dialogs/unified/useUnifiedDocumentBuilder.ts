
import { useState, useCallback, useEffect } from "react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { Estimate } from "@/hooks/useEstimates";
import { Invoice } from "@/hooks/useInvoices";
import { Product, LineItem } from "@/components/jobs/builder/types";
import { DocumentType } from "../UnifiedDocumentBuilder";

interface DocumentFormData {
  documentId?: string;
  documentNumber: string;
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

interface UseUnifiedDocumentBuilderProps {
  documentType: DocumentType;
  existingDocument?: Estimate | Invoice;
  jobId: string;
  open: boolean;
  onSyncToInvoice?: () => void;
}

export const useUnifiedDocumentBuilder = ({ 
  documentType, 
  existingDocument, 
  jobId, 
  open, 
  onSyncToInvoice 
}: UseUnifiedDocumentBuilderProps) => {
  const [formData, setFormData] = useState<DocumentFormData>({
    documentNumber: `${documentType === 'estimate' ? 'EST' : 'INV'}-${Date.now()}`,
    items: [],
    notes: "",
    status: "draft",
    total: 0
  });
  
  const [lineItems, setLineItems] = useState<LineItem[]>([]);
  const [taxRate, setTaxRate] = useState<number>(13);
  const [notes, setNotes] = useState<string>("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [jobData, setJobData] = useState<any>(null);

  // Smart initialization based on job data and existing documents
  useEffect(() => {
    const initializeDocument = async () => {
      try {
        // Fetch job data for smart defaults
        const { data: job } = await supabase
          .from('jobs')
          .select(`
            *,
            client:clients(*),
            estimates(*),
            invoices(*)
          `)
          .eq('id', jobId)
          .single();

        if (job) {
          setJobData(job);
          
          // Smart document number generation
          if (!existingDocument) {
            const existingDocs = documentType === 'estimate' 
              ? job.estimates || []
              : job.invoices || [];
            
            const nextNumber = existingDocs.length + 1;
            const prefix = documentType === 'estimate' ? 'EST' : 'INV';
            
            setFormData(prev => ({
              ...prev,
              documentNumber: `${prefix}-${jobId.slice(-6)}-${String(nextNumber).padStart(3, '0')}`
            }));
          }

          // Auto-populate from job description for new documents
          if (!existingDocument && job.description) {
            const smartNote = generateSmartNotes(job);
            setNotes(smartNote);
          }
        }
      } catch (error) {
        console.error('Error initializing document:', error);
      }
    };

    if (open && jobId) {
      initializeDocument();
    }
  }, [open, jobId, documentType, existingDocument]);

  // Initialize from existing document with smart conversion
  useEffect(() => {
    if (existingDocument && open) {
      const initializeFromExisting = async () => {
        try {
          // Get document number safely
          const documentNumber = documentType === 'estimate' 
            ? (existingDocument as Estimate).estimate_number || (existingDocument as Estimate).number
            : (existingDocument as Invoice).invoice_number || (existingDocument as Invoice).number;

          // Get total/amount safely
          const total = documentType === 'estimate'
            ? (existingDocument as Estimate).total || (existingDocument as Estimate).amount || 0
            : (existingDocument as Invoice).total || 0;

          // Set basic document data
          setFormData({
            documentId: existingDocument.id,
            documentNumber: documentNumber || '',
            items: [],
            notes: existingDocument.notes || "",
            status: existingDocument.status || "draft",
            total: total
          });

          setNotes(existingDocument.notes || "");

          // Fetch line items with smart enhancements
          const { data: items } = await supabase
            .from('line_items')
            .select('*')
            .eq('parent_id', existingDocument.id)
            .eq('parent_type', documentType === 'estimate' ? 'estimate' : 'invoice');

          if (items) {
            const enhancedLineItems: LineItem[] = items.map(item => ({
              id: item.id,
              description: item.description || '',
              quantity: item.quantity || 1,
              unitPrice: item.unit_price || 0,
              taxable: item.taxable !== undefined ? item.taxable : true,
              discount: 0,
              ourPrice: 0,
              name: item.description || '',
              price: item.unit_price || 0,
              total: (item.quantity || 1) * (item.unit_price || 0)
            }));

            setLineItems(enhancedLineItems);
          }

          // Smart suggestions for missing items
          if (items && items.length === 0) {
            suggestLineItems();
          }

        } catch (error) {
          console.error('Error loading existing document:', error);
          toast.error('Failed to load document data');
        }
      };

      initializeFromExisting();
    }
  }, [existingDocument, open, documentType]);

  // Calculate functions - defined early to avoid declaration order issues
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

  const calculateTotalMargin = useCallback(() => {
    return lineItems.reduce((sum, item) => {
      const itemMargin = (item.unitPrice - (item.ourPrice || 0)) * item.quantity;
      return sum + itemMargin;
    }, 0);
  }, [lineItems]);

  const calculateMarginPercentage = useCallback(() => {
    const totalRevenue = calculateSubtotal();
    const totalMargin = calculateTotalMargin();
    return totalRevenue > 0 ? (totalMargin / totalRevenue) * 100 : 0;
  }, [calculateSubtotal, calculateTotalMargin]);

  // Generate smart notes based on job data
  const generateSmartNotes = (job: any): string => {
    const notes = [];
    
    if (job.service) {
      notes.push(`Service: ${job.service}`);
    }
    
    if (job.client?.type === 'Commercial') {
      notes.push('Commercial property - Net 30 payment terms');
    }
    
    if (documentType === 'estimate') {
      notes.push('This estimate is valid for 30 days from the date of issue.');
      notes.push('Warranty information will be provided upon acceptance.');
    } else {
      notes.push('Payment due within 30 days of invoice date.');
    }

    return notes.join('\n');
  };

  // Smart line item suggestions
  const suggestLineItems = async () => {
    if (!jobData) return;

    try {
      // Get common items for this service type
      const { data: commonItems } = await supabase
        .from('products')
        .select('*')
        .ilike('name', `%${jobData.service || 'service'}%`)
        .limit(3);

      if (commonItems && commonItems.length > 0) {
        toast.success(`Found ${commonItems.length} suggested items based on service type`);
      }
    } catch (error) {
      console.error('Error getting suggestions:', error);
    }
  };

  // Enhanced conversion from estimate to invoice
  const convertToInvoice = useCallback(async (): Promise<Invoice | null> => {
    if (documentType !== 'estimate' || !existingDocument) return null;

    try {
      setIsSubmitting(true);
      
      // Generate smart invoice number
      const estimateNumber = (existingDocument as Estimate).estimate_number || (existingDocument as Estimate).number;
      const invoiceNumber = `INV-${estimateNumber?.replace('EST-', '') || Date.now()}`;
      
      // Create invoice with enhanced data
      const invoiceData = {
        job_id: jobId,
        estimate_id: existingDocument.id,
        invoice_number: invoiceNumber,
        total: calculateGrandTotal(),
        amount_paid: 0,
        balance: calculateGrandTotal(),
        status: 'unpaid',
        notes: notes || existingDocument.notes,
        due_date: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString()
      };

      const { data: invoice, error } = await supabase
        .from('invoices')
        .insert(invoiceData)
        .select()
        .single();

      if (error) throw error;

      // Copy line items to invoice
      if (lineItems.length > 0) {
        const invoiceLineItems = lineItems.map(item => ({
          parent_id: invoice.id,
          parent_type: 'invoice',
          description: item.description,
          quantity: item.quantity,
          unit_price: item.unitPrice,
          taxable: item.taxable
        }));

        await supabase
          .from('line_items')
          .insert(invoiceLineItems);
      }

      // Update estimate status
      await supabase
        .from('estimates')
        .update({ status: 'converted' })
        .eq('id', existingDocument.id);

      toast.success('Estimate successfully converted to invoice');
      
      if (onSyncToInvoice) {
        onSyncToInvoice();
      }

      return {
        id: invoice.id,
        job_id: invoice.job_id,
        invoice_number: invoice.invoice_number,
        number: invoice.invoice_number,
        date: invoice.date || invoice.created_at,
        total: invoice.total,
        amount_paid: invoice.amount_paid || 0,
        balance: invoice.balance || invoice.total,
        status: invoice.status,
        notes: invoice.notes,
        created_at: invoice.created_at,
        updated_at: invoice.updated_at
      };

    } catch (error) {
      console.error('Error converting to invoice:', error);
      toast.error('Failed to convert estimate to invoice');
      return null;
    } finally {
      setIsSubmitting(false);
    }
  }, [existingDocument, documentType, jobId, lineItems, notes, calculateGrandTotal, onSyncToInvoice]);

  // Smart product addition with pricing history
  const handleAddProduct = useCallback(async (product: Product) => {
    // Check for historical pricing
    try {
      const { data: historicalPricing } = await supabase
        .from('line_items')
        .select('unit_price')
        .eq('description', product.name)
        .order('created_at', { ascending: false })
        .limit(5);

      let suggestedPrice = product.price;
      
      if (historicalPricing && historicalPricing.length > 0) {
        // Calculate average of recent pricing
        const avgPrice = historicalPricing.reduce((sum, item) => sum + (item.unit_price || 0), 0) / historicalPricing.length;
        if (Math.abs(avgPrice - product.price) > product.price * 0.1) {
          suggestedPrice = avgPrice;
          toast.info(`Using recent pricing: $${avgPrice.toFixed(2)} (was $${product.price.toFixed(2)})`);
        }
      }

      const newLineItem: LineItem = {
        id: `item-${Date.now()}`,
        description: product.description || product.name,
        quantity: product.quantity || 1,
        unitPrice: suggestedPrice,
        taxable: product.taxable,
        discount: 0,
        ourPrice: product.ourPrice || 0,
        name: product.name,
        price: suggestedPrice,
        total: (product.quantity || 1) * suggestedPrice
      };
      
      setLineItems(prev => [...prev, newLineItem]);
    } catch (error) {
      console.error('Error adding product with smart pricing:', error);
      // Fallback to original logic
      const newLineItem: LineItem = {
        id: `item-${Date.now()}`,
        description: product.description || product.name,
        quantity: product.quantity || 1,
        unitPrice: product.price,
        taxable: product.taxable,
        discount: 0,
        ourPrice: product.ourPrice || 0,
        name: product.name,
        price: product.price,
        total: (product.quantity || 1) * product.price
      };
      
      setLineItems(prev => [...prev, newLineItem]);
    }
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

  const saveDocumentChanges = useCallback(async (): Promise<Estimate | Invoice | null> => {
    if (isSubmitting) return null;
    
    setIsSubmitting(true);
    
    try {
      const tableName = documentType === 'estimate' ? 'estimates' : 'invoices';
      
      // Create document data with proper fields for each type
      const baseDocumentData = {
        job_id: jobId,
        total: calculateGrandTotal(),
        status: formData.status,
        notes: notes
      };

      const documentData = documentType === 'estimate' 
        ? {
            ...baseDocumentData,
            estimate_number: formData.documentNumber
          }
        : {
            ...baseDocumentData,
            invoice_number: formData.documentNumber,
            amount_paid: 0,
            balance: calculateGrandTotal()
          };

      let document;
      if (formData.documentId) {
        // Update existing document
        const { data, error } = await supabase
          .from(tableName)
          .update(documentData)
          .eq('id', formData.documentId)
          .select()
          .single();
          
        if (error) throw error;
        document = data;
      } else {
        // Create new document
        const { data, error } = await supabase
          .from(tableName)
          .insert(documentData)
          .select()
          .single();
          
        if (error) throw error;
        document = data;
      }
      
      // Handle line items
      if (document) {
        // Delete existing line items
        await supabase
          .from('line_items')
          .delete()
          .eq('parent_id', document.id)
          .eq('parent_type', documentType);
        
        // Create new line items
        if (lineItems.length > 0) {
          const lineItemsData = lineItems.map(item => ({
            parent_id: document.id,
            parent_type: documentType,
            description: item.description,
            quantity: item.quantity,
            unit_price: item.unitPrice,
            taxable: item.taxable
          }));
          
          await supabase
            .from('line_items')
            .insert(lineItemsData);
        }
      }
      
      toast.success(`${documentType === 'estimate' ? 'Estimate' : 'Invoice'} ${formData.documentId ? 'updated' : 'created'} successfully`);
      
      // Return standardized format
      if (documentType === 'estimate') {
        return {
          id: document.id,
          job_id: document.job_id,
          estimate_number: document.estimate_number,
          number: document.estimate_number,
          date: document.date || document.created_at,
          total: document.total,
          amount: document.total,
          status: document.status,
          notes: document.notes,
          created_at: document.created_at,
          updated_at: document.updated_at
        };
      } else {
        return {
          id: document.id,
          job_id: document.job_id,
          invoice_number: document.invoice_number,
          number: document.invoice_number,
          date: document.date || document.created_at,
          total: document.total,
          amount_paid: document.amount_paid || 0,
          balance: (document.total || 0) - (document.amount_paid || 0),
          status: document.status,
          notes: document.notes,
          created_at: document.created_at,
          updated_at: document.updated_at
        };
      }
    } catch (error) {
      console.error(`Error saving ${documentType}:`, error);
      toast.error(`Failed to save ${documentType}`);
      return null;
    } finally {
      setIsSubmitting(false);
    }
  }, [documentType, jobId, formData, lineItems, notes, calculateGrandTotal, isSubmitting]);

  return {
    formData,
    lineItems,
    taxRate,
    notes,
    documentNumber: formData.documentNumber,
    isSubmitting,
    jobData,
    setLineItems,
    setTaxRate,
    setNotes,
    handleAddProduct,
    handleRemoveLineItem,
    handleUpdateLineItem,
    calculateSubtotal,
    calculateTotalTax,
    calculateGrandTotal,
    calculateTotalMargin,
    calculateMarginPercentage,
    saveDocumentChanges,
    convertToInvoice
  };
};
