
import React, { useState } from 'react';
import { ModernCard, ModernCardContent, ModernCardHeader } from '@/components/ui/modern-card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { 
  Upload, 
  Download, 
  Trash2, 
  FileText, 
  Image, 
  File,
  Plus,
  Eye,
  ExternalLink
} from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';

interface Attachment {
  id: string;
  file_name: string;
  file_size: number;
  mime_type: string;
  uploaded_at: string;
  uploaded_by?: string;
  file_path: string;
}

interface AttachmentsCardProps {
  jobId: string;
  attachments: Attachment[];
  onUpload?: (files: FileList) => void;
  onDelete?: (attachmentId: string) => void;
  onDownload?: (attachment: Attachment) => void;
  onView?: (attachment: Attachment) => void;
  isUploading?: boolean;
  canUpload?: boolean;
  canDelete?: boolean;
}

export const AttachmentsCard = ({
  jobId,
  attachments = [],
  onUpload,
  onDelete,
  onDownload,
  onView,
  isUploading = false,
  canUpload = true,
  canDelete = true
}: AttachmentsCardProps) => {
  const [dragOver, setDragOver] = useState(false);

  const getFileIcon = (mimeType: string) => {
    if (mimeType.startsWith('image/')) {
      return Image;
    } else if (mimeType.includes('pdf') || mimeType.includes('document')) {
      return FileText;
    }
    return File;
  };

  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    
    const files = e.dataTransfer.files;
    if (files.length > 0 && onUpload) {
      onUpload(files);
    }
  };

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0 && onUpload) {
      onUpload(files);
    }
  };

  return (
    <ModernCard>
      <ModernCardHeader className="flex flex-row items-center justify-between">
        <h3 className="text-lg font-semibold flex items-center gap-2">
          <Upload className="h-5 w-5" />
          Attachments ({attachments.length})
        </h3>
        {canUpload && (
          <div className="relative">
            <Button
              variant="outline"
              size="sm"
              disabled={isUploading}
              className="gap-2"
            >
              <Plus className="h-4 w-4" />
              {isUploading ? 'Uploading...' : 'Add Files'}
            </Button>
            <Input
              type="file"
              multiple
              onChange={handleFileInput}
              className="absolute inset-0 opacity-0 cursor-pointer"
              disabled={isUploading}
            />
          </div>
        )}
      </ModernCardHeader>
      <ModernCardContent className="space-y-4">
        {/* Upload Drop Zone */}
        {canUpload && (
          <div
            className={`border-2 border-dashed rounded-lg p-6 text-center transition-colors ${
              dragOver 
                ? 'border-primary bg-primary/10' 
                : 'border-muted-foreground/25 hover:border-muted-foreground/50'
            }`}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
          >
            <Upload className="h-8 w-8 mx-auto mb-2 text-muted-foreground" />
            <p className="text-sm text-muted-foreground mb-2">
              Drag and drop files here, or click to select
            </p>
            <p className="text-xs text-muted-foreground">
              Supports: Images, PDFs, Documents (Max 10MB each)
            </p>
          </div>
        )}

        {/* Attachments List */}
        {attachments.length > 0 ? (
          <div className="space-y-2">
            {attachments.map((attachment) => {
              const FileIcon = getFileIcon(attachment.mime_type);
              
              return (
                <div
                  key={attachment.id}
                  className="flex items-center justify-between p-3 border rounded-lg hover:bg-muted/50"
                >
                  <div className="flex items-center gap-3 flex-1 min-w-0">
                    <FileIcon className="h-5 w-5 text-muted-foreground flex-shrink-0" />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium truncate">
                        {attachment.file_name}
                      </p>
                      <div className="flex items-center gap-2 text-xs text-muted-foreground">
                        <span>{formatFileSize(attachment.file_size)}</span>
                        <span>•</span>
                        <span>
                          {formatDistanceToNow(new Date(attachment.uploaded_at), { addSuffix: true })}
                        </span>
                        {attachment.uploaded_by && (
                          <>
                            <span>•</span>
                            <span>by {attachment.uploaded_by}</span>
                          </>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-1">
                    {attachment.mime_type.startsWith('image/') && onView && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => onView(attachment)}
                        className="h-8 w-8 p-0"
                      >
                        <Eye className="h-4 w-4" />
                      </Button>
                    )}
                    
                    {onDownload && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => onDownload(attachment)}
                        className="h-8 w-8 p-0"
                      >
                        <Download className="h-4 w-4" />
                      </Button>
                    )}
                    
                    {canDelete && onDelete && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => onDelete(attachment.id)}
                        className="h-8 w-8 p-0 text-red-600 hover:text-red-700"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="text-center py-6">
            <FileText className="h-8 w-8 mx-auto mb-2 text-muted-foreground" />
            <p className="text-sm text-muted-foreground">
              No attachments yet
            </p>
            <p className="text-xs text-muted-foreground mt-1">
              Upload files to share documents, photos, or other materials
            </p>
          </div>
        )}
      </ModernCardContent>
    </ModernCard>
  );
};
