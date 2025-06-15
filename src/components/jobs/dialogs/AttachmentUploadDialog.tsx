import { useState, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Upload, X } from "lucide-react";
import { useJobHistoryIntegration } from "@/hooks/useJobHistoryIntegration";

interface AttachmentUploadDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  jobId: string;
  onSuccess?: () => void;
}

export const AttachmentUploadDialog = ({
  open,
  onOpenChange,
  jobId,
  onSuccess
}: AttachmentUploadDialogProps) => {
  const [uploading, setUploading] = useState(false);
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const { logFileAttached } = useJobHistoryIntegration();

  const handleFileSelect = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files || []);
    setSelectedFiles(prev => [...prev, ...files]);
  }, []);

  const handleRemoveFile = (index: number) => {
    setSelectedFiles(prev => prev.filter((_, i) => i !== index));
  };

  const handleUpload = async () => {
    if (selectedFiles.length === 0) return;

    setUploading(true);
    try {
      for (const file of selectedFiles) {
        const fileExt = file.name.split('.').pop();
        const fileName = `${Math.random()}.${fileExt}`;
        const filePath = `job-attachments/${jobId}/${fileName}`;

        const { error: uploadError } = await supabase.storage
          .from('job-attachments')
          .upload(filePath, file);

        if (uploadError) throw uploadError;

        // Get the public URL
        const { data: { publicUrl } } = supabase.storage
          .from('job-attachments')
          .getPublicUrl(filePath);

        // Save to database
        const { error: dbError } = await supabase
          .from('job_attachments')
          .insert({
            job_id: jobId,
            file_name: file.name,
            file_path: filePath,
            file_size: file.size,
            mime_type: file.type
          });

        if (dbError) throw dbError;

        // Log to job history
        await logFileAttached(jobId, file.name, publicUrl);
      }

      toast.success(`${selectedFiles.length} file(s) uploaded successfully`);
      onSuccess?.();
      onOpenChange(false);
      setSelectedFiles([]);
    } catch (error) {
      console.error('Error uploading files:', error);
      toast.error('Failed to upload files');
    } finally {
      setUploading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Upload Attachments</DialogTitle>
        </DialogHeader>
        
        <div className="grid gap-4 py-4">
          <input
            type="file"
            id="attachment"
            className="hidden"
            multiple
            onChange={handleFileSelect}
          />
          <Button asChild variant="outline">
            <label htmlFor="attachment" className="cursor-pointer w-full">
              <Upload className="h-4 w-4 mr-2" />
              Select Files
            </label>
          </Button>

          {selectedFiles.length > 0 && (
            <div className="space-y-2">
              {selectedFiles.map((file, index) => (
                <div key={index} className="flex items-center justify-between rounded-md border p-2">
                  <span className="text-sm font-medium">{file.name}</span>
                  <Button variant="ghost" size="sm" onClick={() => handleRemoveFile(index)}>
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              ))}
            </div>
          )}
        </div>

        <Button onClick={handleUpload} disabled={uploading || selectedFiles.length === 0} className="w-full">
          {uploading ? 'Uploading...' : 'Upload'}
        </Button>
      </DialogContent>
    </Dialog>
  );
};
