
import { useState } from "react";
import { Invoice } from "@/hooks/useInvoices";
import { Estimate } from "@/hooks/useEstimates";
import { useJobData } from "./useJobData";

interface UseUnifiedDocumentViewerProps {
  document: Invoice | Estimate;
  documentType: "invoice" | "estimate";
  jobId: string;
  onConvertToInvoice?: (estimate: Estimate) => void;
  onDocumentUpdated?: () => void;
}

export const useUnifiedDocumentViewer = ({
  document,
  documentType,
  jobId,
  onConvertToInvoice,
  onDocumentUpdated
}: UseUnifiedDocumentViewerProps) => {
  const [showSendDialog, setShowSendDialog] = useState(false);
  const [showEditDialog, setShowEditDialog] = useState(false);
  const [showConvertDialog, setShowConvertDialog] = useState(false);

  const { clientInfo, jobAddress, loading } = useJobData(jobId);
  
  // Calculate line items and totals
  const lineItems = Array.isArray(document.items) ? document.items : [];
  
  // Handle tax rate properly for both invoice and estimate
  const taxRate = documentType === "estimate" 
    ? (document as Estimate).tax_rate || 0
    : (document as Invoice).tax_rate || 0;
  
  const calculateSubtotal = () => {
    return lineItems.reduce((sum, item) => sum + (item.quantity * item.unitPrice), 0);
  };

  const calculateTotalTax = () => {
    const subtotal = calculateSubtotal();
    return subtotal * (taxRate / 100);
  };

  const calculateGrandTotal = () => {
    return calculateSubtotal() + calculateTotalTax();
  };

  const getClientInfo = () => {
    if (clientInfo) {
      return {
        name: clientInfo.name || '',
        email: clientInfo.email || '',
        phone: clientInfo.phone || ''
      };
    }
    return { name: '', email: '', phone: '' };
  };

  const handleEdit = () => {
    setShowEditDialog(true);
  };

  const handleSend = () => {
    setShowSendDialog(true);
  };

  const handleConvert = () => {
    if (documentType === "estimate" && onConvertToInvoice) {
      setShowConvertDialog(true);
    }
  };

  const handleSendSuccess = () => {
    setShowSendDialog(false);
    if (onDocumentUpdated) {
      onDocumentUpdated();
    }
  };

  const handleEditSuccess = () => {
    setShowEditDialog(false);
    if (onDocumentUpdated) {
      onDocumentUpdated();
    }
  };

  const handleConvertSuccess = () => {
    setShowConvertDialog(false);
    if (onDocumentUpdated) {
      onDocumentUpdated();
    }
  };

  const documentNumber = documentType === "invoice" 
    ? (document as Invoice).invoice_number 
    : (document as Estimate).estimate_number;

  return {
    showSendDialog,
    setShowSendDialog,
    showEditDialog,
    setShowEditDialog,
    showConvertDialog,
    setShowConvertDialog,
    clientInfo,
    jobAddress,
    loading,
    lineItems,
    taxRate,
    documentNumber,
    calculateSubtotal,
    calculateTotalTax,
    calculateGrandTotal,
    getClientInfo,
    handleEdit,
    handleSend,
    handleConvert,
    handleSendSuccess,
    handleEditSuccess,
    handleConvertSuccess
  };
};
