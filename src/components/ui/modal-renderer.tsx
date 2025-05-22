
import React from "react";
import { useModal, ModalType } from "./modal-provider";
import { SelectionModal } from "@/components/shared/modals/SelectionModal";
import { ConfirmationModal } from "@/components/shared/modals/ConfirmationModal";
import { User } from "lucide-react";
import { TeamSelectionDialog } from "@/components/jobs/dialogs/TeamSelectionDialog";
import { AssignTechnicianDialog } from "@/components/jobs/dialogs/AssignTechnicianDialog";
import { DeleteConfirmDialog } from "@/components/jobs/dialogs/DeleteConfirmDialog";
import { PrioritySelectionDialog } from "@/components/jobs/dialogs/PrioritySelectionDialog";
import { SourceSelectionDialog } from "@/components/jobs/dialogs/SourceSelectionDialog";
import { JobTypeDialog } from "@/components/jobs/dialogs/JobTypeDialog";
import { RefundDialog } from "@/components/finance/dialogs/RefundDialog";
import { SendReminderDialog } from "@/components/jobs/dialogs/SendReminderDialog";
import { MarkAsPaidDialog } from "@/components/jobs/dialogs/MarkAsPaidDialog";
import { InvoiceModal } from "@/components/clients/client-form/InvoiceModal";
import { ConvertToInvoiceDialog } from "@/components/jobs/estimates/dialogs/ConvertToInvoiceDialog";
import { JobDetailsEditDialog } from "@/components/jobs/dialogs/JobDetailsEditDialog";

export const ModalRenderer = () => {
  const { modalType, modalProps, closeModal } = useModal();
  
  // Common props to pass to the modal
  const commonProps = {
    open: modalType !== null,
    onOpenChange: (open: boolean) => {
      if (!open) closeModal();
    },
  };

  // Render the appropriate modal based on the current modalType
  switch (modalType) {
    // For modals that haven't been refactored yet, we'll use the original components
    case "teamSelection":
      return <TeamSelectionDialog {...commonProps} {...modalProps} />;
      
    case "assignTechnician":
      return <AssignTechnicianDialog {...commonProps} {...modalProps} />;
      
    case "deleteConfirm":
      return <DeleteConfirmDialog {...commonProps} {...modalProps} />;
      
    case "prioritySelection":
      return <PrioritySelectionDialog {...commonProps} {...modalProps} />;
      
    case "sourceSelection":
      return <SourceSelectionDialog {...commonProps} {...modalProps} />;
      
    case "jobType":
      return <JobTypeDialog {...commonProps} {...modalProps} />;
      
    case "refund":
      return <RefundDialog {...commonProps} {...modalProps} />;
      
    case "sendReminder":
      return <SendReminderDialog {...commonProps} {...modalProps} />;
      
    case "markAsPaid":
      return <MarkAsPaidDialog {...commonProps} {...modalProps} />;
      
    case "invoiceCreate":
      return <InvoiceModal {...commonProps} {...modalProps} />;
      
    case "convertToInvoice":
      return <ConvertToInvoiceDialog {...commonProps} {...modalProps} />;
      
    case "jobDetailsEdit":
      return <JobDetailsEditDialog {...commonProps} {...modalProps} />;

    default:
      return null;
  }
};
