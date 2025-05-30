
import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { LineItem } from "@/components/jobs/builder/types";
import { supabase } from "@/integrations/supabase/client";

interface UnifiedDocumentPreviewProps {
  documentType: "estimate" | "invoice";
  documentNumber: string;
  lineItems: LineItem[];
  taxRate: number;
  calculateSubtotal: () => number;
  calculateTotalTax: () => number;
  calculateGrandTotal: () => number;
  notes: string;
  clientInfo?: any;
  issueDate: string;
  dueDate?: string;
  jobId?: string;
}

export const UnifiedDocumentPreview = ({
  documentType,
  documentNumber,
  lineItems,
  taxRate,
  calculateSubtotal,
  calculateTotalTax,
  calculateGrandTotal,
  notes,
  clientInfo: initialClientInfo,
  issueDate,
  dueDate,
  jobId
}: UnifiedDocumentPreviewProps) => {
  const [clientInfo, setClientInfo] = useState(initialClientInfo);
  const [jobData, setJobData] = useState<any>(null);
  const [propertyData, setPropertyData] = useState<any>(null);

  useEffect(() => {
    const fetchJobData = async () => {
      if (!jobId) return;

      try {
        // Fetch job details with client information
        const { data: job, error: jobError } = await supabase
          .from('jobs')
          .select(`
            *,
            client:clients(*)
          `)
          .eq('id', jobId)
          .single();

        if (jobError) {
          console.error('Error fetching job:', jobError);
          return;
        }

        if (job) {
          setJobData(job);
          setClientInfo(job.client);

          // Fetch property data if property_id exists
          if (job.property_id) {
            const { data: properties, error: propError } = await supabase
              .from('client_properties')
              .select('*')
              .eq('id', job.property_id);

            if (!propError && properties && properties.length > 0) {
              setPropertyData(properties[0]);
            }
          }
        }
      } catch (error) {
        console.error('Error in fetchJobData:', error);
      }
    };

    fetchJobData();
  }, [jobId]);

  // Use property address if available, otherwise fall back to client address
  const serviceAddress = propertyData ? {
    address: propertyData.address,
    city: propertyData.city,
    state: propertyData.state,
    zip: propertyData.zip,
    country: propertyData.country
  } : {
    address: clientInfo?.address,
    city: clientInfo?.city,
    state: clientInfo?.state,
    zip: clientInfo?.zip,
    country: clientInfo?.country
  };

  const formatAddress = (addressObj: any) => {
    if (!addressObj) return 'No address provided';
    
    const parts = [
      addressObj.address,
      addressObj.city,
      addressObj.state,
      addressObj.zip,
      addressObj.country
    ].filter(Boolean);
    
    return parts.join(', ') || 'No address provided';
  };

  return (
    <div className="max-w-4xl mx-auto p-8 bg-white">
      {/* Header */}
      <div className="flex justify-between items-start mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            {documentType === "estimate" ? "ESTIMATE" : "INVOICE"}
          </h1>
          <p className="text-gray-600">#{documentNumber}</p>
        </div>
        <div className="text-right">
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Fixlyfy Services Inc.</h2>
          <p className="text-gray-600">123 Business Park, Suite 456</p>
          <p className="text-gray-600">San Francisco, CA 94103</p>
          <p className="text-gray-600">(555) 123-4567</p>
          <p className="text-gray-600">contact@fixlyfy.com</p>
        </div>
      </div>

      {/* Client and Service Information */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
        <div>
          <h3 className="text-lg font-semibold text-gray-900 mb-3">Bill To:</h3>
          <div className="text-gray-600">
            <p className="font-medium">{clientInfo?.name || 'Client Name'}</p>
            {clientInfo?.company && <p>{clientInfo.company}</p>}
            <p>{formatAddress(clientInfo)}</p>
            {clientInfo?.email && <p>{clientInfo.email}</p>}
            {clientInfo?.phone && <p>{clientInfo.phone}</p>}
          </div>
        </div>
        
        <div>
          <h3 className="text-lg font-semibold text-gray-900 mb-3">Service Address:</h3>
          <div className="text-gray-600">
            <p>{formatAddress(serviceAddress)}</p>
            {propertyData?.property_name && (
              <p className="font-medium mt-1">Property: {propertyData.property_name}</p>
            )}
          </div>
        </div>
      </div>

      {/* Document Details */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div>
          <h4 className="font-semibold text-gray-900">Issue Date</h4>
          <p className="text-gray-600">{issueDate}</p>
        </div>
        {dueDate && (
          <div>
            <h4 className="font-semibold text-gray-900">Due Date</h4>
            <p className="text-gray-600">{dueDate}</p>
          </div>
        )}
        <div>
          <h4 className="font-semibold text-gray-900">Job</h4>
          <p className="text-gray-600">{jobData?.title || jobId || 'N/A'}</p>
        </div>
      </div>

      {/* Line Items */}
      <Card className="mb-8">
        <CardHeader>
          <CardTitle>Items</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b">
                  <th className="text-left py-2">Description</th>
                  <th className="text-right py-2">Qty</th>
                  <th className="text-right py-2">Rate</th>
                  <th className="text-right py-2">Amount</th>
                </tr>
              </thead>
              <tbody>
                {lineItems.map((item, index) => (
                  <tr key={index} className="border-b">
                    <td className="py-3">
                      <div className="font-medium">{item.name}</div>
                      {item.description && (
                        <div className="text-sm text-gray-600">{item.description}</div>
                      )}
                    </td>
                    <td className="text-right py-3">{item.quantity}</td>
                    <td className="text-right py-3">${item.unitPrice.toFixed(2)}</td>
                    <td className="text-right py-3">
                      ${(item.quantity * item.unitPrice).toFixed(2)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* Totals */}
      <div className="flex justify-end mb-8">
        <div className="w-64">
          <div className="flex justify-between py-2">
            <span>Subtotal:</span>
            <span>${calculateSubtotal().toFixed(2)}</span>
          </div>
          <div className="flex justify-between py-2">
            <span>Tax ({(taxRate * 100).toFixed(1)}%):</span>
            <span>${calculateTotalTax().toFixed(2)}</span>
          </div>
          <Separator className="my-2" />
          <div className="flex justify-between py-2 font-bold text-lg">
            <span>Total:</span>
            <span>${calculateGrandTotal().toFixed(2)}</span>
          </div>
        </div>
      </div>

      {/* Notes */}
      {notes && (
        <div className="mb-8">
          <h3 className="text-lg font-semibold text-gray-900 mb-3">Notes</h3>
          <p className="text-gray-600">{notes}</p>
        </div>
      )}

      {/* Footer */}
      <div className="text-center text-gray-600 text-sm">
        <p>Thank you for your business!</p>
        <p>For questions about this {documentType}, please contact us at contact@fixlyfy.com</p>
      </div>
    </div>
  );
};
