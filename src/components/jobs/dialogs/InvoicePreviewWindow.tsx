import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  Eye, 
  Printer, 
  Send, 
  FileText, 
  Calendar,
  User,
  MapPin
} from "lucide-react";
import { Invoice } from "@/hooks/useInvoices";
import { useJobData } from "./unified/hooks/useJobData";
import { InvoiceSendDialog } from "./InvoiceSendDialog";
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

interface InvoicePreviewWindowProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  invoice: Invoice;
  jobId: string;
  onPaymentRecorded?: () => void;
}

export const InvoicePreviewWindow = ({
  open,
  onOpenChange,
  invoice,
  jobId,
  onPaymentRecorded
}: InvoicePreviewWindowProps) => {
  const [showSendDialog, setShowSendDialog] = useState(false);
  const [lineItems, setLineItems] = useState<LineItem[]>([]);
  const [isLoadingItems, setIsLoadingItems] = useState(false);
  const { clientInfo, jobAddress, loading } = useJobData(jobId);
  
  // Fetch line items for the invoice
  useEffect(() => {
    const fetchLineItems = async () => {
      if (!invoice.id || !open) return;
      
      setIsLoadingItems(true);
      try {
        const { data, error } = await supabase
          .from('line_items')
          .select('*')
          .eq('parent_id', invoice.id)
          .eq('parent_type', 'invoice');

        if (error) throw error;
        
        setLineItems(data || []);
      } catch (error) {
        console.error('Error fetching line items:', error);
        toast.error('Failed to load invoice items');
      } finally {
        setIsLoadingItems(false);
      }
    };

    fetchLineItems();
  }, [invoice.id, open]);

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

  const getStatusColor = (status: string) => {
    switch (status?.toLowerCase()) {
      case 'sent': return 'bg-blue-100 text-blue-800';
      case 'paid': return 'bg-green-100 text-green-800';
      case 'partial': return 'bg-yellow-100 text-yellow-800';
      case 'overdue': return 'bg-red-100 text-red-800';
      case 'cancelled': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const handleSendDialogSuccess = () => {
    setShowSendDialog(false);
    if (onPaymentRecorded) {
      onPaymentRecorded();
    }
  };

  if (loading) {
    return (
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="max-w-4xl h-[90vh] flex flex-col">
          <div className="flex-1 flex items-center justify-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          </div>
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <>
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="max-w-4xl h-[90vh] flex flex-col">
          <DialogHeader className="flex-shrink-0 pb-4 border-b">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Eye className="h-6 w-6 text-blue-600" />
                <div>
                  <DialogTitle className="text-xl">Invoice Preview</DialogTitle>
                  <div className="flex items-center gap-2 mt-1">
                    <Badge variant="secondary" className="text-sm">
                      {invoice.invoice_number}
                    </Badge>
                    <Badge className={getStatusColor(invoice.status)}>
                      {invoice.status || 'draft'}
                    </Badge>
                  </div>
                </div>
              </div>
              <div className="text-right">
                <div className="text-sm text-gray-500">Total Amount</div>
                <div className="text-2xl font-bold text-green-600">
                  {formatCurrency(invoice.total || 0)}
                </div>
              </div>
            </div>
          </DialogHeader>

          <div className="flex-1 min-h-0 overflow-y-auto">
            <div className="max-w-3xl mx-auto p-8 bg-white">
              {/* Header */}
              <div className="text-center mb-8">
                <h1 className="text-3xl font-bold text-gray-900 mb-2">INVOICE</h1>
                <div className="text-lg text-gray-600">
                  #{invoice.invoice_number}
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
                      {clientInfo?.name || 'Client Name'}
                    </div>
                    <div className="flex items-center gap-2 mt-1">
                      <span className="w-4" />
                      {clientInfo?.email || 'client@example.com'}
                    </div>
                    <div className="flex items-center gap-2 mt-1">
                      <span className="w-4" />
                      {clientInfo?.phone || '(555) 123-4567'}
                    </div>
                    {jobAddress && (
                      <div className="flex items-center gap-2 mt-1">
                        <MapPin className="h-4 w-4" />
                        {jobAddress}
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Date Info */}
              <div className="grid grid-cols-2 gap-8 mb-8">
                <div>
                  <div className="flex items-center gap-2 text-gray-700">
                    <Calendar className="h-4 w-4" />
                    <span className="font-medium">Invoice Date:</span>
                    {new Date(invoice.date).toLocaleDateString()}
                  </div>
                </div>
                <div>
                  <div className="flex items-center gap-2 text-gray-700">
                    <Calendar className="h-4 w-4" />
                    <span className="font-medium">Due Date:</span>
                    {invoice.due_date ? new Date(invoice.due_date).toLocaleDateString() : 'Not set'}
                  </div>
                </div>
              </div>

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
                            No items added to this invoice
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
                      <span>{formatCurrency(invoice.total || 0)}</span>
                    </div>
                    {invoice.amount_paid > 0 && (
                      <>
                        <div className="flex justify-between text-gray-700">
                          <span>Amount Paid:</span>
                          <span>{formatCurrency(invoice.amount_paid)}</span>
                        </div>
                        <div className="flex justify-between font-semibold text-lg border-t pt-2">
                          <span>Balance Due:</span>
                          <span>{formatCurrency(invoice.balance || 0)}</span>
                        </div>
                      </>
                    )}
                  </div>
                </div>
              </div>

              {/* Notes */}
              {invoice.notes && (
                <div className="mb-8">
                  <h3 className="font-semibold text-gray-900 mb-3">Notes:</h3>
                  <div className="text-gray-700 bg-gray-50 p-4 rounded-lg">
                    {invoice.notes}
                  </div>
                </div>
              )}

              {/* Terms */}
              <div className="border-t pt-6 text-sm text-gray-600">
                <h4 className="font-medium mb-2">Terms & Conditions:</h4>
                <ul className="space-y-1">
                  <li>• Payment is due within 30 days of invoice date</li>
                  <li>• Late payments may incur additional charges</li>
                  <li>• All work performed in accordance with industry standards</li>
                  <li>• Warranty information provided upon request</li>
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

            <Button variant="outline" onClick={() => onOpenChange(false)}>
              Close
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      <InvoiceSendDialog
        open={showSendDialog}
        onOpenChange={setShowSendDialog}
        onSave={async () => {
          handleSendDialogSuccess();
          return true;
        }}
        onAddWarranty={() => {}}
        invoiceNumber={invoice.invoice_number}
        jobId={jobId}
      />
    </>
  );
};
