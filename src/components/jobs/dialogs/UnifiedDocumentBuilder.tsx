
import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Save, Send, DollarSign, FileText, ArrowRight } from "lucide-react";
import { EstimateSendDialog } from "./estimate-builder/EstimateSendDialog";
import { WarrantySelectionDialog } from "./WarrantySelectionDialog";
import { UnifiedDocumentPreview } from "./unified/UnifiedDocumentPreview";
import { LineItemsManager } from "./unified/LineItemsManager";
import { useUnifiedDocumentBuilder } from "./unified/useUnifiedDocumentBuilder";
import { useJobs } from "@/hooks/useJobs";
import { toast } from "sonner";
import { Estimate } from "@/hooks/useEstimates";
import { Invoice } from "@/hooks/useInvoices";
import { Product } from "../builder/types";

export type DocumentType = "estimate" | "invoice";

interface UnifiedDocumentBuilderProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  documentType: DocumentType;
  existingDocument?: Estimate | Invoice;
  jobId: string;
  clientInfo?: any;
  onDocumentCreated?: (document: Estimate | Invoice) => void;
  onSyncToInvoice?: () => void;
}

export const UnifiedDocumentBuilder = ({
  open,
  onOpenChange,
  documentType,
  existingDocument,
  jobId,
  clientInfo,
  onDocumentCreated,
  onSyncToInvoice
}: UnifiedDocumentBuilderProps) => {
  const [activeTab, setActiveTab] = useState("items");
  const [showSendDialog, setShowSendDialog] = useState(false);
  const [showWarrantyDialog, setShowWarrantyDialog] = useState(false);
  const [selectedWarranty, setSelectedWarranty] = useState<Product | null>(null);
  const [warrantyNote, setWarrantyNote] = useState("");
  
  const { jobs } = useJobs();
  const job = jobs.find(j => j.id === jobId);

  const {
    lineItems,
    taxRate,
    notes,
    documentNumber,
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
    saveDocumentChanges,
    convertToInvoice
  } = useUnifiedDocumentBuilder({
    documentType,
    existingDocument,
    jobId,
    open,
    onSyncToInvoice
  });

  const finalClientInfo = clientInfo || job?.client || { name: '', email: '', phone: '' };

  const handleSave = async (): Promise<boolean> => {
    try {
      const savedDocument = await saveDocumentChanges();
      if (savedDocument && onDocumentCreated) {
        onDocumentCreated(savedDocument);
      }
      return !!savedDocument;
    } catch (error) {
      console.error('Error saving document:', error);
      toast.error('Failed to save document');
      return false;
    }
  };

  const handleSaveAndSend = async () => {
    const success = await handleSave();
    if (success) {
      setShowSendDialog(true);
    }
  };

  const handleSendSuccess = () => {
    setShowSendDialog(false);
    onOpenChange(false);
    toast.success(`${documentType} sent successfully!`);
  };

  const handleConvertToInvoice = async () => {
    if (documentType === 'estimate') {
      const invoice = await convertToInvoice();
      if (invoice && onDocumentCreated) {
        onDocumentCreated(invoice);
        onOpenChange(false);
        toast.success('Estimate converted to invoice successfully!');
      }
    }
  };

  const handleAddWarranty = () => {
    setShowWarrantyDialog(true);
  };

  const handleWarrantySelection = (warranty: Product | null, note: string) => {
    if (warranty) {
      setSelectedWarranty(warranty);
      setWarrantyNote(note);
      handleAddProduct(warranty);
      toast.success(`${warranty.name} added to estimate`);
    }
    setShowWarrantyDialog(false);
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(amount);
  };

  return (
    <>
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="max-w-7xl h-[90vh] flex flex-col">
          <DialogHeader className="flex-shrink-0">
            <div className="flex items-center justify-between">
              <DialogTitle className="flex items-center gap-2">
                <FileText className="h-5 w-5" />
                {existingDocument ? 'Edit' : 'Create'} {documentType === 'estimate' ? 'Estimate' : 'Invoice'}
                <Badge variant="secondary">{documentNumber}</Badge>
              </DialogTitle>
              <div className="flex items-center gap-2">
                <span className="text-lg font-semibold text-blue-600">
                  Total: {formatCurrency(calculateGrandTotal())}
                </span>
              </div>
            </div>
          </DialogHeader>

          <div className="flex-1 flex gap-6 min-h-0">
            {/* Left Panel - Form */}
            <div className="w-1/2 flex flex-col">
              <Tabs value={activeTab} onValueChange={setActiveTab} className="flex-1 flex flex-col">
                <TabsList className="grid w-full grid-cols-2">
                  <TabsTrigger value="items">Line Items</TabsTrigger>
                  <TabsTrigger value="preview">Preview</TabsTrigger>
                </TabsList>
                
                <TabsContent value="items" className="flex-1 space-y-4 overflow-y-auto">
                  <LineItemsManager
                    lineItems={lineItems}
                    taxRate={taxRate}
                    notes={notes}
                    onLineItemsChange={setLineItems}
                    onTaxRateChange={setTaxRate}
                    onNotesChange={setNotes}
                    onAddProduct={handleAddProduct}
                    onRemoveLineItem={handleRemoveLineItem}
                    onUpdateLineItem={handleUpdateLineItem}
                    calculateSubtotal={calculateSubtotal}
                    calculateTotalTax={calculateTotalTax}
                    calculateGrandTotal={calculateGrandTotal}
                    documentType={documentType}
                  />
                  
                  {/* Warranty Section for Estimates */}
                  {documentType === 'estimate' && (
                    <div className="border rounded-lg p-4 bg-amber-50 border-amber-200">
                      <div className="flex items-center justify-between mb-2">
                        <h3 className="font-medium text-amber-800">Warranty Options</h3>
                        <Button size="sm" onClick={handleAddWarranty} variant="outline">
                          Add Warranty
                        </Button>
                      </div>
                      {selectedWarranty ? (
                        <div className="text-sm text-amber-700">
                          <p><strong>{selectedWarranty.name}</strong> - {formatCurrency(selectedWarranty.price)}</p>
                          {warrantyNote && <p className="mt-1 italic">"{warrantyNote}"</p>}
                        </div>
                      ) : (
                        <p className="text-sm text-amber-600">
                          Add warranty options to provide extra value and peace of mind to your customers.
                        </p>
                      )}
                    </div>
                  )}
                </TabsContent>

                <TabsContent value="preview" className="flex-1 overflow-y-auto">
                  <UnifiedDocumentPreview
                    documentType={documentType}
                    documentNumber={documentNumber}
                    lineItems={lineItems}
                    taxRate={taxRate}
                    calculateSubtotal={calculateSubtotal}
                    calculateTotalTax={calculateTotalTax}
                    calculateGrandTotal={calculateGrandTotal}
                    notes={notes}
                    clientInfo={finalClientInfo}
                    jobId={jobId}
                  />
                </TabsContent>
              </Tabs>
            </div>

            {/* Right Panel - Live Preview */}
            <div className="w-1/2 border-l pl-6 overflow-y-auto">
              <UnifiedDocumentPreview
                documentType={documentType}
                documentNumber={documentNumber}
                lineItems={lineItems}
                taxRate={taxRate}
                calculateSubtotal={calculateSubtotal}
                calculateTotalTax={calculateTotalTax}
                calculateGrandTotal={calculateGrandTotal}
                notes={notes}
                clientInfo={finalClientInfo}
                jobId={jobId}
              />
            </div>
          </div>

          {/* Footer Actions */}
          <div className="flex-shrink-0 flex justify-between items-center pt-4 border-t">
            <div className="flex gap-2">
              {documentType === 'estimate' && existingDocument && (
                <Button 
                  onClick={handleConvertToInvoice}
                  variant="outline"
                  className="gap-2"
                  disabled={isSubmitting}
                >
                  <DollarSign className="h-4 w-4" />
                  Convert to Invoice
                </Button>
              )}
            </div>
            
            <div className="flex gap-2">
              <Button 
                variant="outline" 
                onClick={() => onOpenChange(false)}
                disabled={isSubmitting}
              >
                Cancel
              </Button>
              <Button 
                onClick={handleSave}
                variant="outline"
                disabled={isSubmitting}
                className="gap-2"
              >
                <Save className="h-4 w-4" />
                Save
              </Button>
              <Button 
                onClick={handleSaveAndSend}
                disabled={isSubmitting}
                className="gap-2"
              >
                <Send className="h-4 w-4" />
                Save & Send
                <ArrowRight className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Send Dialog */}
      <EstimateSendDialog
        open={showSendDialog}
        onOpenChange={setShowSendDialog}
        estimateNumber={documentNumber}
        contactInfo={finalClientInfo}
        clientInfo={finalClientInfo}
        jobId={jobId}
        onSuccess={handleSendSuccess}
        onCancel={() => setShowSendDialog(false)}
        onSave={handleSave}
        onAddWarranty={handleWarrantySelection}
      />

      {/* Warranty Selection Dialog */}
      <WarrantySelectionDialog
        open={showWarrantyDialog}
        onOpenChange={setShowWarrantyDialog}
        onConfirm={handleWarrantySelection}
      />
    </>
  );
};
