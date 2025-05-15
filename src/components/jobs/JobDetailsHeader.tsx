
import { JobInfoSection } from "./header/JobInfoSection";
import { JobActions } from "./header/JobActions";
import { CallDialog } from "./dialogs/CallDialog";
import { MessageDialog } from "./dialogs/MessageDialog";
import { InvoiceDialog } from "./dialogs/InvoiceDialog";
import { EstimateDialog } from "./dialogs/EstimateDialog";
import { PaymentDialog } from "./dialogs/PaymentDialog";
import { ExpenseDialog } from "./dialogs/ExpenseDialog";
import { SearchDialog } from "./dialogs/SearchDialog";
import { useJobDetailsHeader } from "./header/useJobDetailsHeader";
import { useState } from "react";

interface JobDetailsHeaderProps {
  id?: string;
}

export const JobDetailsHeader = ({ id = "JOB-1001" }: JobDetailsHeaderProps) => {
  const {
    job,
    status,
    balance,
    invoiceAmount,
    isCallDialogOpen,
    setIsCallDialogOpen,
    isMessageDialogOpen,
    setIsMessageDialogOpen,
    isInvoiceDialogOpen,
    setIsInvoiceDialogOpen,
    isEstimateDialogOpen,
    setIsEstimateDialogOpen,
    isPaymentDialogOpen,
    setIsPaymentDialogOpen,
    isExpenseDialogOpen,
    setIsExpenseDialogOpen,
    handleStatusChange,
    handleEditClient,
    handlePaymentAdded,
    handleInvoiceCreated
  } = useJobDetailsHeader(id);

  const [isSearchDialogOpen, setIsSearchDialogOpen] = useState(false);

  const clientInfo = {
    name: job.client,
    address: job.address,
    phone: job.phone,
    email: job.email
  };

  const companyInfo = {
    name: job.companyName,
    logo: job.companyLogo,
    address: job.companyAddress,
    phone: job.companyPhone,
    email: job.companyEmail,
    legalText: job.legalText
  };

  return (
    <div className="fixlyfy-card">
      <div className="p-6">
        <div className="flex flex-col md:flex-row justify-between md:items-center gap-4">
          <JobInfoSection
            job={job}
            invoiceAmount={invoiceAmount}
            balance={balance}
            status={status}
            onStatusChange={handleStatusChange}
            onCallClick={() => setIsCallDialogOpen(true)}
            onMessageClick={() => setIsMessageDialogOpen(true)}
            onEditClient={handleEditClient}
          />
          
          <JobActions
            onInvoiceClick={() => setIsInvoiceDialogOpen(true)}
            onEstimateClick={() => setIsEstimateDialogOpen(true)}
            onPaymentClick={() => setIsPaymentDialogOpen(true)}
            onExpenseClick={() => setIsExpenseDialogOpen(true)}
            onSearchClick={() => setIsSearchDialogOpen(true)}
          />
        </div>
      </div>

      {/* Dialog Components */}
      <CallDialog 
        open={isCallDialogOpen} 
        onOpenChange={setIsCallDialogOpen} 
        client={{ 
          name: job.client, 
          phone: job.phone 
        }} 
      />
      
      <MessageDialog 
        open={isMessageDialogOpen} 
        onOpenChange={setIsMessageDialogOpen} 
        client={{ name: job.client }} 
      />
      
      <InvoiceDialog 
        open={isInvoiceDialogOpen} 
        onOpenChange={setIsInvoiceDialogOpen} 
        onInvoiceCreated={handleInvoiceCreated}
        clientInfo={clientInfo}
        companyInfo={companyInfo}
      />
      
      <EstimateDialog 
        open={isEstimateDialogOpen} 
        onOpenChange={setIsEstimateDialogOpen}
        clientInfo={clientInfo}
        companyInfo={companyInfo}
      />
      
      <PaymentDialog 
        open={isPaymentDialogOpen} 
        onOpenChange={setIsPaymentDialogOpen} 
        balance={balance}
        onPaymentProcessed={handlePaymentAdded}
      />
      
      <ExpenseDialog 
        open={isExpenseDialogOpen} 
        onOpenChange={setIsExpenseDialogOpen} 
      />

      <SearchDialog
        open={isSearchDialogOpen}
        onOpenChange={setIsSearchDialogOpen}
      />
    </div>
  );
};
