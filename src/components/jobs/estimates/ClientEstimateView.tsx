
import { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import { toast } from "sonner";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { CheckCircle, Download, MessageSquare, Phone, Mail } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { LineItem } from "../builder/types";

interface EstimateData {
  id: string;
  estimate_number: string;
  status: string;
  total: number;
  notes?: string;
  created_at: string;
  client_name: string;
  client_email?: string;
  client_phone?: string;
  job_title?: string;
  job_description?: string;
}

export const ClientEstimateView = () => {
  const { estimateId } = useParams<{ estimateId: string }>();
  const [estimate, setEstimate] = useState<EstimateData | null>(null);
  const [lineItems, setLineItems] = useState<LineItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isAccepting, setIsAccepting] = useState(false);
  
  useEffect(() => {
    if (estimateId) {
      fetchEstimateData();
    }
  }, [estimateId]);

  const fetchEstimateData = async () => {
    try {
      // Fetch estimate details using the view
      const { data: estimateData, error: estimateError } = await supabase
        .from('estimate_details_view')
        .select('*')
        .eq('estimate_id', estimateId)
        .single();

      if (estimateError) throw estimateError;

      if (estimateData) {
        setEstimate({
          id: estimateData.estimate_id,
          estimate_number: estimateData.estimate_number,
          status: estimateData.status,
          total: Number(estimateData.total),
          notes: estimateData.notes,
          created_at: estimateData.created_at,
          client_name: estimateData.client_name,
          client_email: estimateData.client_email,
          client_phone: estimateData.client_phone,
          job_title: estimateData.job_title,
          job_description: estimateData.job_description,
        });

        // Fetch line items
        const { data: items, error: itemsError } = await supabase
          .from('line_items')
          .select('*')
          .eq('parent_id', estimateId)
          .eq('parent_type', 'estimate');

        if (itemsError) throw itemsError;

        // Transform line items
        const transformedItems: LineItem[] = items?.map(item => ({
          id: item.id,
          name: item.description,
          description: item.description,
          quantity: item.quantity,
          unitPrice: Number(item.unit_price),
          price: Number(item.unit_price),
          discount: 0,
          tax: item.taxable ? 13 : 0,
          total: Number(item.unit_price) * item.quantity,
          ourPrice: 0,
          taxable: item.taxable
        })) || [];

        setLineItems(transformedItems);

        // Mark estimate as viewed
        await supabase
          .from('estimates')
          .update({ status: 'viewed' })
          .eq('id', estimateId);
      }
    } catch (error) {
      console.error("Error fetching estimate:", error);
      toast.error("Failed to load estimate");
    } finally {
      setIsLoading(false);
    }
  };

  const calculateSubtotal = () => {
    return lineItems.reduce((sum, item) => sum + (item.unitPrice * item.quantity), 0);
  };

  const calculateTax = () => {
    return lineItems.reduce((sum, item) => {
      return sum + (item.taxable ? item.unitPrice * item.quantity * 0.13 : 0);
    }, 0);
  };

  const calculateTotal = () => {
    return calculateSubtotal() + calculateTax();
  };

  const handleAcceptEstimate = async () => {
    setIsAccepting(true);
    try {
      // Update estimate status to accepted
      const { error } = await supabase
        .from('estimates')
        .update({ status: 'approved' })
        .eq('id', estimateId);

      if (error) throw error;

      setEstimate(prev => prev ? { ...prev, status: 'approved' } : null);
      toast.success("Estimate accepted successfully! We'll contact you soon to schedule the work.");
    } catch (error) {
      console.error("Error accepting estimate:", error);
      toast.error("Failed to accept estimate. Please try again.");
    } finally {
      setIsAccepting(false);
    }
  };

  const handleRequestChanges = () => {
    // This would open a modal or form for requesting changes
    toast.info("Please contact us directly to request changes to this estimate.");
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!estimate) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Card className="p-8 max-w-md text-center">
          <h1 className="text-xl font-semibold text-gray-900 mb-2">Estimate Not Found</h1>
          <p className="text-gray-600">
            The estimate you're looking for doesn't exist or you don't have permission to view it.
          </p>
        </Card>
      </div>
    );
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'approved':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'viewed':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'sent':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="container mx-auto px-4 max-w-4xl">
        {/* Header */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 mb-6">
          <div className="bg-gradient-to-r from-blue-600 to-blue-700 px-8 py-6 text-white rounded-t-lg">
            <div className="flex justify-between items-start">
              <div>
                <h1 className="text-3xl font-bold mb-2">Service Estimate</h1>
                <p className="text-xl font-medium text-blue-100">{estimate.estimate_number}</p>
              </div>
              <div className="text-right">
                <Badge className={`${getStatusColor(estimate.status)} border`}>
                  {estimate.status.charAt(0).toUpperCase() + estimate.status.slice(1)}
                </Badge>
              </div>
            </div>
          </div>

          <div className="p-8">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
              <div>
                <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-3">
                  Prepared For:
                </h3>
                <div className="bg-gray-50 rounded-lg p-4">
                  <p className="font-semibold text-lg text-gray-900 mb-1">{estimate.client_name}</p>
                  {estimate.client_email && (
                    <p className="text-gray-600 text-sm flex items-center gap-1">
                      <Mail className="w-4 h-4" />
                      {estimate.client_email}
                    </p>
                  )}
                  {estimate.client_phone && (
                    <p className="text-gray-600 text-sm flex items-center gap-1">
                      <Phone className="w-4 h-4" />
                      {estimate.client_phone}
                    </p>
                  )}
                </div>
              </div>

              <div>
                <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-3">
                  Estimate Details:
                </h3>
                <div className="bg-gray-50 rounded-lg p-4 space-y-2">
                  <div className="flex justify-between">
                    <span className="text-sm font-medium text-gray-600">Date:</span>
                    <span className="text-sm text-gray-900">{formatDate(estimate.created_at)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm font-medium text-gray-600">Estimate #:</span>
                    <span className="text-sm font-mono text-gray-900">{estimate.estimate_number}</span>
                  </div>
                  {estimate.job_title && (
                    <div className="flex justify-between">
                      <span className="text-sm font-medium text-gray-600">Service:</span>
                      <span className="text-sm text-gray-900">{estimate.job_title}</span>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {estimate.job_description && (
              <div className="mb-8">
                <h3 className="text-lg font-semibold text-gray-900 mb-3">Service Description</h3>
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <p className="text-gray-700">{estimate.job_description}</p>
                </div>
              </div>
            )}

            <Separator className="my-8" />

            {/* Line Items */}
            <div className="mb-8">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Services & Products</h3>
              <div className="overflow-hidden border border-gray-200 rounded-lg">
                <table className="w-full">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wide">
                        Description
                      </th>
                      <th className="px-6 py-4 text-center text-xs font-semibold text-gray-600 uppercase tracking-wide">
                        Qty
                      </th>
                      <th className="px-6 py-4 text-right text-xs font-semibold text-gray-600 uppercase tracking-wide">
                        Unit Price
                      </th>
                      <th className="px-6 py-4 text-right text-xs font-semibold text-gray-600 uppercase tracking-wide">
                        Amount
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {lineItems.map((item, index) => (
                      <tr key={item.id} className={index % 2 === 0 ? 'bg-white' : 'bg-gray-50/50'}>
                        <td className="px-6 py-4">
                          <p className="font-medium text-gray-900">{item.description}</p>
                        </td>
                        <td className="px-6 py-4 text-center text-gray-900">{item.quantity}</td>
                        <td className="px-6 py-4 text-right text-gray-900">${item.unitPrice.toFixed(2)}</td>
                        <td className="px-6 py-4 text-right font-medium text-gray-900">
                          ${(item.quantity * item.unitPrice).toFixed(2)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Totals */}
            <div className="flex justify-end mb-8">
              <div className="w-full max-w-sm">
                <div className="bg-gray-50 rounded-lg p-6 space-y-3">
                  <div className="flex justify-between text-gray-600">
                    <span className="font-medium">Subtotal:</span>
                    <span>${calculateSubtotal().toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between text-gray-600">
                    <span className="font-medium">Tax (13%):</span>
                    <span>${calculateTax().toFixed(2)}</span>
                  </div>
                  <Separator />
                  <div className="flex justify-between text-lg font-bold text-gray-900">
                    <span>Total:</span>
                    <span className="text-blue-600">${calculateTotal().toFixed(2)}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Notes */}
            {estimate.notes && (
              <div className="mb-8">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Additional Notes</h3>
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <p className="text-gray-700 whitespace-pre-line">{estimate.notes}</p>
                </div>
              </div>
            )}

            {/* Action Buttons */}
            {estimate.status !== 'approved' && (
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Button 
                  onClick={handleAcceptEstimate}
                  disabled={isAccepting}
                  className="bg-green-600 hover:bg-green-700 text-white flex items-center gap-2"
                >
                  <CheckCircle className="w-4 h-4" />
                  {isAccepting ? 'Accepting...' : 'Accept Estimate'}
                </Button>
                <Button 
                  variant="outline" 
                  onClick={handleRequestChanges}
                  className="flex items-center gap-2"
                >
                  <MessageSquare className="w-4 h-4" />
                  Request Changes
                </Button>
                <Button 
                  variant="outline"
                  onClick={() => window.print()}
                  className="flex items-center gap-2"
                >
                  <Download className="w-4 h-4" />
                  Download PDF
                </Button>
              </div>
            )}

            {estimate.status === 'approved' && (
              <div className="text-center p-6 bg-green-50 border border-green-200 rounded-lg">
                <CheckCircle className="w-12 h-12 text-green-600 mx-auto mb-3" />
                <h3 className="text-lg font-semibold text-green-800 mb-2">Estimate Approved</h3>
                <p className="text-green-700">
                  Thank you for approving this estimate. We'll contact you soon to schedule the work.
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="text-center text-sm text-gray-500">
          <p>© 2024 Fixlyfy Services. All rights reserved.</p>
        </div>
      </div>
    </div>
  );
};
