
import React from "react";
import { useModal } from "./modal-provider";
import { ConfirmationModal } from "@/components/shared/modals/ConfirmationModal";
import { TeamSelectionDialog } from "@/components/jobs/dialogs/TeamSelectionDialog";
import { AssignTechnicianDialog } from "@/components/jobs/dialogs/AssignTechnicianDialog";
import { DeleteConfirmDialog } from "@/components/jobs/dialogs/DeleteConfirmDialog";
import { PrioritySelectionDialog } from "@/components/jobs/dialogs/refactored/PrioritySelectionDialog";
import { SourceSelectionDialog } from "@/components/jobs/dialogs/SourceSelectionDialog";
import { JobTypeDialog } from "@/components/jobs/dialogs/JobTypeDialog";
import { SendReminderDialog } from "@/components/jobs/dialogs/SendReminderDialog";
import { MarkAsPaidDialog } from "@/components/jobs/dialogs/MarkAsPaidDialog";
import { JobDetailsEditDialog } from "@/components/jobs/dialogs/JobDetailsEditDialog";
import { CallDialog } from "@/components/jobs/dialogs/CallDialog";

export const ModalRenderer = () => {
  const { modalType, modalProps, closeModal } = useModal();

  // Common props to pass to the modal
  const commonProps = {
    open: modalType !== null,
    onOpenChange: (open: boolean) => {
      if (!open) closeModal();
    }
  };

  // Early return if no modal type
  if (!modalType) return null;

  // Render the appropriate modal based on the current modalType
  switch (modalType) {
    case "teamSelection":
      return (
        <TeamSelectionDialog
          {...commonProps}
          {...modalProps}
          initialTeam={modalProps.initialTeam || ""}
          onSave={modalProps.onSave || (() => {})}
        />
      );

    case "assignTechnician":
      return (
        <AssignTechnicianDialog
          {...commonProps}
          {...modalProps}
          selectedJobs={modalProps.selectedJobs || []}
          onSuccess={modalProps.onSuccess || (() => {})}
        />
      );

    case "deleteConfirm":
      return (
        <DeleteConfirmDialog
          {...commonProps}
          {...modalProps}
          title={modalProps.title || "Confirm Delete"}
          description={modalProps.description || "Are you sure you want to delete this item?"}
          onConfirm={modalProps.onConfirm || (() => {})}
        />
      );

    case "callClient":
      return (
        <CallDialog
          {...commonProps}
          {...modalProps}
          client={{
            name: modalProps.clientName || "Client",
            phone: modalProps.phone
          }}
        />
      );

    case "messageClient":
      return (
        <ConfirmationModal
          {...commonProps}
          {...modalProps}
          title={modalProps.title || "Message Client"}
          description={modalProps.description || "Send a message to this client?"}
          onConfirm={() => {
            if (modalProps.phone) {
              window.open(`sms:${modalProps.phone}`);
            }
          }}
          variant="success"
          confirmText="Send Message"
        />
      );

    case "prioritySelection":
      return <PrioritySelectionDialog />;

    case "sourceSelection":
      return (
        <SourceSelectionDialog
          {...commonProps}
          {...modalProps}
          initialSource={modalProps.initialSource || ""}
          onSave={modalProps.onSave || (() => {})}
        />
      );

    case "jobType":
      return (
        <JobTypeDialog
          {...commonProps}
          {...modalProps}
          initialType={modalProps.initialType || ""}
          onSave={modalProps.onSave || (() => {})}
        />
      );

    case "sendReminder":
      return (
        <SendReminderDialog
          {...commonProps}
          {...modalProps}
          selectedJobs={modalProps.selectedJobs || []}
          onSuccess={modalProps.onSuccess || (() => {})}
        />
      );

    case "markAsPaid":
      return (
        <MarkAsPaidDialog
          {...commonProps}
          {...modalProps}
          selectedJobs={modalProps.selectedJobs || []}
          onSuccess={modalProps.onSuccess || (() => {})}
        />
      );

    case "jobDetailsEdit":
      return (
        <JobDetailsEditDialog
          {...commonProps}
          {...modalProps}
          initialDescription={modalProps.initialDescription || ""}
          onSave={modalProps.onSave || (() => {})}
        />
      );

    default:
      return null;
  }
};
