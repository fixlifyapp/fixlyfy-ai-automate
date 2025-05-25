
import React, { useState } from "react";
import { ModernCard, ModernCardHeader, ModernCardContent, ModernCardTitle } from "@/components/ui/modern-card";
import { Button } from "@/components/ui/button";
import { Upload, File, Download, Trash2, Eye, Paperclip } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { AttachmentUploadDialog } from "../dialogs/AttachmentUploadDialog";
import { toast } from "sonner";

interface AttachmentsCardProps {
  jobId: string;
  editable?: boolean;
}

export const AttachmentsCard = ({ jobId, editable = false }: AttachmentsCardProps) => {
  const [isUploadDialogOpen, setIsUploadDialogOpen] = useState(false);
  
  // Mock attachments data - replace with real data later
  const [attachments, setAttachments] = useState([
    { id: 1, name: "job_estimate.pdf", size: "245 KB", type: "PDF" },
    { id: 2, name: "before_photo.jpg", size: "1.2 MB", type: "Image" },
  ]);

  const handleView = (attachment: any) => {
    toast.info(`Viewing ${attachment.name}`);
    // Implement view functionality
  };

  const handleDownload = (attachment: any) => {
    toast.success(`Downloading ${attachment.name}`);
    // Implement download functionality
  };

  const handleDelete = (attachmentId: number) => {
    setAttachments(prev => prev.filter(att => att.id !== attachmentId));
    toast.success("Attachment deleted successfully");
  };

  const handleUploadSuccess = (newAttachments: any[]) => {
    setAttachments(newAttachments);
    toast.success("Attachments updated successfully");
  };

  return (
    <>
      <ModernCard variant="elevated" className="hover:shadow-lg transition-all duration-300">
        <ModernCardHeader className="pb-4">
          <div className="flex items-center justify-between">
            <ModernCardTitle icon={Paperclip}>
              Attachments
            </ModernCardTitle>
            {editable && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setIsUploadDialogOpen(true)}
                className="text-fixlyfy hover:text-fixlyfy-dark"
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
                      <p className="text-sm font-medium truncate">{attachment.name}</p>
                      <div className="flex items-center gap-2 mt-1">
                        <Badge variant="outline" className="text-xs">
                          {attachment.type}
                        </Badge>
                        <span className="text-xs text-muted-foreground">
                          {attachment.size}
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
        initialAttachments={attachments}
        onSave={handleUploadSuccess}
      />
    </>
  );
};
