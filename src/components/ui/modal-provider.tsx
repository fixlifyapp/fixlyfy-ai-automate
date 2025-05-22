
import React, { createContext, useContext, useState, ReactNode } from "react";
import { Dialog } from "@/components/ui/dialog";
import { ModalRenderer } from "./modal-renderer";

// Define modal types
export type ModalType = 
  | "teamSelection" 
  | "assignTechnician" 
  | "deleteConfirm" 
  | "prioritySelection" 
  | "sourceSelection" 
  | "jobType" 
  | "refund" 
  | "sendReminder"
  | "markAsPaid"
  | "invoiceCreate"
  | "convertToInvoice"
  | "jobDetailsEdit";

// Base props that all modals will have
export interface BaseModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

// Define the structure for our modal context
interface ModalContextType {
  openModal: <T extends Record<string, any>>(type: ModalType, props?: T) => void;
  closeModal: () => void;
  modalType: ModalType | null;
  modalProps: Record<string, any>;
}

const ModalContext = createContext<ModalContextType | undefined>(undefined);

export const useModal = () => {
  const context = useContext(ModalContext);
  if (context === undefined) {
    throw new Error("useModal must be used within a ModalProvider");
  }
  return context;
};

export const ModalProvider = ({ children }: { children: ReactNode }) => {
  const [modalType, setModalType] = useState<ModalType | null>(null);
  const [modalProps, setModalProps] = useState<Record<string, any>>({});

  const openModal = <T extends Record<string, any>>(type: ModalType, props?: T) => {
    setModalType(type);
    setModalProps(props || {});
  };

  const closeModal = () => {
    setModalType(null);
    setModalProps({});
  };

  return (
    <ModalContext.Provider value={{ openModal, closeModal, modalType, modalProps }}>
      {children}
      <ModalRenderer />
    </ModalContext.Provider>
  );
};
