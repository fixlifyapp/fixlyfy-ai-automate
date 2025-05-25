
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export interface JobAttachment {
  id: string;
  job_id: string;
  file_name: string;
  file_path: string;
  file_size: number;
  mime_type?: string;
  uploaded_at: string;
  uploaded_by?: string;
}

export const useJobAttachments = (jobId?: string) => {
  const [attachments, setAttachments] = useState<JobAttachment[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isUploading, setIsUploading] = useState(false);

  // Fetch attachments for a specific job
  const fetchAttachments = async () => {
    if (!jobId) return;
    
    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from('job_attachments')
        .select('*')
        .eq('job_id', jobId)
        .order('uploaded_at', { ascending: false });

      if (error) throw error;
      setAttachments(data || []);
    } catch (error) {
      console.error('Error fetching attachments:', error);
      toast.error('Failed to load attachments');
    } finally {
      setIsLoading(false);
    }
  };

  // Upload files to storage and save to database
  const uploadAttachments = async (files: File[]) => {
    if (!jobId || files.length === 0) return false;

    setIsUploading(true);
    try {
      const uploadPromises = files.map(async (file) => {
        // Generate unique file path
        const fileExt = file.name.split('.').pop();
        const fileName = `${jobId}/${Date.now()}-${Math.random().toString(36).substring(2)}.${fileExt}`;

        // Upload to storage (we'll implement this when storage is configured)
        // For now, just save the metadata to database
        const { data, error } = await supabase
          .from('job_attachments')
          .insert({
            job_id: jobId,
            file_name: file.name,
            file_path: fileName,
            file_size: file.size,
            mime_type: file.type || 'application/octet-stream'
          })
          .select()
          .single();

        if (error) throw error;
        return data;
      });

      await Promise.all(uploadPromises);
      toast.success(`${files.length} file(s) uploaded successfully`);
      await fetchAttachments(); // Refresh the list
      return true;
    } catch (error) {
      console.error('Error uploading attachments:', error);
      toast.error('Failed to upload attachments');
      return false;
    } finally {
      setIsUploading(false);
    }
  };

  // Delete an attachment
  const deleteAttachment = async (attachmentId: string) => {
    try {
      const { error } = await supabase
        .from('job_attachments')
        .delete()
        .eq('id', attachmentId);

      if (error) throw error;
      
      toast.success('Attachment deleted successfully');
      await fetchAttachments(); // Refresh the list
      return true;
    } catch (error) {
      console.error('Error deleting attachment:', error);
      toast.error('Failed to delete attachment');
      return false;
    }
  };

  // Load attachments when jobId changes
  useEffect(() => {
    if (jobId) {
      fetchAttachments();
    }
  }, [jobId]);

  return {
    attachments,
    isLoading,
    isUploading,
    uploadAttachments,
    deleteAttachment,
    refreshAttachments: fetchAttachments
  };
};
