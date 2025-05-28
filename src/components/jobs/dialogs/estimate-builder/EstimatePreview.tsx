
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { LineItem } from "@/components/jobs/builder/types";

interface EstimatePreviewProps {
  estimateNumber: string;
  lineItems: LineItem[];
  notes: string;
  taxRate: number;
  calculateSubtotal: () => number;
  calculateTotalTax: () => number;
  calculateGrandTotal: () => number;
  jobId: string;
  clientInfo?: {
    id?: string;
    name?: string;
    email?: string;
    phone?: string;
  } | null;
}

export const EstimatePreview = ({
  estimateNumber,
  lineItems,
  notes,
  taxRate,
  calculateSubtotal,
  calculateTotalTax,
  calculateGrandTotal,
  jobId,
  clientInfo: providedClientInfo,
}: EstimatePreviewProps) => {
  const [clientInfo, setClientInfo] = useState(providedClientInfo);
  const [jobInfo, setJobInfo] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(!providedClientInfo);

  useEffect(() => {
    const fetchJobAndClientData = async () => {
      if (providedClientInfo) {
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
          setJobInfo(jobData);
          setClientInfo(jobData.clients);
        }
      } catch (error) {
        console.error("Error in fetchJobAndClientData:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchJobAndClientData();
  }, [jobId, providedClientInfo]);
  
  // Helper function to calculate the total for a line item
  const calculateLineTotal = (item: LineItem): number => {
    const subtotal = item.quantity * item.unitPrice;
    const discountAmount = subtotal * ((item.discount || 0) / 100);
    return subtotal - discountAmount;
  };

  if (isLoading) {
    return (
      <div className="border rounded-md p-6 bg-white">
        <div className="flex items-center justify-center py-8">
          <div className="text-muted-foreground">Loading client information...</div>
        </div>
      </div>
    );
  }

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

  return (
    <div className="border rounded-md p-6 bg-white">
      <div className="flex justify-between items-start mb-8">
        <div>
          <h2 className="text-2xl font-bold mb-1">ESTIMATE</h2>
          <p className="text-lg font-medium">{estimateNumber}</p>
        </div>
        <div className="text-right">
          <img src="/placeholder.svg" alt="Company Logo" className="h-12 mb-2" />
          <p className="font-medium">Fixlyfy Services</p>
          <p className="text-sm text-muted-foreground">456 Business Ave, Suite 789</p>
          <p className="text-sm text-muted-foreground">(555) 987-6543</p>
        </div>
      </div>
      
      <div className="grid grid-cols-2 gap-8 mb-8">
        <div>
          <h3 className="text-sm font-medium uppercase text-muted-foreground mb-2">Bill To:</h3>
          <p className="font-medium">{clientInfo?.name || "Client Name"}</p>
          <p className="text-sm text-muted-foreground">{formatClientAddress()}</p>
          <p className="text-sm text-muted-foreground">{clientInfo?.phone || "(555) 123-4567"}</p>
          <p className="text-sm text-muted-foreground">{clientInfo?.email || "client@example.com"}</p>
        </div>
        <div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <h3 className="text-sm font-medium uppercase text-muted-foreground mb-2">Estimate Date:</h3>
              <p>{new Date().toLocaleDateString()}</p>
            </div>
            <div>
              <h3 className="text-sm font-medium uppercase text-muted-foreground mb-2">Valid Until:</h3>
              <p>{new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toLocaleDateString()}</p>
            </div>
          </div>
        </div>
      </div>
      
      <table className="w-full mb-8">
        <thead className="border-b">
          <tr>
            <th className="text-left py-2">Description</th>
            <th className="text-right py-2">Qty</th>
            <th className="text-right py-2">Unit Price</th>
            <th className="text-right py-2">Discount</th>
            <th className="text-right py-2">Amount</th>
          </tr>
        </thead>
        <tbody>
          {lineItems.map((item) => (
            <tr key={item.id} className="border-b">
              <td className="py-2">{item.description}</td>
              <td className="text-right py-2">{item.quantity}</td>
              <td className="text-right py-2">${item.unitPrice.toFixed(2)}</td>
              <td className="text-right py-2">{(item.discount || 0) > 0 ? `${item.discount}%` : '-'}</td>
              <td className="text-right py-2">${calculateLineTotal(item).toFixed(2)}</td>
            </tr>
          ))}
        </tbody>
        <tfoot>
          <tr>
            <td colSpan={3}></td>
            <td className="text-right py-2 font-medium">Subtotal:</td>
            <td className="text-right py-2">${calculateSubtotal().toFixed(2)}</td>
          </tr>
          <tr>
            <td colSpan={3}></td>
            <td className="text-right py-2 font-medium">Tax ({taxRate}%):</td>
            <td className="text-right py-2">${calculateTotalTax().toFixed(2)}</td>
          </tr>
          <tr>
            <td colSpan={3}></td>
            <td className="text-right py-2 font-medium">Total:</td>
            <td className="text-right py-2 font-bold">${calculateGrandTotal().toFixed(2)}</td>
          </tr>
        </tfoot>
      </table>
      
      {notes && (
        <div className="mb-8">
          <h3 className="text-sm font-medium uppercase text-muted-foreground mb-2">Notes:</h3>
          <p className="text-sm whitespace-pre-line">{notes}</p>
        </div>
      )}
      
      <div className="text-sm text-muted-foreground border-t pt-4">
        <p>All services are subject to our terms and conditions. Estimate valid for 30 days.</p>
      </div>
    </div>
  );
};
