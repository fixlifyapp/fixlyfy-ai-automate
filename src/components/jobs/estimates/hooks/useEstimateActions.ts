
import { useState, useCallback } from 'react';
import { toast } from 'sonner';

interface LineItem {
  id: string;
  description: string;
  quantity: number;
  unit_price: number;
  taxable: boolean;
}

interface Estimate {
  id: string;
  estimate_number: string;
  job_id: string;
  total: number;
  status: string;
  notes?: string;
  items?: LineItem[];
  created_at: string;
  updated_at: string;
}

interface UseEstimateActionsReturn {
  isLoading: boolean;
  createEstimate: (estimateData: any) => Promise<Estimate | null>;
  updateEstimate: (estimateId: string, updates: any) => Promise<Estimate | null>;
  deleteEstimate: (estimateId: string) => Promise<boolean>;
  convertToInvoice: (estimateId: string) => Promise<any>;
  sendEstimate: (estimateId: string, method: 'email' | 'sms', recipient: string) => Promise<boolean>;
}

export const useEstimateActions = (): UseEstimateActionsReturn => {
  const [isLoading, setIsLoading] = useState(false);

  const createEstimate = useCallback(async (estimateData: any): Promise<Estimate | null> => {
    setIsLoading(true);
    try {
      console.log('Creating estimate (MOCK):', estimateData);
      
      // Mock creation delay
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      const mockEstimate: Estimate = {
        id: `est-${Date.now()}`,
        estimate_number: `EST-${Date.now().toString().slice(-6)}`,
        job_id: estimateData.job_id || '',
        total: estimateData.total || 0,
        status: 'draft',
        notes: estimateData.notes || '',
        items: estimateData.items || [],
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      };

      toast.success('Estimate created successfully');
      console.log('✅ Mock estimate created:', mockEstimate);
      return mockEstimate;
    } catch (error: any) {
      console.error('❌ Error creating estimate:', error);
      toast.error('Failed to create estimate');
      return null;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const updateEstimate = useCallback(async (estimateId: string, updates: any): Promise<Estimate | null> => {
    setIsLoading(true);
    try {
      console.log('Updating estimate (MOCK):', estimateId, updates);
      
      // Mock update delay
      await new Promise(resolve => setTimeout(resolve, 500));
      
      const mockUpdatedEstimate: Estimate = {
        id: estimateId,
        estimate_number: `EST-${estimateId.slice(-6)}`,
        job_id: updates.job_id || '',
        total: updates.total || 0,
        status: updates.status || 'draft',
        notes: updates.notes || '',
        items: updates.items || [],
        created_at: new Date(Date.now() - 86400000).toISOString(), // Yesterday
        updated_at: new Date().toISOString()
      };

      toast.success('Estimate updated successfully');
      console.log('✅ Mock estimate updated:', mockUpdatedEstimate);
      return mockUpdatedEstimate;
    } catch (error: any) {
      console.error('❌ Error updating estimate:', error);
      toast.error('Failed to update estimate');
      return null;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const deleteEstimate = useCallback(async (estimateId: string): Promise<boolean> => {
    setIsLoading(true);
    try {
      console.log('Deleting estimate (MOCK):', estimateId);
      
      // Mock delete delay
      await new Promise(resolve => setTimeout(resolve, 500));
      
      toast.success('Estimate deleted successfully');
      console.log('✅ Mock estimate deleted:', estimateId);
      return true;
    } catch (error: any) {
      console.error('❌ Error deleting estimate:', error);
      toast.error('Failed to delete estimate');
      return false;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const convertToInvoice = useCallback(async (estimateId: string): Promise<any> => {
    setIsLoading(true);
    try {
      console.log('Converting estimate to invoice (MOCK):', estimateId);
      
      // Mock conversion delay
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      const mockInvoice = {
        id: `inv-${Date.now()}`,
        invoice_number: `INV-${Date.now().toString().slice(-6)}`,
        estimate_id: estimateId,
        job_id: `job-${estimateId}`,
        total: 750.00,
        amount_paid: 0,
        balance: 750.00,
        status: 'unpaid',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      };

      toast.success('Estimate converted to invoice successfully');
      console.log('✅ Mock invoice created:', mockInvoice);
      return mockInvoice;
    } catch (error: any) {
      console.error('❌ Error converting estimate:', error);
      toast.error('Failed to convert estimate to invoice');
      return null;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const sendEstimate = useCallback(async (estimateId: string, method: 'email' | 'sms', recipient: string): Promise<boolean> => {
    setIsLoading(true);
    try {
      console.log('Sending estimate (MOCK):', estimateId, method, recipient);
      
      // Mock send delay
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      toast.success(`Estimate sent via ${method} to ${recipient}`);
      console.log('✅ Mock estimate sent');
      return true;
    } catch (error: any) {
      console.error('❌ Error sending estimate:', error);
      toast.error(`Failed to send estimate via ${method}`);
      return false;
    } finally {
      setIsLoading(false);
    }
  }, []);

  return {
    isLoading,
    createEstimate,
    updateEstimate,
    deleteEstimate,
    convertToInvoice,
    sendEstimate
  };
};
