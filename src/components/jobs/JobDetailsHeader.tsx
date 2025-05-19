
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
      <div className="flex flex-col md:flex-row justify-between gap-4 md:items-center">
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
        
        <div>
          <JobActions 
            onInvoiceClick={() => jobHeaderData.setIsInvoiceDialogOpen(true)}
            onEstimateClick={() => jobHeaderData.setIsEstimateDialogOpen(true)}
            hasEstimate={jobHeaderData.hasEstimate}
            onSyncEstimateToInvoice={jobHeaderData.handleSyncEstimateToInvoice}
            previousEstimates={jobHeaderData.previousEstimates}
            previousInvoices={jobHeaderData.previousInvoices}
            onLoadPreviousEstimate={() => jobHeaderData.setIsLoadPreviousEstimateDialogOpen(true)}
            onLoadPreviousInvoice={() => jobHeaderData.setIsLoadPreviousInvoiceDialogOpen(true)}
          />
        </div>
      </div>

      <CallDialog 
        open={jobHeaderData.isCallDialogOpen} 
        onOpenChange={jobHeaderData.setIsCallDialogOpen}
        client={{
          name: jobHeaderData.job.client,
          phone: jobHeaderData.job.phone
        }}
      />
      
      <MessageDialog 
        open={jobHeaderData.isMessageDialogOpen} 
        onOpenChange={jobHeaderData.setIsMessageDialogOpen}
        client={{
          name: jobHeaderData.job.client,
          phone: jobHeaderData.job.phone
        }}
      />
      
      <InvoiceDialog 
        open={jobHeaderData.isInvoiceDialogOpen} 
        onOpenChange={jobHeaderData.setIsInvoiceDialogOpen}
        onInvoiceCreated={jobHeaderData.handleInvoiceCreated}
        clientInfo={{
          name: jobHeaderData.job.client,
          address: jobHeaderData.job.address,
          phone: jobHeaderData.job.phone,
          email: jobHeaderData.job.email
        }}
        companyInfo={{
          name: jobHeaderData.job.companyName,
          logo: jobHeaderData.job.companyLogo,
          address: jobHeaderData.job.companyAddress,
          phone: jobHeaderData.job.companyPhone,
          email: jobHeaderData.job.companyEmail,
          legalText: jobHeaderData.job.legalText
        }}
      />
      
      <EstimateDialog 
        open={jobHeaderData.isEstimateDialogOpen} 
        onOpenChange={jobHeaderData.setIsEstimateDialogOpen}
        onEstimateCreated={jobHeaderData.handleEstimateCreated}
        clientInfo={{
          name: jobHeaderData.job.client,
          address: jobHeaderData.job.address,
          phone: jobHeaderData.job.phone,
          email: jobHeaderData.job.email
        }}
        companyInfo={{
          name: jobHeaderData.job.companyName,
          logo: jobHeaderData.job.companyLogo,
          address: jobHeaderData.job.companyAddress,
          phone: jobHeaderData.job.companyPhone,
          email: jobHeaderData.job.companyEmail,
          legalText: jobHeaderData.job.legalText
        }}
      />
    </div>
  );
};
