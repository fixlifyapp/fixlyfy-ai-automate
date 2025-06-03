
import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { 
  Eye, 
  Printer, 
  Send, 
  CreditCard, 
  FileText, 
  Calendar,
  User,
  MapPin,
  DollarSign
} from "lucide-react";
import { Invoice } from "@/hooks/useInvoices";
import { useJobs } from "@/hooks/useJobs";
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
  onPaymentRecorded?: () => void;
}

export const InvoicePreviewWindow = ({
  open,
  onOpenChange,
  invoice,
  onPaymentRecorded
}: InvoicePreviewWindowProps) => {
  const [showPaymentDialog, setShowPaymentDialog] = useState(false);
  const [paymentAmount, setPaymentAmount] = useState(invoice.balance?.toString() || "0");
  const [paymentMethod, setPaymentMethod] = useState("credit-card");
  const [paymentDate, setPaymentDate] = useState(new Date().toISOString().split('T')[0]);
  const [isRecordingPayment, setIsRecordingPayment] = useState(false);
  const [lineItems, setLineItems] = useState<LineItem[]>([]);
  const [isLoadingItems, setIsLoadingItems] = useState(false);

  const { jobs } = useJobs();
  
  const job = jobs.find(j => j.id === invoice.job_id);
  const clientInfo = job?.client || { name: '', email: '', phone: '' };

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

  const handleRecordPayment = async () => {
    if (!paymentAmount || parseFloat(paymentAmount) <= 0) {
      toast.error("Please enter a valid payment amount");
      return;
    }

    setIsRecordingPayment(true);
    try {
      const amount = parseFloat(paymentAmount);
      
      // Record payment
      const { error: paymentError } = await supabase
        .from("payments")
        .insert({
          invoice_id: invoice.id,
          amount,
          method: paymentMethod,
          date: new Date(paymentDate).toISOString()
        });
        
      if (paymentError) throw paymentError;
      
      // Update invoice
      const newAmountPaid = (invoice.amount_paid || 0) + amount;
      const newBalance = Math.max(0, invoice.total - newAmountPaid);
      let newStatus = "unpaid";
      
      if (newBalance === 0) {
        newStatus = "paid";
      } else if (newAmountPaid > 0) {
        newStatus = "partial";
      }
      
      const { error: updateError } = await supabase
        .from("invoices")
        .update({
          amount_paid: newAmountPaid,
          balance: newBalance,
          status: newStatus
        })
        .eq("id", invoice.id);
        
      if (updateError) throw updateError;
      
      toast.success("Payment recorded successfully");
      setShowPaymentDialog(false);
      
      // Trigger parent refresh
      if (onPaymentRecorded) {
        onPaymentRecorded();
      }
      
      // Close the preview window to show updated data
      onOpenChange(false);
      
    } catch (error) {
      console.error("Error recording payment:", error);
      toast.error("Failed to record payment");
    } finally {
      setIsRecordingPayment(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status?.toLowerCase()) {
      case 'paid': return 'bg-green-100 text-green-800';
      case 'partial': return 'bg-yellow-100 text-yellow-800';
      case 'unpaid': return 'bg-red-100 text-red-800';
      case 'overdue': return 'bg-red-200 text-red-900';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl h-[90vh] flex flex-col">
        <DialogHeader className="flex-shrink-0 pb-4 border-b">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Eye className="h-6 w-6 text-green-600" />
              <div>
                <DialogTitle className="text-xl">Invoice Preview</DialogTitle>
                <div className="flex items-center gap-2 mt-1">
                  <Badge variant="secondary" className="text-sm">
                    {invoice.invoice_number || invoice.number}
                  </Badge>
                  <Badge className={getStatusColor(invoice.status)}>
                    {invoice.status}
                  </Badge>
                </div>
              </div>
            </div>
            <div className="text-right">
              <div className="text-sm text-gray-500">Total Amount</div>
              <div className="text-2xl font-bold text-green-600">
                {formatCurrency(invoice.total)}
              </div>
              {invoice.balance > 0 && (
                <div className="text-sm text-red-600 mt-1">
                  Balance: {formatCurrency(invoice.balance)}
                </div>
              )}
            </div>
          </div>
        </DialogHeader>

        <div className="flex-1 min-h-0 overflow-y-auto">
          <div className="max-w-3xl mx-auto p-8 bg-white">
            {/* Header */}
            <div className="text-center mb-8">
              <h1 className="text-3xl font-bold text-gray-900 mb-2">INVOICE</h1>
              <div className="text-lg text-gray-600">
                #{invoice.invoice_number || invoice.number}
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
                <h3 className="font-semibold text-gray-900 mb-3">Bill To:</h3>
                <div className="text-gray-700">
                  <div className="font-medium flex items-center gap-2">
                    <User className="h-4 w-4" />
                    {clientInfo.name}
                  </div>
                  {clientInfo.email && (
                    <div className="flex items-center gap-2 mt-1">
                      <span className="w-4" />
                      {clientInfo.email}
                    </div>
                  )}
                  {clientInfo.phone && (
                    <div className="flex items-center gap-2 mt-1">
                      <span className="w-4" />
                      {clientInfo.phone}
                    </div>
                  )}
                  {job?.address && (
                    <div className="flex items-center gap-2 mt-1">
                      <MapPin className="h-4 w-4" />
                      {job.address}
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Invoice Details */}
            <div className="grid grid-cols-3 gap-8 mb-8">
              <div>
                <div className="flex items-center gap-2 text-gray-700">
                  <Calendar className="h-4 w-4" />
                  <span className="font-medium">Invoice Date:</span>
                </div>
                <div className="mt-1 text-gray-600">
                  {new Date(invoice.date || invoice.created_at).toLocaleDateString()}
                </div>
              </div>
              <div>
                <div className="flex items-center gap-2 text-gray-700">
                  <Calendar className="h-4 w-4" />
                  <span className="font-medium">Due Date:</span>
                </div>
                <div className="mt-1 text-gray-600">
                  {invoice.due_date ? new Date(invoice.due_date).toLocaleDateString() : 'Net 30'}
                </div>
              </div>
              <div>
                <div className="flex items-center gap-2 text-gray-700">
                  <FileText className="h-4 w-4" />
                  <span className="font-medium">Job:</span>
                </div>
                <div className="mt-1 text-gray-600">
                  {job?.title || 'Service Request'}
                </div>
              </div>
            </div>

            {/* Payment Status */}
            {invoice.amount_paid > 0 && (
              <div className="mb-8 p-4 bg-green-50 border border-green-200 rounded-lg">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="font-medium text-green-800">Payment Received</div>
                    <div className="text-sm text-green-600">
                      Paid: {formatCurrency(invoice.amount_paid)} of {formatCurrency(invoice.total)}
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="font-medium text-green-800">
                      Remaining: {formatCurrency(invoice.balance)}
                    </div>
                  </div>
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
                          No items found for this invoice
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
                  {invoice.amount_paid > 0 && (
                    <>
                      <div className="flex justify-between text-green-600">
                        <span>Paid:</span>
                        <span>-{formatCurrency(invoice.amount_paid)}</span>
                      </div>
                      <div className="flex justify-between font-semibold text-lg border-t pt-2 text-red-600">
                        <span>Balance Due:</span>
                        <span>{formatCurrency(invoice.balance)}</span>
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

            {/* Payment Instructions */}
            <div className="border-t pt-6 text-sm text-gray-600">
              <h4 className="font-medium mb-2">Payment Information:</h4>
              <ul className="space-y-1">
                <li>• Payment due within 30 days of invoice date</li>
                <li>• Late payments may be subject to 1.5% monthly service charge</li>
                <li>• Please include invoice number with payment</li>
                <li>• Questions? Contact us at (555) 123-4567</li>
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
            <Button variant="outline" className="gap-2">
              <Send className="h-4 w-4" />
              Send
            </Button>
          </div>

          <div className="flex gap-3">
            <Button variant="outline" onClick={() => onOpenChange(false)}>
              Close
            </Button>
            {invoice.balance > 0 && (
              <Button 
                onClick={() => setShowPaymentDialog(true)} 
                className="gap-2 bg-green-600 hover:bg-green-700"
              >
                <CreditCard className="h-4 w-4" />
                Record Payment
              </Button>
            )}
          </div>
        </div>

        {/* Payment Recording Dialog */}
        {showPaymentDialog && (
          <div className="absolute inset-0 bg-black/50 flex items-center justify-center p-4">
            <div className="bg-white rounded-lg p-6 w-full max-w-md">
              <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                <DollarSign className="h-5 w-5" />
                Record Payment
              </h3>
              
              <div className="space-y-4">
                <div>
                  <Label htmlFor="amount">Payment Amount</Label>
                  <Input
                    id="amount"
                    type="number"
                    value={paymentAmount}
                    onChange={(e) => setPaymentAmount(e.target.value)}
                    placeholder="0.00"
                    min="0"
                    step="0.01"
                  />
                </div>
                
                <div>
                  <Label htmlFor="method">Payment Method</Label>
                  <Select value={paymentMethod} onValueChange={setPaymentMethod}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="credit-card">Credit Card</SelectItem>
                      <SelectItem value="cash">Cash</SelectItem>
                      <SelectItem value="check">Check</SelectItem>
                      <SelectItem value="bank-transfer">Bank Transfer</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <div>
                  <Label htmlFor="date">Payment Date</Label>
                  <Input
                    id="date"
                    type="date"
                    value={paymentDate}
                    onChange={(e) => setPaymentDate(e.target.value)}
                  />
                </div>
              </div>
              
              <div className="flex gap-3 mt-6">
                <Button 
                  variant="outline" 
                  onClick={() => setShowPaymentDialog(false)}
                  disabled={isRecordingPayment}
                  className="flex-1"
                >
                  Cancel
                </Button>
                <Button 
                  onClick={handleRecordPayment}
                  disabled={isRecordingPayment}
                  className="flex-1"
                >
                  {isRecordingPayment ? 'Recording...' : 'Record Payment'}
                </Button>
              </div>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
};
