
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
    // Create a new window with the styled content for printing
    const printWindow = window.open('', '_blank');
    if (printWindow) {
      // Get the preview content
      const previewContent = document.querySelector('.max-w-5xl');
      if (previewContent) {
        const contentHTML = previewContent.outerHTML;
        
        printWindow.document.write(`
          <!DOCTYPE html>
          <html>
            <head>
              <title>${documentType === "invoice" ? "Invoice" : "Estimate"} ${documentNumber}</title>
              <meta charset="utf-8">
              <meta name="viewport" content="width=device-width, initial-scale=1">
              <script src="https://cdn.tailwindcss.com"></script>
              <style>
                @media print {
                  body { 
                    margin: 0; 
                    padding: 0;
                    -webkit-print-color-adjust: exact;
                    color-adjust: exact;
                  }
                  .no-print { display: none !important; }
                  .print-only { display: block !important; }
                  .max-w-5xl {
                    max-width: none !important;
                    margin: 0 !important;
                    box-shadow: none !important;
                    border: none !important;
                  }
                  .shadow-2xl {
                    box-shadow: none !important;
                  }
                  .border {
                    border: none !important;
                  }
                  /* Ensure colors print correctly */
                  .bg-blue-50 { background-color: #eff6ff !important; }
                  .bg-green-50 { background-color: #f0fdf4 !important; }
                  .bg-amber-50 { background-color: #fffbeb !important; }
                  .bg-blue-600 { background-color: #2563eb !important; }
                  .bg-blue-700 { background-color: #1d4ed8 !important; }
                  .bg-purple-700 { background-color: #7c3aed !important; }
                  .text-blue-600 { color: #2563eb !important; }
                  .text-blue-700 { color: #1d4ed8 !important; }
                  .text-green-600 { color: #16a34a !important; }
                  .text-purple-700 { color: #7c3aed !important; }
                  .border-amber-200 { border-color: #fde68a !important; }
                  .border-gray-200 { border-color: #e5e7eb !important; }
                  .border-gray-300 { border-color: #d1d5db !important; }
                }
                @page { 
                  margin: 0.5in;
                  size: letter;
                }
                body { 
                  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
                  line-height: 1.5;
                  color: #111827;
                }
                /* Ensure table styling is preserved */
                table {
                  border-collapse: collapse;
                  width: 100%;
                }
                th, td {
                  border: 1px solid #e5e7eb;
                  padding: 12px 16px;
                  text-align: left;
                }
                th {
                  background-color: #f9fafb;
                  font-weight: 600;
                }
                /* Preserve grid layouts */
                .grid {
                  display: grid !important;
                }
                .flex {
                  display: flex !important;
                }
                /* Ensure proper spacing */
                .space-y-6 > * + * {
                  margin-top: 1.5rem !important;
                }
                .space-y-4 > * + * {
                  margin-top: 1rem !important;
                }
                .space-y-2 > * + * {
                  margin-top: 0.5rem !important;
                }
              </style>
            </head>
            <body>
              ${contentHTML}
              <script>
                // Auto-print when page loads
                window.onload = function() {
                  setTimeout(function() {
                    window.print();
                    window.onafterprint = function() {
                      window.close();
                    };
                  }, 500);
                };
              </script>
            </body>
          </html>
        `);
        
        printWindow.document.close();
        printWindow.focus();
      } else {
        // Fallback to basic print
        window.print();
      }
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
