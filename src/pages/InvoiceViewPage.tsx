
import { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import { Card } from "@/components/ui/card";
import { supabase } from "@/integrations/supabase/client";

interface InvoiceData {
  id: string;
  invoice_number: string;
  total: number;
  status: string;
  notes?: string;
  job_id: string;
  created_at: string;
  client_id?: string;
}

const InvoiceViewPage = () => {
  const { invoiceNumber } = useParams<{ invoiceNumber: string }>();
  const [invoice, setInvoice] = useState<InvoiceData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchInvoice = async () => {
      if (!invoiceNumber) {
        setError("No invoice number provided");
        setIsLoading(false);
        return;
      }

      try {
        console.log("Fetching public invoice:", invoiceNumber);
        
        // Fetch invoice by invoice number
        const { data: invoiceData, error: invoiceError } = await supabase
          .from('invoices')
          .select('*')
          .eq('invoice_number', invoiceNumber)
          .single();

        if (invoiceError) {
          console.error("Error fetching invoice:", invoiceError);
          setError("Invoice not found");
          return;
        }

        console.log("Invoice data loaded:", invoiceData);
        setInvoice(invoiceData);

        // Update invoice status to viewed if it's still draft
        if (invoiceData.status === 'draft') {
          await supabase
            .from('invoices')
            .update({ status: 'viewed' })
            .eq('id', invoiceData.id);
        }

      } catch (error: any) {
        console.error("Error in fetchInvoice:", error);
        setError("Failed to load invoice");
      } finally {
        setIsLoading(false);
      }
    };

    fetchInvoice();
  }, [invoiceNumber]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Card className="p-8">
          <div className="flex flex-col items-center space-y-4">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            <p>Loading your invoice...</p>
          </div>
        </Card>
      </div>
    );
  }

  if (error || !invoice) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Card className="p-8 text-center">
          <h1 className="text-2xl font-bold text-red-600 mb-4">Invoice Not Found</h1>
          <p className="text-gray-600 mb-4">
            {error || "The invoice you're looking for could not be found."}
          </p>
          <p className="text-sm text-gray-500">
            Please check the link or contact us for assistance.
          </p>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="py-8">
        <div className="max-w-4xl mx-auto px-4">
          <Card className="p-8">
            <div className="text-center mb-8">
              <h1 className="text-3xl font-bold text-gray-900">Invoice #{invoice.invoice_number}</h1>
              <p className="text-lg text-gray-600 mt-2">Total: ${invoice.total.toFixed(2)}</p>
              <p className="text-sm text-gray-500 capitalize">Status: {invoice.status}</p>
            </div>
            
            {invoice.notes && (
              <div className="mt-6">
                <h3 className="text-lg font-semibold mb-2">Notes:</h3>
                <p className="text-gray-700 whitespace-pre-wrap">{invoice.notes}</p>
              </div>
            )}
            
            <div className="mt-8 pt-6 border-t text-center">
              <p className="text-sm text-gray-500">
                Created: {new Date(invoice.created_at).toLocaleDateString()}
              </p>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default InvoiceViewPage;
