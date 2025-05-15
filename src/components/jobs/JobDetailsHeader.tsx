
import { JobStatusBadge } from "./header/JobStatusBadge";
import { ClientContactButtons } from "./header/ClientContactButtons";
import { JobActions } from "./header/JobActions";
import { JobInfoSection } from "./header/JobInfoSection";
import { CallDialog } from "./dialogs/CallDialog";
import { MessageDialog } from "./dialogs/MessageDialog";
import { InvoiceDialog } from "./dialogs/InvoiceDialog";
import { EstimateDialog } from "./dialogs/EstimateDialog";
import { PaymentDialog } from "./dialogs/PaymentDialog";
import { ExpenseDialog } from "./dialogs/ExpenseDialog";
import { useJobDetailsHeader } from "./header/useJobDetailsHeader";

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
      />
      
      <EstimateDialog 
        open={isEstimateDialogOpen} 
        onOpenChange={setIsEstimateDialogOpen} 
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
    </div>
  );
};
