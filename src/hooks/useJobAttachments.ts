
import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export const useJobAttachments = () => {
  const [isUploading, setIsUploading] = useState(false);

  const uploadAttachments = async (jobId: string, files: File[]) => {
    if (files.length === 0) return true;

    setIsUploading(true);
    try {
      const uploadPromises = files.map(async (file) => {
        // Generate unique file path
        const fileExt = file.name.split('.').pop();
        const fileName = `${jobId}/${Date.now()}-${Math.random().toString(36).substring(2)}.${fileExt}`;

        // Upload to storage
        const { data: storageData, error: storageError } = await supabase.storage
          .from('job-attachments')
          .upload(fileName, file);

        if (storageError) throw storageError;

        // Save attachment record to database
        const { error: dbError } = await supabase
          .from('job_attachments')
          .insert({
            job_id: jobId,
            file_name: file.name,
            file_path: storageData.path,
            file_size: file.size,
            mime_type: file.type || 'application/octet-stream'
          });

        if (dbError) throw dbError;

        return storageData;
      });

      await Promise.all(uploadPromises);
      toast.success(`${files.length} file(s) uploaded successfully`);
      return true;
    } catch (error) {
      console.error('Error uploading attachments:', error);
      toast.error('Failed to upload attachments');
      return false;
    } finally {
      setIsUploading(false);
    }
  };

  return {
    uploadAttachments,
    isUploading
  };
};
