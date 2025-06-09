
import React from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";

export type DocumentType = "estimate" | "invoice";

interface UnifiedDocumentBuilderProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  documentType: DocumentType;
  jobId: string;
  onDocumentCreated?: (document?: any) => void;
  existingDocument?: any;
}

export const UnifiedDocumentBuilder = ({ 
  open, 
  onOpenChange, 
  documentType 
}: UnifiedDocumentBuilderProps) => {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>
            {documentType === "estimate" ? "Create Estimate" : "Create Invoice"}
          </DialogTitle>
        </DialogHeader>
        <div className="text-center py-8 text-muted-foreground">
          Document builder will be rebuilt in the next phase
        </div>
      </DialogContent>
    </Dialog>
  );
};
