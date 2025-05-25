import React, { useState, useEffect } from "react";
import { ModernCard, ModernCardHeader, ModernCardContent, ModernCardTitle } from "@/components/ui/modern-card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { Paperclip, Upload, Download, Trash2, Plus, FileText, Image, Film } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useJobAttachments } from "@/hooks/useJobAttachments";
import { toast } from "sonner";

interface Attachment {
  id: string;
  file_name: string;
  file_path: string;
  file_size: number;
  uploaded_at: string;
  mime_type?: string;
}

interface AttachmentsCardProps {
  jobId: string;
  editable?: boolean;
}

export const AttachmentsCard = ({ jobId, editable = false }: AttachmentsCardProps) => {
  const [attachments, setAttachments] = useState<Attachment[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const { uploadAttachments, isUploading } = useJobAttachments();

  useEffect(() => {
    fetchAttachments();
  }, [jobId]);

  const fetchAttachments = async () => {
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

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files || []);
    setSelectedFiles(files);
  };

  const handleUpload = async () => {
    if (selectedFiles.length === 0) return;
    
    const success = await uploadAttachments(jobId, selectedFiles);
    if (success) {
      setSelectedFiles([]);
      fetchAttachments();
      const input = document.getElementById('file-input') as HTMLInputElement;
      if (input) input.value = '';
    }
  };

  const handleDownload = async (attachment: Attachment) => {
    try {
      const { data, error } = await supabase.storage
        .from('job-attachments')
        .download(attachment.file_path);

      if (error) throw error;

      const url = URL.createObjectURL(data);
      const a = document.createElement('a');
      a.href = url;
      a.download = attachment.file_name;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Error downloading file:', error);
      toast.error('Failed to download file');
    }
  };

  const handleDelete = async (attachment: Attachment) => {
    try {
      const { error: storageError } = await supabase.storage
        .from('job-attachments')
        .remove([attachment.file_path]);

      if (storageError) throw storageError;

      const { error: dbError } = await supabase
        .from('job_attachments')
        .delete()
        .eq('id', attachment.id);

      if (dbError) throw dbError;

      toast.success('Attachment deleted successfully');
      fetchAttachments();
    } catch (error) {
      console.error('Error deleting attachment:', error);
      toast.error('Failed to delete attachment');
    }
  };

  const formatFileSize = (bytes: number) => {
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    if (bytes === 0) return '0 Bytes';
    const i = Math.floor(Math.log(bytes) / Math.log(1024));
    return Math.round(bytes / Math.pow(1024, i) * 100) / 100 + ' ' + sizes[i];
  };

  const getFileIcon = (fileName: string, mimeType?: string) => {
    if (mimeType?.startsWith('image/')) {
      return <Image className="h-4 w-4 text-blue-500" />;
    }
    if (mimeType?.startsWith('video/')) {
      return <Film className="h-4 w-4 text-purple-500" />;
    }
    return <FileText className="h-4 w-4 text-gray-500" />;
  };

  if (isLoading) {
    return (
      <ModernCard variant="elevated">
        <ModernCardContent className="p-6">
          <div className="space-y-3">
            {[1, 2].map(i => (
              <Skeleton key={i} className="w-full h-16" />
            ))}
          </div>
        </ModernCardContent>
      </ModernCard>
    );
  }

  return (
    <ModernCard variant="elevated" className="hover:shadow-lg transition-all duration-300">
      <ModernCardHeader className="pb-4">
        <div className="flex items-center justify-between">
          <ModernCardTitle icon={Paperclip}>
            Attachments ({attachments.length})
          </ModernCardTitle>
          {editable && (
            <div className="flex gap-2">
              <label htmlFor="file-input">
                <Button
                  variant="ghost"
                  size="sm"
                  className="text-fixlyfy hover:text-fixlyfy-dark cursor-pointer"
                  asChild
                >
                  <span>
                    <Plus className="h-4 w-4" />
                  </span>
                </Button>
              </label>
              <Input
                id="file-input"
                type="file"
                multiple
                onChange={handleFileSelect}
                className="hidden"
              />
            </div>
          )}
        </div>
      </ModernCardHeader>
      <ModernCardContent className="space-y-3">
        {selectedFiles.length > 0 && (
          <div className="border rounded-lg p-3 bg-blue-50">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium">Selected Files:</span>
              <Button
                size="sm"
                onClick={handleUpload}
                disabled={isUploading}
                className="bg-fixlyfy hover:bg-fixlyfy-dark"
              >
                {isUploading ? (
                  "Uploading..."
                ) : (
                  <>
                    <Upload className="h-4 w-4 mr-1" />
                    Upload
                  </>
                )}
              </Button>
            </div>
            {selectedFiles.map((file, index) => (
              <div key={index} className="text-sm text-gray-600">
                {file.name} ({formatFileSize(file.size)})
              </div>
            ))}
          </div>
        )}

        {attachments.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            <Paperclip className="mx-auto h-12 w-12 text-gray-400 mb-4" />
            <p className="text-lg font-medium">No attachments yet</p>
            <p className="text-sm">Upload files to keep job documentation organized</p>
          </div>
        ) : (
          <div className="space-y-2">
            {attachments.map((attachment) => (
              <div
                key={attachment.id}
                className="flex items-center justify-between p-3 border rounded-lg hover:bg-gray-50 transition-colors"
              >
                <div className="flex items-center gap-3 flex-1">
                  {getFileIcon(attachment.file_name, attachment.mime_type)}
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate">
                      {attachment.file_name}
                    </p>
                    <p className="text-xs text-gray-500">
                      {formatFileSize(attachment.file_size)} • {new Date(attachment.uploaded_at).toLocaleDateString()}
                    </p>
                  </div>
                </div>
                <div className="flex gap-1">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleDownload(attachment)}
                    className="text-blue-600 hover:text-blue-700"
                  >
                    <Download className="h-4 w-4" />
                  </Button>
                  {editable && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleDelete(attachment)}
                      className="text-red-600 hover:text-red-700"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </ModernCardContent>
    </ModernCard>
  );
};
