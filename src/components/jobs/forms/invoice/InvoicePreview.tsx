
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { LineItem } from "@/components/jobs/builder/types";

interface InvoicePreviewProps {
  invoice_number: string;
  lineItems: LineItem[];
  taxRate: number;
  calculateSubtotal: () => number;
  calculateTotalTax: () => number;
  calculateGrandTotal: () => number;
  notes: string;
  jobId?: string;
  clientInfo?: any;
  issueDate?: string;
  dueDate?: string;
}

export const InvoicePreview = ({
  invoice_number,
  lineItems,
  taxRate,
  calculateSubtotal,
  calculateTotalTax,
  calculateGrandTotal,
  notes,
  jobId,
  clientInfo: providedClientInfo,
  issueDate,
  dueDate
}: InvoicePreviewProps) => {
  const [clientInfo, setClientInfo] = useState(providedClientInfo);
  const [isLoading, setIsLoading] = useState(!providedClientInfo && !!jobId);

  useEffect(() => {
    const fetchClientData = async () => {
      if (providedClientInfo || !jobId) {
        setClientInfo(providedClientInfo);
        setIsLoading(false);
        return;
      }

      try {
        setIsLoading(true);
        
        // Fetch job with client data
        const { data: jobData, error: jobError } = await supabase
          .from('jobs')
          .select(`
            *,
            clients!inner(*)
          `)
          .eq('id', jobId)
          .single();

        if (jobError) {
          console.error("Error fetching job data:", jobError);
          return;
        }

        if (jobData) {
          setClientInfo(jobData.clients);
        }
      } catch (error) {
        console.error("Error in fetchClientData:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchClientData();
  }, [jobId, providedClientInfo]);

  const currentDate = new Date().toLocaleDateString();
  const defaultDueDate = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toLocaleDateString();

  // Format client address
  const formatClientAddress = () => {
    if (!clientInfo) return "Client Address";
    
    const parts = [
      clientInfo.address,
      clientInfo.city,
      clientInfo.state,
      clientInfo.zip,
      clientInfo.country
    ].filter(Boolean);
    
    return parts.length > 0 ? parts.join(', ') : "Address not available";
  };

  if (isLoading) {
    return (
      <div className="max-w-4xl mx-auto p-8 bg-white">
        <div className="flex items-center justify-center py-8">
          <div className="text-muted-foreground">Loading client information...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto p-8 bg-white">
      <div className="border-b-2 border-gray-200 pb-6 mb-6">
        <h1 className="text-3xl font-bold text-gray-900">INVOICE</h1>
        <p className="text-lg text-gray-600">#{invoice_number}</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        <div>
          <h3 className="font-semibold text-gray-900 mb-2">Bill To:</h3>
          <div className="text-gray-700">
            <p className="font-medium">{clientInfo?.name || 'Client Name'}</p>
            <p className="text-sm">{formatClientAddress()}</p>
            <p className="text-sm">{clientInfo?.phone || '(555) 123-4567'}</p>
            <p className="text-sm">{clientInfo?.email || 'client@example.com'}</p>
          </div>
        </div>
        
        <div className="text-right">
          <div className="mb-2">
            <span className="text-gray-600">Issue Date: </span>
            <span className="font-medium">{issueDate || currentDate}</span>
          </div>
          <div>
            <span className="text-gray-600">Due Date: </span>
            <span className="font-medium">{dueDate || defaultDueDate}</span>
          </div>
        </div>
      </div>

      <div className="mb-8">
        <table className="w-full border-collapse">
          <thead>
            <tr className="border-b-2 border-gray-200">
              <th className="text-left py-3 px-2 font-semibold text-gray-900">Description</th>
              <th className="text-center py-3 px-2 font-semibold text-gray-900">Qty</th>
              <th className="text-right py-3 px-2 font-semibold text-gray-900">Unit Price</th>
              <th className="text-right py-3 px-2 font-semibold text-gray-900">Total</th>
            </tr>
          </thead>
          <tbody>
            {lineItems.map((item, index) => (
              <tr key={index} className="border-b border-gray-100">
                <td className="py-3 px-2 text-gray-800">{item.description}</td>
                <td className="py-3 px-2 text-center text-gray-800">{item.quantity}</td>
                <td className="py-3 px-2 text-right text-gray-800">${item.unitPrice.toFixed(2)}</td>
                <td className="py-3 px-2 text-right text-gray-800">${(item.quantity * item.unitPrice).toFixed(2)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="flex justify-end mb-8">
        <div className="w-64">
          <div className="flex justify-between py-2 border-b border-gray-200">
            <span className="text-gray-600">Subtotal:</span>
            <span className="font-medium">${calculateSubtotal().toFixed(2)}</span>
          </div>
          <div className="flex justify-between py-2 border-b border-gray-200">
            <span className="text-gray-600">Tax ({taxRate}%):</span>
            <span className="font-medium">${calculateTotalTax().toFixed(2)}</span>
          </div>
          <div className="flex justify-between py-3 border-b-2 border-gray-900">
            <span className="text-lg font-semibold text-gray-900">Total:</span>
            <span className="text-lg font-bold text-gray-900">${calculateGrandTotal().toFixed(2)}</span>
          </div>
        </div>
      </div>

      {notes && (
        <div className="border-t border-gray-200 pt-6">
          <h4 className="font-semibold text-gray-900 mb-2">Notes:</h4>
          <p className="text-gray-700 whitespace-pre-wrap">{notes}</p>
        </div>
      )}
    </div>
  );
};
