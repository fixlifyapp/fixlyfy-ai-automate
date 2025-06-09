import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  Eye, 
  Printer, 
  Send, 
  DollarSign, 
  FileText, 
  Calendar,
  User,
  MapPin
} from "lucide-react";
import { Estimate } from "@/hooks/useEstimates";
import { useJobs } from "@/hooks/useJobs";
import { EstimateSendDialog } from "./estimate-builder/EstimateSendDialog";
import { formatCurrency } from "@/lib/utils";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";

interface LineItem {
  id: string;
  description: string;
  quantity: number;
  unit_price: number;
  taxable: boolean;
}

interface EstimatePreviewWindowProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  estimate: Estimate;
  onConvertToInvoice?: (estimate: Estimate) => void;
}

export const EstimatePreviewWindow = ({
  open,
  onOpenChange,
  estimate,
  onConvertToInvoice
}: EstimatePreviewWindowProps) => {
  const [showSendDialog, setShowSendDialog] = useState(false);
  const [lineItems, setLineItems] = useState<LineItem[]>([]);
  const [isLoadingItems, setIsLoadingItems] = useState(false);
  const { jobs } = useJobs();
  
  const job = jobs.find(j => j.id === estimate.job_id);
  
  // Ensure clientInfo has required properties with fallbacks
  const clientInfo = {
    name: job?.client?.name || 'Client Name',
    email: job?.client?.email || 'client@example.com',
    phone: job?.client?.phone || '(555) 123-4567'
  };

  // Fetch line items for the estimate
  useEffect(() => {
    const fetchLineItems = async () => {
      if (!estimate.id || !open) return;
      
      setIsLoadingItems(true);
      try {
        const { data, error } = await supabase
          .from('line_items')
          .select('*')
          .eq('parent_id', estimate.id)
          .eq('parent_type', 'estimate');

        if (error) throw error;
        
        setLineItems(data || []);
      } catch (error) {
        console.error('Error fetching line items:', error);
        toast.error('Failed to load estimate items');
      } finally {
        setIsLoadingItems(false);
      }
    };

    fetchLineItems();
  }, [estimate.id, open]);

  const calculateSubtotal = () => {
    return lineItems.reduce((sum, item) => sum + (item.quantity * item.unit_price), 0);
  };

  const calculateTax = () => {
    const taxableTotal = lineItems
      .filter(item => item.taxable)
      .reduce((sum, item) => sum + (item.quantity * item.unit_price), 0);
    return taxableTotal * 0.13; // 13% tax rate
  };

  const handlePrint = () => {
    window.print();
    toast.success("Print dialog opened");
  };

  const handleConvert = () => {
    if (onConvertToInvoice) {
      onConvertToInvoice(estimate);
      onOpenChange(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status?.toLowerCase()) {
      case 'sent': return 'bg-blue-100 text-blue-800';
      case 'accepted': return 'bg-green-100 text-green-800';
      case 'rejected': return 'bg-red-100 text-red-800';
      case 'converted': return 'bg-purple-100 text-purple-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <>
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="max-w-4xl h-[90vh] flex flex-col">
          <DialogHeader className="flex-shrink-0 pb-4 border-b">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Eye className="h-6 w-6 text-blue-600" />
                <div>
                  <DialogTitle className="text-xl">Estimate Preview</DialogTitle>
                  <div className="flex items-center gap-2 mt-1">
                    <Badge variant="secondary" className="text-sm">
                      {estimate.estimate_number || estimate.number}
                    </Badge>
                    <Badge className={getStatusColor(estimate.status)}>
                      {estimate.status || 'draft'}
                    </Badge>
                  </div>
                </div>
              </div>
              <div className="text-right">
                <div className="text-sm text-gray-500">Total Amount</div>
                <div className="text-2xl font-bold text-green-600">
                  {formatCurrency(estimate.total || estimate.amount || 0)}
                </div>
              </div>
            </div>
          </DialogHeader>

          <div className="flex-1 min-h-0 overflow-y-auto">
            <div className="max-w-3xl mx-auto p-8 bg-white">
              {/* Header */}
              <div className="text-center mb-8">
                <h1 className="text-3xl font-bold text-gray-900 mb-2">ESTIMATE</h1>
                <div className="text-lg text-gray-600">
                  #{estimate.estimate_number || estimate.number}
                </div>
              </div>

              {/* Company & Client Info */}
              <div className="grid grid-cols-2 gap-8 mb-8">
                <div>
                  <h3 className="font-semibold text-gray-900 mb-3">From:</h3>
                  <div className="text-gray-700">
                    <div className="font-medium">Fixlyfy Services Inc.</div>
                    <div>123 Business Park, Suite 456</div>
                    <div>San Francisco, CA 94103</div>
                    <div>(555) 123-4567</div>
                    <div>contact@fixlyfy.com</div>
                  </div>
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900 mb-3">To:</h3>
                  <div className="text-gray-700">
                    <div className="font-medium flex items-center gap-2">
                      <User className="h-4 w-4" />
                      {clientInfo.name}
                    </div>
                    <div className="flex items-center gap-2 mt-1">
                      <span className="w-4" />
                      {clientInfo.email}
                    </div>
                    <div className="flex items-center gap-2 mt-1">
                      <span className="w-4" />
                      {clientInfo.phone}
                    </div>
                    {job?.address && (
                      <div className="flex items-center gap-2 mt-1">
                        <MapPin className="h-4 w-4" />
                        {job.address}
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Date & Job Info */}
              <div className="grid grid-cols-2 gap-8 mb-8">
                <div>
                  <div className="flex items-center gap-2 text-gray-700">
                    <Calendar className="h-4 w-4" />
                    <span className="font-medium">Date:</span>
                    {new Date(estimate.date || estimate.created_at).toLocaleDateString()}
                  </div>
                </div>
                <div>
                  <div className="flex items-center gap-2 text-gray-700">
                    <FileText className="h-4 w-4" />
                    <span className="font-medium">Job:</span>
                    {job?.title || 'Service Request'}
                  </div>
                </div>
              </div>

              {/* Service Description */}
              {job?.description && (
                <div className="mb-8">
                  <h3 className="font-semibold text-gray-900 mb-3">Service Description:</h3>
                  <div className="text-gray-700 bg-gray-50 p-4 rounded-lg">
                    {job.description}
                  </div>
                </div>
              )}

              {/* Line Items */}
              <div className="mb-8">
                <h3 className="font-semibold text-gray-900 mb-4">Services & Products:</h3>
                <div className="border rounded-lg overflow-hidden">
                  <table className="w-full">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-4 py-3 text-left font-medium text-gray-900">Description</th>
                        <th className="px-4 py-3 text-center font-medium text-gray-900">Qty</th>
                        <th className="px-4 py-3 text-right font-medium text-gray-900">Unit Price</th>
                        <th className="px-4 py-3 text-right font-medium text-gray-900">Total</th>
                      </tr>
                    </thead>
                    <tbody>
                      {isLoadingItems ? (
                        <tr className="border-t">
                          <td colSpan={4} className="px-4 py-8 text-center text-gray-500">
                            Loading items...
                          </td>
                        </tr>
                      ) : lineItems.length > 0 ? (
                        lineItems.map((item) => (
                          <tr key={item.id} className="border-t">
                            <td className="px-4 py-3 text-gray-700">{item.description}</td>
                            <td className="px-4 py-3 text-center text-gray-700">{item.quantity}</td>
                            <td className="px-4 py-3 text-right text-gray-700">
                              {formatCurrency(item.unit_price)}
                            </td>
                            <td className="px-4 py-3 text-right text-gray-700">
                              {formatCurrency(item.quantity * item.unit_price)}
                            </td>
                          </tr>
                        ))
                      ) : (
                        <tr className="border-t">
                          <td colSpan={4} className="px-4 py-8 text-center text-gray-500">
                            No items added to this estimate
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Totals */}
              <div className="flex justify-end mb-8">
                <div className="w-64">
                  <div className="space-y-2">
                    <div className="flex justify-between text-gray-700">
                      <span>Subtotal:</span>
                      <span>{formatCurrency(calculateSubtotal())}</span>
                    </div>
                    <div className="flex justify-between text-gray-700">
                      <span>Tax (13%):</span>
                      <span>{formatCurrency(calculateTax())}</span>
                    </div>
                    <div className="flex justify-between font-semibold text-lg border-t pt-2">
                      <span>Total:</span>
                      <span>{formatCurrency(calculateSubtotal() + calculateTax())}</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Notes */}
              {estimate.notes && (
                <div className="mb-8">
                  <h3 className="font-semibold text-gray-900 mb-3">Notes:</h3>
                  <div className="text-gray-700 bg-gray-50 p-4 rounded-lg">
                    {estimate.notes}
                  </div>
                </div>
              )}

              {/* Terms */}
              <div className="border-t pt-6 text-sm text-gray-600">
                <h4 className="font-medium mb-2">Terms & Conditions:</h4>
                <ul className="space-y-1">
                  <li>• This estimate is valid for 30 days from the date of issue</li>
                  <li>• All work will be performed in accordance with industry standards</li>
                  <li>• Payment terms: Net 30 days from completion</li>
                  <li>• Warranty information will be provided upon acceptance</li>
                </ul>
              </div>
            </div>
          </div>

          <div className="flex-shrink-0 flex justify-between items-center pt-4 px-6 border-t">
            <div className="flex gap-2">
              <Button variant="outline" onClick={handlePrint} className="gap-2">
                <Printer className="h-4 w-4" />
                Print
              </Button>
              <Button variant="outline" onClick={() => setShowSendDialog(true)} className="gap-2">
                <Send className="h-4 w-4" />
                Send
              </Button>
            </div>

            <div className="flex gap-3">
              <Button variant="outline" onClick={() => onOpenChange(false)}>
                Close
              </Button>
              {estimate.status !== 'converted' && (
                <Button onClick={handleConvert} className="gap-2 bg-green-600 hover:bg-green-700">
                  <DollarSign className="h-4 w-4" />
                  Convert to Invoice
                </Button>
              )}
            </div>
          </div>
        </DialogContent>
      </Dialog>

      <EstimateSendDialog
        isOpen={showSendDialog}
        onClose={() => setShowSendDialog(false)}
        estimateId={estimate.id}
        estimateNumber={estimate.estimate_number || estimate.number || ''}
        total={estimate.total || estimate.amount || 0}
        contactInfo={clientInfo}
      />
    </>
  );
};
