
import { Card } from "@/components/ui/card";
import { useJobDetailsHeader } from "@/components/jobs/header/useJobDetailsHeader";
import { useParams } from "react-router-dom";
import { JobInfoSection } from "@/components/jobs/header/JobInfoSection";
import { JobActions } from "@/components/jobs/header/JobActions";
import { CallDialog } from "@/components/jobs/dialogs/CallDialog";
import { MessageDialog } from "@/components/jobs/dialogs/MessageDialog";
import { InvoiceDialog } from "@/components/jobs/dialogs/InvoiceDialog";
import { EstimateDialog } from "@/components/jobs/dialogs/EstimateDialog";

export const JobDetailsHeader = () => {
  const { id } = useParams();
  const jobHeaderData = useJobDetailsHeader(id || "");
  
  return (
    <div className="p-6">
      <div className="flex flex-col md:flex-row justify-between gap-4 md:items-start">
        <JobInfoSection 
          job={jobHeaderData.job}
          invoiceAmount={jobHeaderData.invoiceAmount}
          balance={jobHeaderData.balance}
          status={jobHeaderData.status}
          onStatusChange={jobHeaderData.handleStatusChange}
          onCallClick={() => jobHeaderData.setIsCallDialogOpen(true)}
          onMessageClick={() => jobHeaderData.setIsMessageDialogOpen(true)}
          onEditClient={jobHeaderData.handleEditClient}
        />
        
        <JobActions 
          onInvoiceClick={() => jobHeaderData.setIsInvoiceDialogOpen(true)}
          onEstimateClick={() => jobHeaderData.setIsEstimateDialogOpen(true)}
          hasEstimate={jobHeaderData.hasEstimate}
          onSyncEstimateToInvoice={jobHeaderData.handleSyncEstimateToInvoice}
        />
      </div>

      <CallDialog 
        open={jobHeaderData.isCallDialogOpen} 
        onOpenChange={jobHeaderData.setIsCallDialogOpen}
        phoneNumber={jobHeaderData.job.phone}
      />
      
      <MessageDialog 
        open={jobHeaderData.isMessageDialogOpen} 
        onOpenChange={jobHeaderData.setIsMessageDialogOpen}
        clientName={jobHeaderData.job.client}
        phoneNumber={jobHeaderData.job.phone}
      />
      
      <InvoiceDialog 
        open={jobHeaderData.isInvoiceDialogOpen} 
        onOpenChange={jobHeaderData.setIsInvoiceDialogOpen}
        jobId={id || ""}
        onInvoiceCreated={jobHeaderData.handleInvoiceCreated}
      />
      
      <EstimateDialog 
        open={jobHeaderData.isEstimateDialogOpen} 
        onOpenChange={jobHeaderData.setIsEstimateDialogOpen}
        jobId={id || ""}
        onEstimateCreated={jobHeaderData.handleEstimateCreated}
      />
    </div>
  );
};
