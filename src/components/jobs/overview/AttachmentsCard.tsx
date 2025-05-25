
import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Upload, File, Download, Trash2, Eye } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { AttachmentUploadDialog } from "../dialogs/AttachmentUploadDialog";

interface AttachmentsCardProps {
  jobId: string;
  editable?: boolean;
}

export const AttachmentsCard = ({ jobId, editable = false }: AttachmentsCardProps) => {
  const [isUploadDialogOpen, setIsUploadDialogOpen] = useState(false);
  
  // Mock attachments data - replace with real data later
  const attachments = [
    { id: 1, name: "job_estimate.pdf", size: "245 KB", type: "PDF" },
    { id: 2, name: "before_photo.jpg", size: "1.2 MB", type: "Image" },
  ];

  return (
    <>
      <Card className="hover:shadow-lg transition-all duration-300">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Attachments</CardTitle>
          {editable && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsUploadDialogOpen(true)}
              className="h-8 w-8 p-0 text-fixlyfy hover:text-fixlyfy-dark"
            >
              <Upload className="h-4 w-4" />
            </Button>
          )}
        </CardHeader>
        <CardContent className="space-y-3">
          {attachments.length > 0 ? (
            <div className="space-y-2">
              {attachments.map((attachment) => (
                <div key={attachment.id} className="flex items-center justify-between p-2 border rounded-md hover:bg-gray-50 transition-colors">
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
                  <div className="flex items-center space-x-1 flex-shrink-0">
                    <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                      <Eye className="h-3 w-3" />
                    </Button>
                    <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                      <Download className="h-3 w-3" />
                    </Button>
                    {editable && (
                      <Button variant="ghost" size="sm" className="h-8 w-8 p-0 text-red-500 hover:text-red-700">
                        <Trash2 className="h-3 w-3" />
                      </Button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-sm text-muted-foreground">
              {editable ? "No attachments. Click the upload button to add files." : "No attachments"}
            </div>
          )}
        </CardContent>
      </Card>

      <AttachmentUploadDialog
        open={isUploadDialogOpen}
        onOpenChange={setIsUploadDialogOpen}
        jobId={jobId}
        onUploadSuccess={() => {
          // Refresh attachments list
          console.log("Attachment uploaded successfully");
        }}
      />
    </>
  );
};
