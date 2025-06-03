
import { useState, useEffect } from "react";
import { LineItem } from "../../../builder/types";
import { DocumentType } from "../../UnifiedDocumentBuilder";
import { Estimate } from "@/hooks/useEstimates";
import { Invoice } from "@/hooks/useInvoices";

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
      if (existingDocument) {
        // Load existing document data
        setNotes(existingDocument.notes || "");
        
        if (documentType === 'estimate') {
          const estimate = existingDocument as Estimate;
          setDocumentNumber(estimate.estimate_number || estimate.number || "");
        } else {
          const invoice = existingDocument as Invoice;
          setDocumentNumber(invoice.invoice_number || invoice.number || "");
        }

        // TODO: Load line items from database
        setLineItems([]);
      } else {
        // Generate new document number
        const prefix = documentType === 'estimate' ? 'EST' : 'INV';
        const timestamp = Date.now();
        setDocumentNumber(`${prefix}-${timestamp}`);
        setLineItems([]);
        setNotes("");
      }
      
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
