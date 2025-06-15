
import React from "react";
import { Button } from "@/components/ui/button";
import { Download, Send, Edit, ArrowRight } from "lucide-react";

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
  const handleDownloadPDF = () => {
    // Use the browser's print functionality with CSS media queries for PDF
    // This avoids showing Lovable URLs in the printed document
    const printWindow = window.open('', '_blank');
    if (printWindow) {
      const currentContent = document.querySelector('.max-w-5xl')?.outerHTML || '';
      
      printWindow.document.write(`
        <!DOCTYPE html>
        <html>
          <head>
            <title>${documentType === "invoice" ? "Invoice" : "Estimate"} ${documentNumber}</title>
            <link href="https://cdn.tailwindcss.com/3.3.6" rel="stylesheet">
            <style>
              @media print {
                body { margin: 0; padding: 20px; }
                .no-print { display: none !important; }
                .print-only { display: block !important; }
              }
              @page { margin: 1in; }
              body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; }
            </style>
          </head>
          <body>
            ${currentContent}
          </body>
        </html>
      `);
      
      printWindow.document.close();
      printWindow.focus();
      printWindow.print();
      printWindow.close();
    }
  };

  return (
    <div className="flex items-center justify-between p-6 border-b">
      <div>
        <h2 className="text-xl font-semibold">
          {documentType === "invoice" ? "Invoice" : "Estimate"} Preview
        </h2>
        <p className="text-sm text-muted-foreground">#{documentNumber}</p>
      </div>
      
      <div className="flex gap-2">
        <Button variant="outline" onClick={handleDownloadPDF}>
          <Download className="h-4 w-4 mr-2" />
          Download PDF
        </Button>
        
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
