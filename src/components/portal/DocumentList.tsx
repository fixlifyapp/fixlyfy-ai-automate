
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { FileText, DollarSign, Eye, Download } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface DocumentListProps {
  title: string;
  documents: any[];
  documentType: 'estimate' | 'invoice';
  formatDate: (dateString: string) => string;
  formatCurrency: (amount: number) => string;
  getStatusColor: (status: string) => string;
  permissions: {
    make_payments: boolean;
  };
}

export const DocumentList = ({
  title,
  documents,
  documentType,
  formatDate,
  formatCurrency,
  getStatusColor,
  permissions
}: DocumentListProps) => {
  const handleView = async (document: any) => {
    try {
      console.log(`📄 Viewing ${documentType}:`, document);
      
      // Call the document viewer function
      const { data, error } = await supabase.functions.invoke('document-viewer', {
        body: {
          documentType,
          documentId: document.id,
          documentNumber: documentType === 'estimate' ? document.estimate_number : document.invoice_number
        }
      });

      if (error) {
        console.error(`Error viewing ${documentType}:`, error);
        toast.error(`Failed to view ${documentType}`);
        return;
      }

      // Open document in new window/tab
      if (data?.viewUrl) {
        window.open(data.viewUrl, '_blank');
        toast.success(`${documentType.charAt(0).toUpperCase() + documentType.slice(1)} opened successfully`);
      } else {
        toast.success(`${documentType.charAt(0).toUpperCase() + documentType.slice(1)} viewed successfully`);
      }
    } catch (error) {
      console.error(`Error viewing ${documentType}:`, error);
      toast.error(`Failed to view ${documentType}`);
    }
  };

  const handleDownload = async (document: any) => {
    try {
      console.log(`📥 Downloading ${documentType}:`, document);
      
      // Call the download function
      const { data, error } = await supabase.functions.invoke('download-document', {
        body: {
          documentType,
          documentId: document.id,
          documentNumber: documentType === 'estimate' ? document.estimate_number : document.invoice_number
        }
      });

      if (error) {
        console.error(`Error downloading ${documentType}:`, error);
        toast.error(`Failed to download ${documentType}`);
        return;
      }

      if (data?.downloadUrl) {
        // Create a temporary link to download the file
        const link = document.createElement('a');
        link.href = data.downloadUrl;
        link.download = `${documentType}-${documentType === 'estimate' ? document.estimate_number : document.invoice_number}.txt`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        toast.success(`${documentType.charAt(0).toUpperCase() + documentType.slice(1)} downloaded successfully`);
      } else {
        toast.error(`Download URL not available`);
      }
    } catch (error) {
      console.error(`Error downloading ${documentType}:`, error);
      toast.error(`Failed to download ${documentType}`);
    }
  };

  const Icon = documentType === 'estimate' ? FileText : DollarSign;

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Icon className="h-5 w-5" />
            {title} ({documents?.length || 0})
          </div>
        </CardTitle>
      </CardHeader>
      <CardContent>
        {documents && documents.length > 0 ? (
          <div className="space-y-4">
            {documents.map((doc: any) => {
              const total = parseFloat(doc.total?.toString() || '0');
              return (
                <div key={doc.id} className="border rounded-lg p-3 sm:p-4">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <div className="min-w-0">
                      <h4 className="font-semibold text-sm sm:text-base">
                        {documentType.charAt(0).toUpperCase() + documentType.slice(1)} #{documentType === 'estimate' ? doc.estimate_number : doc.invoice_number}
                      </h4>
                      <p className="text-xs sm:text-sm text-gray-600">
                        {documentType === 'invoice' && doc.due_date 
                          ? `Due: ${formatDate(doc.due_date)}` 
                          : formatDate(doc.created_at)}
                      </p>
                      {doc.description && (
                        <p className="text-xs sm:text-sm text-gray-600 mt-1 line-clamp-2">
                          {doc.description}
                        </p>
                      )}
                    </div>
                    <div className="flex items-center justify-between sm:justify-end gap-4">
                      <div className="text-right">
                        <div className="text-base sm:text-lg font-semibold text-green-600">
                          {formatCurrency(total)}
                        </div>
                        <div className={`text-xs px-2 py-1 rounded-full ${getStatusColor(doc.status || doc.payment_status)}`}>
                          {doc.status || doc.payment_status || 'draft'}
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <Button size="sm" variant="outline" className="text-xs" onClick={() => handleView(doc)}>
                          <Eye className="h-3 w-3 mr-1" />
                          View
                        </Button>
                        <Button size="sm" variant="outline" className="text-xs" onClick={() => handleDownload(doc)}>
                          <Download className="h-3 w-3 mr-1" />
                          Download
                        </Button>
                        {documentType === 'invoice' && permissions.make_payments && 
                         (doc.status !== 'paid' && doc.payment_status !== 'paid') && (
                          <Button size="sm" className="bg-green-600 hover:bg-green-700 text-xs">
                            Pay Now
                          </Button>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="text-center py-8 text-gray-500">
            <Icon className="h-12 w-12 mx-auto mb-4 opacity-50" />
            <p>No {title.toLowerCase()} available</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};
