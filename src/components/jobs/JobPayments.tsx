
import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Plus, CreditCard, Trash2, RotateCcw } from "lucide-react";
import { usePayments, Payment, PaymentMethod } from "@/hooks/usePayments";
import { useInvoices } from "@/hooks/useInvoices";
import { formatDistanceToNow } from "date-fns";

interface JobPaymentsProps {
  jobId: string;
}

export const JobPayments = ({ jobId }: JobPaymentsProps) => {
  const { payments, isLoading, totalPaid, totalRefunded, netAmount, addPayment, refundPayment, deletePayment } = usePayments(jobId);
  const { invoices } = useInvoices(jobId);
  const [isAddingPayment, setIsAddingPayment] = useState(false);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(amount);
  };

  const getPaymentMethodBadge = (method: PaymentMethod) => {
    const colors = {
      'cash': 'bg-green-100 text-green-800',
      'credit-card': 'bg-blue-100 text-blue-800',
      'e-transfer': 'bg-purple-100 text-purple-800',
      'cheque': 'bg-orange-100 text-orange-800'
    };
    
    return (
      <Badge className={colors[method] || 'bg-gray-100 text-gray-800'}>
        {method.replace('-', ' ').toUpperCase()}
      </Badge>
    );
  };

  const getStatusBadge = (status?: string) => {
    if (status === 'refunded') {
      return <Badge className="bg-red-100 text-red-800">Refunded</Badge>;
    }
    return <Badge className="bg-green-100 text-green-800">Paid</Badge>;
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

      {/* Payments List */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <CreditCard className="h-5 w-5" />
              Payments ({payments.length})
            </CardTitle>
            <Button onClick={() => setIsAddingPayment(true)}>
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
              <p className="text-sm">Add the first payment to get started</p>
            </div>
          ) : (
            <div className="space-y-4">
              {payments.map((payment) => (
                <div key={payment.id} className="flex items-center justify-between p-4 border rounded-lg">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <span className="font-medium">{formatCurrency(payment.amount)}</span>
                      {getPaymentMethodBadge(payment.method)}
                      {getStatusBadge(payment.status)}
                    </div>
                    <div className="text-sm text-muted-foreground">
                      <p>Date: {new Date(payment.date).toLocaleDateString()}</p>
                      {payment.reference && <p>Reference: {payment.reference}</p>}
                      {payment.notes && <p>Notes: {payment.notes}</p>}
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    {payment.status !== 'refunded' && (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => refundPayment(payment.id)}
                        className="text-orange-600 hover:text-orange-700"
                      >
                        <RotateCcw className="h-4 w-4" />
                        Refund
                      </Button>
                    )}
                    
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => deletePayment(payment.id)}
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
