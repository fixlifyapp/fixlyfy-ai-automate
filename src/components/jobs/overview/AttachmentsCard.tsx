
import React, { useState } from "react";
import { ModernCard, ModernCardHeader, ModernCardContent, ModernCardTitle } from "@/components/ui/modern-card";
import { Button } from "@/components/ui/button";
import { Upload, File, Download, Trash2, Eye, Paperclip } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { AttachmentUploadDialog } from "../dialogs/AttachmentUploadDialog";
import { useJobAttachments } from "@/hooks/useJobAttachments";
import { toast } from "sonner";

interface AttachmentsCardProps {
  jobId: string;
  editable?: boolean;
  onUpdate?: () => void;
}

export const AttachmentsCard = ({ jobId, editable = false, onUpdate }: AttachmentsCardProps) => {
  const [isUploadDialogOpen, setIsUploadDialogOpen] = useState(false);
  const { 
    attachments, 
    isLoading, 
    isUploading, 
    uploadAttachments, 
    deleteAttachment 
  } = useJobAttachments(jobId);

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const getFileType = (mimeType?: string, fileName?: string) => {
    if (mimeType?.includes('image')) return 'Image';
    if (mimeType?.includes('pdf')) return 'PDF';
    if (mimeType?.includes('document') || mimeType?.includes('word')) return 'Document';
    if (fileName?.toLowerCase().endsWith('.pdf')) return 'PDF';
    if (fileName?.toLowerCase().match(/\.(jpg|jpeg|png|gif|bmp|webp)$/)) return 'Image';
    return 'File';
  };

  const handleView = (attachment: any) => {
    toast.info(`Viewing ${attachment.file_name}`);
    // TODO: Implement view functionality when storage is configured
  };

  const handleDownload = (attachment: any) => {
    toast.info(`Downloading ${attachment.file_name}`);
    // TODO: Implement download functionality when storage is configured
  };

  const handleDelete = async (attachmentId: string) => {
    const success = await deleteAttachment(attachmentId);
    if (success && onUpdate) {
      onUpdate();
    }
  };

  const handleUploadSuccess = async (files: File[]) => {
    const success = await uploadAttachments(files);
    if (success) {
      setIsUploadDialogOpen(false);
      if (onUpdate) {
        onUpdate();
      }
    }
  };

  if (isLoading) {
    return (
      <ModernCard variant="elevated" className="hover:shadow-lg transition-all duration-300">
        <ModernCardHeader className="pb-4">
          <ModernCardTitle icon={Paperclip}>
            Attachments
          </ModernCardTitle>
        </ModernCardHeader>
        <ModernCardContent>
          <div className="text-sm text-muted-foreground text-center py-4">
            Loading attachments...
          </div>
        </ModernCardContent>
      </ModernCard>
    );
  }

  return (
    <>
      <ModernCard variant="elevated" className="hover:shadow-lg transition-all duration-300">
        <ModernCardHeader className="pb-4">
          <div className="flex items-center justify-between">
            <ModernCardTitle icon={Paperclip}>
              Attachments ({attachments.length})
            </ModernCardTitle>
            {editable && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setIsUploadDialogOpen(true)}
                className="text-fixlyfy hover:text-fixlyfy-dark"
                disabled={isUploading}
              >
                <Upload className="h-4 w-4" />
              </Button>
            )}
          </div>
        </ModernCardHeader>
        <ModernCardContent>
          {attachments.length > 0 ? (
            <div className="space-y-3">
              {attachments.map((attachment) => (
                <div key={attachment.id} className="flex items-center justify-between p-3 border rounded-lg hover:bg-gray-50 transition-colors">
                  <div className="flex items-center space-x-3 min-w-0 flex-1">
                    <File className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-medium truncate">{attachment.file_name}</p>
                      <div className="flex items-center gap-2 mt-1">
                        <Badge variant="outline" className="text-xs">
                          {getFileType(attachment.mime_type, attachment.file_name)}
                        </Badge>
                        <span className="text-xs text-muted-foreground">
                          {formatFileSize(attachment.file_size)}
                        </span>
                        <span className="text-xs text-muted-foreground">
                          {new Date(attachment.uploaded_at).toLocaleDateString()}
                        </span>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center space-x-1 flex-shrink-0 ml-2">
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      className="h-8 w-8 p-0 hover:bg-blue-50 hover:text-blue-600"
                      onClick={() => handleView(attachment)}
                    >
                      <Eye className="h-3 w-3" />
                    </Button>
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      className="h-8 w-8 p-0 hover:bg-green-50 hover:text-green-600"
                      onClick={() => handleDownload(attachment)}
                    >
                      <Download className="h-3 w-3" />
                    </Button>
                    {editable && (
                      <Button 
                        variant="ghost" 
                        size="sm" 
                        className="h-8 w-8 p-0 hover:bg-red-50 hover:text-red-600"
                        onClick={() => handleDelete(attachment.id)}
                      >
                        <Trash2 className="h-3 w-3" />
                      </Button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-sm text-muted-foreground text-center py-4">
              {editable ? "No attachments. Click the upload button to add files." : "No attachments"}
            </div>
          )}
        </ModernCardContent>
      </ModernCard>

      <AttachmentUploadDialog
        open={isUploadDialogOpen}
        onOpenChange={setIsUploadDialogOpen}
        onUpload={handleUploadSuccess}
        isUploading={isUploading}
      />
    </>
  );
};
