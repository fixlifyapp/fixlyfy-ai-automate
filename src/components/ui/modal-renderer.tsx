
import React from "react";
import { useModal } from "./modal-provider";
// Import necessary modal components
import { EstimateFormModal } from "@/components/jobs/dialogs/EstimateFormModal";
import { InvoiceFormModal } from "@/components/jobs/dialogs/InvoiceFormModal";
import { PaymentModal } from "@/components/jobs/dialogs/PaymentModal";
import { Dialog, DialogContent } from "@/components/ui/dialog";

// Create a simple generic modal when specific modal components aren't yet implemented
const GenericModal = ({ title, description, onClose }: { title: string; description: string; onClose: () => void }) => (
  <DialogContent>
    <h2 className="text-lg font-semibold">{title}</h2>
    <p className="mt-2 text-sm text-muted-foreground">{description}</p>
    <div className="mt-4 flex justify-end">
      <button 
        className="px-4 py-2 bg-primary text-white rounded" 
        onClick={onClose}
      >
        Close
      </button>
    </div>
  </DialogContent>
);

export const ModalRenderer = () => {
  const { modalType, modalProps, closeModal } = useModal();
  
  // No modal to render
  if (!modalType) {
    return null;
  }

  // Map modal type to component
  const renderModalContent = () => {
    switch (modalType) {
      case "createEstimate":
        return (
          <EstimateFormModal 
            jobId={modalProps.jobId || ""}
            client={modalProps.client || ""}
            onSuccess={modalProps.onSuccess}
            title={modalProps.title}
            onOpenChange={(open) => !open && closeModal()} 
            open={true} 
          />
        );
      
      case "createInvoice":
        return (
          <InvoiceFormModal 
            jobId={modalProps.jobId || ""}
            client={modalProps.client || ""}
            estimateId={modalProps.estimateId}
            onSuccess={modalProps.onSuccess}
            title={modalProps.title}
            onOpenChange={(open) => !open && closeModal()} 
            open={true} 
          />
        );
        
      case "collectPayment":
        return (
          <PaymentModal 
            jobId={modalProps.jobId || ""}
            client={modalProps.client || ""}
            balance={modalProps.balance}
            onSuccess={modalProps.onSuccess}
            title={modalProps.title}
            onOpenChange={(open) => !open && closeModal()} 
            open={true} 
          />
        );
        
      case "callClient":
        return (
          <GenericModal
            title={modalProps.title || "Call Client"}
            description={modalProps.description || "Call client?"}
            onClose={closeModal}
          />
        );
        
      case "messageClient":
        return (
          <GenericModal
            title={modalProps.title || "Message Client"}
            description={modalProps.description || "Message client?"}
            onClose={closeModal}
          />
        );
      
      // Handle other modal types as they are implemented
      default:
        return (
          <GenericModal
            title={modalProps.title || "Modal"}
            description={modalProps.description || "Modal content"}
            onClose={closeModal}
          />
        );
    }
  };

  return (
    <Dialog open={!!modalType} onOpenChange={(open) => !open && closeModal()}>
      {renderModalContent()}
    </Dialog>
  );
};
