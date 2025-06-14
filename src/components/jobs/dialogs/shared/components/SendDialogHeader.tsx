
import React from "react";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Send } from "lucide-react";

interface SendDialogHeaderProps {
  documentType: "estimate" | "invoice";
  documentNumber: string;
  onClose: () => void;
}

export const SendDialogHeader = ({
  documentType,
  documentNumber,
  onClose
}: SendDialogHeaderProps) => {
  return (
    <div className="p-6 border-b">
      <div className="flex items-center gap-2 mb-4">
        <Button variant="ghost" size="sm" onClick={onClose}>
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <Send className="h-5 w-5 text-blue-600" />
        <h3 className="text-lg font-semibold">
          Send {documentType.charAt(0).toUpperCase() + documentType.slice(1)} {documentNumber}
        </h3>
      </div>
    </div>
  );
};
