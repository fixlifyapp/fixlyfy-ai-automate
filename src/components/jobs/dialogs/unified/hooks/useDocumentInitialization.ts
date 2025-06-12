
import { useState, useEffect } from 'react';
import { LineItem } from '@/components/jobs/builder/types';
import { DocumentType } from '../../UnifiedDocumentBuilder';
import { Estimate } from '@/hooks/useEstimates';
import { Invoice } from '@/hooks/useInvoices';
import { extractLineItems } from '@/types/database-types';
import { generateNextId } from '@/utils/idGeneration';

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
  const [taxRate, setTaxRate] = useState(0);
  const [notes, setNotes] = useState('');
  const [documentNumber, setDocumentNumber] = useState('');
  const [isInitialized, setIsInitialized] = useState(false);

  useEffect(() => {
    if (open) {
      if (existingDocument) {
        // Initialize from existing document
        setLineItems(extractLineItems(existingDocument.items));
        setTaxRate(existingDocument.tax_rate || 0);
        setNotes(existingDocument.notes || '');
        
        if (documentType === 'estimate') {
          setDocumentNumber((existingDocument as Estimate).estimate_number || '');
        } else {
          setDocumentNumber((existingDocument as Invoice).invoice_number || '');
        }
      } else {
        // Initialize new document
        setLineItems([]);
        setTaxRate(0.1); // Default 10% tax
        setNotes('');
        
        // Generate document number
        const generateNumber = async () => {
          try {
            const prefix = documentType === 'estimate' ? 'EST' : 'INV';
            const number = await generateNextId(documentType);
            setDocumentNumber(number || `${prefix}-${Date.now()}`);
          } catch (error) {
            console.error('Error generating document number:', error);
            const prefix = documentType === 'estimate' ? 'EST' : 'INV';
            setDocumentNumber(`${prefix}-${Date.now()}`);
          }
        };
        
        generateNumber();
      }
      
      setIsInitialized(true);
    }
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
