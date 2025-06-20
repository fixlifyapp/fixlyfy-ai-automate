
import { useState, useEffect } from "react";
import { LineItem } from "../../../builder/types";
import { DocumentType } from "../../UnifiedDocumentBuilder";
import { Estimate } from "@/hooks/useEstimates";
import { Invoice } from "@/hooks/useInvoices";
import { supabase } from "@/integrations/supabase/client";

interface UseDocumentInitializationProps {
  documentType: DocumentType;
  existingDocument?: Estimate | Invoice;
  jobId: string;
  open: boolean;
}

export const useDocumentInitialization = ({
  documentType,
  existingDocument,
  jobId,
  open
}: UseDocumentInitializationProps) => {
  const [lineItems, setLineItems] = useState<LineItem[]>([]);
  const [taxRate, setTaxRate] = useState(8.5);
  const [notes, setNotes] = useState("");
  const [documentNumber, setDocumentNumber] = useState("");
  const [isInitialized, setIsInitialized] = useState(false);

  // Initialize document data when dialog opens or existing document changes
  useEffect(() => {
    if (!open) {
      setIsInitialized(false);
      return;
    }

    const initializeDocument = async () => {
      console.log("=== INITIALIZING DOCUMENT ===");
      console.log("Document type:", documentType);
      console.log("Existing document:", existingDocument);
      
      if (existingDocument) {
        // Load existing document data
        setNotes(existingDocument.notes || "");
        
        if (documentType === 'estimate') {
          const estimate = existingDocument as Estimate;
          setDocumentNumber(estimate.estimate_number || estimate.number || "");
        } else if (documentType === 'invoice' && 'estimate_number' in existingDocument) {
          // Converting from estimate - generate new invoice number
          const estimate = existingDocument as Estimate;
          const invoiceNumber = `INV-${estimate.estimate_number?.replace('EST-', '') || Date.now()}`;
          setDocumentNumber(invoiceNumber);
        } else {
          const invoice = existingDocument as Invoice;
          setDocumentNumber(invoice.invoice_number || invoice.number || "");
        }

        // Load line items from database
        console.log("Loading line items for existing document:", existingDocument.id);
        try {
          // Determine the parent type to query
          let queryParentType = documentType;
          
          // If we're creating an invoice from an estimate, load estimate line items
          if (documentType === 'invoice' && existingDocument && 'estimate_number' in existingDocument) {
            queryParentType = 'estimate';
            console.log("Converting from estimate - loading estimate line items");
          }
          
          const { data: items, error } = await supabase
            .from('line_items')
            .select('*')
            .eq('parent_type', queryParentType)
            .eq('parent_id', existingDocument.id);

          if (error) {
            console.error("Error loading line items:", error);
          } else if (items) {
            console.log(`Loaded ${items.length} line items from ${queryParentType}`);
            // Transform database items to LineItem format
            const transformedItems: LineItem[] = items.map(item => ({
              id: `temp-${Date.now()}-${Math.random()}`, // Generate new IDs for invoice items
              description: item.description || '',
              quantity: item.quantity || 1,
              unitPrice: Number(item.unit_price) || 0,
              taxable: item.taxable !== false,
              discount: 0,
              ourPrice: 0,
              name: item.description || '',
              price: Number(item.unit_price) || 0,
              total: (item.quantity || 1) * (Number(item.unit_price) || 0)
            }));
            setLineItems(transformedItems);
          }
        } catch (error) {
          console.error("Error fetching line items:", error);
        }
      } else {
        // Generate new document number
        const prefix = documentType === 'estimate' ? 'EST' : 'INV';
        const timestamp = Date.now();
        setDocumentNumber(`${prefix}-${timestamp}`);
        setLineItems([]);
        setNotes("");
      }
      
      console.log("Document initialization completed");
      setIsInitialized(true);
    };

    initializeDocument();
  }, [open, existingDocument, documentType]);

  return {
    lineItems,
    setLineItems,
    taxRate,
    setTaxRate,
    notes,
    setNotes,
    documentNumber,
    setDocumentNumber,
    isInitialized
  };
};
