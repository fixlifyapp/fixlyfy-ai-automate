
import { Button } from '@/components/ui/button';
import { ArrowLeft, Download, Send } from 'lucide-react';

interface InvoiceViewHeaderProps {
  invoiceNumber: string;
  createdAt: string;
  onBack: () => void;
}

export const InvoiceViewHeader = ({ 
  invoiceNumber, 
  createdAt, 
  onBack 
}: InvoiceViewHeaderProps) => {
  return (
    <div className="mb-8">
      <Button
        variant="ghost"
        onClick={onBack}
        className="mb-4"
      >
        <ArrowLeft className="h-4 w-4 mr-2" />
        Back to Invoices
      </Button>
      
      <div className="flex justify-between items-start">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">
            Invoice {invoiceNumber}
          </h1>
          <p className="text-gray-600 mt-2">
            Created on {new Date(createdAt).toLocaleDateString()}
          </p>
        </div>
        
        <div className="flex gap-2">
          <Button variant="outline">
            <Download className="h-4 w-4 mr-2" />
            Download PDF
          </Button>
          <Button>
            <Send className="h-4 w-4 mr-2" />
            Send Invoice
          </Button>
        </div>
      </div>
    </div>
  );
};
