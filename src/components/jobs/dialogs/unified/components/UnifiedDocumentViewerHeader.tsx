
import React from "react";
import { Button } from "@/components/ui/button";
import { Send, Edit, ArrowRight } from "lucide-react";

interface UnifiedDocumentViewerHeaderProps {
  documentType: "invoice" | "estimate";
  documentNumber: string;
  onEdit: () => void;
  onSend: () => void;
  onConvert?: () => void;
  showConvertButton: boolean;
}

export const UnifiedDocumentViewerHeader = ({
  documentType,
  documentNumber,
  onEdit,
  onSend,
  onConvert,
  showConvertButton
}: UnifiedDocumentViewerHeaderProps) => {
  return (
    <div className="flex items-center justify-between p-6 border-b">
      <div>
        <h2 className="text-xl font-semibold">
          {documentType === "invoice" ? "Invoice" : "Estimate"} Preview
        </h2>
        <p className="text-sm text-muted-foreground">#{documentNumber}</p>
      </div>
      
      <div className="flex gap-2">
        <Button variant="outline" onClick={onSend}>
          <Send className="h-4 w-4 mr-2" />
          Send
        </Button>
        
        <Button variant="outline" onClick={onEdit}>
          <Edit className="h-4 w-4 mr-2" />
          Edit
        </Button>
        
        {showConvertButton && onConvert && (
          <Button onClick={onConvert} className="gap-2">
            Convert to Invoice
            <ArrowRight className="h-4 w-4" />
          </Button>
        )}
      </div>
    </div>
  );
};
