
import React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Send, Download, Trash2, X, FileSpreadsheet, FileText } from "lucide-react";
import { Document } from "./DocumentManagement";
import { toast } from "sonner";

interface BulkActionsProps {
  selectedDocuments: string[];
  documents: Document[];
  onClearSelection: () => void;
}

export const BulkActions = ({
  selectedDocuments,
  documents,
  onClearSelection,
}: BulkActionsProps) => {
  const selectedDocs = documents.filter(doc => selectedDocuments.includes(doc.id));
  const estimateCount = selectedDocs.filter(doc => doc.type === 'estimate').length;
  const invoiceCount = selectedDocs.filter(doc => doc.type === 'invoice').length;

  const handleBulkSend = () => {
    toast.info(`Sending ${selectedDocuments.length} documents...`);
    // Implementation would go here
  };

  const handleBulkExportPDF = () => {
    toast.info(`Exporting ${selectedDocuments.length} documents to PDF...`);
    // Implementation would go here
  };

  const handleBulkExportExcel = () => {
    toast.info(`Exporting ${selectedDocuments.length} documents to Excel...`);
    // Implementation would go here
  };

  const handleBulkDelete = () => {
    if (confirm(`Are you sure you want to delete ${selectedDocuments.length} documents? This action cannot be undone.`)) {
      toast.success(`Deleted ${selectedDocuments.length} documents`);
      onClearSelection();
      // Implementation would go here
    }
  };

  return (
    <Card className="border-blue-200 bg-blue-50">
      <CardContent className="p-4">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <Badge variant="secondary" className="bg-blue-100 text-blue-800">
              {selectedDocuments.length} selected
            </Badge>
            <div className="text-sm text-muted-foreground">
              {estimateCount > 0 && `${estimateCount} estimates`}
              {estimateCount > 0 && invoiceCount > 0 && ", "}
              {invoiceCount > 0 && `${invoiceCount} invoices`}
            </div>
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={onClearSelection}
              className="h-6 w-6 p-0"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>

          <div className="flex flex-wrap gap-2">
            <Button 
              size="sm" 
              variant="outline"
              onClick={handleBulkSend}
              className="gap-2"
            >
              <Send className="h-4 w-4" />
              Send All
            </Button>
            
            <Button 
              size="sm" 
              variant="outline"
              onClick={handleBulkExportPDF}
              className="gap-2"
            >
              <FileText className="h-4 w-4" />
              Export PDF
            </Button>
            
            <Button 
              size="sm" 
              variant="outline"
              onClick={handleBulkExportExcel}
              className="gap-2"
            >
              <FileSpreadsheet className="h-4 w-4" />
              Export Excel
            </Button>
            
            <Button 
              size="sm" 
              variant="destructive"
              onClick={handleBulkDelete}
              className="gap-2"
            >
              <Trash2 className="h-4 w-4" />
              Delete
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
