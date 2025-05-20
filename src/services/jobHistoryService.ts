
import { supabase } from '@/integrations/supabase/client';
import { HistoryItem } from '@/hooks/useJobHistory';

export const recordStatusChange = async (
  jobId: string, 
  oldStatus: string, 
  newStatus: string,
  userName?: string,
  userId?: string
) => {
  try {
    const historyItem = {
      job_id: jobId,
      type: 'status-change',
      title: 'Job Status Changed',
      description: `Job status changed from '${oldStatus}' to '${newStatus}'`,
      user_id: userId,
      user_name: userName,
      meta: { 
        oldStatus, 
        newStatus 
      }
    };
    
    const { data, error } = await supabase
      .from('job_history')
      .insert(historyItem)
      .select()
      .single();
      
    if (error) throw error;
    
    return data;
  } catch (error) {
    console.error('Error recording status change:', error);
    return null;
  }
};

export const recordNoteAdded = async (
  jobId: string,
  note: string,
  userName?: string,
  userId?: string
) => {
  try {
    const historyItem = {
      job_id: jobId,
      type: 'note',
      title: 'Note Added',
      description: `Note: ${note}`,
      user_id: userId,
      user_name: userName
    };
    
    const { data, error } = await supabase
      .from('job_history')
      .insert(historyItem)
      .select()
      .single();
      
    if (error) throw error;
    
    return data;
  } catch (error) {
    console.error('Error recording note:', error);
    return null;
  }
};

export const recordPayment = async (
  jobId: string,
  amount: number,
  method: string,
  userName?: string,
  userId?: string
) => {
  try {
    const historyItem = {
      job_id: jobId,
      type: 'payment',
      title: 'Payment Received',
      description: `Payment of $${amount.toFixed(2)} received via ${method}`,
      user_id: userId,
      user_name: userName,
      meta: {
        amount,
        method
      },
      visibility: 'restricted'
    };
    
    const { data, error } = await supabase
      .from('job_history')
      .insert(historyItem)
      .select()
      .single();
      
    if (error) throw error;
    
    return data;
  } catch (error) {
    console.error('Error recording payment:', error);
    return null;
  }
};

export const recordEstimateCreated = async (
  jobId: string,
  estimateNumber: string,
  amount: number,
  userName?: string,
  userId?: string
) => {
  try {
    const historyItem = {
      job_id: jobId,
      type: 'estimate',
      title: 'Estimate Created',
      description: `Estimate #${estimateNumber} was created for $${amount.toFixed(2)}`,
      user_id: userId,
      user_name: userName,
      meta: {
        estimateNumber,
        amount
      }
    };
    
    const { data, error } = await supabase
      .from('job_history')
      .insert(historyItem)
      .select()
      .single();
      
    if (error) throw error;
    
    return data;
  } catch (error) {
    console.error('Error recording estimate creation:', error);
    return null;
  }
};

export const recordEstimateUpdated = async (
  jobId: string,
  estimateNumber: string,
  oldAmount: number,
  newAmount: number,
  userName?: string,
  userId?: string
) => {
  try {
    const historyItem = {
      job_id: jobId,
      type: 'estimate',
      title: 'Estimate Updated',
      description: `Estimate #${estimateNumber} was updated from $${oldAmount.toFixed(2)} to $${newAmount.toFixed(2)}`,
      user_id: userId,
      user_name: userName,
      meta: {
        estimateNumber,
        oldAmount,
        newAmount
      }
    };
    
    const { data, error } = await supabase
      .from('job_history')
      .insert(historyItem)
      .select()
      .single();
      
    if (error) throw error;
    
    return data;
  } catch (error) {
    console.error('Error recording estimate update:', error);
    return null;
  }
};

export const recordInvoiceCreated = async (
  jobId: string,
  invoiceNumber: string,
  amount: number,
  userName?: string,
  userId?: string
) => {
  try {
    const historyItem = {
      job_id: jobId,
      type: 'invoice',
      title: 'Invoice Generated',
      description: `Invoice #${invoiceNumber} was generated for $${amount.toFixed(2)}`,
      user_id: userId,
      user_name: userName,
      meta: {
        invoiceNumber,
        amount
      },
      visibility: 'restricted'
    };
    
    const { data, error } = await supabase
      .from('job_history')
      .insert(historyItem)
      .select()
      .single();
      
    if (error) throw error;
    
    return data;
  } catch (error) {
    console.error('Error recording invoice creation:', error);
    return null;
  }
};

export const recordInvoiceUpdated = async (
  jobId: string,
  invoiceNumber: string,
  oldAmount: number,
  newAmount: number,
  userName?: string,
  userId?: string
) => {
  try {
    const historyItem = {
      job_id: jobId,
      type: 'invoice',
      title: 'Invoice Updated',
      description: `Invoice #${invoiceNumber} was updated from $${oldAmount.toFixed(2)} to $${newAmount.toFixed(2)}`,
      user_id: userId,
      user_name: userName,
      meta: {
        invoiceNumber,
        oldAmount,
        newAmount
      },
      visibility: 'restricted'
    };
    
    const { data, error } = await supabase
      .from('job_history')
      .insert(historyItem)
      .select()
      .single();
      
    if (error) throw error;
    
    return data;
  } catch (error) {
    console.error('Error recording invoice update:', error);
    return null;
  }
};

