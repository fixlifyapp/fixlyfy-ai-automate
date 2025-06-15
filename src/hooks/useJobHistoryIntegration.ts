
import { useRBAC } from "@/components/auth/RBACProvider";
import { 
  recordNoteAdded,
  recordEstimateCreated,
  recordEstimateUpdated,
  recordInvoiceCreated,
  recordEstimateConverted,
  recordTechnicianChange,
  recordFileAttached,
  recordCommunication
} from "@/services/jobHistoryService";

export const useJobHistoryIntegration = () => {
  const { currentUser } = useRBAC();

  const logNoteAdded = async (jobId: string, note: string) => {
    return await recordNoteAdded(
      jobId,
      note,
      currentUser?.name || 'Unknown User',
      currentUser?.id
    );
  };

  const logEstimateCreated = async (jobId: string, estimateNumber: string, amount: number) => {
    return await recordEstimateCreated(
      jobId,
      estimateNumber,
      amount,
      currentUser?.name || 'Unknown User',
      currentUser?.id
    );
  };

  const logEstimateUpdated = async (jobId: string, estimateNumber: string, oldAmount: number, newAmount: number) => {
    return await recordEstimateUpdated(
      jobId,
      estimateNumber,
      oldAmount,
      newAmount,
      currentUser?.name || 'Unknown User',
      currentUser?.id
    );
  };

  const logInvoiceCreated = async (jobId: string, invoiceNumber: string, amount: number) => {
    return await recordInvoiceCreated(
      jobId,
      invoiceNumber,
      amount,
      currentUser?.name || 'Unknown User',
      currentUser?.id
    );
  };

  const logEstimateConverted = async (jobId: string, estimateNumber: string, invoiceNumber: string, amount: number) => {
    return await recordEstimateConverted(
      jobId,
      estimateNumber,
      invoiceNumber,
      amount,
      currentUser?.name || 'Unknown User',
      currentUser?.id
    );
  };

  const logTechnicianChange = async (jobId: string, oldTechnician: string, newTechnician: string) => {
    return await recordTechnicianChange(
      jobId,
      oldTechnician,
      newTechnician,
      currentUser?.name || 'Unknown User',
      currentUser?.id
    );
  };

  const logFileAttached = async (jobId: string, fileName: string, fileUrl: string) => {
    return await recordFileAttached(
      jobId,
      fileName,
      fileUrl,
      currentUser?.name || 'Unknown User',
      currentUser?.id
    );
  };

  const logCommunication = async (jobId: string, type: 'call' | 'email' | 'sms', description: string) => {
    return await recordCommunication(
      jobId,
      type,
      description,
      currentUser?.name || 'Unknown User',
      currentUser?.id
    );
  };

  return {
    logNoteAdded,
    logEstimateCreated,
    logEstimateUpdated,
    logInvoiceCreated,
    logEstimateConverted,
    logTechnicianChange,
    logFileAttached,
    logCommunication
  };
};
