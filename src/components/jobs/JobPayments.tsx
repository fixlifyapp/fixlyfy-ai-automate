
import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Plus, CreditCard, Trash2, RotateCcw } from "lucide-react";
import { usePayments } from "@/hooks/usePayments";
import { useInvoices } from "@/hooks/useInvoices";
import { usePaymentActions } from "@/hooks/usePaymentActions";
import { PaymentForm } from "./payments/PaymentForm";
import { formatDistanceToNow } from "date-fns";

interface JobPaymentsProps {
  jobId: string;
}

export const JobPayments = ({ jobId }: JobPaymentsProps) => {
  const { payments, isLoading, totalPaid, totalRefunded, netAmount, refreshPayments } = usePayments(jobId);
  const { invoices } = useInvoices(jobId);
  const { addPayment, refundPayment, deletePayment, isProcessing } = usePaymentActions(jobId, refreshPayments);
  const [showPaymentForm, setShowPaymentForm] = useState(false);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(amount);
  };

  const getPaymentMethodBadge = (method: string) => {
    const colors = {
      'cash': 'bg-green-100 text-green-800',
      'credit-card': 'bg-blue-100 text-blue-800',
      'e-transfer': 'bg-purple-100 text-purple-800',
      'cheque': 'bg-orange-100 text-orange-800'
    };
    
    const methodMap = {
      'credit-card': 'Credit Card',
      'cash': 'Cash',
      'e-transfer': 'E-Transfer',
      'cheque': 'Cheque'
    };
    
    return (
      <Badge className={colors[method as keyof typeof colors] || 'bg-gray-100 text-gray-800'}>
        {methodMap[method as keyof typeof methodMap] || method}
      </Badge>
    );
  };

  const getStatusBadge = (amount: number) => {
    if (amount < 0) {
      return <Badge className="bg-red-100 text-red-800">Refunded</Badge>;
    }
    return <Badge className="bg-green-100 text-green-800">Paid</Badge>;
  };

  const handleRefundPayment = async (paymentId: string) => {
    if (window.confirm('Are you sure you want to refund this payment?')) {
      await refundPayment(paymentId);
    }
  };

  const handleDeletePayment = async (paymentId: string) => {
    if (window.confirm('Are you sure you want to delete this payment? This action cannot be undone.')) {
      await deletePayment(paymentId);
    }
  };

  return (
    <div className="space-y-6">
      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Total Paid</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{formatCurrency(totalPaid)}</div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Total Refunded</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">{formatCurrency(totalRefunded)}</div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Net Amount</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(netAmount)}</div>
          </CardContent>
        </Card>
      </div>

      {/* Payment Form */}
      {showPaymentForm && (
        <div className="flex justify-center">
          <PaymentForm
            invoices={invoices.filter(inv => inv.balance > 0)}
            onSubmit={addPayment}
            onCancel={() => setShowPaymentForm(false)}
            isProcessing={isProcessing}
          />
        </div>
      )}

      {/* Payments List */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <CreditCard className="h-5 w-5" />
              Payments ({payments.length})
            </CardTitle>
            <Button onClick={() => setShowPaymentForm(true)} disabled={invoices.filter(inv => inv.balance > 0).length === 0}>
              <Plus className="h-4 w-4 mr-2" />
              Add Payment
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="text-center py-8">Loading payments...</div>
          ) : payments.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <CreditCard className="mx-auto h-12 w-12 text-gray-400 mb-4" />
              <p className="text-lg font-medium">No payments yet</p>
              <p className="text-sm">Record the first payment to get started</p>
            </div>
          ) : (
            <div className="space-y-4">
              {payments.map((payment) => (
                <div key={payment.id} className="flex items-center justify-between p-4 border rounded-lg">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <span className="font-medium">{formatCurrency(Math.abs(payment.amount))}</span>
                      {getPaymentMethodBadge(payment.method)}
                      {getStatusBadge(payment.amount)}
                    </div>
                    <div className="text-sm text-muted-foreground">
                      <p>Date: {new Date(payment.date).toLocaleDateString()}</p>
                      {payment.reference && <p>Reference: {payment.reference}</p>}
                      {payment.notes && <p>Notes: {payment.notes}</p>}
                      <p>Recorded {formatDistanceToNow(new Date(payment.created_at || payment.date), { addSuffix: true })}</p>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    {payment.amount > 0 && (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleRefundPayment(payment.id)}
                        disabled={isProcessing}
                        className="text-orange-600 hover:text-orange-700"
                      >
                        <RotateCcw className="h-4 w-4" />
                        Refund
                      </Button>
                    )}
                    
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleDeletePayment(payment.id)}
                      disabled={isProcessing}
                      className="text-red-600 hover:text-red-700"
                    >
                      <Trash2 className="h-4 w-4" />
                      Delete
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};