export const recordEstimateConverted = async (
  jobId: string,
  estimateNumber: string,
  invoiceNumber: string,
  amount: number,
  userName?: string,
  userId?: string
) => {
  try {
    const historyItem = {
      job_id: jobId,
      type: 'estimate-conversion',
      title: 'Estimate Converted to Invoice',
      description: `Estimate #${estimateNumber} was converted to Invoice #${invoiceNumber} for $${amount.toFixed(2)}`,
      user_id: userId,
      user_name: userName,
      meta: {
        estimateNumber,
        invoiceNumber,
        amount
      }
    };
    
    const { data, error } = await supabase
      .from('job_history')
      .insert(historyItem)
      .select()
      .single();
      
    if (error) throw error;
    
    return data;
  } catch (error) {
    console.error('Error recording estimate conversion:', error);
    return null;
  }
};

export const recordTechnicianChange = async (
  jobId: string,
  oldTechnician: string,
  newTechnician: string,
  userName?: string,
  userId?: string
) => {
  try {
    const historyItem = {
      job_id: jobId,
      type: 'technician',
      title: 'Technician Changed',
      description: `Job reassigned from ${oldTechnician} to ${newTechnician}`,
      user_id: userId,
      user_name: userName,
      meta: {
        oldTechnician,
        newTechnician
      }
    };
    
    const { data, error } = await supabase
      .from('job_history')
      .insert(historyItem)
      .select()
      .single();
      
    if (error) throw error;
    
    return data;
  } catch (error) {
    console.error('Error recording technician change:', error);
    return null;
  }
};

export const recordFileAttached = async (
  jobId: string,
  fileName: string,
  fileUrl: string,
  userName?: string,
  userId?: string
) => {
  try {
    const historyItem = {
      job_id: jobId,
      type: 'attachment',
      title: 'File Attached',
      description: `File ${fileName} was uploaded`,
      user_id: userId,
      user_name: userName,
      meta: {
        fileName,
        fileUrl
      }
    };
    
    const { data, error } = await supabase
      .from('job_history')
      .insert(historyItem)
      .select()
      .single();
      
    if (error) throw error;
    
    return data;
  } catch (error) {
    console.error('Error recording file attachment:', error);
    return null;
  }
};

export const recordCommunication = async (
  jobId: string,
  communicationType: 'call' | 'email' | 'sms',
  description: string,
  userName?: string,
  userId?: string
) => {
  try {
    let title;
    switch (communicationType) {
      case 'call':
        title = 'Call Made';
        break;
      case 'email':
        title = 'Email Sent';
        break;
      case 'sms':
        title = 'SMS Sent';
        break;
    }
    
    const historyItem = {
      job_id: jobId,
      type: 'communication',
      title,
      description,
      user_id: userId,
      user_name: userName,
      meta: {
        type: communicationType
      }
    };
    
    const { data, error } = await supabase
      .from('job_history')
      .insert(historyItem)
      .select()
      .single();
      
    if (error) throw error;
    
    return data;
  } catch (error) {
    console.error('Error recording communication:', error);
    return null;
  }
};

export const recordDetailsUpdated = async (
  jobId: string,
  changedFields: string[],
  userName?: string,
  userId?: string
) => {
  try {
    const historyItem = {
      job_id: jobId,
      type: 'details-update',
      title: 'Job Details Updated',
      description: `Updated job fields: ${changedFields.join(', ')}`,
      user_id: userId,
      user_name: userName,
      meta: {
        changedFields
      }
    };
    
    const { data, error } = await supabase
      .from('job_history')
      .insert(historyItem)
      .select()
      .single();
      
    if (error) throw error;
    
    return data;
  } catch (error) {
    console.error('Error recording details update:', error);
    return null;
  }
};

export const recordMessage = async (
  jobId: string,
  messageContent: string,
  recipient: string,
  messageType: 'email' | 'sms' | 'app',
  userName?: string,
  userId?: string
) => {
  try {
    const historyItem = {
      job_id: jobId,
      type: 'message',
      title: `${messageType.toUpperCase()} Message Sent`,
      description: `Message sent to ${recipient}: "${messageContent.substring(0, 50)}${messageContent.length > 50 ? '...' : ''}"`,
      user_id: userId,
      user_name: userName,
      meta: {
        messageContent,
        recipient,
        messageType
      }
    };
    
    const { data, error } = await supabase
      .from('job_history')
      .insert(historyItem)
      .select()
      .single();
      
    if (error) throw error;
    
    return data;
  } catch (error) {
    console.error('Error recording message:', error);
    return null;
  }
};
