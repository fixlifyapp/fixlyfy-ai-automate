
import { useCallback } from 'react';
import { useRBAC } from '@/components/auth/RBACProvider';
import { 
  recordStatusChange,
  recordNoteAdded,
  recordPayment,
  recordTechnicianChange,
  recordFileAttached,
  recordCommunication
} from '@/services/jobHistoryService';
import { PaymentMethod } from '@/types/payment';

export const useJobHistoryIntegration = (jobId?: string) => {
  const { currentUser } = useRBAC();

  const logStatusChange = useCallback(async (oldStatus: string, newStatus: string) => {
    if (!jobId) return;
    await recordStatusChange(
      jobId,
      oldStatus,
      newStatus,
      currentUser?.name || currentUser?.email,
      currentUser?.id
    );
  }, [jobId, currentUser]);

  const logNoteAdded = useCallback(async (note: string) => {
    if (!jobId) return;
    await recordNoteAdded(
      jobId,
      note,
      currentUser?.name || currentUser?.email,
      currentUser?.id
    );
  }, [jobId, currentUser]);

  const logPaymentReceived = useCallback(async (
    amount: number, 
    method: PaymentMethod, 
    reference?: string
  ) => {
    if (!jobId) return;
    await recordPayment(
      jobId,
      amount,
      method,
      currentUser?.name || currentUser?.email,
      currentUser?.id,
      reference
    );
  }, [jobId, currentUser]);

  const logTechnicianChange = useCallback(async (
    oldTechnician: string, 
    newTechnician: string
  ) => {
    if (!jobId) return;
    await recordTechnicianChange(
      jobId,
      oldTechnician,
      newTechnician,
      currentUser?.name || currentUser?.email,
      currentUser?.id
    );
  }, [jobId, currentUser]);

  const logFileAttached = useCallback(async (fileName: string, fileUrl: string) => {
    if (!jobId) return;
    await recordFileAttached(
      jobId,
      fileName,
      fileUrl,
      currentUser?.name || currentUser?.email,
      currentUser?.id
    );
  }, [jobId, currentUser]);

  const logCommunication = useCallback(async (
    type: 'call' | 'email' | 'sms',
    description: string
  ) => {
    if (!jobId) return;
    await recordCommunication(
      jobId,
      type,
      description,
      currentUser?.name || currentUser?.email,
      currentUser?.id
    );
  }, [jobId, currentUser]);

  return {
    logStatusChange,
    logNoteAdded,
    logPaymentReceived,
    logTechnicianChange,
    logFileAttached,
    logCommunication
  };
};
