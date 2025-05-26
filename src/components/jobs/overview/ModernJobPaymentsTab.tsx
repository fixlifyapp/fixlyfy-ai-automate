
import React, { useState, useEffect } from "react";
import { ModernCard, ModernCardHeader, ModernCardContent, ModernCardTitle } from "@/components/ui/modern-card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { usePayments } from "@/hooks/usePayments";
import { supabase } from "@/integrations/supabase/client";
import { 
  CreditCard, 
  Plus,
  DollarSign,
  Loader2,
  Calendar,
  FileText,
  TrendingUp
} from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { useJobHistory } from "@/hooks/useJobHistory";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";

interface ModernJobPaymentsTabProps {
  jobId: string;
}

export const ModernJobPaymentsTab = ({ jobId }: ModernJobPaymentsTabProps) => {
  const [actionInProgress, setActionInProgress] = useState<{[key: string]: string}>({});

  const { payments, isLoading, totalPaid, totalRefunded, netAmount, refreshPayments } = usePayments(jobId);
  const { addHistoryItem } = useJobHistory(jobId);

  // Real-time updates for payments
  useEffect(() => {
    if (!jobId) return;

    const channel = supabase
      .channel('payments-realtime')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'payments'
        },
        (payload) => {
          console.log('Real-time payment update:', payload);
          refreshPayments();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [jobId, refreshPayments]);

  const handleRecordPayment = async () => {
    setActionInProgress(prev => ({ ...prev, 'record-payment': 'recording' }));
    
    try {
      await addHistoryItem({
        job_id: jobId,
        entity_id: 'manual-payment',
        entity_type: 'payment',
        type: 'payment',
        title: 'Payment Recording Started',
        description: 'Started recording a new payment',
        meta: { action: 'record_payment_started' }
      });
      
      toast.info('Payment recording feature coming soon');
      
    } finally {
      setTimeout(() => {
        setActionInProgress(prev => {
          const newState = { ...prev };
          delete newState['record-payment'];
          return newState;
        });
      }, 300);
    }
  };

  const getPaymentMethodBadge = (method: string) => {
    const colors = {
      'cash': 'bg-green-100 text-green-800 border-green-300',
      'credit-card': 'bg-blue-100 text-blue-800 border-blue-300',
      'e-transfer': 'bg-purple-100 text-purple-800 border-purple-300',
      'cheque': 'bg-orange-100 text-orange-800 border-orange-300',
      'manual': 'bg-slate-100 text-slate-800 border-slate-300'
    };
    
    return (
      <Badge className={`${colors[method as keyof typeof colors] || colors.manual} font-medium px-2 py-1 text-sm`}>
        {method.replace('-', ' ').toUpperCase()}
      </Badge>
    );
  };

  const formatCurrency = (amount: number) => `$${amount.toFixed(2)}`;

  return (
    <div className="space-y-6">
      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="group relative overflow-hidden rounded-xl border border-emerald-200 bg-gradient-to-br from-emerald-50 to-emerald-100/50 p-5 transition-all duration-300 hover:shadow-lg">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center justify-center w-10 h-10 bg-emerald-500 rounded-full shadow-sm">
              <TrendingUp className="h-5 w-5 text-white" />
            </div>
            <span className="text-xs font-semibold text-emerald-600 uppercase tracking-wide">
              Total Received
            </span>
          </div>
          <div className="space-y-1">
            <div className="text-2xl font-bold text-emerald-900">
              {formatCurrency(totalPaid)}
            </div>
            <div className="text-xs text-emerald-600">
              From {payments.length} payment{payments.length !== 1 ? 's' : ''}
            </div>
          </div>
        </div>

        <div className="group relative overflow-hidden rounded-xl border border-red-200 bg-gradient-to-br from-red-50 to-red-100/50 p-5 transition-all duration-300 hover:shadow-lg">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center justify-center w-10 h-10 bg-red-500 rounded-full shadow-sm">
              <CreditCard className="h-5 w-5 text-white" />
            </div>
            <span className="text-xs font-semibold text-red-600 uppercase tracking-wide">
              Refunded
            </span>
          </div>
          <div className="space-y-1">
            <div className="text-2xl font-bold text-red-900">
              {formatCurrency(totalRefunded)}
            </div>
            <div className="text-xs text-red-600">
              {totalRefunded > 0 ? 'Refunds processed' : 'No refunds'}
            </div>
          </div>
        </div>

        <div className="group relative overflow-hidden rounded-xl border border-blue-200 bg-gradient-to-br from-blue-50 to-blue-100/50 p-5 transition-all duration-300 hover:shadow-lg">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center justify-center w-10 h-10 bg-blue-500 rounded-full shadow-sm">
              <DollarSign className="h-5 w-5 text-white" />
            </div>
            <span className="text-xs font-semibold text-blue-600 uppercase tracking-wide">
              Net Amount
            </span>
          </div>
          <div className="space-y-1">
            <div className="text-2xl font-bold text-blue-900">
              {formatCurrency(netAmount)}
            </div>
            <div className="text-xs text-blue-600">
              After refunds
            </div>
          </div>
        </div>
      </div>

      {/* Payments List */}
      <ModernCard className="border border-slate-200 bg-white">
        <ModernCardHeader className="border-b border-slate-200">
          <div className="flex items-center justify-between">
            <ModernCardTitle icon={CreditCard} className="text-slate-800 text-xl font-semibold">
              <div className="flex items-center gap-2">
                <span>Payments</span>
                <Badge variant="outline" className="font-semibold">
                  {payments.length}
                </Badge>
              </div>
            </ModernCardTitle>
            <Button onClick={handleRecordPayment} className="gap-2">
              <Plus className="h-4 w-4" />
              Record Payment
            </Button>
          </div>
        </ModernCardHeader>
        
        <ModernCardContent className="space-y-4">
          {isLoading ? (
            <div className="space-y-4">
              {[1, 2, 3].map(i => (
                <div key={i} className="p-4 rounded-lg border border-slate-200">
                  <Skeleton className="w-full h-16 bg-slate-200" />
                </div>
              ))}
            </div>
          ) : payments.length === 0 ? (
            <div className="text-center py-12">
              <CreditCard className="mx-auto h-12 w-12 text-slate-400 mb-4" />
              <h3 className="text-lg font-semibold text-slate-700 mb-2">No payments recorded</h3>
              <p className="text-slate-500 mb-4">
                Record payments when you receive them from clients
              </p>
              <Button onClick={handleRecordPayment} className="gap-2">
                <Plus className="h-4 w-4" />
                Record First Payment
              </Button>
            </div>
          ) : (
            <div className="space-y-3">
              {payments.map((payment) => (
                <div 
                  key={payment.id} 
                  className="border border-slate-200 rounded-lg p-4 bg-white hover:bg-slate-50 transition-colors"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex-1 space-y-2">
                      <div className="flex items-center gap-3 flex-wrap">
                        <div className="flex items-center text-xl font-semibold text-emerald-600">
                          <DollarSign className="h-5 w-5 mr-1" />
                          {payment.amount.toFixed(2)}
                        </div>
                        {getPaymentMethodBadge(payment.method)}
                        {payment.reference && (
                          <div className="flex items-center text-sm text-slate-600">
                            <FileText className="h-3 w-3 mr-1" />
                            <span>Ref: {payment.reference}</span>
                          </div>
                        )}
                      </div>
                      <div className="flex items-center gap-4 text-sm text-slate-500">
                        <div className="flex items-center gap-1">
                          <Calendar className="h-3 w-3" />
                          <span>{new Date(payment.date).toLocaleDateString()}</span>
                        </div>
                        <span>
                          Recorded {formatDistanceToNow(new Date(payment.created_at), { addSuffix: true })}
                        </span>
                      </div>
                      {payment.notes && (
                        <p className="text-sm text-slate-600 mt-2">
                          <strong>Notes:</strong> {payment.notes}
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </ModernCardContent>
      </ModernCard>
    </div>
  );
};
